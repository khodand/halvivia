import GameCard from '@/entities/games/ui/GameCard';
import type { Game } from '@/entities/games/model/types';
import { connection } from 'next/server';
import { getGamesPageViewModel } from '../model/viewModel';
import { GamesToolbar } from './GamesToolbar';

const RECENT_EMPTY_TEXT = 'Игры появятся здесь после добавления.';
const GRID_EMPTY_TEXT = 'В игротеке пока пусто.';

function GameRow({ games, emptyText }: { games: Game[]; emptyText: string }) {
  if (games.length === 0) {
    return (
      <div className="border-border-inverse-200 text-text-inverse-500 flex min-h-29 items-center rounded-lg border border-dashed px-4 text-sm">
        {emptyText}
      </div>
    );
  }

  return (
    <div className="flex gap-3 overflow-x-auto overflow-y-visible pb-5 md:gap-4">
      {games.map((game) => (
        <GameCard key={game.id} game={game} />
      ))}
    </div>
  );
}

export async function GamesPage() {
  await connection();
  const { recentGames, games, canAddGames } = await getGamesPageViewModel();

  return (
    <>
      <section className="bg-bg-inverse text-text-inverse">
        <div className="page-content-width flex flex-col gap-4 py-8 lg:py-9">
          <h2 className="text-2xl leading-tight font-bold md:text-3xl">Новинки</h2>
          <GameRow games={recentGames} emptyText={RECENT_EMPTY_TEXT} />
        </div>
      </section>

      <section>
        <div className="page-content-width flex flex-col gap-8 py-8 lg:py-9">
          <GamesToolbar canAddGames={canAddGames} />
          {games.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {games.map((game) => (
                <GameCard key={game.id} game={game} fill />
              ))}
            </div>
          ) : (
            <div className="text-text-muted flex min-h-29 items-center rounded-lg border border-dashed border-white/10 px-4 text-sm">
              {GRID_EMPTY_TEXT}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default GamesPage;
