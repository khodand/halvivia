import { ROUTES } from './routes';
import type { NavigationHref, NavigationLink } from './types';

export const NAVIGATION_LINKS = {
  HOME: {
    id: 'home',
    label: 'Home',
    href: ROUTES.HOME,
  },

  CINEMA: {
    id: 'cinema',
    label: 'Смотрильня',
    href: ROUTES.CINEMA,
  },

  LIBRARY: {
    id: 'library',
    label: 'Читальня',
    href: ROUTES.LIBRARY,
  },

  GAMES: {
    id: 'games',
    label: 'Игротека',
    href: ROUTES.GAMES,
  },

  TERMS: {
    id: 'terms',
    label: 'Пользовательское соглашение',
    href: ROUTES.TERMS,
  },

  PRIVACY: {
    id: 'privacy',
    label: 'Политика конфиденциальности',
    href: ROUTES.PRIVACY,
  },

  EMAIL: {
    id: 'email',
    label: 'halva-povidlo@gmail.com',
    href: 'mailto:halva-povidlo@gmail.com',
  },

  DISCORD: {
    id: 'discord',
    label: 'Discord',
    href: 'https://discord.com',
  },

  TELEGRAM: {
    id: 'telegram',
    label: 'Telegram',
    href: 'https://t.me',
  },

  DISCORD_AUTH: {
    id: 'discordAuth',
    label: 'Войти через discord',
    href: process.env.NEXT_PUBLIC_DISCORD_OAUTH_LINK as NavigationHref,
    //href: 'https://discord.com/oauth2/authorize?client_id=1511191352887611452&response_type=code&redirect_uri=https%3A%2F%2Fhalvivia.vercel.app%2Fauth%2Fdiscord%2F&scope=identify+guilds',
  },

  DISCORD_REDIRECT: {
    id: 'discordAuth',
    label: 'dsRedirect',
    href: process.env.NEXT_PUBLIC_DISCORD_REDIRECT_LINK as NavigationHref,
    //href: 'https://halvivia.vercel.app/auth/discord/'
    //href: 'http://localhost:3000/auth/discord/'
  },
  LOGIN: {
    id: 'login',
    href: ROUTES.LOGIN,
    label: 'Войти',
  },

  REGISTER: {
    id: 'register',
    href: ROUTES.REGISTER,
    label: 'Зарегистрироваться',
  },

  PROFILE: {
    id: 'profile',
    href: ROUTES.PROFILE,
    label: 'Профиль',
  },

  SETTINGS: {
    id: 'settings',
    href: ROUTES.SETTINGS,
    label: 'Настройки',
  },

  REVIEWS: {
    id: 'reviews',
    href: ROUTES.REVIEWS,
    label: 'Оценки',
  },

  DOWNLOADS: {
    id: 'downloads',
    href: ROUTES.DOWNLOADS,
    label: 'Загрузки',
  },
} as const satisfies Record<string, NavigationLink>;
