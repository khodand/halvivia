import type { Game } from './types';

export type DbGame = {
  id: string;
  steam_app_id: number;
  name: string;
  steam_url: string;
  header_image?: string | null;
  short_description?: string | null;
  developers?: string[] | null;
  publishers?: string[] | null;
  release_date?: string | null;
  recent_review_label?: string | null;
  recent_review_count?: number | null;
  recent_review_score?: number | null;
  russian_review_label?: string | null;
  russian_review_count?: number | null;
  russian_review_score?: number | null;
  created_by_user_id: string | null;
  created_at: string | Date;
  rating_avg: string | null;
  rating_count: number | null;
};

function textList(value: string[] | null | undefined) {
  return (value ?? []).map((item) => item.trim()).filter((item) => item.length > 0);
}

export function mapDbGame(row: DbGame): Game {
  return {
    id: row.id,
    steamAppId: row.steam_app_id,
    name: row.name,
    steamUrl: row.steam_url,
    headerImage: row.header_image ?? null,
    shortDescription: row.short_description?.trim() || null,
    developers: textList(row.developers),
    publishers: textList(row.publishers),
    releaseDate: row.release_date?.trim() || null,
    recentReviewLabel: row.recent_review_label?.trim() || null,
    recentReviewCount: row.recent_review_count ?? null,
    recentReviewScore: row.recent_review_score ?? null,
    russianReviewLabel: row.russian_review_label?.trim() || null,
    russianReviewCount: row.russian_review_count ?? null,
    russianReviewScore: row.russian_review_score ?? null,
    createdByUserId: row.created_by_user_id,
    createdAt:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : new Date(row.created_at).toISOString(),
    ratingAvg: row.rating_avg == null ? null : Number(row.rating_avg),
    ratingCount: row.rating_count,
  };
}
