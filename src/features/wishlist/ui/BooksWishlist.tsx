import { getBookWishlist } from '@/features/wishlist/api/queries';
import BookCard from '@/entities/books/ui/BookCard';
import { WishlistPagination } from '@/features/wishlist/ui/WishlistPagination';
import { WishlistRemoveButton } from '@/features/wishlist/ui/WishlistRemoveButton';
import { WishlistEmptyState } from '@/features/wishlist/ui/WishlistEmptyState';

type BookWishlistGridProps = {
  userId: string;
  limit?: number;
  page?: number;
  canRemove?: boolean;
};

export async function BookWishlistGrid({
  userId,
  limit = 24,
  page = 1,
  canRemove = false,
}: BookWishlistGridProps) {
  const result = await getBookWishlist(userId, limit, page);

  if (result.books.length === 0) {
    return <WishlistEmptyState type="book" />;
  }

  return (
    <>
      <div className="grid w-full grid-cols-[repeat(auto-fill,6.5rem)] gap-3 py-4 sm:grid-cols-[repeat(auto-fill,8rem)] lg:grid-cols-[repeat(auto-fill,9.25rem)]">
        {result.books.map((book) => (
          <div
            key={book.id}
            className="group relative w-26 transition-transform duration-300 ease-out hover:z-20 hover:-translate-y-1 sm:w-32 lg:w-37"
          >
            <BookCard book={book} hoverLift={false} />
            {canRemove && (
              <div className="absolute top-1.5 right-1.5 z-30">
                <WishlistRemoveButton type="book" bookId={book.id} />
              </div>
            )}
          </div>
        ))}
      </div>
      <WishlistPagination page={page} totalPages={result.totalPages} />
    </>
  );
}
