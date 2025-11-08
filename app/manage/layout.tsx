'use client';

import { usePathname } from 'next/navigation';
import AdminLayout from '../components/admin/AdminLayout';

export default function ManageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // If it's the login page, don't wrap in AdminLayout
  if (pathname === '/manage/login') {
    return <>{children}</>;
  }
  
  return <AdminLayout>{children}</AdminLayout>;
}

