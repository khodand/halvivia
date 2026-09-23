import { GameListFiltersSchema, GameSortSchema } from '@/entities/games/model/schemas';
import type { GameListFilters } from '@/entities/games/model/schemas';
import { ROUTES } from '@/shared/config/navigation/routes';

type SearchParams = Record<string, string | string[] | undefined>;

export function parseGameListFilters(params: SearchParams): GameListFilters {
  const search = typeof params.search === 'string' ? params.search : undefined;
  const sort = GameSortSchema.safeParse(typeof params.sort === 'string' ? params.sort : undefined);
  const pageNumber = typeof params.page === 'string' ? Number(params.page) : Number.NaN;
  const page = Number.isSafeInteger(pageNumber) && pageNumber >= 1 ? pageNumber : undefined;

  return GameListFiltersSchema.parse({
    search: search?.trim() ? search : undefined,
    sort: sort.success ? sort.data : undefined,
    page,
  });
}

export function gamesCatalogHref(filters: GameListFilters, page = 1) {
  const params = new URLSearchParams();

  if (filters.search) {
    params.set('search', filters.search);
  }

  if (filters.sort !== 'newest') {
    params.set('sort', filters.sort);
  }

  if (page > 1) {
    params.set('page', String(page));
  }

  const query = params.toString();

  return query ? `${ROUTES.GAMES}?${query}` : ROUTES.GAMES;
}
