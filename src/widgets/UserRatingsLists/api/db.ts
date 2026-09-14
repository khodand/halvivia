import 'server-only';
import { sql } from '@/shared/lib/db';
import { BookWithUserRating, FilmWithUserRating } from '@/widgets/UserRatingsLists/model/types';
import { DbBook, mapDbBook } from '@/entities/books/model/mappers';
import { RatingValue } from '@/entities/rating/model/types';
import { DbFilm } from '@/entities/films/model/types';
import { mapDbFilmToFilmWithoutGenres } from '@/entities/films/model/mappers';
import { cacheLife, cacheTag } from 'next/cache';

export async function getUserBooksWithRating(
  userId: string,
  page = 1,
  limit = 20,
): Promise<{
  items: BookWithUserRating[];
  totalPages: number;
  totalCount: number;
}> {
  'use cache';

  cacheLife('minutes');
  cacheTag(`user:${userId}:ratings`);

  const offset = (page - 1) * limit;

  const [rows, countRows] = await Promise.all([
    sql`
      SELECT
        b.*,
        r.rating AS user_rating,
        r.created_at AS user_rating_created_at
      FROM books b
             INNER JOIN ratings r
                        ON r.subject_id = b.id
                          AND r.subject_type = 'book'
                          AND r.user_id = ${userId}
      ORDER BY r.created_at DESC
      LIMIT ${limit}
        OFFSET ${offset}
    `,

    sql`
      SELECT COUNT(*) AS total_count
      FROM ratings r
      WHERE r.subject_type = 'book'
        AND r.user_id = ${userId}
    `,
  ]);

  const items = (
    rows as (DbBook & {
      user_rating: RatingValue;
      user_rating_created_at: string;
    })[]
  ).map((row) => {
    const { user_rating, user_rating_created_at, ...bookFields } = row;

    return {
      ...mapDbBook(bookFields),
      userRating: user_rating,
      userRatingCreatedAt: user_rating_created_at,
    };
  });

  const totalCount = Number(countRows[0].total_count);

  return {
    items,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
  };
}

export async function getUserFilmsWithRating(
  userId: string,
  page = 1,
  limit = 20,
): Promise<{
  items: FilmWithUserRating[];
  totalPages: number;
  totalCount: number;
}> {
  'use cache';

  cacheLife('minutes');
  cacheTag(`user:${userId}:ratings`);

  const offset = (page - 1) * limit;

  const [rows, countRows] = await Promise.all([
    sql`
      SELECT
        f.*,
        r.rating AS user_rating,
        r.created_at AS user_rating_created_at
      FROM films f
             INNER JOIN ratings r
                        ON r.subject_id = f.id
                          AND r.subject_type = 'film'
                          AND r.user_id = ${userId}
      ORDER BY r.created_at DESC
      LIMIT ${limit}
        OFFSET ${offset}
    `,

    sql`
      SELECT COUNT(*) AS total_count
      FROM ratings r
      WHERE r.subject_type = 'film'
        AND r.user_id = ${userId}
    `,
  ]);

  const items = (
    rows as (DbFilm & {
      user_rating: RatingValue;
      user_rating_created_at: string;
    })[]
  ).map((row) => {
    const { user_rating, user_rating_created_at, ...filmFields } = row;

    return {
      ...mapDbFilmToFilmWithoutGenres(filmFields),
      userRating: user_rating,
      userRatingCreatedAt: user_rating_created_at,
    };
  });

  const totalCount = Number(countRows[0].total_count);

  return {
    items,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
  };
}
