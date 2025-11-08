'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminNav from './AdminNav';
import { AdminDataCacheProvider } from '@/app/contexts/AdminDataCache';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check authentication
    fetch('/api/auth')
      .then(res => res.json())
      .then(data => {
        if (!data.authenticated) {
          router.push('/manage/login');
        } else {
          setUser(data.user);
          setLoading(false);
        }
      })
      .catch(() => {
        router.push('/manage/login');
      });
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-dark)]">
        <div className="text-[var(--color-text-primary)]">Laden...</div>
      </div>
    );
  }

  return (
    <AdminDataCacheProvider>
      <div className="min-h-screen bg-[var(--color-bg-dark)]">
        <AdminNav />
        <main className="lg:ml-64 p-6 pt-20 lg:pt-6">
          {children}
        </main>
      </div>
    </AdminDataCacheProvider>
  );
}

