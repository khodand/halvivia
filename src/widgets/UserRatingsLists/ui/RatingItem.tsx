import Link from 'next/link';

import type { RatingChartItem } from '../model/types';
import { RatingItemPoster } from './RatingItemPoster';
import { getSubjectRef } from '@/shared/lib/utils';

type RatingItemProps = {
  item: RatingChartItem;
  showDetails?: boolean;
};

const RATING_COLORS: Record<RatingChartItem['rating'], string> = {
  [-1]: '#ef4444',
  [0]: '#94a3b8',
  [1]: '#3b82f6',
  [2]: '#8b5cf6',
};

const RATING_LABELS: Record<RatingChartItem['rating'], string> = {
  [-1]: 'Не понравилось',
  [0]: 'Нейтрально',
  [1]: 'Понравилось',
  [2]: 'Очень понравилось',
};

export function RatingItem({ item, showDetails = true }: RatingItemProps) {
  const ratedAt = new Date(item.ratedAt).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const itemRef = getSubjectRef({ type: item.type, id: item.id });
  return (
    <div>
      <div className="flex gap-3">
        <RatingItemPoster item={item} />

        <div className="min-w-0 flex-1">
          <Link
            href={itemRef}
            className="hover:text-primary line-clamp-2 text-sm leading-5 font-semibold text-slate-900 transition-colors"
          >
            {item.title}
          </Link>

          <div className="mt-1 text-xs text-slate-500">{ratedAt}</div>

          <div className="mt-2 flex items-center gap-2">
            <span
              className="inline-flex h-6 min-w-6 items-center justify-center rounded-md px-1.5 text-xs font-bold text-white"
              style={{
                backgroundColor: RATING_COLORS[item.rating],
              }}
            >
              {item.rating}
            </span>

            <span className="text-xs font-medium text-slate-600">{RATING_LABELS[item.rating]}</span>
          </div>
        </div>
      </div>

      {showDetails && (
        <>
          {item.meta && <div className="mt-3 text-xs text-slate-500">{item.meta}</div>}

          {item.description && (
            <div className="mt-2 line-clamp-3 text-xs leading-5 text-slate-500">
              {item.description}
            </div>
          )}
        </>
      )}
    </div>
  );
}
