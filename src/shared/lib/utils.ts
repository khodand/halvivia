import clsx, { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Subject } from '@/shared/model';
import { ROUTES } from '@/shared/config';

export function cn(...args: ClassValue[]) {
  return twMerge(clsx(args));
}

export function getSubjectRef(subject: Subject) {
  switch (subject.type) {
    case 'book': {
      return ROUTES.LIBRARY + `/${subject.id}`;
    }
    case 'film': {
      return ROUTES.FILM_PAGE + `${subject.id}`;
    }
  }
}
