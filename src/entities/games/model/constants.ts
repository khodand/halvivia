export const GAMES_PAGE_SIZE = 24;

export const GAME_SORT_MAP = {
  newest: 'created_at DESC',
  oldest: 'created_at ASC',
  name_asc: 'name ASC, created_at DESC',
  name_desc: 'name DESC, created_at DESC',
  rating_desc: 'halva_score DESC NULLS LAST, created_at DESC',
  rating_asc: 'halva_score ASC NULLS LAST, created_at DESC',
  ratings_desc: 'rating_count DESC, created_at DESC',
  ratings_asc: 'rating_count ASC, created_at DESC',
} as const;

export type GameSort = keyof typeof GAME_SORT_MAP;

export const GAME_SORT_OPTIONS = [
  { value: 'newest', label: 'Сначала новые' },
  { value: 'oldest', label: 'Сначала старые' },
  { value: 'name_asc', label: 'Название А–Я' },
  { value: 'name_desc', label: 'Название Я–А' },
  { value: 'rating_desc', label: 'Рейтинг ↓' },
  { value: 'rating_asc', label: 'Рейтинг ↑' },
  { value: 'ratings_desc', label: 'Оценок ↓' },
  { value: 'ratings_asc', label: 'Оценок ↑' },
] as const satisfies readonly { value: GameSort; label: string }[];
