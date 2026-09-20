import z from 'zod';

import {
  ActivityEventDbSchema,
  ActivityEventSchema,
  ActivityEventTypeSchema,
  ActivityVisibilitySchema,
} from '@/entities/activity/model/schemas';
import { SubjectType } from '@/shared/model/subject/types';

export type ActivityEventType = z.infer<typeof ActivityEventTypeSchema>;

export type ActivityVisibility = z.infer<typeof ActivityVisibilitySchema>;

export type ActivityEvent = z.infer<typeof ActivityEventSchema>;

export type ActivityEventDb = z.infer<typeof ActivityEventDbSchema>;

export type ActivityFeedItem = {
  id: string;

  eventType: ActivityEventType;

  actor: {
    id: string;
    username: string;
    avatarUrl: string | null;
  };

  subject: {
    type: SubjectType;
    id: string;
    title: string;
    slug: string;
    image: string | null;
  };

  metadata: Record<string, unknown>;

  createdAt: Date;
};
