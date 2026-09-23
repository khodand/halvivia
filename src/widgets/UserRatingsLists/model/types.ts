import { Book } from '@/entities/books';
import { Game } from '@/entities/games';
import { RatingValue } from '@/entities/rating/model/types';
import { FilmWithoutGenres } from '@/entities/films/model/types';

export type BookWithUserRating = Book & {
  userRating: RatingValue;
  userRatingCreatedAt: string;
};

export type FilmWithUserRating = FilmWithoutGenres & {
  userRating: RatingValue;
  userRatingCreatedAt: string;
};

export type GameWithUserRating = Game & {
  userRating: RatingValue;
  userRatingCreatedAt: string;
};

export function isBookWithRating(book: Book | BookWithUserRating): book is BookWithUserRating {
  return 'userRating' in book;
}

export type RatingChartItem = {
  id: string;
  title: string;
  posterUrl: string | null;
  type: 'book' | 'film' | 'game';
  rating: -1 | 0 | 1 | 2;
  ratedAt: string;
  meta: string | null;
  description: string | null;
};

export type RatingHistoryPage<T> = {
  items: T[];
  totalCount: number;
  totalPages: number;
};

export type RatingHistoryType = 'books' | 'films' | 'games';
