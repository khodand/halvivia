'use server';

import { ActionResult, Subject } from '@/shared/model';
import { Rating } from '@/entities/rating/model/types';
import { upsertRating } from '@/entities/rating/api/db';
import { mapDbRatingToRating } from '@/entities/rating/model/mappers';
import { withAuth } from '@/shared/lib/auth';
import { updateTag } from 'next/cache';

export async function setRatingAction(params: {
  subject: Subject;
  value: number;
}): Promise<ActionResult<Rating>> {
  const session = await withAuth();
  if (session.status === 'unauthenticated') return { success: false, error: 'UNAUTHENTICATED' };

  const userId = session.payload.userId;

  try {
    const dbRating = await upsertRating({
      userId,
      subjectType: params.subject.type,
      subjectId: params.subject.id,
      newRating: params.value,
    });

    const rating = mapDbRatingToRating(dbRating);

    updateTag(`user:${userId}:ratings`);
    updateTag(`ratings:${params.subject.type}:${params.subject.id}`);

    return {
      success: true,
      data: rating,
    };
  } catch (e) {
    console.error('setRating failed:', e);

    return {
      success: false,
      error: 'DB_ERROR',
    };
  }
}
