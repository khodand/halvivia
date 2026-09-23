import 'server-only';

import { GAME_SORT_MAP, GAMES_PAGE_SIZE } from '@/entities/games/model/constants';
import { mapDbGame } from '@/entities/games/model/mappers';
import type { GameListFilters } from '@/entities/games/model/schemas';
import type { Game, NewGameInput } from '@/entities/games/model/types';
import { isPgError, pool } from '@/shared/lib/db';

const UNIQUE_VIOLATION_CODE = '23505';

function escapeLike(value: string) {
  return value.replace(/[\\%_]/g, (char) => `\\${char}`);
}

export async function listGames(
  filters: GameListFilters,
): Promise<{ games: Game[]; totalCount: number }> {
  const values: unknown[] = [];
  let whereSql = '';

  if (filters.search) {
    values.push(`%${escapeLike(filters.search)}%`);
    whereSql = `WHERE name ILIKE $1 ESCAPE '\\'`;
  }

  const orderBy = GAME_SORT_MAP[filters.sort];
  const offset = (filters.page - 1) * GAMES_PAGE_SIZE;
  const pageValues = [...values, GAMES_PAGE_SIZE, offset];

  const [countResult, pageResult] = await Promise.all([
    pool.query<{ total_count: number }>(
      `SELECT COUNT(*)::int AS total_count FROM games ${whereSql}`,
      values,
    ),
    pool.query(
      `
      SELECT *
      FROM games
      ${whereSql}
      ORDER BY ${orderBy}
      LIMIT $${values.length + 1}
      OFFSET $${values.length + 2}
    `,
      pageValues,
    ),
  ]);

  return {
    games: pageResult.rows.map(mapDbGame),
    totalCount: Number(countResult.rows[0]?.total_count ?? 0),
  };
}

export async function getGameById(id: string): Promise<Game | null> {
  const { rows } = await pool.query(
    `
    SELECT *
    FROM games
    WHERE id = $1
    LIMIT 1
  `,
    [id],
  );

  return rows[0] ? mapDbGame(rows[0]) : null;
}

export async function findGameBySteamAppId(steamAppId: number): Promise<Game | null> {
  const { rows } = await pool.query(
    `
    SELECT *
    FROM games
    WHERE steam_app_id = $1
    LIMIT 1
  `,
    [steamAppId],
  );

  return rows[0] ? mapDbGame(rows[0]) : null;
}

export async function addGameOrGetExisting(
  input: NewGameInput,
  createdByUserId: string,
): Promise<{ game: Game; created: boolean }> {
  try {
    const { rows } = await pool.query(
      `
      INSERT INTO games (
        steam_app_id,
        name,
        steam_url,
        header_image,
        short_description,
        developers,
        publishers,
        release_date,
        recent_review_label,
        recent_review_count,
        recent_review_score,
        russian_review_label,
        russian_review_count,
        russian_review_score,
        created_by_user_id
      )
      VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15
      )
      RETURNING *
    `,
      [
        input.steamAppId,
        input.name,
        input.steamUrl,
        input.headerImage,
        input.shortDescription,
        input.developers,
        input.publishers,
        input.releaseDate,
        input.recentReviewLabel,
        input.recentReviewCount,
        input.recentReviewScore,
        input.russianReviewLabel,
        input.russianReviewCount,
        input.russianReviewScore,
        createdByUserId,
      ],
    );

    return { game: mapDbGame(rows[0]), created: true };
  } catch (error) {
    if (!isPgError(error) || error.code !== UNIQUE_VIOLATION_CODE) {
      throw error;
    }

    const existingGame = await findGameBySteamAppId(input.steamAppId);

    if (!existingGame) {
      throw error;
    }

    return { game: existingGame, created: false };
  }
}
