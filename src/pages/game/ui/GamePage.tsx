import { getGameById } from '@/entities/games/api/db';
import { releaseYear } from '@/entities/games/model/steam';
import { SteamHeaderImage } from '@/entities/games/ui/SteamHeaderImage';
import RatingStarButton from '@/features/setRating/ui/RatingStarButton';
import { mapGameToInfoItems } from '@/pages/game/model/mapGameToInfoItems';
import Description from '@/pages/film/ui/Description';
import Info from '@/pages/film/ui/Info';
import { ROUTES } from '@/shared/config';
import { ArrowIcon } from '@/shared/ui/icons';
import SubjectRatingStar from '@/widgets/SubjectRatingStar/SubjectRatingStar';
import { CommentSection } from '@/widgets/CommentSection/ui/CommentSection';
import { connection } from 'next/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

type GamePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function GamePageContent({ params }: GamePageProps) {
  await connection();

  const { id } = await params;
  const game = await getGameById(id);

  if (!game) {
    notFound();
  }

  const year = releaseYear(game.releaseDate);
  const infoItems = mapGameToInfoItems(game);

  return (
    <>
      <div className="page-content-width grid grid-cols-1 items-start gap-y-6 py-8 md:grid-cols-[minmax(0,420px)_1fr] md:gap-x-8 lg:py-10">
        <Link
          href={ROUTES.GAMES}
          className="text-text-secondary hover:text-text-primary flex w-fit items-center gap-2 text-sm font-medium transition-colors md:col-span-2"
        >
          <ArrowIcon className="h-3 w-3 scale-x-[-1]" />
          вернуться к играм
        </Link>

        <div className="relative aspect-video w-full justify-self-center overflow-hidden bg-neutral-900 md:justify-self-start">
          {game.headerImage ? (
            <SteamHeaderImage
              src={game.headerImage}
              alt={game.name}
              sizes="(max-width: 768px) 100vw, 420px"
              priority
            />
          ) : (
            <div className="text-text-secondary absolute inset-0 flex items-center justify-center p-4 text-center">
              {game.name}
            </div>
          )}
        </div>

        <div className="flex flex-col items-center gap-5 md:items-start">
          <div className="flex flex-col items-center gap-3 md:items-start">
            <h1 className="font-heading text-text-primary text-center text-2xl font-bold md:text-left">
              {game.name}
              {year ? (
                <>
                  <br />({year})
                </>
              ) : null}
            </h1>
            <SubjectRatingStar subject={{ type: 'game', id: game.id }} avgRating={game.ratingAvg} />
          </div>
          <Info className="text-text-primary hidden w-full md:grid" items={infoItems} />
          <RatingStarButton className="md:self-start" subject={{ type: 'game', id: game.id }} />
        </div>
      </div>

      <section className="bg-bg-base md:bg-bg-inverse py-10">
        <div className="page-content-width">
          <Description description={game.shortDescription} />
        </div>
      </section>

      <section className="bg-bg-inverse py-10 md:hidden">
        <div className="page-content-width">
          <Info className="text-text-inverse w-full" items={infoItems} />
        </div>
      </section>

      <section className="bg-bg-inverse flex py-8">
        <CommentSection entityType="game" entityId={id} />
      </section>
    </>
  );
}

export function GamePage(props: GamePageProps) {
  return (
    <Suspense
      fallback={
        <main className="bg-bg-base text-text-secondary px-4 py-10 md:px-8">Загружаем игру...</main>
      }
    >
      <GamePageContent {...props} />
    </Suspense>
  );
}
