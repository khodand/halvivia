import 'server-only';

import { allowedSteamImageUrl } from '@/entities/games/model/steam';
import type { NewGameInput } from '@/entities/games/model/types';
import type { SteamGameSearchHit } from '@/features/addGame/model/types';
import { z } from 'zod';

const STORE_SEARCH_URL = 'https://store.steampowered.com/api/storesearch/';
const STORE_BROWSE_URL = 'https://api.steampowered.com/IStoreBrowseService/GetItems/v1/';
const APP_DETAILS_URL = 'https://store.steampowered.com/api/appdetails';
const SEARCH_RESULTS_LIMIT = 12;
// Store browse type: 0 game, 1 demo, 4 DLC, 6 software, 11 music.
const GAME_APP_TYPE = 0;
// The RU catalog omits type for region-locked apps. US still returns it.
const STORE_BROWSE_COUNTRY = 'US';
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

const storeBrowseSchema = z
  .object({
    response: z
      .object({
        store_items: z
          .array(
            z
              .object({
                appid: z.number(),
                type: z.number().optional(),
                success: z.number(),
                release: z
                  .object({
                    steam_release_date: z.number().optional(),
                  })
                  .passthrough()
                  .optional(),
              })
              .passthrough(),
          )
          .optional(),
      })
      .passthrough()
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
        steam_appid: z.number().optional(),
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

function releaseYearFromUnix(timestamp: number | undefined) {
  if (timestamp == null || !Number.isFinite(timestamp) || timestamp <= 0) {
    return null;
  }

  const year = new Date(timestamp * 1000).getUTCFullYear();

  return Number.isInteger(year) ? year : null;
}

async function fetchStoreItems(appIds: number[], countryCode: string) {
  const url = new URL(STORE_BROWSE_URL);
  url.searchParams.set(
    'input_json',
    JSON.stringify({
      ids: appIds.map((appid) => ({ appid })),
      context: { language: 'russian', country_code: countryCode, steam_realm: 1 },
      data_request: { include_release: true },
    }),
  );

  const parsed = storeBrowseSchema.parse(await fetchJson(url.toString()));

  return parsed.response?.store_items ?? [];
}

async function fetchGameReleaseYears(appIds: number[]) {
  const items = await fetchStoreItems(appIds, STORE_BROWSE_COUNTRY);
  const byAppId = new Map(items.map((item) => [item.appid, item]));
  const releaseYears = new Map<number, number | null>();

  for (const appId of appIds) {
    const item = byAppId.get(appId);
    const classified = item?.success === 1 && item.type != null;

    if (classified && item.type !== GAME_APP_TYPE) {
      continue;
    }

    releaseYears.set(
      appId,
      classified ? releaseYearFromUnix(item.release?.steam_release_date) : null,
    );
  }

  return releaseYears;
}

export async function searchSteamGames(query: string): Promise<SteamGameSearchHit[]> {
  const url = new URL(STORE_SEARCH_URL);
  url.searchParams.set('term', query);
  url.searchParams.set('l', 'russian');
  url.searchParams.set('cc', 'ru');

  const parsed = storeSearchSchema.parse(await fetchJson(url.toString()));
  const hits = (parsed.items ?? [])
    .filter((item) => item.type === 'app' && item.name.trim().length > 0)
    .map((item) => ({
      steamAppId: item.id,
      name: item.name.trim(),
    }));

  if (hits.length === 0) {
    return [];
  }

  const releaseYears = await fetchGameReleaseYears(hits.map((hit) => hit.steamAppId));

  return hits
    .filter((hit) => releaseYears.has(hit.steamAppId))
    .slice(0, SEARCH_RESULTS_LIMIT)
    .map((hit) => ({
      ...hit,
      releaseYear: releaseYears.get(hit.steamAppId) ?? null,
    }));
}

export type SteamResolveResult =
  | { status: 'game'; game: NewGameInput }
  | { status: 'not_found' }
  | { status: 'not_game' };

type AppDetailsPayload = Record<string, z.infer<typeof appDetailsSchema>>;

// Steam keys appdetails by the last DLC id. Stardew Valley (413150) comes back
// under 440820, while data.steam_appid is the app that was requested.
function appDetailsEntry(payload: AppDetailsPayload, steamAppId: number) {
  const direct = payload[String(steamAppId)];

  if (direct) {
    return direct;
  }

  return Object.values(payload).find((entry) => entry.data?.steam_appid === steamAppId);
}

export async function resolveSteamGame(steamAppId: number): Promise<SteamResolveResult> {
  const url = new URL(APP_DETAILS_URL);
  url.searchParams.set('appids', String(steamAppId));
  url.searchParams.set('l', 'russian');

  const payload = z.record(z.string(), appDetailsSchema).parse(await fetchJson(url.toString()));
  const entry = appDetailsEntry(payload, steamAppId);

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
