'use server';

import { addBookOrGetExisting } from '@/entities/books/api/db';
import type {
  AddBookSelectionInput,
  Book,
  BookSearchResult,
  BookSearchResultPreview,
  BookSectionId,
} from '@/entities/books/model/types';
import { BOOK_SECTION_IDS, isBookSectionId } from '@/entities/books/model/sections';
import { verifySession, withAuth } from '@/shared/lib/auth';
import { ROUTES } from '@/shared/config';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { checkRateLimit } from '@/shared/lib/rateLimit';
import { getExternalBookBySelection, searchExternalBooks } from './bookSearch';
import { tryCreateActivityEvent } from '@/entities/activity/api/queries';

type SearchBooksResult =
  | { success: true; books: BookSearchResultPreview[] }
  | {
      success: false;
      error:
        | 'UNAUTHORIZED'
        | 'QUERY_TOO_SHORT'
        | 'QUERY_TOO_LONG'
        | 'RATE_LIMITED'
        | 'SEARCH_FAILED';
    };

type AddBookResult =
  | { success: true; bookId: string; book: Book }
  | {
      success: false;
      error:
        | 'UNAUTHORIZED'
        | 'BOOK_ALREADY_EXISTS'
        | 'BOOK_NOT_FOUND'
        | 'RATE_LIMITED'
        | 'ADD_FAILED';
      bookId?: string;
    };

function toBookSearchResultPreview(book: BookSearchResult): BookSearchResultPreview {
  const { rawData, ...preview } = book;
  void rawData;
  return preview;
}

const SEARCH_QUERY_MAX_LENGTH = 120;
const SEARCH_RATE_LIMIT = 30;
const SEARCH_RATE_LIMIT_WINDOW_MS = 60 * 1000;
const ADD_BOOK_RATE_LIMIT = 10;
const ADD_BOOK_RATE_LIMIT_WINDOW_MS = 60 * 1000;

async function getRequestIp() {
  const requestHeaders = await headers();
  const forwardedFor = requestHeaders.get('x-forwarded-for');

  return forwardedFor?.split(',')[0]?.trim() ?? requestHeaders.get('x-real-ip') ?? 'unknown';
}

export async function searchBooksAction(query: string): Promise<SearchBooksResult> {
  const session = await verifySession();

  if (session.status === 'unauthenticated' || session.payload.role !== 'MEMBER') {
    return { success: false, error: 'UNAUTHORIZED' };
  }

  const normalizedQuery = query.trim();

  if (normalizedQuery.length < 2) {
    return { success: false, error: 'QUERY_TOO_SHORT' };
  }

  if (normalizedQuery.length > SEARCH_QUERY_MAX_LENGTH) {
    return { success: false, error: 'QUERY_TOO_LONG' };
  }

  const rateLimit = checkRateLimit({
    key: `book-search:${session.payload.userId}:${await getRequestIp()}`,
    limit: SEARCH_RATE_LIMIT,
    windowMs: SEARCH_RATE_LIMIT_WINDOW_MS,
  });

  if (!rateLimit.success) {
    return { success: false, error: 'RATE_LIMITED' };
  }

  try {
    const books = await searchExternalBooks(normalizedQuery);
    return { success: true, books: books.map(toBookSearchResultPreview) };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'SEARCH_FAILED' };
  }
}

function normalizeSectionIds(sectionIds: BookSectionId[]): BookSectionId[] {
  const unique = Array.from(new Set(sectionIds.filter(isBookSectionId)));
  return unique.length > 0 ? unique : [BOOK_SECTION_IDS[0]];
}

export async function addBookAction(input: AddBookSelectionInput): Promise<AddBookResult> {
  const session = await withAuth();

  if (session.status === 'unauthenticated') {
    redirect(ROUTES.LOGIN);
  }

  if (session.payload.role !== 'MEMBER') {
    return {
      success: false,
      error: 'UNAUTHORIZED',
    };
  }

  const rateLimit = checkRateLimit({
    key: `book-add:${session.payload.userId}:${await getRequestIp()}`,
    limit: ADD_BOOK_RATE_LIMIT,
    windowMs: ADD_BOOK_RATE_LIMIT_WINDOW_MS,
  });

  if (!rateLimit.success) {
    return {
      success: false,
      error: 'RATE_LIMITED',
    };
  }

  try {
    const externalBook = await getExternalBookBySelection(input);

    if (!externalBook) {
      return {
        success: false,
        error: 'BOOK_NOT_FOUND',
      };
    }

    const { book, created } = await addBookOrGetExisting(
      {
        book: externalBook,
        sectionIds: normalizeSectionIds(input.sectionIds),
      },
      session.payload.userId,
    );

    if (!created) {
      return {
        success: false,
        error: 'BOOK_ALREADY_EXISTS',
        bookId: book.id,
      };
    }

    revalidatePath(ROUTES.LIBRARY);

    await tryCreateActivityEvent({
      eventType: 'subject.created',
      subject: { type: 'book', id: book.id },
      actorId: session.payload.userId,
    });

    return {
      success: true,
      bookId: book.id,
      book,
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      error: 'ADD_FAILED',
    };
  }
}
