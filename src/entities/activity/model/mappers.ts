import { ActivityEventDb, ActivityFeedItem } from '@/entities/activity/model/types';

export function mapActivityEventDb(event: ActivityEventDb): ActivityFeedItem {
  return {
    id: event.id,

    eventType: event.event_type,

    actor: {
      id: event.actor_id,
      username: event.actor_username,
      avatarUrl: event.actor_avatar_url,
    },

    subject: {
      type: event.subject_type,
      id: event.subject_id,
      title: event.subject_title,
      slug: event.subject_slug,
      image: event.subject_image,
    },

    metadata: event.metadata,

    createdAt: event.created_at,
  };
}
