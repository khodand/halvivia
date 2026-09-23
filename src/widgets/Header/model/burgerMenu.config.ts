import { ROUTES } from '@/shared/config';
import { IconName } from '@/shared/ui/icon/Icon';

type MenuItem = {
  title: string;
  href: string;
  icon: IconName;
};

export type MenuSection = {
  title: string;
  href: string;
  items: MenuItem[];
};

export const menuSections: MenuSection[] = [
  {
    title: 'Смотрильня',
    href: ROUTES.CINEMA,
    items: [
      {
        title: 'Добавить фильм',
        href: ROUTES.CINEMA,
        icon: 'AddIcon',
      },
    ],
  },
  {
    title: 'Читальня',
    href: ROUTES.LIBRARY,
    items: [
      {
        title: 'Добавить книгу',
        href: ROUTES.LIBRARY,
        icon: 'AddIcon',
      },
    ],
  },
  {
    title: 'Игротека',
    href: ROUTES.GAMES,
    items: [
      {
        title: 'Добавить игру',
        href: ROUTES.GAMES,
        icon: 'AddIcon',
      },
    ],
  },
];
