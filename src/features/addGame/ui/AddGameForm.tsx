'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import type { Game } from '@/entities/games/model/types';
import { AddedSubjectRating } from '@/entities/rating/ui/AddedSubjectRating';
import { useCurrentUserStore } from '@/entities/user/model/currentUserStore';
import {
  addGameAction,
  addGameByUrlAction,
  searchGamesAction,
} from '@/features/addGame/api/actions';
import type { SteamGameSearchHit } from '@/features/addGame/model/types';
import { ROUTES } from '@/shared/config';
import { Button } from '@/shared/ui/Button';
import Input from '@/shared/ui/Input/Input';
import Link from 'next/link';

const searchErrors = {
  UNAUTHORIZED: 'Добавлять игры могут только участники.',
  QUERY_TOO_SHORT: 'Введите хотя бы 2 символа.',
  QUERY_TOO_LONG: 'Слишком длинный запрос.',
  RATE_LIMITED: 'Слишком много запросов. Попробуйте чуть позже.',
  SEARCH_FAILED: 'Не удалось выполнить поиск в Steam.',
} as const;

const addErrors = {
  UNAUTHORIZED: 'Добавлять игры могут только участники.',
  INVALID_URL: 'Нужна ссылка на страницу игры: store.steampowered.com/app/…',
  NOT_A_GAME: 'Это не игра. DLC, саундтреки и демо не добавляем.',
  GAME_NOT_FOUND: 'Steam не нашёл такую игру.',
  GAME_ALREADY_EXISTS: 'Эта игра уже есть в игротеке.',
  RATE_LIMITED: 'Слишком много запросов. Попробуйте чуть позже.',
  ADD_FAILED: 'Не удалось сохранить игру.',
} as const;

export function AddGameForm() {
  const userId = useCurrentUserStore((state) => state.currentUser?.id);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SteamGameSearchHit[]>([]);
  const [selectedAppId, setSelectedAppId] = useState<number | null>(null);
  const [steamUrl, setSteamUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [existingGameId, setExistingGameId] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [addedGame, setAddedGame] = useState<Game | null>(null);

  function resetMessages() {
    setErrorMessage(null);
    setExistingGameId(null);
  }

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    resetMessages();
    setSelectedAppId(null);

    if (!query.trim()) return;

    setIsSearching(true);

    try {
      const result = await searchGamesAction(query);

      if (!result.success) {
        setResults([]);
        setErrorMessage(searchErrors[result.error]);
        return;
      }

      setResults(result.games);

      if (result.games.length === 0) {
        setErrorMessage('Ничего не найдено.');
      }
    } finally {
      setIsSearching(false);
    }
  }

  async function handleAddSelected() {
    if (selectedAppId == null) return;

    resetMessages();
    setIsAdding(true);

    try {
      const result = await addGameAction(selectedAppId);
      applyAddResult(result);
    } finally {
      setIsAdding(false);
    }
  }

  async function handleAddByUrl(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    resetMessages();
    setIsAdding(true);

    try {
      const result = await addGameByUrlAction(steamUrl);
      applyAddResult(result);
    } finally {
      setIsAdding(false);
    }
  }

  function applyAddResult(result: Awaited<ReturnType<typeof addGameAction>>) {
    if (result.success) {
      setAddedGame(result.game);
      return;
    }

    setErrorMessage(addErrors[result.error]);
    setExistingGameId(result.gameId ?? null);
  }

  function handleAddAnother() {
    setAddedGame(null);
    setQuery('');
    setResults([]);
    setSelectedAppId(null);
    setSteamUrl('');
    resetMessages();
  }

  if (addedGame) {
    return (
      <div className="text-text-inverse flex w-full flex-col items-center gap-8">
        <p className="text-center text-base font-medium">Игра добавлена: {addedGame.name}</p>
        {userId && (
          <AddedSubjectRating userId={userId} subject={{ type: 'game', id: addedGame.id }}>
            <p className="text-center text-sm">{addedGame.name}</p>
          </AddedSubjectRating>
        )}
        <Button
          type="button"
          variant="primaryOnLight"
          className="w-full"
          onClick={handleAddAnother}
        >
          Добавить ещё
        </Button>
      </div>
    );
  }

  return (
    <div className="text-text-inverse flex w-full flex-col gap-4">
      <form className="flex" onSubmit={(event) => void handleSearch(event)}>
        <Input
          searchIcon
          value={query}
          onChange={(event) => {
            resetMessages();
            setQuery(event.target.value);
          }}
          aria-label="Поиск игры в Steam"
          placeholder="Название игры"
          className="h-10 rounded-lg pr-8 text-sm"
          disabled={isAdding}
        />
      </form>

      {results.length > 0 && (
        <ul className="max-h-64 overflow-y-auto">
          {results.map((game) => {
            const isSelected = game.steamAppId === selectedAppId;

            return (
              <li key={game.steamAppId}>
                <button
                  type="button"
                  onClick={() => {
                    resetMessages();
                    setSelectedAppId(game.steamAppId);
                  }}
                  className={`border-border-inverse-200 w-full border-b py-3 text-left text-sm font-medium last:border-b-0 ${
                    isSelected ? 'bg-border-inverse-200/30' : 'hover:bg-border-inverse-200/20'
                  }`}
                >
                  {game.name}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <Button
        disabled={selectedAppId == null || isAdding || isSearching}
        type="button"
        variant="primaryOnLight"
        className="w-full"
        onClick={() => void handleAddSelected()}
      >
        {isAdding ? 'Добавление...' : 'Добавить из поиска'}
      </Button>

      <form className="flex flex-col gap-3" onSubmit={(event) => void handleAddByUrl(event)}>
        <Input
          value={steamUrl}
          onChange={(event) => {
            resetMessages();
            setSteamUrl(event.target.value);
          }}
          aria-label="Ссылка на игру в Steam"
          placeholder="https://store.steampowered.com/app/…"
          className="h-10 rounded-lg text-sm"
          disabled={isAdding}
        />
        <Button
          disabled={!steamUrl.trim() || isAdding}
          type="submit"
          variant="outlineBlue"
          className="w-full"
        >
          Добавить по ссылке
        </Button>
      </form>

      {isSearching && <p className="text-text-inverse-500 text-sm">Ищем в Steam...</p>}
      {errorMessage && <p className="text-error text-sm">{errorMessage}</p>}
      {existingGameId && (
        <Link
          href={`${ROUTES.GAME_PAGE}${existingGameId}`}
          className="text-primary text-sm underline"
        >
          Открыть игру
        </Link>
      )}
    </div>
  );
}

export default AddGameForm;
