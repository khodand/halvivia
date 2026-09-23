export type NewGameInput = {
  steamAppId: number;
  name: string;
  steamUrl: string;
  headerImage: string | null;
  shortDescription: string | null;
  developers: string[];
  publishers: string[];
  releaseDate: string | null;
  recentReviewLabel: string | null;
  recentReviewCount: number | null;
  recentReviewScore: number | null;
  russianReviewLabel: string | null;
  russianReviewCount: number | null;
  russianReviewScore: number | null;
};

export type Game = {
  id: string;
  steamAppId: number;
  name: string;
  steamUrl: string;
  headerImage: string | null;
  shortDescription: string | null;
  developers: string[];
  publishers: string[];
  releaseDate: string | null;
  recentReviewLabel: string | null;
  recentReviewCount: number | null;
  recentReviewScore: number | null;
  russianReviewLabel: string | null;
  russianReviewCount: number | null;
  russianReviewScore: number | null;
  createdByUserId: string | null;
  createdAt: string;
  ratingAvg: number | null;
  ratingCount: number | null;
};
