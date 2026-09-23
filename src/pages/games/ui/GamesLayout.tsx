import { ReactNode, Suspense } from 'react';

export function GamesLayout({ children }: { children: ReactNode }) {
  return <Suspense fallback={<>Загружаем игры...</>}>{children}</Suspense>;
}

export default GamesLayout;
