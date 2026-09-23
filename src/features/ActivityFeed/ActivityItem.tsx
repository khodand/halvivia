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
    <article className="flex items-start gap-2">
      <UserLink userId={event.actor.id} className="shrink-0">
        <UserAvatarMini className="h-12 w-12 border-0" avatarUrl={event.actor.avatarUrl} />
      </UserLink>

      <p className="text-muted-foreground">
        <span className="text-primary font-medium hover:underline">
          <UserLink userId={event.actor.id}>{event.actor.username} </UserLink>
        </span>
        {renderEventText(event)}
      </p>
    </article>
  );
}

function renderEventText(event: ActivityFeedItem) {
  const subjectHref = getSubjectRef(event.subject);

  const subjectLink = (
    <Link href={subjectHref} className="text-text-primary-700 font-medium hover:underline">
      {`"${
        event.subject.title.length > 30
          ? event.subject.title.slice(0, 30) + '...'
          : event.subject.title
      }"`}
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
            ответил на комментарий к {subjectLink}:<br />
            {commentPreview && (
              <>
                <span className="text-muted-foreground text-sm">«{commentPreview}»</span>
              </>
            )}
          </>
        );
      }

      return (
        <>
          оставил комментарий к {subjectLink}:<br />
          {commentPreview && (
            <>
              <span className="text-muted-foreground text-sm">«{commentPreview}»</span>
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
