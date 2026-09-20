import { LoginButton } from './LoginButton';
import { HeaderDropdown } from './HeaderDropdown';
import { getCurrentUser } from '@/features/auth/api/getCurrentUser';
import { UserClient } from '@/widgets/Header/ui/UserClient';
import { ActivityDropdown } from '@/widgets/Header/ui/ActivityDropwdown';

export async function HeaderUserBar() {
  const user = await getCurrentUser();

  return (
    <div className="flex items-center gap-4 lg:gap-6">
      <UserClient user={user}></UserClient>
      <ActivityDropdown></ActivityDropdown>

      {user ? <HeaderDropdown user={user} /> : <LoginButton />}
    </div>
  );
}

export default HeaderUserBar;
