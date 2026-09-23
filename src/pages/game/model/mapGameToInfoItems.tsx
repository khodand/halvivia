import type { Game } from '@/entities/games/model/types';
import type { InfoItem } from '@/pages/film/ui/Info';

const reviewCountFormat = new Intl.NumberFormat('ru-RU');

type StoredReview = {
  label: string;
  totalReviews: number;
  score: number;
};

function reviewToneClass(score: number) {
  if (score >= 6) {
    return 'text-[#66c0f4]';
  }

  if (score === 5) {
    return 'text-[#b9a074]';
  }

  if (score > 0) {
    return 'text-[#a34c25]';
  }

  return 'text-text-secondary';
}

function storedReview(
  label: string | null,
  totalReviews: number | null,
  score: number | null,
): StoredReview | null {
  if (!label || totalReviews == null || totalReviews <= 0 || score == null) {
    return null;
  }

  return { label, totalReviews, score };
}

function ReviewValue({ summary, href }: { summary: StoredReview; href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`hover:underline ${reviewToneClass(summary.score)}`}
    >
      {summary.label} ({reviewCountFormat.format(summary.totalReviews)})
    </a>
  );
}

function SteamNameLinks({ names, kind }: { names: string[]; kind: 'developer' | 'publisher' }) {
  return (
    <span className="flex flex-wrap gap-x-2">
      {names.map((name) => (
        <a
          key={`${kind}-${name}`}
          href={`https://store.steampowered.com/search/?${kind}=${encodeURIComponent(name)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#66c0f4] hover:underline"
        >
          {name}
        </a>
      ))}
    </span>
  );
}

export function mapGameToInfoItems(game: Game): InfoItem[] {
  const recentReviews = storedReview(
    game.recentReviewLabel,
    game.recentReviewCount,
    game.recentReviewScore,
  );
  const russianReviews = storedReview(
    game.russianReviewLabel,
    game.russianReviewCount,
    game.russianReviewScore,
  );

  return [
    recentReviews
      ? {
          key: 'recent-reviews',
          label: 'Недавние обзоры',
          render: () => (
            <ReviewValue summary={recentReviews} href={`${game.steamUrl}#app_reviews_hash`} />
          ),
        }
      : null,
    russianReviews
      ? {
          key: 'russian-reviews',
          label: 'Обзоры (русский)',
          render: () => (
            <ReviewValue
              summary={russianReviews}
              href={`https://steamcommunity.com/app/${game.steamAppId}/reviews/?browsefilter=toprated&filterLanguage=russian`}
            />
          ),
        }
      : null,
    game.releaseDate
      ? {
          key: 'release-date',
          label: 'Дата выхода',
          value: game.releaseDate,
        }
      : null,
    game.developers.length > 0
      ? {
          key: 'developers',
          label: 'Разработчик',
          render: () => <SteamNameLinks names={game.developers} kind="developer" />,
        }
      : null,
    game.publishers.length > 0
      ? {
          key: 'publishers',
          label: 'Издатель',
          render: () => <SteamNameLinks names={game.publishers} kind="publisher" />,
        }
      : null,
    {
      key: 'steam',
      label: 'Ссылки',
      render: () => (
        <a
          href={game.steamUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#66c0f4] hover:underline"
        >
          Steam
        </a>
      ),
    },
  ].filter(Boolean) as InfoItem[];
}
