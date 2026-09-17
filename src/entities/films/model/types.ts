import { FilmFiltersSchema, FilmTypeSchema, GenreSchema } from '@/entities/films/model/Schemas';
import { z } from 'zod';

export type Genre = z.infer<typeof GenreSchema>;
export type FilmType = z.infer<typeof FilmTypeSchema>;

export interface Film {
  id: string;
  kinopoiskId: number;
  kinopoiskHDId: string | null;
  imdbId: string | null;
  nameRu: string;
  nameEn: string | null;
  nameOriginal: string | null;
  posterUrl: string;
  coverUrl: string;
  posterUrlPreview: string;
  ratingImdb: number | string | null;
  ratingKinopoisk: number | null;
  webUrl: string; //weburl=>kinopoiskurl
  year: number | null;
  filmLength: number | null; //в минутах
  slogan: string | null;
  description: string | null;
  type: FilmType;
  ratingAgeLimits: string | null;
  lastSync: string;
  countries: string[] | null;
  startYear: number | null;
  endYear: number | null;
  serial: boolean | null;
  shortFilm: boolean | null;
  completed: boolean | null;
  genres: Genre[];
  ratingAvg: number | null;
  ratingCount: number | null;
}

//используем когда нам не нужн делать фильтр по жанрам
export type FilmWithoutGenres = Omit<Film, 'genres'>;

export type DbFilm = {
  id: string;

  kinopoisk_id: number;
  kinopoisk_hd_id: string | null;
  imdb_id: string | null;

  name_ru: string;
  name_en: string | null;
  name_original: string | null;

  poster_url: string;
  cover_url: string;
  poster_url_preview: string;

  rating_imdb: number | null;
  rating_kinopoisk: number | null;

  web_url: string;

  year: number | null;
  film_length: number | null;

  slogan: string | null;
  description: string | null;

  type: string;

  rating_age_limits: string | null;

  last_sync: Date;

  countries: string[];
  start_year: number | null;
  end_year: number | null;

  serial: boolean | null;
  short_film: boolean | null;
  completed: boolean | null;

  rating_avg: string | null;
  rating_count: number | null;
};

export type DbGenre = {
  id: number;
  name: string;
};

/// это то что мы получаем запросом по id когда нам нужен полный фильи
export type DbFilmWithGenres = DbFilm & {
  genres: DbGenre[];
};

export type FilmFilters = z.infer<typeof FilmFiltersSchema>;

export type FilmFilterKey = keyof FilmFilters;
