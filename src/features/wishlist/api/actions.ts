'use server';

import { ActionResult } from '@/shared/model';
import {
  addBookToWishlist,
  addFilmToWishlist,
  removeBookFromWishlist,
  removeFilmFromWishlist,
} from '@/features/wishlist/api/db';
import { z } from 'zod';
import { withAuth } from '@/shared/lib/auth';
import { updateTag } from 'next/cache';

const filmIdSchema = z.string().uuid();
const bookIdSchema = z.string().uuid();

export async function addFilmToWishlistAction(filmId: string): Promise<ActionResult<string>> {
  const session = await withAuth();

  if (session.status === 'unauthenticated') {
    return {
      success: false,
      error: 'UNAUTHORIZED',
    };
  }

  const parsedFilmId = filmIdSchema.safeParse(filmId);

  if (!parsedFilmId.success) {
    return {
      success: false,
      error: 'VALIDATION_ERROR',
    };
  }

  try {
    await addFilmToWishlist(session.payload.userId, parsedFilmId.data);
    updateTag(`user:${session.payload.userId}:film_wishlist`);

    return {
      success: true,
      data: parsedFilmId.data,
    };
  } catch (error) {
    console.error('Failed to add film to wishlist', {
      userId: session.payload.userId,
      filmId: parsedFilmId.data,
      error,
    });

    return {
      success: false,
      error: 'DB_ERROR',
    };
  }
}

export async function removeFilmFromWishlistAction(filmId: string): Promise<ActionResult<string>> {
  const session = await withAuth();

  if (session.status === 'unauthenticated') {
    return { success: false, error: 'UNAUTHORIZED' };
  }

  const parsedFilmId = filmIdSchema.safeParse(filmId);

  if (!parsedFilmId.success) {
    return { success: false, error: 'VALIDATION_ERROR' };
  }

  try {
    await removeFilmFromWishlist(session.payload.userId, parsedFilmId.data);
    updateTag(`user:${session.payload.userId}:film_wishlist`);

    return {
      success: true,
      data: parsedFilmId.data,
    };
  } catch (error) {
    console.error('Failed to remove film from wishlist', {
      userId: session.payload.userId,
      filmId: parsedFilmId.data,
      error,
    });

    return {
      success: false,
      error: 'DB_ERROR',
    };
  }
}

export async function addBookToWishlistAction(bookId: string): Promise<ActionResult<string>> {
  const session = await withAuth();

  if (session.status === 'unauthenticated') {
    return { success: false, error: 'UNAUTHORIZED' };
  }

  const parsedBookId = bookIdSchema.safeParse(bookId);

  if (!parsedBookId.success) {
    return { success: false, error: 'VALIDATION_ERROR' };
  }

  try {
    await addBookToWishlist(session.payload.userId, parsedBookId.data);
    updateTag(`user:${session.payload.userId}:book_wishlist`);

    return { success: true, data: parsedBookId.data };
  } catch (error) {
    console.error('Failed to add book to wishlist', {
      userId: session.payload.userId,
      bookId: parsedBookId.data,
      error,
    });

    return { success: false, error: 'DB_ERROR' };
  }
}

export async function removeBookFromWishlistAction(bookId: string): Promise<ActionResult<string>> {
  const session = await withAuth();

  if (session.status === 'unauthenticated') {
    return { success: false, error: 'UNAUTHORIZED' };
  }

  const parsedBookId = bookIdSchema.safeParse(bookId);

  if (!parsedBookId.success) {
    return { success: false, error: 'VALIDATION_ERROR' };
  }

  try {
    await removeBookFromWishlist(session.payload.userId, parsedBookId.data);
    updateTag(`user:${session.payload.userId}:book_wishlist`);

    return { success: true, data: parsedBookId.data };
  } catch (error) {
    console.error('Failed to remove book from wishlist', {
      userId: session.payload.userId,
      bookId: parsedBookId.data,
      error,
    });

    return { success: false, error: 'DB_ERROR' };
  }
}
