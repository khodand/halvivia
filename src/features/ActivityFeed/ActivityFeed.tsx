import { getRecentActivity } from '@/entities/activity/api/db';
import { ActivityItem } from '@/features/ActivityFeed/ActivityItem';
import { verifySession } from '@/shared/lib/auth';
import { ROUTES } from '@/shared/config';
import Link from 'next/link';

type ActivityFeedProps = {
  limit?: number;
};

export async function ActivityFeed({ limit = 25 }: ActivityFeedProps) {
  const session = await verifySession();

  if (session.status === 'unauthenticated')
    return (
      <div className="text-muted-foreground px-4 py-12 text-center text-sm">
        <Link className={'text-text-primary'} href={ROUTES.LOGIN}>
          Войдите
        </Link>
        , чтобы посмотреть последнюю активность
      </div>
    );

  const events = await getRecentActivity(limit);
  if (events.length === 0) {
    return (
      <div className="text-muted-foreground px-4 py-8 text-center text-sm">Пока нет активности</div>
    );
  }

  return (
    <div className="max-h-screen overflow-y-auto md:max-h-[457px]">
      <div className="border-border-default border px-4 py-4">
        <h2 className="text-sm font-semibold">Уведомления</h2>
      </div>

      <div className="flex flex-col gap-5 px-4 py-4">
        {events.map((event) => (
          <ActivityItem key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
}
