import Link from 'next/link';
import type { AddBookStatus } from '../model/types';

type AddBookStatusMessageProps = {
  status: AddBookStatus;
};

export function AddBookStatusMessage({ status }: AddBookStatusMessageProps) {
  if (status.type === 'error') {
    return <p className="text-error text-sm">{status.message}</p>;
  }

  if (status.type === 'success') {
    return (
      <p className="text-success text-sm">
        {status.message}.{' '}
        <Link className="font-semibold" href={`/library/${status.bookId}`}>
          Открыть
        </Link>
      </p>
    );
  }

  return null;
}
