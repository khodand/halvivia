'use client';

import { useState } from 'react';
import { getRatingsBySubjectAction } from '@/entities/rating';
import { RatingWithUser } from '@/entities/rating/model/types';
import { getRatingColorClass } from '@/entities/rating/lib/utils';
import { Subject } from '@/shared/model';
import { StarIcon } from '@/shared/ui/icons';

import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/shared/ui/hover-card/HoverCard';

import RatingList from '@/widgets/SubjectRatingStar/ui/RatingList';

export type SubjectRatingStarProps = {
  avgRating: number | null;
  subject: Subject;
  className?: string;
};

export function SubjectRatingStar({ avgRating, subject, className }: SubjectRatingStarProps) {
  const [ratings, setRatings] = useState<RatingWithUser[] | null>(null);
  const [loading, setLoading] = useState(false);

  async function loadRatings() {
    if (ratings || loading) return;

    setLoading(true);

    const result = await getRatingsBySubjectAction({ subject });

    if (result.success) {
      setRatings(result.data);
    }

    setLoading(false);
  }

  return (
    <HoverCard openDelay={250}>
      <HoverCardTrigger asChild onMouseEnter={loadRatings}>
        <span
          className={`inline-flex cursor-default items-center gap-1 ${getRatingColorClass(avgRating)} ${className}`}
        >
          <StarIcon className="w-4" fill="currentColor" />
          {avgRating}
        </span>
      </HoverCardTrigger>

      <HoverCardContent
        align="center"
        side="top"
        className="bg-bg-surface ring-border-default z-150 w-72 rounded-xl p-3 shadow-lg"
      >
        {loading ? (
          <div className="text-text-secondary py-4 text-center text-sm">Loading...</div>
        ) : ratings?.length ? (
          <>
            <div className="border-border mb-3 flex items-center justify-between border-b pb-2">
              <span className="text-sm font-semibold">Оценки пользователей</span>
              <span className="text-text-secondary text-sm">({ratings.length})</span>
            </div>

            <RatingList ratings={ratings} className="max-h-64 overflow-y-auto" />
          </>
        ) : (
          <div className="text-text-secondary py-4 text-center text-sm">Оценок пока нет</div>
        )}
      </HoverCardContent>
    </HoverCard>
  );
}

export default SubjectRatingStar;
