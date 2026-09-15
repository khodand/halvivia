'use client';

import Input from '@/shared/ui/Input/Input';
import { Button } from '@/shared/ui/Button';
import { ChangeEvent, useEffect, useState, useTransition } from 'react';
import { useDebouncedCallback } from 'use-debounce';

import { addKinopoiskFilmAction } from '@/features/addKinopoiskFilm/api/actions';
import { useSearchByKeyword } from '@/features/addKinopoiskFilm/model/useSearchByKeyword';
import FilmPreview from '@/features/addKinopoiskFilm/ui/FilmPreview';
import SearchBox from '@/shared/ui/search-box/SearchBox';
import { StatusBlock } from '@/features/addKinopoiskFilm/ui/StatusBlock';
import FilmRatingPreview from '@/features/addKinopoiskFilm/ui/filmRatingPreview';

import { getFilmRefById } from '@/entities/films/lib/utils';
import { Film } from '@/entities/films/model/types';

import { useCurrentUserStore } from '@/entities/user/model/currentUserStore';
import { AddedSubjectRating } from '@/entities/rating/ui/AddedSubjectRating';

export function parseKinopoiskFilmId(url: string): number | null {
  if (typeof url !== 'string') return null;

  const match = url.match(/kinopoisk\.ru\/[^/]+\/(\d+)\b/);

  return match ? Number(match[1]) : null;
}

export function KinopoiskForm() {
  const [currentRef, setCurrentRef] = useState('');
  const [keyword, setKeyword] = useState('');
  const [isValidOrEmpty, setValidOrEmpty] = useState(true);
  const [isPending, startTransition] = useTransition();

  const [addedFilm, setAddedFilm] = useState<Film | null>(null);

  const { data, loading, error, search } = useSearchByKeyword();

  const userId = useCurrentUserStore((state) => state.currentUser?.id);

  const addFilm = (filmId: number) => {
    startTransition(async () => {
      const res = await addKinopoiskFilmAction(filmId);

      if (!res.success || !res.data) {
        return;
      }

      setAddedFilm(res.data);
    });
  };

  const onSubmit = () => {
    if (!isValidOrEmpty) return;

    const filmId = parseKinopoiskFilmId(currentRef);

    if (filmId === null) return;

    addFilm(filmId);
  };

  const debouncedRefValidation = useDebouncedCallback((value: string) => {
    if (value === '') {
      setValidOrEmpty(true);
      return;
    }

    setValidOrEmpty(Boolean(parseKinopoiskFilmId(value)));
  }, 500);

  const debouncedSearch = useDebouncedCallback((value: string) => {
    search(value);
  }, 1000);

  useEffect(() => {
    debouncedRefValidation(currentRef);
  }, [currentRef, debouncedRefValidation]);

  if (addedFilm) {
    return (
      <div className="text-text-inverse flex w-full min-w-100 flex-col items-center gap-8 md:w-[22vw]">
        <StatusBlock status={true} filmRef={getFilmRefById(addedFilm.id)} />
        {userId && (
          <AddedSubjectRating
            userId={userId}
            subject={{
              type: 'film',
              id: addedFilm.id,
            }}
          >
            <FilmRatingPreview film={addedFilm} />
          </AddedSubjectRating>
        )}
        <Button
          type="button"
          variant="primaryOnLight"
          onClick={() => {
            setAddedFilm(null);
            setCurrentRef('');
            setKeyword('');
          }}
          className="w-full lg:text-xl"
        >
          Добавить ещё
        </Button>
      </div>
    );
  }

  return (
    <form className="flex w-full min-w-100 flex-col gap-8 md:w-[22vw]">
      <div className="relative flex w-full flex-col items-center gap-3.5 overflow-visible">
        <Input
          value={keyword}
          onChange={(e) => {
            const value = e.target.value;

            setKeyword(value);
            debouncedSearch(value);
          }}
          searchIcon
          placeholder="Поиск"
          className="text-sm md:text-base lg:text-xl"
          type="text"
        />

        {keyword.length === 0 && (
          <label className="text-text-inverse-500 text-xs lg:text-sm">Введи название фильма</label>
        )}

        <SearchBox show={keyword.length > 2}>
          {loading && <p>Loading...</p>}

          {error && <p>{error}</p>}

          <div className="flex flex-col items-start gap-4 lg:items-center">
            <div className="h-91.25 w-full overflow-y-scroll">
              <ul className="flex flex-col gap-1">
                {data?.map((film) => (
                  <li key={film.filmId}>
                    <FilmPreview film={film} onAdd={addFilm} isPending={isPending} />
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-text-inverse-500">Не нашел нужный фильм? Добавь по ссылке</p>

            <Button
              disabled={isPending || !isValidOrEmpty}
              onClick={onSubmit}
              type="button"
              variant="primaryOnLight"
              className="w-full lg:text-xl"
            >
              {isPending ? 'Добавление...' : 'Добавить'}
            </Button>
          </div>
        </SearchBox>
      </div>

      <div
        className={`flex flex-col gap-10 ${
          keyword.length === 0 ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <div className="text-text-inverse-200 flex flex-row items-center gap-4 text-sm md:text-lg">
          <hr className="flex-1" />
          или
          <hr className="flex-1" />
        </div>

        <div className="flex min-h-14 w-full flex-col items-center gap-1">
          <Input
            value={currentRef}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setCurrentRef(e.target.value);
            }}
            placeholder="https://"
            className="text-sm md:text-base lg:text-xl"
            type="text"
          />

          {!isValidOrEmpty && (
            <label className="text-error block w-fit text-[10px] lg:text-xs">
              *Видеосервис не поддерживается или ссылка некорректная
            </label>
          )}

          <label className="text-text-inverse-500 mt-2.5 text-xs lg:text-sm">
            Укажи ссылку на фильм на Кинопоиске
          </label>
        </div>

        <Button
          disabled={isPending || !isValidOrEmpty}
          onClick={onSubmit}
          type="button"
          variant="primaryOnLight"
          className="w-full lg:text-xl"
        >
          {isPending ? 'Добавление...' : 'Добавить'}
        </Button>
      </div>
    </form>
  );
}

export default KinopoiskForm;
