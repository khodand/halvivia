import z from 'zod';
import { SubjectSchema, SubjectTypeSchema } from '@/shared/model/subject/schema';

export const ActivityEventTypeSchema = z.enum([
  'subject.created',
  'subject.rated',
  'subject.commented',
  'subject.reviewed',
]);

export const ActivityVisibilitySchema = z.enum(['public', 'private']);

export const ActivityEventSchema = z.object({
  id: z.string().uuid(),

  actorId: z.string().uuid(),

  eventType: ActivityEventTypeSchema,

  subject: SubjectSchema,

  metadata: z.record(z.string(), z.unknown()),

  visibility: ActivityVisibilitySchema,

  createdAt: z.coerce.date(),
});

export const ActivityEventDbSchema = z.object({
  id: z.coerce.string(),

  event_type: ActivityEventTypeSchema,

  subject_type: SubjectTypeSchema,
  subject_id: z.string().uuid(),

  metadata: z.record(z.string(), z.unknown()),

  created_at: z.coerce.date(),

  actor_id: z.string().uuid(),
  actor_username: z.string(),
  actor_avatar_url: z.string().nullable(),

  subject_title: z.string(),
  subject_slug: z.string(),
  subject_image: z.string().nullable(),
});
