import {
  DbFilm,
  DbFilmWithGenres,
  Film,
  FilmType,
  FilmWithoutGenres,
} from '@/entities/films/model/types';
import { FilmCardProps } from '@/entities/films/ui/FilmCard';

export function mapDbFilmToFilmWithoutGenres(db: DbFilm): FilmWithoutGenres {
  return {
    id: db.id,

    kinopoiskId: db.kinopoisk_id,
    kinopoiskHDId: db.kinopoisk_hd_id,
    imdbId: db.imdb_id,

    nameRu: db.name_ru,
    nameEn: db.name_en,
    nameOriginal: db.name_original,
    coverUrl: db.cover_url == '/posters/default_cover' ? db.poster_url : db.cover_url,
    posterUrl: db.poster_url,
    posterUrlPreview: db.poster_url_preview,

    ratingImdb: db.rating_imdb,
    ratingKinopoisk: db.rating_kinopoisk === null ? null : Number(db.rating_kinopoisk),

    webUrl: db.web_url,

    year: db.year,
    filmLength: db.film_length,

    slogan: db.slogan,
    description: db.description,

    type: db.type as FilmType,

    ratingAgeLimits: db.rating_age_limits,

    lastSync: db.last_sync.toISOString(),

    countries: db.countries,

    startYear: db.start_year,
    endYear: db.end_year,

    serial: db.serial,
    shortFilm: db.short_film,
    completed: db.completed,

    ratingAvg: Number(db.rating_avg),
    ratingCount: db.rating_count,
  };
}

export function mapDbFilmWithGenresToFilm(db: DbFilmWithGenres): Film {
  return {
    id: db.id,

    kinopoiskId: db.kinopoisk_id,
    kinopoiskHDId: db.kinopoisk_hd_id,
    imdbId: db.imdb_id,

    nameRu: db.name_ru,
    nameEn: db.name_en,
    nameOriginal: db.name_original,
    coverUrl: db.cover_url == '/posters/default_cover' ? db.poster_url : db.cover_url,
    posterUrl: db.poster_url,
    posterUrlPreview: db.poster_url_preview,

    ratingImdb: db.rating_imdb,
    ratingKinopoisk: db.rating_kinopoisk === null ? null : Number(db.rating_kinopoisk),

    webUrl: db.web_url,

    year: db.year,
    filmLength: db.film_length,

    slogan: db.slogan,
    description: db.description,

    type: db.type as FilmType,

    ratingAgeLimits: db.rating_age_limits,

    lastSync: db.last_sync.toISOString(),

    countries: db.countries ?? null,

    genres: db.genres.map((g) => ({
      genre: g.name,
    })),

    startYear: db.start_year,
    endYear: db.end_year,

    serial: db.serial,
    shortFilm: db.short_film,
    completed: db.completed,

    ratingAvg: Number(db.rating_avg),
    ratingCount: db.rating_count,
  };
}

export function mapDbFilmToFilmCardProps(film: DbFilm): FilmCardProps {
  return {
    id: film.id,
    name: film.name_ru || film.name_en || film.name_original || 'Без названия',
    posterUrl: film.poster_url,
    ratingAvg: Number(film.rating_avg),
    coverUrl: film.cover_url !== '/posters/default_cover' ? film.cover_url : film.poster_url,
  };
}

// переводит массив фильмов в массив пропсов
export const mapFilms = (films: DbFilm[]) => films.map(mapDbFilmToFilmCardProps);
