import { type User } from '@/entities/user';
import { ComponentPropsWithoutRef } from 'react';
import { cn } from '@/shared';
import { Image } from '@imagekit/next';
import { PublicUser } from '@/entities/user/model/types';

export type UserAvatarProps = {
  user?: User | PublicUser | null;
  avatarUrl?: string | null;
} & ComponentPropsWithoutRef<'img'>;

export function UserAvatarMini({ user, avatarUrl, className }: UserAvatarProps) {
  const src = avatarUrl ?? user?.avatarUrl;

  return src ? (
    <div>
      <Image
        urlEndpoint={`https://ik.imagekit.io/${process.env.NEXT_PUBLIC_IMAGEKIT_ID}`}
        src={src}
        className={cn(
          'border-primary h-10 w-10 shrink-0 rounded-full border-2 md:h-17 md:w-17',
          className,
        )}
        width={100}
        height={100}
        alt="Picture of the author"
      />
    </div>
  ) : (
    <div
      className={cn(
        'border-primary h-10 w-10 shrink-0 rounded-full border-2 bg-gray-500 md:h-17 md:w-17',
        className,
      )}
    />
  );
}

export default UserAvatarMini;
