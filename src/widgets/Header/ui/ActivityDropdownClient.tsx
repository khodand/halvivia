'use client';

import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/shared/ui/Dropdown';
import { Icon } from '@/shared/ui/icon';

type ActivityDropdownClientProps = {
  children: React.ReactNode;
};

export function ActivityDropdownClient({ children }: ActivityDropdownClientProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="relative flex items-center rounded-full transition-colors hover:bg-white/10"
          aria-label="Уведомления"
        >
          <Icon name="NotificationIcon" active={true} className="w-4 lg:w-5.5" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="bg-bg-base mt-5 w-screen rounded-t-none p-0 md:w-[339px] lg:mt-7"
      >
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
