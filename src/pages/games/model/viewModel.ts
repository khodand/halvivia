import { listGames } from '@/entities/games/api/db';
import type { GameListFilters } from '@/entities/games/model/schemas';
import type { Game } from '@/entities/games/model/types';
import { verifySession } from '@/shared/lib/auth';

export type GamesPageViewModel = {
  games: Game[];
  totalCount: number;
  canAddGames: boolean;
};

export async function getGamesPageViewModel(filters: GameListFilters): Promise<GamesPageViewModel> {
  const [catalog, session] = await Promise.all([listGames(filters), verifySession()]);

  return {
    games: catalog.games,
    totalCount: catalog.totalCount,
    canAddGames: session.status !== 'unauthenticated' && session.payload.role === 'MEMBER',
  };
}
