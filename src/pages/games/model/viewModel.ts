import { getGames, getRecentGames } from '@/entities/games/api/db';
import type { Game } from '@/entities/games/model/types';
import { verifySession } from '@/shared/lib/auth';

const RECENT_GAMES_LIMIT = 10;
const GAMES_LIMIT = 80;

export type GamesPageViewModel = {
  recentGames: Game[];
  games: Game[];
  canAddGames: boolean;
};

export async function getGamesPageViewModel(): Promise<GamesPageViewModel> {
  const [recentGames, games, session] = await Promise.all([
    getRecentGames(RECENT_GAMES_LIMIT),
    getGames(GAMES_LIMIT),
    verifySession(),
  ]);

  return {
    recentGames,
    games,
    canAddGames: session.status !== 'unauthenticated' && session.payload.role === 'MEMBER',
  };
}
