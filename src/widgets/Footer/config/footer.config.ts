import type { NavigationLink } from 'src/shared/config';
import { NAVIGATION_LINKS } from 'src/shared/config';
import { IconLinkProps } from 'src/shared/ui/icon-link';

type FooterSectionId = 'sections' | 'important' | 'contacts';

export type FooterSection = {
  id: FooterSectionId;
  title: string;
  links: NavigationLink[];
};

export const SOCIAL_LINKS: IconLinkProps[] = [
  {
    link: NAVIGATION_LINKS.DISCORD,
    iconName: 'DiscordIcon',
  },

  {
    link: NAVIGATION_LINKS.TELEGRAM,
    iconName: 'TelegramIcon',
  },
];

export const FOOTER_SECTIONS = [
  {
    id: 'sections',
    title: 'Разделы',
    links: [NAVIGATION_LINKS.CINEMA, NAVIGATION_LINKS.LIBRARY, NAVIGATION_LINKS.GAMES],
  },
  {
    id: 'important',
    title: 'Важное',
    links: [NAVIGATION_LINKS.TERMS, NAVIGATION_LINKS.PRIVACY],
  },

  {
    id: 'contacts',
    title: 'Контакты',
    links: [...SOCIAL_LINKS.map((SocialLink) => SocialLink.link)],
  },
] satisfies readonly FooterSection[];

export function isContactSection(section: Pick<FooterSection, 'id'>) {
  return section.id === 'contacts';
}
