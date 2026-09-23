export const ROUTES = {
  HOME: '/',
  CINEMA: '/cinema',
  LIBRARY: '/library',
  TERMS: '/terms',
  PRIVACY: '/privacy',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  PROFILE: '/user/',
  SETTINGS: '/user/settings/',
  REVIEWS: '/reviews',
  DOWNLOADS: '/downloads',
  FILM_PAGE: '/cinema/film/',
  GAMES: '/games',
  GAME_PAGE: '/games/',
} as const;

// type Route = "/" | "/cinema" | "/library" | "/terms" | "/privacy"
export type Route = (typeof ROUTES)[keyof typeof ROUTES];
