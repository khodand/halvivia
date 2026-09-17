import { getFilmWishlist } from '@/features/wishlist/api/queries';
import FilmCard from '@/entities/films/ui/FilmCard';
import { WishlistPagination } from '@/features/wishlist/ui/WishlistPagination';
import { WishlistRemoveButton } from '@/features/wishlist/ui/WishlistRemoveButton';
import { WishlistEmptyState } from '@/features/wishlist/ui/WishlistEmptyState';

type FilmWishlistGridProps = {
  userId: string;
  limit?: number;
  page?: number;
  canRemove?: boolean;
};

export async function FilmWishlistGrid({
  userId,
  limit = 24,
  page = 1,
  canRemove = false,
}: FilmWishlistGridProps) {
  const result = await getFilmWishlist(userId, limit, page);

  if (result.films.length === 0) {
    return <WishlistEmptyState type="film" />;
  }

  return (
    <>
      <div className="grid w-full grid-cols-2 gap-3 py-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {result.films.map((film) => (
          <div
            key={film.id}
            className="group relative transition-transform duration-300 ease-out hover:z-50 hover:scale-110"
          >
            <FilmCard
              id={film.id}
              name={film.name}
              coverUrl={film.coverUrl}
              posterUrl={film.posterUrl}
              ratingAvg={film.ratingAvg}
              variant="grid"
              hoverScale={false}
            />
            {canRemove && (
              <div className="absolute top-1.5 right-1.5 z-[60]">
                <WishlistRemoveButton type="film" filmId={film.id} />
              </div>
            )}
          </div>
        ))}
      </div>
      <WishlistPagination page={page} totalPages={result.totalPages} />
    </>
  );
}
