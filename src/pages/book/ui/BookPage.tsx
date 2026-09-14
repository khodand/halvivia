import { getBookById } from '@/entities/books/api/db';
import { ROUTES } from '@/shared/config';
import { sanitizeHtml } from '@/shared/lib/sanitizeHtml';
import { ArrowIcon } from '@/shared/ui/icons';
import Image from 'next/image';
import { connection } from 'next/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { CommentSection } from '@/widgets/CommentSection/ui/CommentSection';
import RatingStarButton from '@/features/setRating/ui/RatingStarButton';
import SubjectRatingStar from '@/widgets/SubjectRatingStar/SubjectRatingStar';
import { BookWishlistButton } from '@/features/wishlist/ui/BookWishlistButton';
import { verifySession } from '@/shared/lib/auth';
import { isBookInWishlist } from '@/features/wishlist/api/db';

type BookPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function BookPageContent({ params }: BookPageProps) {
  await connection();

  const [{ id }, session] = await Promise.all([params, verifySession()]);
  const book = await getBookById(id);

  if (!book) {
    notFound();
  }

  const descriptionHtml = book.description ? sanitizeHtml(book.description) : null;
  const isInWishlist =
    session.status !== 'unauthenticated'
      ? await isBookInWishlist(session.payload.userId, book.id)
      : false;

  return (
    <>
      <section className="page-content-width flex flex-col gap-6 py-8 lg:py-10">
        <Link
          href={ROUTES.LIBRARY}
          className="text-text-secondary hover:text-text-primary flex w-fit items-center gap-2 text-sm"
        >
          <ArrowIcon className="h-3 w-3 scale-x-[-1]" />
          Вернуться к книгам
        </Link>

        <div className="grid gap-6 md:grid-cols-[180px_minmax(0,1fr)] lg:grid-cols-[220px_minmax(0,1fr)]">
          <div className="relative aspect-104/171 w-full max-w-55 overflow-hidden bg-neutral-200">
            {book.thumbnailUrl ? (
              <Image
                src={book.thumbnailUrl}
                alt={book.title}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="text-text-inverse flex h-full items-center justify-center p-4 text-center">
                {book.title}
              </div>
            )}
          </div>

          <div className="flex max-w-2xl flex-col gap-4">
            <div>
              <h1 className="text-3xl font-bold md:text-4xl">{book.title}</h1>
              {book.authors.length > 0 && (
                <p className="text-text-secondary mt-2 flex flex-row flex-wrap items-center gap-2 text-lg">
                  <span>{book.authors.join(', ')} </span>
                  <SubjectRatingStar
                    subject={{ type: 'book', id: book.id }}
                    avgRating={book.ratingAvg}
                  ></SubjectRatingStar>
                </p>
              )}
            </div>

            <div className="text-text-secondary rounded-lg border border-white/10 p-4">
              Полная страница книги будет реализована в следующей итерации. Сейчас карточка уже
              сохранена в библиотеку и готова к будущим отзывам, комментариям и спискам чтения.
            </div>

            {descriptionHtml && (
              <div
                className="text-text-secondary line-clamp-6 leading-relaxed [&_em]:italic [&_li]:ml-5 [&_li]:list-disc [&_p:not(:first-child)]:mt-3 [&_strong]:font-semibold"
                dangerouslySetInnerHTML={{ __html: descriptionHtml }}
              />
            )}
            <div className="flex flex-row gap-2">
              <BookWishlistButton bookId={book.id} isInWishlist={isInWishlist} />
              <RatingStarButton subject={{ type: 'book', id: book.id }} />
            </div>
          </div>
        </div>
      </section>
      <section className="bg-bg-inverse flex py-8">
        <CommentSection entityType={'book'} entityId={id}></CommentSection>
      </section>
    </>
  );
}

export function BookPage(props: BookPageProps) {
  return (
    <Suspense
      fallback={
        <main className="bg-bg-base text-text-secondary px-4 py-10 md:px-8">
          Загружаем книгу...
        </main>
      }
    >
      <BookPageContent {...props} />
    </Suspense>
  );
}
