'use client';

import type { Book, BookSearchResultPreview, BookSectionId } from '@/entities/books/model/types';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';

import { addBookAction } from '../api/actions';
import type { AddBookStatus } from './types';

function getAddBookErrorMessage(
  error: 'UNAUTHORIZED' | 'BOOK_ALREADY_EXISTS' | 'BOOK_NOT_FOUND' | 'RATE_LIMITED' | 'ADD_FAILED',
) {
  if (error === 'UNAUTHORIZED') {
    return 'Добавлять книги могут только участники сообщества';
  }

  if (error === 'BOOK_NOT_FOUND') {
    return 'Не удалось получить данные книги';
  }

  if (error === 'BOOK_ALREADY_EXISTS') {
    return 'Книга уже есть в библиотеке';
  }

  if (error === 'RATE_LIMITED') {
    return 'Слишком много попыток, попробуй чуть позже';
  }

  return 'Не удалось добавить книгу';
}

export function useAddBook() {
  const router = useRouter();

  const [status, setStatus] = useState<AddBookStatus>({
    type: 'idle',
  });

  const [isAdding, setIsAdding] = useState(false);

  const addSelectedBook = useCallback(
    async (
      selectedBook: BookSearchResultPreview | null,
      selectedSections: BookSectionId[],
    ): Promise<Book | null> => {
      if (!selectedBook) return null;

      setStatus({ type: 'idle' });
      setIsAdding(true);

      try {
        const response = await addBookAction({
          source: selectedBook.source,
          googleBooksId: selectedBook.googleBooksId,
          openLibraryKey: selectedBook.openLibraryKey,
          sectionIds: selectedSections,
        });

        if (response.success) {
          setStatus({
            type: 'success',
            message: 'Книга добавлена',
            bookId: response.bookId,
          });

          router.refresh();

          return response.book;
        }

        if (response.error === 'BOOK_ALREADY_EXISTS' && response.bookId) {
          setStatus({
            type: 'duplicate',
            bookId: response.bookId,
          });

          return null;
        }

        setStatus({
          type: 'error',
          message: getAddBookErrorMessage(response.error),
        });

        return null;
      } finally {
        setIsAdding(false);
      }
    },
    [router],
  );

  const resetStatus = useCallback(() => {
    setStatus({ type: 'idle' });
  }, []);

  return {
    status,
    isAdding,
    addSelectedBook,
    resetStatus,
  };
}
