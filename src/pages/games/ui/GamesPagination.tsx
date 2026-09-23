'use client';

import { useListQuery } from '@/shared/lib/url/hooks';
import { Pagination } from '@/shared/ui/pagination/pagination';

type GamesPaginationProps = {
  page: number;
  totalPages: number;
};

export function GamesPagination({ page, totalPages }: GamesPaginationProps) {
  const { updateParam } = useListQuery<'page'>();

  return (
    <Pagination
      page={page}
      totalPages={totalPages}
      onChange={(nextPage) => updateParam('page', String(nextPage))}
    />
  );
}
