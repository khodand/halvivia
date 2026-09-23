import { UserTab, USER_TABS } from '@/pages/user/model';
import UserRatings from '@/pages/user/ui/UserRatings';
import { FilmWishlistGrid } from '@/features/wishlist/ui/FilmsWishlist';
import { BookWishlistGrid } from '@/features/wishlist/ui/BooksWishlist';

type UserTabContentProps = {
  userId: string;
  activeTab: UserTab;
  page: number;
  canRemoveFromWishlist: boolean;
  searchParams: {
    tab?: string;
    page?: string;
    booksPage?: string;
    filmsPage?: string;
    gamesPage?: string;
  };
};

export function UserTabContent({
  userId,
  activeTab,
  page,
  canRemoveFromWishlist,
  searchParams,
}: UserTabContentProps) {
  switch (activeTab) {
    case USER_TABS.BOOKS:
      return <BookWishlistGrid userId={userId} page={page} canRemove={canRemoveFromWishlist} />;

    case USER_TABS.MOVIES:
      return <FilmWishlistGrid userId={userId} page={page} canRemove={canRemoveFromWishlist} />;

    case USER_TABS.RATINGS:
      return <UserRatings userId={userId} searchParams={searchParams} />;

    case USER_TABS.UPLOADS:
      return <div className="mt-4 text-gray-500">Данный раздел пока не реализован</div>;
  }
}

export default UserTabContent;
