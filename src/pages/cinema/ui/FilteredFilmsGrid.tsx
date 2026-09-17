'use client';

import { useQuery } from '@tanstack/react-query';
import { FilmCard } from '@/entities/films/ui/FilmCard';
import { getFilteredFilmsAction } from '@/pages/cinema/api/actions';
import { useState } from 'react';
import { Pagination } from '@/shared/ui/pagination/pagination';

export const fetchFilteredFilms = async (genreIds: number[], limit: number, page: number) => {
  const result = await getFilteredFilmsAction(genreIds, limit, page);

  if (!result.success) {
    throw new Error(result.error);
  }

  return result.data;
};

type FilmsGridProps = {
  genreIds: number[];
  limit?: number;
};

export function FilteredFilmsGrid({ genreIds, limit = 24 }: FilmsGridProps) {
  const [page, setPage] = useState(1);

  const {
    data: res,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['filtered-films', genreIds, limit, page],
    queryFn: () => fetchFilteredFilms(genreIds, limit, page),
    staleTime: 1000 * 60,
  });

  if (isLoading) {
    return <div>Загрузка...</div>;
  }

  if (isError) {
    return <div>Не удалось загрузить фильмы.</div>;
  }

  return (
    <>
      <div className="grid w-full grid-cols-2 gap-5 md:grid-cols-3 xl:grid-cols-4">
        {res?.films.map((film) => (
          <FilmCard
            key={film.id}
            id={film.id}
            name={film.nameRu}
            posterUrl={film.posterUrl}
            ratingAvg={film.ratingAvg}
            coverUrl={film.coverUrl}
            variant={'grid'}
          />
        ))}
      </div>

      <Pagination page={page} totalPages={res?.totalPages ?? 0} onChange={setPage} />
    </>
  );
}
