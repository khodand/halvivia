export const FILM_TYPES = ['FILM', 'SERIES', 'ANIME', 'CARTOON', 'OTHERS'] as const;

export const FILM_TYPE_OPTIONS = [
  {
    value: 'FILM',
    label: 'Фильм',
  },
  {
    value: 'SERIES',
    label: 'Сериал',
  },
  {
    value: 'ANIME',
    label: 'Аниме',
  },
  {
    value: 'CARTOON',
    label: 'Мультфильм',
  },
  {
    value: 'OTHERS',
    label: 'Другое',
  },
] satisfies {
  value: (typeof FILM_TYPES)[number];
  label: string;
}[];

export const FILM_SORT_MAP = {
  newest: 'created_at DESC',
  oldest: 'created_at ASC',
  rating_desc: 'halva_score DESC NULLS LAST, created_at DESC',
  rating_asc: 'halva_score ASC NULLS LAST, created_at DESC',
  year_desc: 'year DESC NULLS LAST',
  year_asc: 'year ASC NULLS LAST',
} as const;

export type FilmSort = keyof typeof FILM_SORT_MAP;
