import 'server-only';

import { addFilmOrGetExisting, findFilmIdByKinopoiskId } from '@/entities/films/api/db';
import {
  FilmSearchByKeywordResponse,
  KinopoiskFilm,
} from '@/features/addKinopoiskFilm/model/types';
import { KinopoiskFilmSchema } from '@/features/addKinopoiskFilm/model/schemas';
import { mapKinopoiskFilmToFilm } from '@/features/addKinopoiskFilm/model/mappers';
import { imagekitClient } from '@/shared/api/imagekit/client';
import { Film } from '@/entities/films/model/types';

export async function getKinopoiskFilmById(id: number = 41519): Promise<KinopoiskFilm> {
  try {
    const res = await fetch(`https://kinopoiskapiunofficial.tech/api/v2.2/films/${id}`, {
      method: 'GET',
      headers: {
        'X-API-KEY': process.env.KINOPOISK_API_PRIVATE_KEY!,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();

    const result = KinopoiskFilmSchema.safeParse(data);

    if (!result.success) {
      console.error('Invalid KinopoiskFilm:', result.error.issues);
      throw new Error('Kinopoisk API returned invalid data');
    }

    return result.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

//переделать через edge handlers? или перенести на клиент, но тогда будет больше перенаправлений или хотебя таймер сделать
export async function addFilmByKinopoiskId(
  id: number,
): Promise<{ created: true; film: Film } | { created: false; id: string }> {
  const existingId = await findFilmIdByKinopoiskId(id);

  if (existingId) {
    return { created: false, id: existingId };
  }

  const kFilm = await getKinopoiskFilmById(id);
  const film = mapKinopoiskFilmToFilm(kFilm);

  const [posterResult, coverResult] = await Promise.allSettled([
    imagekitClient.files.upload({
      file: film.posterUrl,
      fileName: film.kinopoiskId.toString(),
      folder: '/posters',
    }),

    imagekitClient.files.upload({
      file: film.coverUrl,
      fileName: film.kinopoiskId.toString(),
      folder: '/covers',
    }),
  ]);

  if (posterResult.status === 'fulfilled') {
    if (typeof posterResult.value.filePath === 'string') {
      film.posterUrl = posterResult.value.filePath;
    }
  } else {
    film.posterUrl = 'defaultposter.png';
    console.log('Не вышло загрузить постер', posterResult.reason);
  }

  if (coverResult.status === 'fulfilled') {
    if (typeof coverResult.value.filePath === 'string') {
      film.coverUrl = coverResult.value.filePath;
    }
  } else {
    film.coverUrl = 'defaultcover.png';
    console.log('Не вышло загрузить широкий постер', coverResult.reason);
  }

  return addFilmOrGetExisting(film);
}

export async function searchFilmsByKeyword(keyword: string) {
  const res = await fetch(
    `https://kinopoiskapiunofficial.tech/api/v2.1/films/search-by-keyword?keyword=${encodeURIComponent(keyword)}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': process.env.KINOPOISK_API_PRIVATE_KEY!,
      },
      cache: 'no-store',
    },
  );

  if (!res.ok) {
    throw new Error(`Kinopoisk API error: ${res.status}`);
  }

  const data: FilmSearchByKeywordResponse = await res.json();

  return data;
}
