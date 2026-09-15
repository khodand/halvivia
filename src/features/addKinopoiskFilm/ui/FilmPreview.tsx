import { FilmSearchByKeywordItem } from '@/features/addKinopoiskFilm/model/types';
import { Icon } from '@/shared/ui/icon';
import Image from 'next/image';

export type FilmPreviewProps = {
  film: FilmSearchByKeywordItem;
  onAdd: (filmId: number) => void;
  isPending: boolean;
};

export function FilmPreview({ film, onAdd, isPending }: FilmPreviewProps) {
  return (
    <div className="hover:bg-bg-gray-100 flex h-19 items-center gap-3">
      {/* Poster */}
      <img
        src={film.posterUrlPreview}
        alt={'Постер' + film.nameRu}
        className="h-19 w-12 object-cover"
      />

      {/* Info */}
      <div className="flex flex-1 flex-col">
        <h3 className="font-body lg:font-heading line-clamp-1 text-sm font-bold lg:text-xl lg:font-semibold">
          {film.nameRu}
        </h3>

        {/* Secondary title */}
        {(film.nameEn || film.nameOriginal) && (
          <p className="line-clamp-1 text-xs text-gray-500 lg:text-base">
            {film.nameEn || film.nameOriginal}
          </p>
        )}
        {/* Rating */}

        {film.rating !== 'null' && film.rating && (
          <span className="flex flex-row items-center gap-1 text-xs lg:text-base">
            <Image
              src="/kinopoisk-logo.png"
              width={14}
              height={14}
              alt={'kinopoisk logo'}
              className={'border-r-3.5 inline'}
            />

            {film.rating}
          </span>
        )}
      </div>

      {/* Action */}
      <button disabled={isPending} type={'button'} onClick={() => onAdd(film.filmId)}>
        <Icon name={'AddIcon'} className={'text-primary'}></Icon>
      </button>
    </div>
  );
}

export default FilmPreview;
