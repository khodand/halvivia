'use client';

import { ReactNode, useState } from 'react';
import { SetRatingRadio } from '@/features/setRating/ui/SetRatingRadio';
import { Subject } from '@/shared/model';

type Props = {
  userId: string;
  subject: Subject;
  children: ReactNode;
};

export function AddedSubjectRating({ userId, subject, children }: Props) {
  const [rating, setRating] = useState<number | null>(null);

  return (
    <div className="flex w-full flex-col items-center gap-8">
      {rating === null && (
        <div className="flex flex-col items-center gap-3">
          <span className="text-text-inverse-200 text-sm md:text-base">
            Оцени {subject.type === 'film' ? 'фильм' : 'книгу'}
          </span>

          <SetRatingRadio
            subject={subject}
            userId={userId}
            buttonVariant="light"
            handleSuccessChange={setRating}
          />
        </div>
      )}

      {children}
    </div>
  );
}
