import { sql } from '@/shared/lib/db';
import z from 'zod';

import {
  ActivityEventDbSchema,
  ActivityEventTypeSchema,
  ActivityVisibilitySchema,
} from '@/entities/activity/model/schemas';

import { SubjectSchema } from '@/shared/model/subject/schema';
import { mapActivityEventDb } from '@/entities/activity/model/mappers';
import { cacheLife, cacheTag } from 'next/cache';

export const CreateActivityEventSchema = z.object({
  actorId: z.string().uuid(),

  eventType: ActivityEventTypeSchema,

  subject: SubjectSchema,

  metadata: z.record(z.string(), z.unknown()).optional(),

  visibility: ActivityVisibilitySchema.optional(),
});

export type CreateActivityEventInput = z.infer<typeof CreateActivityEventSchema>;

export async function createActivityEvent(input: CreateActivityEventInput) {
  const data = CreateActivityEventSchema.parse(input);

  const { actorId, eventType, subject, metadata = {}, visibility = 'public' } = data;

  if (eventType === 'subject.rated') {
    await sql`
      DELETE FROM activity_events
      WHERE actor_id = ${actorId}
        AND event_type = 'subject.rated'
        AND subject_type = ${subject.type}
        AND subject_id = ${subject.id};
    `;
  }

  await sql`
    INSERT INTO activity_events (
      actor_id,
      event_type,
      subject_type,
      subject_id,
      metadata,
      visibility
    )
    VALUES (
      ${actorId},
      ${eventType},
      ${subject.type},
      ${subject.id},
      ${JSON.stringify(metadata)}::jsonb,
      ${visibility}
    );
  `;
}

export async function getRecentActivity(limit = 30) {
  'use cache';

  cacheLife('minutes');
  cacheTag('activity-feed');

  const safeLimit = Math.min(Math.max(limit, 1), 100);

  const rows = await sql`
      SELECT ae.id,
             ae.event_type,
             ae.subject_type,
             ae.subject_id,
             ae.metadata,
             ae.created_at,

             u.id         AS actor_id,
             u.name          actor_username,
             u.avatar_url AS actor_avatar_url,

             CASE
                 WHEN ae.subject_type = 'film' THEN f.name_ru
                 WHEN ae.subject_type = 'book' THEN b.title
                 WHEN ae.subject_type = 'game' THEN g.name
                 END      AS subject_title,

             CASE
                 WHEN ae.subject_type = 'film' THEN COALESCE(f.description, '')
                 WHEN ae.subject_type = 'book' THEN COALESCE(b.description, '')
                 WHEN ae.subject_type = 'game' THEN ''
                 END      AS subject_slug,

             CASE
                 WHEN ae.subject_type = 'film' THEN f.cover_url
                 WHEN ae.subject_type = 'book' THEN b.thumbnail_url
                 WHEN ae.subject_type = 'game' THEN NULL
                 END      AS subject_image

      FROM activity_events ae

               JOIN users u
                    ON u.id = ae.actor_id

               LEFT JOIN films f
                         ON ae.subject_type = 'film'
                             AND ae.subject_id = f.id

               LEFT JOIN books b
                         ON ae.subject_type = 'book'
                             AND ae.subject_id = b.id

               LEFT JOIN games g
                         ON ae.subject_type = 'game'
                             AND ae.subject_id = g.id

      WHERE ae.visibility = 'public'
        AND (
          (ae.subject_type = 'film' AND f.id IS NOT NULL)
              OR
          (ae.subject_type = 'book' AND b.id IS NOT NULL)
              OR
          (ae.subject_type = 'game' AND g.id IS NOT NULL)
          )
        
      ORDER BY ae.created_at DESC,
               ae.id DESC

      LIMIT ${safeLimit};
  `;

  return rows.map((row) => {
    const parsed = ActivityEventDbSchema.parse(row);

    return mapActivityEventDb(parsed);
  });
}
