'use client';

import { cn } from '@/shared';

export type Props = {
  value: number;
  active: boolean;
  disabled: boolean;
  onClick: () => void;
  variant?: keyof typeof buttonVariants;
};

function getValueClass(value: number, active: boolean) {
  switch (value) {
    case -1:
      return active ? 'text-red-base' : 'hover:text-red-base';
    case 0:
      return active ? 'text-yellow-base' : 'hover:text-yellow-base';
    case 1:
    case 2:
      return active ? 'text-green-base' : 'hover:text-green-base';
    default:
      return '';
  }
}

const baseStyles = `flex h-10 w-10 items-center justify-center rounded-sm font-heading font-semibold transition-colors duration-300 ease-out`;

//TODO: light-variant поправить
const buttonVariants = {
  light: {
    base: 'text-text-inverse-500 bg-bg-base-050',
    active: 'border border-white bg-bg-inverse-050',
  },
  dark: {
    base: 'text-text-secondary bg-bg-inverse-100',
    active: 'border border-white bg-bg-inverse-050',
  },
} as const;

export function SetRatingButton({ value, active, disabled, onClick, variant = 'dark' }: Props) {
  const valueClass = getValueClass(value, active);

  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        baseStyles,
        buttonVariants[variant].base,
        active && buttonVariants[variant].active,
        valueClass,
        disabled && 'cursor-not-allowed opacity-50',
      )}
    >
      {value}
    </button>
  );
}
