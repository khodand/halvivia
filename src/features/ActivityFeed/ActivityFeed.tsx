import { getRecentActivity } from '@/entities/activity/api/db';
import { ActivityItem } from '@/features/ActivityFeed/ActivityItem';

type ActivityFeedProps = {
  limit?: number;
};

export async function ActivityFeed({ limit = 25 }: ActivityFeedProps) {
  const events = await getRecentActivity(limit);

  if (events.length === 0) {
    return (
      <div className="text-muted-foreground px-4 py-8 text-center text-sm">Пока нет активности</div>
    );
  }

  return (
    <div className="max-h-[500px] overflow-y-auto">
      <div className="border-border-default px-4 py-3">
        <h2 className="text-sm font-semibold">Последняя активность</h2>
      </div>

      <div className="divide-border-default divide-y">
        {events.map((event) => (
          <ActivityItem key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
}
