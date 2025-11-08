'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';
import StandardFooter from './StandardFooter';

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/manage');

  return (
    <>
      {!isAdminRoute && <Header />}
      {children}
      {!isAdminRoute && <StandardFooter />}
    </>
  );
}

