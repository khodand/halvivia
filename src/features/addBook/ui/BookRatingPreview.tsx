import Image from 'next/image';

import type { Book } from '@/entities/books/model/types';

type Props = {
  book: Book;
};

export function BookRatingPreview({ book }: Props) {
  return (
    <div className="border-border-inverse-500 flex w-full items-center gap-4 rounded-xl border p-4">
      <div className="relative h-28 w-19 shrink-0 overflow-hidden rounded-md">
        <Image
          src={book.thumbnailUrl || '/default-book-cover.png'}
          alt={book.title}
          fill
          sizes="76px"
          className="object-cover"
        />
      </div>

      <div className="flex min-w-0 flex-col gap-1">
        <h3 className="text-text-inverse text-sm font-semibold md:text-base">{book.title}</h3>

        {book.authors?.length > 0 && (
          <p className="text-text-inverse-500 text-xs md:text-sm">{book.authors.join(', ')}</p>
        )}

        {book.publishedDate && (
          <span className="text-text-inverse-500 text-xs">{book.publishedDate}</span>
        )}
      </div>
    </div>
  );
}

export default BookRatingPreview;
