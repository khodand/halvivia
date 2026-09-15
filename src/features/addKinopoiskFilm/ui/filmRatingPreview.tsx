import { Image } from '@imagekit/next';
import type { Film } from '@/entities/films/model/types';
import { IMAGEKIT_URL_ENPOINT } from '@/shared/config';
import KinopoiskLogo from '@/shared/assets/kinopoisk-logo.svg';
import Link from 'next/link';
import { getFilmRefById } from '@/entities/films/lib/utils';

type Props = {
  film: Film;
};

export function FilmRatingPreview({ film }: Props) {
  return (
    <article className="flex w-full gap-4">
      <div className="relative h-46 w-29 shrink-0 overflow-hidden">
        <Image
          urlEndpoint={IMAGEKIT_URL_ENPOINT}
          src={film.posterUrl}
          width={301}
          height={389}
          alt={`The ${film.nameRu} poster`}
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <Link href={getFilmRefById(film.id)}>
          <h2 className="line-clamp-2 text-xl leading-tight font-bold">
            {film.nameRu ?? film.nameOriginal}
          </h2>
        </Link>

        <p className="text-text-inverse-500 mt-1 line-clamp-2 text-base">
          {[
            film.countries?.map((country) => country).join(', '),
            film.genres?.map((genre) => genre.genre).join(', '),
            film.year,
          ]
            .filter(Boolean)
            .join(', ')}
        </p>

        {film.ratingKinopoisk != null && (
          <div className="mt-2 flex items-center gap-1.5">
            <KinopoiskLogo classname={'inline'}></KinopoiskLogo>
            <span className="text-base font-medium">{film.ratingKinopoisk}</span>
          </div>
        )}

        {film.description && (
          <p className="mt-3 line-clamp-4 text-base leading-relaxed">{film.description}</p>
        )}
      </div>
    </article>
  );
}

export default FilmRatingPreview;
