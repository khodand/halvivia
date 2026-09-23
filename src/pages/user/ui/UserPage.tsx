import { findUserById } from '@/entities/user';
import { verifySession } from '@/shared/lib/auth';
import { redirect } from 'next/navigation';
import { ROUTES } from '@/shared/config';
import UserAvatarMini from '@/entities/user/ui/UserAvatarMini';
import { Separator } from '@/shared/ui/separator';
import { UserTabs } from '@/pages/user/ui/UserTabs';
import UserTabContent from '@/pages/user/ui/UserTabContent';
import { getUserTab } from '@/pages/user/model';
import Link from 'next/link';
import { SettingsIcon } from '@/shared/ui/icons';

export type UserPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    tab?: string;
    page?: string;
    booksPage?: string;
    filmsPage?: string;
    gamesPage?: string;
  }>;
};

function getPage(value?: string): number {
  const page = Number(value);

  return Number.isInteger(page) && page > 0 ? page : 1;
}

export async function UserPage({ params, searchParams }: UserPageProps) {
  const [session, { id }, query] = await Promise.all([verifySession(), params, searchParams]);

  if (session.status === 'unauthenticated') {
    redirect(ROUTES.LOGIN);
  }

  const user = await findUserById(id);

  if (!user) {
    return <div>Пользователь не найден...</div>;
  }

  const isOwner = session.payload.userId === user.id;

  const activeTab = getUserTab(query.tab);

  // Эта страница нужна только wishlist.
  const wishlistPage = getPage(query.page);

  return (
    <div className="flex w-full flex-col py-4.5 md:py-7">
      <div className="page-content-width">
        <UserAvatarMini className="border-none lg:h-[4.9vw] lg:w-[4.9vw]" user={user} />

        <div className="mt-0.5 flex items-center gap-2 md:mt-1.5">
          <h1 className="text-text-inverse text-xl font-semibold md:text-2xl">{user.name}</h1>

          {isOwner && (
            <Link
              href={ROUTES.SETTINGS + user.id}
              className="text-text-inverse-500 hover:text-text-inverse focus-visible:ring-primary rounded p-1 transition-colors focus-visible:ring-2"
              aria-label="Настройки профиля"
              title="Настройки профиля"
            >
              <SettingsIcon className="h-5 w-5" aria-hidden="true" />
            </Link>
          )}
        </div>
      </div>

      <div>tabspan</div>

      <div className="page-content-width">
        <UserTabs userId={user.id} />
      </div>

      <Separator className="bg-border-second w-screen" />

      <div className="page-content-width min-h-40">
        <UserTabContent
          userId={user.id}
          activeTab={activeTab}
          page={wishlistPage}
          canRemoveFromWishlist={isOwner}
          searchParams={query}
        />
      </div>
    </div>
  );
}

export default UserPage;
