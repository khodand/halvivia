import 'server-only';

import { allowedSteamImageUrl } from '@/entities/games/model/steam';
import type { NewGameInput } from '@/entities/games/model/types';
import type { SteamGameSearchHit } from '@/features/addGame/model/types';
import { z } from 'zod';

const STORE_SEARCH_URL = 'https://store.steampowered.com/api/storesearch/';
const APP_DETAILS_URL = 'https://store.steampowered.com/api/appdetails';
const SEARCH_RESULTS_LIMIT = 12;
const REQUEST_TIMEOUT_MS = 15000;
const RECENT_REVIEW_WINDOW_SEC = 30 * 24 * 60 * 60;

const STEAM_APP_URL =
  /^https?:\/\/(?:www\.)?store\.steampowered\.com\/app\/(\d+)(?:\/[^?\s]*)?(?:\?[^\s]*)?$/;

const storeSearchSchema = z
  .object({
    items: z
      .array(
        z
          .object({
            id: z.number(),
            name: z.string(),
            type: z.string(),
          })
          .passthrough(),
      )
      .optional(),
  })
  .passthrough();

const appDetailsSchema = z
  .object({
    success: z.boolean(),
    data: z
      .object({
        type: z.string(),
        name: z.string(),
        short_description: z.string().optional(),
        header_image: z.string().optional(),
        developers: z.array(z.string()).optional(),
        publishers: z.array(z.string()).optional(),
        release_date: z
          .object({
            coming_soon: z.boolean().optional(),
            date: z.string().optional(),
          })
          .optional(),
      })
      .passthrough()
      .optional(),
  })
  .passthrough();

const reviewSummarySchema = z
  .object({
    success: z.number(),
    query_summary: z
      .object({
        review_score: z.number(),
        review_score_desc: z.string(),
        total_reviews: z.number(),
      })
      .passthrough(),
  })
  .passthrough();

export function steamStoreUrl(steamAppId: number) {
  return `https://store.steampowered.com/app/${steamAppId}`;
}

export function parseSteamAppUrl(input: string): number | null {
  const match = STEAM_APP_URL.exec(input.trim());

  if (!match) {
    return null;
  }

  const steamAppId = Number(match[1]);

  return Number.isInteger(steamAppId) && steamAppId > 0 ? steamAppId : null;
}

async function fetchJson(url: string) {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    cache: 'no-store',
    headers: {
      Accept: 'application/json',
      'Accept-Language': 'ru-RU,ru;q=0.9',
    },
  });

  if (!response.ok) {
    throw new Error(`Steam request failed: ${response.status}`);
  }

  return response.json();
}

function cleanNames(names: string[] | undefined) {
  return (names ?? []).map((name) => name.trim()).filter((name) => name.length > 0);
}

function formatReleaseDate(
  releaseDate: { coming_soon?: boolean; date?: string } | undefined,
): string | null {
  const date = releaseDate?.date?.trim() ?? '';

  if (date) {
    return date;
  }

  if (releaseDate?.coming_soon) {
    return 'Скоро выйдет';
  }

  return null;
}

function toStoredReview(payload: unknown) {
  const parsed = reviewSummarySchema.safeParse(payload);

  if (!parsed.success || parsed.data.success !== 1) {
    return {
      label: null,
      count: null,
      score: null,
    };
  }

  const summary = parsed.data.query_summary;
  const label = summary.review_score_desc.trim();

  if (!label || summary.total_reviews <= 0) {
    return {
      label: null,
      count: null,
      score: null,
    };
  }

  return {
    label,
    count: summary.total_reviews,
    score: summary.review_score,
  };
}

async function fetchReviewSummary(steamAppId: number, kind: 'recent' | 'russian') {
  const url = new URL(`https://store.steampowered.com/appreviews/${steamAppId}`);
  url.searchParams.set('json', '1');
  url.searchParams.set('purchase_type', 'steam');
  url.searchParams.set('num_per_page', '0');

  if (kind === 'recent') {
    const endDate = Math.floor(Date.now() / 1000);
    url.searchParams.set('language', 'all');
    url.searchParams.set('filter', 'recent');
    url.searchParams.set('date_range_type', 'include');
    url.searchParams.set('start_date', String(endDate - RECENT_REVIEW_WINDOW_SEC));
    url.searchParams.set('end_date', String(endDate));
  } else {
    url.searchParams.set('language', 'russian');
    url.searchParams.set('filter', 'all');
  }

  return toStoredReview(await fetchJson(url.toString()));
}

export async function searchSteamGames(query: string): Promise<SteamGameSearchHit[]> {
  const url = new URL(STORE_SEARCH_URL);
  url.searchParams.set('term', query);
  url.searchParams.set('l', 'russian');
  url.searchParams.set('cc', 'ru');

  const parsed = storeSearchSchema.parse(await fetchJson(url.toString()));

  return (parsed.items ?? [])
    .filter((item) => item.type === 'app' && item.name.trim().length > 0)
    .slice(0, SEARCH_RESULTS_LIMIT)
    .map((item) => ({
      steamAppId: item.id,
      name: item.name.trim(),
    }));
}

export type SteamResolveResult =
  | { status: 'game'; game: NewGameInput }
  | { status: 'not_found' }
  | { status: 'not_game' };

export async function resolveSteamGame(steamAppId: number): Promise<SteamResolveResult> {
  const url = new URL(APP_DETAILS_URL);
  url.searchParams.set('appids', String(steamAppId));
  url.searchParams.set('l', 'russian');

  const payload = z.record(z.string(), appDetailsSchema).parse(await fetchJson(url.toString()));
  const entry = payload[String(steamAppId)];

  if (!entry?.success || !entry.data) {
    return { status: 'not_found' };
  }

  if (entry.data.type !== 'game') {
    return { status: 'not_game' };
  }

  const name = entry.data.name.trim();

  if (!name) {
    return { status: 'not_found' };
  }

  const [recentResult, russianResult] = await Promise.allSettled([
    fetchReviewSummary(steamAppId, 'recent'),
    fetchReviewSummary(steamAppId, 'russian'),
  ]);
  const recent =
    recentResult.status === 'fulfilled'
      ? recentResult.value
      : { label: null, count: null, score: null };
  const russian =
    russianResult.status === 'fulfilled'
      ? russianResult.value
      : { label: null, count: null, score: null };
  const shortDescription = entry.data.short_description?.trim() ?? '';

  return {
    status: 'game',
    game: {
      steamAppId,
      name,
      steamUrl: steamStoreUrl(steamAppId),
      headerImage: allowedSteamImageUrl(entry.data.header_image),
      shortDescription: shortDescription || null,
      developers: cleanNames(entry.data.developers),
      publishers: cleanNames(entry.data.publishers),
      releaseDate: formatReleaseDate(entry.data.release_date),
      recentReviewLabel: recent.label,
      recentReviewCount: recent.count,
      recentReviewScore: recent.score,
      russianReviewLabel: russian.label,
      russianReviewCount: russian.count,
      russianReviewScore: russian.score,
    },
  };
}
