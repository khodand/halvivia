import type { Game } from '@/entities/games/model/types';
import { SteamHeaderImage } from '@/entities/games/ui/SteamHeaderImage';
import { CardRatingStar } from '@/entities/rating/ui/CardRatingStar';
import { ROUTES } from '@/shared/config';
import Link from 'next/link';

type GameCardProps = {
  game: Game;
  fill?: boolean;
};

export function GameCard({ game, fill = false }: GameCardProps) {
  return (
    <Link
      href={`${ROUTES.GAME_PAGE}${game.id}`}
      className={`group focus-visible:ring-primary relative block shrink-0 overflow-visible outline-none focus-visible:ring-2 ${
        fill ? 'w-full' : 'w-40 sm:w-52 lg:w-60'
      }`}
    >
      <div className="relative aspect-video overflow-hidden bg-neutral-900 shadow-[0_12px_28px_rgba(0,0,0,0.22)] transition-transform duration-300 ease-out group-hover:z-20 group-hover:-translate-y-1">
        {game.headerImage ? (
          <SteamHeaderImage
            src={game.headerImage}
            alt={game.name}
            sizes={fill ? '(max-width: 640px) 50vw, 20vw' : '240px'}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-neutral-200 p-3 text-center text-xs font-semibold text-neutral-700">
            {game.name}
          </div>
        )}
        <div className="bg-bg-overlay-gray text-text-primary absolute right-0 bottom-0 left-0 hidden min-h-15 translate-y-full items-end justify-between gap-2 px-3 py-2 opacity-0 backdrop-blur-sm transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 lg:flex">
          <span className="line-clamp-2 text-base leading-tight font-bold lg:text-lg">
            {game.name}
          </span>
          {game.ratingAvg !== null && (
            <CardRatingStar className="h-4 w-4" averageRating={game.ratingAvg} />
          )}
        </div>
      </div>
      <div className="text-text-primary flex items-center justify-between gap-2 px-1 py-1 lg:hidden">
        <span className="line-clamp-2 text-sm leading-tight font-semibold">{game.name}</span>
        {game.ratingAvg !== null && (
          <CardRatingStar className="h-4 w-4 shrink-0" averageRating={game.ratingAvg} />
        )}
      </div>
    </Link>
  );
}

export default GameCard;
