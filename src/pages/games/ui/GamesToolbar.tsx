'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import AddGameDialogButton from '@/features/addGame/ui/AddGameDialogButton';
import { GAME_SORT_OPTIONS, type GameSort } from '@/entities/games/model/constants';
import { useDebouncedCallback } from 'use-debounce';

type GamesToolbarProps = {
  canAddGames: boolean;
  search?: string;
  sort: GameSort;
};

const controlClassName =
  'border-white/15 bg-bg-surface text-text-primary focus-visible:ring-primary h-10 rounded-lg border px-3 focus-visible:ring-2 focus-visible:outline-none';

export function GamesToolbar({ canAddGames, search, sort }: GamesToolbarProps) {
  const router = useRouter();
  const pathname = usePathname() ?? '/';
  const [searchText, setSearchText] = useState(search ?? '');
  const pushedSearch = useRef(search ?? '');

  useEffect(() => {
    const next = search ?? '';

    if (next === pushedSearch.current) return;

    pushedSearch.current = next;
    setSearchText(next);
  }, [search]);

  function pushQuery(mutate: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(window.location.search);
    mutate(params);
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  const commitSearch = useDebouncedCallback((value: string) => {
    const trimmed = value.trim();
    pushedSearch.current = trimmed;
    pushQuery((params) => {
      if (trimmed) {
        params.set('search', trimmed);
      } else {
        params.delete('search');
      }

      params.delete('page');
    });
  }, 400);

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <input
          className={`${controlClassName} placeholder:text-text-muted w-full md:w-72`}
          value={searchText}
          placeholder="Название игры"
          aria-label="Поиск игр"
          onChange={(event) => {
            const value = event.target.value;
            setSearchText(value);
            commitSearch(value);
          }}
        />
        <select
          className={`${controlClassName} w-full md:w-auto`}
          aria-label="Сортировка"
          value={sort}
          onChange={(event) => {
            const value = event.target.value;
            pushQuery((params) => {
              params.set('sort', value);
              params.delete('page');
            });
          }}
        >
          {GAME_SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      {canAddGames && <AddGameDialogButton />}
    </div>
  );
}
