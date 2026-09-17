import { filmsQuery } from '@/entities/films/api/filmsQuery';
import { PaginationClient } from '@/pages/lists/PaginationClient';
import FilterForm from '@/pages/lists/FilterForm';
import { parseFilmFiltersFromSearchParams } from '@/pages/lists/model';
import { getFilmGenres } from '@/entities/films/api/api';
import FilmCard from '@/entities/films/ui/FilmCard';

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function ListsPage({ searchParams }: Props) {
  const params = await searchParams;

  const filters = parseFilmFiltersFromSearchParams(params);

  const result = await filmsQuery(filters);

  if (!result.success) {
    return <>Не удалось загрузить фильмы</>;
  }

  const genresResult = await getFilmGenres();

  if (!genresResult.success) {
    return <>не удалось загрузить жанры</>;
  }

  return (
    <div className="page-content-width py-6">
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[280px_1fr]">
        <div className={'sticky h-fit lg:top-24'}>
          <FilterForm filters={filters} genres={genresResult.data} />
        </div>
        <div className="flex w-full flex-col gap-6">
          <div className="grid w-full grid-cols-2 gap-5 md:grid-cols-3 xl:grid-cols-4">
            {result.data.films.map((film) => (
              <FilmCard
                key={film.id}
                id={film.id}
                name={film.nameRu}
                posterUrl={film.posterUrl}
                ratingAvg={film.ratingAvg}
                variant={'grid'}
                coverUrl={film.coverUrl}
              />
            ))}
          </div>

          <PaginationClient
            page={filters.page}
            totalPages={Math.ceil(result.data.totalCount / filters.limit)}
          />
        </div>
      </div>
    </div>
  );
}

export default ListsPage;
