import {
  getUserBooksWithRating,
  getUserFilmsWithRating,
  getUserGamesWithRating,
} from '@/widgets/UserRatingsLists/api/db';
import { RatingHistory } from '@/widgets/UserRatingsLists/ui/RatingHistory';

type UserRatingsProps = {
  userId: string;
  searchParams: {
    booksPage?: string;
    filmsPage?: string;
    gamesPage?: string;
  };
};

const PAGE_SIZE = 20;

function getPage(value?: string): number {
  const page = Number(value);

  return Number.isInteger(page) && page > 0 ? page : 1;
}

export async function UserRatings({ userId, searchParams }: UserRatingsProps) {
  const booksPage = getPage(searchParams.booksPage);
  const filmsPage = getPage(searchParams.filmsPage);
  const gamesPage = getPage(searchParams.gamesPage);

  const [books, films, games] = await Promise.all([
    getUserBooksWithRating(userId, booksPage, PAGE_SIZE),
    getUserFilmsWithRating(userId, filmsPage, PAGE_SIZE),
    getUserGamesWithRating(userId, gamesPage, PAGE_SIZE),
  ]);

  return (
    <RatingHistory
      books={books}
      films={films}
      games={games}
      booksPage={booksPage}
      filmsPage={filmsPage}
      gamesPage={gamesPage}
      pageSize={PAGE_SIZE}
    />
  );
}

export default UserRatings;
