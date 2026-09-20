import { ActivityFeed } from '@/features/ActivityFeed/ActivityFeed';
import { ActivityDropdownClient } from '@/widgets/Header/ui/ActivityDropdownClient';

export async function ActivityDropdown() {
  return (
    <ActivityDropdownClient>
      <ActivityFeed limit={10} />
    </ActivityDropdownClient>
  );
}
