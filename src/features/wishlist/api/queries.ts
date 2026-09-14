import { getUserBookWishlist, getUserFilmWishlist } from '@/features/wishlist/api/db';
import { mapFilms } from '@/entities/films/model/mappers';
import { mapDbBook } from '@/entities/books/model/mappers';
import { cacheLife, cacheTag } from 'next/cache';

export async function getFilmWishlist(userId: string, limit = 25, page = 1) {
  'use cache';

  cacheLife('minutes');
  cacheTag(`user:${userId}:film_wishlist`);

  const result = await getUserFilmWishlist(userId, limit, page);

  return {
    films: mapFilms(result.films),
    totalCount: result.totalCount,
    totalPages: result.totalPages,
  };
}

export async function getBookWishlist(userId: string, limit = 25, page = 1) {
  'use cache';

  cacheLife('minutes');
  cacheTag(`user:${userId}:book_wishlist`);

  const result = await getUserBookWishlist(userId, limit, page);

  return {
    books: result.books.map(mapDbBook),
    totalCount: result.totalCount,
    totalPages: result.totalPages,
  };
}
