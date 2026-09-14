import { Film } from '@/entities/films/model/types';
import Poster from '@/pages/film/ui/Poster';
import { ArrowIcon, StarIcon } from '@/shared/ui/icons';
import Description from '@/pages/film/ui/Description';
import Info from '@/pages/film/ui/Info';
import RatingStarButton from '@/features/setRating/ui/RatingStarButton';
import { ROUTES } from '@/shared/config';
import Link from 'next/link';
import { mapFilmToInfoItems } from '@/pages/film/model/mapFilmToInfoItems';
import SubjectRatingStar from '@/widgets/SubjectRatingStar/SubjectRatingStar';
import { FilmWishlistButton } from '@/features/wishlist/ui/FilmWishlistButton';
import { verifySession } from '@/shared/lib/auth';
import { isFilmInWishlist } from '@/features/wishlist/api/db';

type HeroSectionProps = {
  film: Film;
};

function parseAgeLimits(age: string | null) {
  if (!age) return '';
  return age.substring(3) + '+';
}

export async function HeroSection({ film }: HeroSectionProps) {
  const session = await verifySession();

  const isInWishlist =
    session.status !== 'unauthenticated'
      ? await isFilmInWishlist(session.payload.userId, film.id)
      : false;

  return (
    <>
      <div className="page-content-width grid grid-cols-1 items-start gap-y-6 py-8 md:grid-cols-[auto_1fr] md:gap-x-8">
        <Link
          href={ROUTES.CINEMA}
          className="text-text-secondary hover:text-text-primary flex w-fit items-center gap-2 text-sm font-medium transition-colors md:col-span-2"
        >
          <ArrowIcon className="h-3 w-3 scale-x-[-1]" />
          вернуться к фильмам
        </Link>

        <Poster
          filmName={film.nameRu}
          posterUrl={film.posterUrl}
          className="justify-self-center md:justify-self-start"
        />

        <div className="flex flex-col items-center gap-5 md:items-start">
          <div className="flex flex-col items-center gap-3 md:items-start">
            <h1 className="font-heading text-text-primary text-center text-2xl font-bold md:text-left">
              {film.nameRu}
              <br />({film.year ? film.year : `${film.startYear}-${film.endYear}`})
            </h1>

            <div className="text-text-secondary flex flex-wrap items-center justify-center gap-2.5 md:justify-start">
              <span>{film.nameOriginal || film.nameEn}</span>
              <span>{parseAgeLimits(film.ratingAgeLimits)}</span>
              <SubjectRatingStar
                avgRating={film.ratingAvg}
                subject={{ type: 'film', id: film.id }}
              />
            </div>
          </div>
          <Info
            className="text-text-primary hidden w-full md:grid"
            items={mapFilmToInfoItems(film)}
          />
          <div className="flex flex-row gap-2">
            <FilmWishlistButton isInWishlist={isInWishlist} filmId={film.id}></FilmWishlistButton>
            <RatingStarButton className="md:self-start" subject={{ type: 'film', id: film.id }} />
          </div>
        </div>
      </div>
      <section className="bg-bg-base md:bg-bg-inverse py-10">
        <div className="page-content-width">
          <Description description={film.description} />
        </div>
      </section>
      <section className="bg-bg-inverse py-10">
        <div className="page-content-width">
          <Info className="text-text-inverse w-full md:hidden" items={mapFilmToInfoItems(film)} />;
        </div>
      </section>
    </>
  );
}
export default HeroSection;
