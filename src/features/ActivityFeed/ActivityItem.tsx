import { ActivityFeedItem } from '@/entities/activity/model/types';
import UserAvatarMini from '@/entities/user/ui/UserAvatarMini';
import UserLink from '@/pages/user/ui/UserLink';
import Link from 'next/link';
import { getSubjectRef } from '@/shared/lib/utils';
import { getRatingColorClass } from '@/entities/rating/lib/utils';

type ActivityItemProps = {
  event: ActivityFeedItem;
};

export function ActivityItem({ event }: ActivityItemProps) {
  return (
    <article className="flex items-center gap-2 py-3">
      <UserLink userId={event.actor.id} className="flex shrink-0 items-center gap-2">
        <UserAvatarMini className="h-6 w-6 md:h-8 md:w-8" avatarUrl={event.actor.avatarUrl} />

        <span className="text-primary font-medium">{event.actor.username}</span>
      </UserLink>

      <span className="text-muted-foreground">{renderEventText(event)}</span>
    </article>
  );
}

function renderEventText(event: ActivityFeedItem) {
  const subjectHref = getSubjectRef(event.subject);

  const subjectLink = (
    <Link href={subjectHref} className="font-medium hover:underline">
      {event.subject.title}
    </Link>
  );

  switch (event.eventType) {
    case 'subject.created':
      return <>добавил {subjectLink}</>;

    case 'subject.rated': {
      const value = getRatingValue(event.metadata);
      return (
        <>
          оценил {subjectLink} на{' '}
          <span className={`font-medium ${getRatingColorClass(value)}`}>{value}</span>
        </>
      );
    }

    case 'subject.commented': {
      const commentPreview = getCommentPreview(event.metadata);
      const parentCommentId = getParentCommentId(event.metadata);

      if (parentCommentId) {
        return (
          <>
            ответил на комментарий к {subjectLink}
            {commentPreview && (
              <>
                : <span className="text-muted-foreground">«{commentPreview}»</span>
              </>
            )}
          </>
        );
      }

      return (
        <>
          прокомментировал {subjectLink}
          {commentPreview && (
            <>
              : <span className="text-muted-foreground">«{commentPreview}»</span>
            </>
          )}
        </>
      );
    }

    case 'subject.reviewed':
      return <>написал рецензию на {subjectLink}</>;

    default:
      return null;
  }
}

function getRatingValue(metadata: Record<string, unknown>) {
  const ratingValue = metadata.ratingValue;

  return typeof ratingValue === 'number' ? ratingValue : null;
}

function getCommentPreview(metadata: Record<string, unknown>) {
  return typeof metadata.commentPreview === 'string' ? metadata.commentPreview : null;
}

function getParentCommentId(metadata: Record<string, unknown>) {
  return typeof metadata.parentCommentId === 'string' ? metadata.parentCommentId : null;
}
