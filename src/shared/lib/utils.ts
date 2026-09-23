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

export function formatRelativeTime(date: Date) {
  const now = Date.now();
  const diff = now - date.getTime();

  const seconds = Math.floor(diff / 1000);

  if (seconds < 60) {
    return 'только что';
  }

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) {
    return `${minutes} ${pluralize(minutes, 'минуту', 'минуты', 'минут')} назад`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} ${pluralize(hours, 'час', 'часа', 'часов')} назад`;
  }

  const days = Math.floor(hours / 24);

  return `${days} ${pluralize(days, 'день', 'дня', 'дней')} назад`;
}

function pluralize(value: number, one: string, few: string, many: string) {
  const mod10 = value % 10;
  const mod100 = value % 100;

  if (mod10 === 1 && mod100 !== 11) return one;

  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
    return few;
  }

  return many;
}
