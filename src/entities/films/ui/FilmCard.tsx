import { Image } from '@imagekit/next';
import Link from 'next/link';
import { ROUTES } from '@/shared/config';
import { CardRatingStar } from '@/entities/rating/ui/CardRatingStar';
import { cn } from '@/shared';

export type FilmCardProps = {
  id: string;
  name?: string;
  posterUrl?: string;
  ratingAvg?: number | null;
  variant?: 'grid' | 'fixed';
  className?: string;
  hoverScale?: boolean;
  children?: React.ReactNode;
  coverUrl: string;
};

const variants = {
  grid: 'w-full',
  fixed: 'w-[43vw] md:w-[22vw] xl:w-[17vw] 2xl:w-64.25',
};

const sizesByVariant = {
  grid: '(max-width: 390px) 43vw, (max-width: 800px) 22vw, (max-width: 1400px) 17vw, 15vw',
  fixed: '(max-width: 390px) 43vw, (max-width: 800px) 22vw, (max-width: 1400px) 17vw, 15vw',
};

export function FilmCard({
  id = 'e9339093-33db-4dc8-b465-381efbf712eb',
  posterUrl = '/posters/1143242_FgX7h_vrI',
  coverUrl,
  name = 'Джентльмены ',
  ratingAvg = 0,
  variant = 'fixed',
  hoverScale = true,
  children,
}: FilmCardProps) {
  return (
    <Link
      href={`${ROUTES.FILM_PAGE}${id}`}
      className={`${variant === 'grid' ? 'w-full' : 'w-max'} relative block overflow-visible hover:z-50`}
    >
      <div
        className={cn(
          `group default relative flex flex-col gap-1 overflow-visible transition-transform duration-300 ease-out ${
            hoverScale ? 'hover:scale-110' : ''
          }`,
          variant === 'grid' && 'w-full',
          variant === 'fixed' && 'w-[43vw] md:w-[22vw] xl:w-[17vw] 2xl:w-64.25',
        )}
      >
        {children}
        <Image
          urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT}
          alt={`${name}`}
          className={`aspect-video h-full w-full object-cover object-center`}
          width={166}
          height={93}
          src={coverUrl || posterUrl}
          loading={'lazy'}
          sizes={sizesByVariant[variant]}
        ></Image>
        <div
          className={`lg:font-heading lg:bg-bg-overlay-gray flex w-full flex-row items-center justify-between px-1 py-1 backdrop-opacity-40 transition-opacity duration-300 ease-out lg:absolute lg:bottom-0 lg:min-h-[25%] lg:px-3 lg:font-semibold lg:opacity-0 lg:backdrop-blur-sm lg:group-hover:opacity-100`}
        >
          <span className={`line-clamp-2`}>{name}</span>
          <span className={`inline-flex items-center ${ratingAvg === null && 'hidden'}`}>
            <CardRatingStar averageRating={ratingAvg}></CardRatingStar>
            &nbsp;
            <span className={'hidden lg:block'}>{ratingAvg}</span>
          </span>
        </div>
      </div>
    </Link>
  );
}

export default FilmCard;
