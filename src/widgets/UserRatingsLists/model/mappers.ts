import {
  BookWithUserRating,
  FilmWithUserRating,
  GameWithUserRating,
  RatingChartItem,
} from '@/widgets/UserRatingsLists/model/types';

export function mapBookToRatingChartItem(book: BookWithUserRating): RatingChartItem {
  return {
    id: book.id,
    title: book.title,
    posterUrl: book.thumbnailUrl,
    type: 'book',
    rating: book.userRating,
    ratedAt: book.userRatingCreatedAt,

    meta:
      [
        book.publishedDate?.slice(0, 4),
        book.authors.length > 0 ? book.authors.join(', ') : null,
        book.pageCount ? `${book.pageCount} стр.` : null,
      ]
        .filter(Boolean)
        .join(' · ') || null,

    description: book.description,
  };
}

export function mapFilmToRatingChartItem(film: FilmWithUserRating): RatingChartItem {
  return {
    id: film.id,
    title: film.nameRu || film.nameOriginal || film.nameEn || 'Без названия',

    posterUrl: film.posterUrl || film.posterUrlPreview || null,

    type: 'film',
    rating: film.userRating,
    ratedAt: film.userRatingCreatedAt,

    meta:
      [
        film.year ? String(film.year) : null,
        film.filmLength ? `${film.filmLength} мин.` : null,
        film.ratingKinopoisk ? `КП ${film.ratingKinopoisk}` : null,
        film.ratingImdb ? `IMDb ${film.ratingImdb}` : null,
      ]
        .filter(Boolean)
        .join(' · ') || null,

    description: film.description,
  };
}

export function mapBooksToRatingChartItems(books: BookWithUserRating[]): RatingChartItem[] {
  return books.map(mapBookToRatingChartItem);
}

export function mapFilmsToRatingChartItems(films: FilmWithUserRating[]): RatingChartItem[] {
  return films.map(mapFilmToRatingChartItem);
}

export function mapGameToRatingChartItem(game: GameWithUserRating): RatingChartItem {
  return {
    id: game.id,
    title: game.name,
    posterUrl: game.headerImage,
    type: 'game',
    rating: game.userRating,
    ratedAt: game.userRatingCreatedAt,
    meta:
      [game.releaseDate, game.developers.length > 0 ? game.developers.join(', ') : null]
        .filter(Boolean)
        .join(' · ') || null,
    description: game.shortDescription,
  };
}

export function mapGamesToRatingChartItems(games: GameWithUserRating[]): RatingChartItem[] {
  return games.map(mapGameToRatingChartItem);
}
