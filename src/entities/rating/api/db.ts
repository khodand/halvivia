import 'server-only';

import { sql, pool } from '@/shared/lib/db';
import { DbRating, DbRatingWithUser } from '@/entities/rating/model/types';
import { Subject } from '@/shared/model';

export async function upsertRating({
  userId,
  subjectId,
  subjectType,
  newRating,
}: {
  userId: string;
  subjectId: string;
  subjectType: 'film' | 'book';
  newRating: number;
}) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. блокируем сущность (film/book)
    const { rows: subjectRows } = await client.query(
      `
      SELECT rating_sum, rating_count
      FROM ${subjectType === 'film' ? 'films' : 'books'}
      WHERE id = $1
      FOR UPDATE
      `,
      [subjectId],
    );

    const subject = subjectRows[0];

    if (!subject) {
      throw new Error(`${subjectType} not found`);
    }

    // 2. читаем старый рейтинг пользователя
    const { rows: ratingRows } = await client.query(
      `
      SELECT rating
      FROM ratings
      WHERE user_id = $1
        AND subject_type = $2
        AND subject_id = $3
      `,
      [userId, subjectType, subjectId],
    );

    const oldRating = ratingRows[0]?.rating ?? null;

    // 3. upsert рейтинга пользователя
    const { rows: resRows } = await client.query(
      `
      INSERT INTO ratings (user_id, subject_type, subject_id, rating)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id, subject_type, subject_id)
      DO UPDATE SET rating = EXCLUDED.rating
      RETURNING *
      `,
      [userId, subjectType, subjectId, newRating],
    );
    const result = resRows[0];
    // 4. пересчёт агрегатов
    let ratingSum = subject.rating_sum;
    let ratingCount = subject.rating_count;

    if (oldRating === null) {
      ratingSum += newRating;
      ratingCount += 1;
    } else {
      ratingSum += newRating - oldRating;
    }

    const ratingAvg = ratingCount === 0 ? null : ratingSum / ratingCount;

    // 5. обновляем сущность
    await client.query(
      `
      UPDATE ${subjectType === 'film' ? 'films' : 'books'}
      SET
        rating_sum = $1,
        rating_count = $2,
        rating_avg = $3
      WHERE id = $4
      `,
      [ratingSum, ratingCount, ratingAvg, subjectId],
    );

    await client.query('COMMIT');
    return result;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

export async function getRatingsBySubject(params: {
  subject: Subject;
  limit?: number;
}): Promise<DbRatingWithUser[]> {
  const limit = params.limit ?? 20;

  return (await sql`
    SELECT
      ratings.*,
      json_build_object(
          'id', users.id,
          'name', users.name,
          'avatar_url', users.avatar_url
      ) AS user
    FROM ratings
           JOIN users ON users.id = ratings.user_id
    WHERE ratings.subject_type = ${params.subject.type}
      AND ratings.subject_id = ${params.subject.id}
    ORDER BY ratings.created_at DESC
    LIMIT ${limit};
  `) as DbRatingWithUser[];
}

export async function getRatingByUserIdAndSubject(params: {
  userId: string;
  subject: Subject;
}): Promise<DbRating | null> {
  const { id: subjectId, type: subjectType } = params.subject;

  const result = (await sql`
    SELECT *
    FROM ratings
    WHERE user_id = ${params.userId}
      AND subject_type = ${subjectType}
      AND subject_id = ${subjectId}
    LIMIT 1;
  `) as DbRating[];

  return result[0] ?? null;
}

export async function getRatingsByUser(params: {
  userId: string;
  subjectType?: string;
  limit?: number;
}): Promise<DbRating[]> {
  const limit = params.limit ?? 50;
  return (await sql`
    SELECT *
    FROM ratings
    WHERE user_id = ${params.userId}
      AND (
      ${params.subjectType} IS NULL
        OR subject_type = ${params.subjectType}
      )
    ORDER BY created_at DESC
    LIMIT ${limit};
  `) as DbRating[];
}
