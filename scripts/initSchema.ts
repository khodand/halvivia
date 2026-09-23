import dotenv from 'dotenv';

dotenv.config({
  path: '.env.local',
});

import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL as string);

export async function createUserTable() {
  await sql`CREATE EXTENSION IF NOT EXISTS citext;`;
  await sql`CREATE EXTENSION IF NOT EXISTS pgcrypto;`;

  await sql`
    CREATE TABLE IF NOT EXISTS users
    (
      id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name          VARCHAR(20) UNIQUE,
      email         CITEXT      UNIQUE,
      password_hash TEXT        NOT NULL,
      discord_id    VARCHAR(20) UNIQUE,
      role          VARCHAR(20),
      avatar_url    VARCHAR(255)
    );
  `;
}

export async function createRefreshTokensTable() {
  await sql`CREATE EXTENSION IF NOT EXISTS pgcrypto;`;

  await sql`
    CREATE TABLE IF NOT EXISTS refresh_tokens
    (
      id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token      TEXT        NOT NULL UNIQUE,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS refresh_tokens_user_id_idx
      ON refresh_tokens(user_id);
  `;
}

export async function createFilmsTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS films
    (
      id                          UUID PRIMARY KEY     DEFAULT gen_random_uuid(),

      kinopoisk_id                INTEGER     NOT NULL,
      kinopoisk_hd_id             TEXT,
      imdb_id                     TEXT,

      name_ru                     TEXT,
      name_en                     TEXT,
      name_original               TEXT,

      poster_url                  TEXT        NOT NULL,
      poster_url_preview          TEXT        NOT NULL,

      rating_imdb                 NUMERIC,
      rating_kinopoisk            NUMERIC,
      web_url                     TEXT        NOT NULL,

      year                        INTEGER,
      film_length                 INTEGER,

      slogan                      TEXT,
      description                 TEXT,

      type                        TEXT        NOT NULL,

      rating_age_limits           TEXT,

      last_sync                   TIMESTAMP   NOT NULL,

      countries                   TEXT[]      NOT NULL DEFAULT '{}',

      start_year                  INTEGER,
      end_year                    INTEGER,

      serial                      BOOLEAN,
      short_film                  BOOLEAN,
      completed                   BOOLEAN,
      created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      cover_url                   TEXT    NOT NULL DEFAULT '/cover/default'
    );
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_films_created_at
      ON films (created_at DESC);
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS genres (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS film_genres (
      film_id TEXT NOT NULL REFERENCES films(id) ON DELETE CASCADE,
      genre_id INTEGER NOT NULL REFERENCES genres(id) ON DELETE CASCADE,
      PRIMARY KEY (film_id, genre_id)
    );
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_film_genres_genre_id
      ON film_genres (genre_id);
  `;
}

export async function createBooksTable() {
  await sql`CREATE EXTENSION IF NOT EXISTS pgcrypto;`;

  await sql`
    CREATE TABLE IF NOT EXISTS books (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      google_books_id TEXT UNIQUE,
      open_library_key TEXT UNIQUE,
      title TEXT NOT NULL,
      subtitle TEXT,
      authors TEXT[] NOT NULL DEFAULT '{}',
      description TEXT,
      published_date TEXT,
      publisher TEXT,
      page_count INTEGER,
      language TEXT,
      maturity_rating TEXT,
      info_link TEXT,
      preview_link TEXT,
      canonical_volume_link TEXT,
      thumbnail_url TEXT,
      categories TEXT[] NOT NULL DEFAULT '{}',
      section_ids TEXT[] NOT NULL DEFAULT '{}',
      external_ratings JSONB NOT NULL DEFAULT '[]'::jsonb,
      raw_data JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_by_user_id UUID,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS books_created_at_idx
      ON books (created_at DESC);
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS books_section_ids_idx
      ON books USING GIN (section_ids);
  `;

  await sql`
    DO $$
    BEGIN
      IF to_regclass('public.users') IS NOT NULL
        AND NOT EXISTS (
          SELECT 1
          FROM pg_constraint
          WHERE conname = 'books_created_by_user_id_fkey'
        )
      THEN
        ALTER TABLE books
          ADD CONSTRAINT books_created_by_user_id_fkey
          FOREIGN KEY (created_by_user_id)
          REFERENCES users(id)
          ON DELETE SET NULL
          NOT VALID;
      END IF;
    END
    $$;
  `;
}

export async function createCommentsTable() {
  await sql`
    CREATE EXTENSION IF NOT EXISTS pgcrypto;
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS comments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

      content TEXT NOT NULL,

      -- к чему относится комментарий (film | book)
      entity_type TEXT NOT NULL,
      entity_id UUID NOT NULL,

      --  вложенные комментарии (reply to comment)
      parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,

      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS comments_entity_idx
      ON comments (entity_type, entity_id);
  `;

  await sql`
     CREATE INDEX IF NOT EXISTS comments_parent_idx
     ON comments (parent_id);
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS comments_user_idx
      ON comments (user_id);
  `;

  await sql`CREATE INDEX IF NOT EXISTS comments_entity_created_idx
    ON comments (entity_type, entity_id, created_at DESC);`;
}

export async function createRatingsTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS ratings
    (
      id          UUID PRIMARY KEY     DEFAULT gen_random_uuid(),
      user_id     UUID        NOT NULL REFERENCES users (id),

      subject_type TEXT        NOT NULL,
      subject_id   UUID        NOT NULL,

      rating      SMALLINT,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  await sql`
    DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_constraint
          WHERE conname = 'unique_user_entity_rating'
        ) THEN
          ALTER TABLE ratings
            ADD CONSTRAINT unique_user_entity_rating
              UNIQUE (user_id, subject_type, subject_id);
        END IF;
      END $$;
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_ratings_user_created
      ON ratings (user_id, created_at DESC);
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_ratings_entity_created
      ON ratings (subject_id, subject_type, created_at DESC);
  `;
}

export async function createReviewsTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS reviews
    (
      id          UUID PRIMARY KEY     DEFAULT gen_random_uuid(),
      user_id     UUID        NOT NULL REFERENCES users (id),

      subject_type TEXT        NOT NULL,
      subject_id   UUID        NOT NULL,

      title       VARCHAR(100),
      review_text TEXT,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  await sql`
    DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_constraint
          WHERE conname = 'unique_user_entity_review'
        ) THEN
          ALTER TABLE reviews
            ADD CONSTRAINT unique_user_entity_review
              UNIQUE (user_id, subject_type, subject_id);
        END IF;
      END $$;
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_reviews_user_created
      ON reviews (user_id, created_at DESC);
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_reviews_entity_created
      ON reviews (subject_id, subject_type, created_at DESC);
  `;
}

export async function addFilmRatingsFields() {
  await sql`
    ALTER TABLE films
    ADD COLUMN IF NOT EXISTS rating_sum INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS rating_count INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS rating_avg NUMERIC(3,2);
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS films_rating_avg_idx
    ON films (rating_avg DESC);
  `;
}

export async function addBookRatingsFields() {
  await sql`
    ALTER TABLE books
    ADD COLUMN IF NOT EXISTS rating_sum INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS rating_count INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS rating_avg NUMERIC(3,2);
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS books_rating_avg_idx
    ON books (rating_avg DESC);
  `;
}

export async function createWishListsTables() {
  await sql`
    CREATE TABLE IF NOT EXISTS user_film_wishlist
    (
      user_id    UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
      film_id    UUID        NOT NULL REFERENCES films (id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

      PRIMARY KEY (user_id, film_id)
    );
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_user_film_wishlist_user_created
      ON user_film_wishlist (user_id, created_at DESC);
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS user_book_wishlist
    (
      user_id    UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
      book_id    UUID        NOT NULL REFERENCES books (id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

      PRIMARY KEY (user_id, book_id)
    );
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_user_book_wishlist_user_created
      ON user_book_wishlist (user_id, created_at DESC);
  `;
}

export async function createEventsTable() {
  await sql`
    CREATE TABLE activity_events (
                                   id  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

                                   actor_id UUID NOT NULL
                                     REFERENCES users(id)
                                       ON DELETE CASCADE,

                                   event_type TEXT NOT NULL,

                                   subject_type TEXT NOT NULL
                                     CHECK (subject_type IN ('film', 'book', 'game')),

                                   subject_id UUID NOT NULL,

                                   metadata JSONB NOT NULL DEFAULT '{}'::jsonb,

                                   visibility TEXT NOT NULL DEFAULT 'public'
                                     CHECK (visibility IN ('public', 'followers', 'private')),

                                   created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  await sql`
    CREATE INDEX activity_events_public_feed_idx
      ON activity_events (created_at DESC, id DESC)
      WHERE visibility = 'public';
  `;

  await sql`
    CREATE INDEX activity_events_actor_idx
      ON activity_events (actor_id, created_at DESC, id DESC);
  `;

  await sql`
    CREATE INDEX activity_events_subject_idx
      ON activity_events (
                          subject_type,
                          subject_id,
                          created_at DESC
        );
  `;
}

export async function createGamesTable() {
  await sql`CREATE EXTENSION IF NOT EXISTS pgcrypto;`;

  await sql`
    CREATE TABLE IF NOT EXISTS games (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      steam_app_id INTEGER NOT NULL UNIQUE,
      name TEXT NOT NULL,
      steam_url TEXT NOT NULL,
      header_image TEXT,
      short_description TEXT,
      developers TEXT[] NOT NULL DEFAULT '{}',
      publishers TEXT[] NOT NULL DEFAULT '{}',
      release_date TEXT,
      recent_review_label TEXT,
      recent_review_count INTEGER,
      recent_review_score INTEGER,
      russian_review_label TEXT,
      russian_review_count INTEGER,
      russian_review_score INTEGER,
      created_by_user_id UUID,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      rating_sum INTEGER NOT NULL DEFAULT 0,
      rating_count INTEGER NOT NULL DEFAULT 0,
      rating_avg NUMERIC(3,2)
    );
  `;

  await sql`ALTER TABLE games ADD COLUMN IF NOT EXISTS header_image TEXT;`;
  await sql`ALTER TABLE games ADD COLUMN IF NOT EXISTS short_description TEXT;`;
  await sql`ALTER TABLE games ADD COLUMN IF NOT EXISTS developers TEXT[] NOT NULL DEFAULT '{}';`;
  await sql`ALTER TABLE games ADD COLUMN IF NOT EXISTS publishers TEXT[] NOT NULL DEFAULT '{}';`;
  await sql`ALTER TABLE games ADD COLUMN IF NOT EXISTS release_date TEXT;`;
  await sql`ALTER TABLE games ADD COLUMN IF NOT EXISTS recent_review_label TEXT;`;
  await sql`ALTER TABLE games ADD COLUMN IF NOT EXISTS recent_review_count INTEGER;`;
  await sql`ALTER TABLE games ADD COLUMN IF NOT EXISTS recent_review_score INTEGER;`;
  await sql`ALTER TABLE games ADD COLUMN IF NOT EXISTS russian_review_label TEXT;`;
  await sql`ALTER TABLE games ADD COLUMN IF NOT EXISTS russian_review_count INTEGER;`;
  await sql`ALTER TABLE games ADD COLUMN IF NOT EXISTS russian_review_score INTEGER;`;

  await sql`
    CREATE INDEX IF NOT EXISTS games_created_at_idx
      ON games (created_at DESC);
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS games_rating_avg_idx
      ON games (rating_avg DESC);
  `;

  await sql`
    DO $$
    BEGIN
      IF to_regclass('public.users') IS NOT NULL
        AND NOT EXISTS (
          SELECT 1
          FROM pg_constraint
          WHERE conname = 'games_created_by_user_id_fkey'
        )
      THEN
        ALTER TABLE games
          ADD CONSTRAINT games_created_by_user_id_fkey
          FOREIGN KEY (created_by_user_id)
          REFERENCES users(id)
          ON DELETE SET NULL
          NOT VALID;
      END IF;
    END
    $$;
  `;
}

export async function addHalvaScoreColumns() {
  await sql`
    ALTER TABLE films
    ADD COLUMN IF NOT EXISTS halva_score NUMERIC
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS films_halva_score_idx
    ON films (halva_score DESC)
  `;

  await sql`
    ALTER TABLE books
    ADD COLUMN IF NOT EXISTS halva_score NUMERIC
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS books_halva_score_idx
    ON books (halva_score DESC)
  `;

  await sql`
    ALTER TABLE games
    ADD COLUMN IF NOT EXISTS halva_score NUMERIC
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS games_halva_score_idx
    ON games (halva_score DESC)
  `;
}

export async function allowGameActivitySubject() {
  await sql`
    DO $$
    DECLARE
      constraint_name text;
    BEGIN
      IF to_regclass('public.activity_events') IS NULL THEN
        RETURN;
      END IF;

      FOR constraint_name IN
        SELECT con.conname
        FROM pg_constraint con
        JOIN pg_class rel ON rel.oid = con.conrelid
        JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
        WHERE nsp.nspname = 'public'
          AND rel.relname = 'activity_events'
          AND con.contype = 'c'
          AND pg_get_constraintdef(con.oid) ILIKE '%subject_type%'
      LOOP
        EXECUTE format('ALTER TABLE activity_events DROP CONSTRAINT %I', constraint_name);
      END LOOP;

      ALTER TABLE activity_events
        ADD CONSTRAINT activity_events_subject_type_check
        CHECK (subject_type IN ('film', 'book', 'game'));
    END
    $$;
  `;
}
