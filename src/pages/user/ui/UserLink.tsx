import Link from 'next/link';
import { ROUTES } from '@/shared/config';

export type UserLinkProps = {
  userId: string;
  children?: React.ReactNode;
  className?: string;
};

export function UserLink({ userId, children, className }: UserLinkProps) {
  return (
    <Link href={`${ROUTES.PROFILE}/${userId}`} className={className ? className : ''}>
      {children}
    </Link>
  );
}

export default UserLink;
