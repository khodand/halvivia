'use server';

import { addFilmByKinopoiskId, searchFilmsByKeyword } from '@/features/addKinopoiskFilm/api/api';
import { withAuth } from '@/shared/lib/auth';
import { redirect } from 'next/navigation';
import { ROUTES } from '@/shared/config';
import { revalidatePath } from 'next/cache';
import { FilmSearchByKeywordResponseSchema } from '@/features/addKinopoiskFilm/model/schemas';
import { FilmSearchByKeywordItem } from '@/features/addKinopoiskFilm/model/types';
import { Film } from '@/entities/films/model/types';
import { ActionResult } from '@/shared/model';
import { tryCreateActivityEvent } from '@/entities/activity/api/queries';

export async function addKinopoiskFilmAction(id: number): Promise<ActionResult<Film>> {
  const controller = new AbortController();
  const session = await withAuth();

  if (session.status === 'unauthenticated') {
    redirect(ROUTES.LOGIN);
  }

  if (session.payload.role !== 'MEMBER') {
    return { success: false, error: 'UNAUTHORIZED' };
  }

  setTimeout(() => controller.abort(), 15000);
  try {
    const film = await addFilmByKinopoiskId(id);
    revalidatePath(ROUTES.CINEMA);

    await tryCreateActivityEvent({
      eventType: 'subject.created',
      subject: { type: 'film', id: film.id },
      actorId: session.payload.userId,
    });

    return {
      success: true,
      data: film,
    } as const;
  } catch (err) {
    console.error(err);

    return {
      success: false,
      error: 'DB_ERROR',
    } as const;
  }
}

type GetFilmsByKeywordActionResult =
  | { success: true; data: FilmSearchByKeywordItem[] }
  | { success: false; error: string };

export async function getFilmsByKeywordAction(
  keyword: string,
): Promise<GetFilmsByKeywordActionResult> {
  try {
    if (!keyword || keyword.trim().length < 2) {
      return {
        success: false,
        error: 'At least two symbols required',
      };
    }

    const data = await searchFilmsByKeyword(keyword);
    const parsed = FilmSearchByKeywordResponseSchema.safeParse(data);

    if (!parsed.success) {
      console.error(parsed.error);
      return {
        success: false,
        error: 'Invalid API response format',
      };
    }

    return {
      success: true,
      data: parsed.data.films,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: 'Unknown error',
    };
  }
}
