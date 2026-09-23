'use server';

import { addGameOrGetExisting } from '@/entities/games/api/db';
import type { Game } from '@/entities/games/model/types';
import { tryCreateActivityEvent } from '@/entities/activity/api/queries';
import { ROUTES } from '@/shared/config';
import { verifySession, withAuth } from '@/shared/lib/auth';
import { checkRateLimit } from '@/shared/lib/rateLimit';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { SteamGameSearchHit } from '@/features/addGame/model/types';
import { parseSteamAppUrl, resolveSteamGame, searchSteamGames } from './steam';

type SearchGamesResult =
  | { success: true; games: SteamGameSearchHit[] }
  | {
      success: false;
      error:
        | 'UNAUTHORIZED'
        | 'QUERY_TOO_SHORT'
        | 'QUERY_TOO_LONG'
        | 'RATE_LIMITED'
        | 'SEARCH_FAILED';
    };

type AddGameResult =
  | { success: true; gameId: string; game: Game }
  | {
      success: false;
      error:
        | 'UNAUTHORIZED'
        | 'INVALID_URL'
        | 'NOT_A_GAME'
        | 'GAME_NOT_FOUND'
        | 'GAME_ALREADY_EXISTS'
        | 'RATE_LIMITED'
        | 'ADD_FAILED';
      gameId?: string;
    };

const SEARCH_QUERY_MAX_LENGTH = 120;
const SEARCH_RATE_LIMIT = 30;
const SEARCH_RATE_LIMIT_WINDOW_MS = 60 * 1000;
const ADD_GAME_RATE_LIMIT = 10;
const ADD_GAME_RATE_LIMIT_WINDOW_MS = 60 * 1000;

async function getRequestIp() {
  const requestHeaders = await headers();
  const forwardedFor = requestHeaders.get('x-forwarded-for');

  return forwardedFor?.split(',')[0]?.trim() ?? requestHeaders.get('x-real-ip') ?? 'unknown';
}

async function requireMember() {
  const session = await withAuth();

  if (session.status === 'unauthenticated') {
    redirect(ROUTES.LOGIN);
  }

  if (session.payload.role !== 'MEMBER') {
    return null;
  }

  return session;
}

export async function searchGamesAction(query: string): Promise<SearchGamesResult> {
  const session = await verifySession();

  if (session.status === 'unauthenticated' || session.payload.role !== 'MEMBER') {
    return { success: false, error: 'UNAUTHORIZED' };
  }

  const normalizedQuery = query.trim();

  if (normalizedQuery.length < 2) {
    return { success: false, error: 'QUERY_TOO_SHORT' };
  }

  if (normalizedQuery.length > SEARCH_QUERY_MAX_LENGTH) {
    return { success: false, error: 'QUERY_TOO_LONG' };
  }

  const rateLimit = checkRateLimit({
    key: `game-search:${session.payload.userId}:${await getRequestIp()}`,
    limit: SEARCH_RATE_LIMIT,
    windowMs: SEARCH_RATE_LIMIT_WINDOW_MS,
  });

  if (!rateLimit.success) {
    return { success: false, error: 'RATE_LIMITED' };
  }

  try {
    const games = await searchSteamGames(normalizedQuery);
    return { success: true, games };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'SEARCH_FAILED' };
  }
}

async function saveResolvedGame(steamAppId: number): Promise<AddGameResult> {
  const session = await requireMember();

  if (!session) {
    return { success: false, error: 'UNAUTHORIZED' };
  }

  const rateLimit = checkRateLimit({
    key: `game-add:${session.payload.userId}:${await getRequestIp()}`,
    limit: ADD_GAME_RATE_LIMIT,
    windowMs: ADD_GAME_RATE_LIMIT_WINDOW_MS,
  });

  if (!rateLimit.success) {
    return { success: false, error: 'RATE_LIMITED' };
  }

  try {
    const resolved = await resolveSteamGame(steamAppId);

    if (resolved.status === 'not_found') {
      return { success: false, error: 'GAME_NOT_FOUND' };
    }

    if (resolved.status === 'not_game') {
      return { success: false, error: 'NOT_A_GAME' };
    }

    const { game, created } = await addGameOrGetExisting(resolved.game, session.payload.userId);

    if (!created) {
      return {
        success: false,
        error: 'GAME_ALREADY_EXISTS',
        gameId: game.id,
      };
    }

    revalidatePath(ROUTES.GAMES);
    revalidatePath(`${ROUTES.GAME_PAGE}${game.id}`);

    await tryCreateActivityEvent({
      eventType: 'subject.created',
      subject: { type: 'game', id: game.id },
      actorId: session.payload.userId,
    });

    return {
      success: true,
      gameId: game.id,
      game,
    };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'ADD_FAILED' };
  }
}

export async function addGameAction(steamAppId: number): Promise<AddGameResult> {
  if (!Number.isInteger(steamAppId) || steamAppId <= 0) {
    return { success: false, error: 'GAME_NOT_FOUND' };
  }

  return saveResolvedGame(steamAppId);
}

export async function addGameByUrlAction(url: string): Promise<AddGameResult> {
  const steamAppId = parseSteamAppUrl(url);

  if (!steamAppId) {
    return { success: false, error: 'INVALID_URL' };
  }

  return saveResolvedGame(steamAppId);
}
