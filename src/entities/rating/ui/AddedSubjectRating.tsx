'use client';

import { ReactNode, useState } from 'react';
import { SetRatingRadio } from '@/features/setRating/ui/SetRatingRadio';
import { Subject } from '@/shared/model';
import { SubjectType } from '@/shared/model/subject/types';

type Props = {
  userId: string;
  subject: Subject;
  children: ReactNode;
};

const subjectLabels = {
  film: 'фильм',
  book: 'книгу',
  game: 'игру',
} as const satisfies Record<SubjectType, string>;

export function AddedSubjectRating({ userId, subject, children }: Props) {
  const [rating, setRating] = useState<number | null>(null);

  return (
    <div className="flex w-full flex-col items-center gap-8">
      {rating === null && (
        <div className="flex flex-col items-center gap-3">
          <span className="text-text-inverse-200 text-sm md:text-base">
            Оцени {subjectLabels[subject.type]}
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
