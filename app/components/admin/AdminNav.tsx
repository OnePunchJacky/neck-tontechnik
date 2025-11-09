'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard,
  Home,
  Mic,
  Music,
  Headphones,
  Settings,
  Users,
  Image as ImageIcon,
  Menu,
  LogOut,
  UserCog,
  FileText,
} from 'lucide-react';

const navItems = [
  { href: '/manage', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/manage/homepage', label: 'Homepage', icon: Home },
  { href: '/manage/live-references', label: 'Live References', icon: Mic },
  { href: '/manage/recordings', label: 'Recordings', icon: Music },
  { href: '/manage/audio-samples', label: 'Audio Samples', icon: Headphones },
  { href: '/manage/equipment', label: 'Equipment', icon: Settings },
  { href: '/manage/artists', label: 'Artists', icon: Users },
  { href: '/manage/pages', label: 'Seiten', icon: FileText },
  { href: '/manage/media', label: 'Media Library', icon: ImageIcon },
  { href: '/manage/settings', label: 'Einstellungen', icon: UserCog },
];

export default function AdminNav() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth', { method: 'DELETE' });
      window.location.href = '/manage/login';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg"
        aria-label="Toggle menu"
      >
        <Menu className="w-6 h-6 text-[var(--color-text-primary)]" />
      </button>

      {/* Sidebar */}
      <nav
        className={`
          fixed left-0 top-0 h-full w-64 bg-[var(--color-surface-dark)] border-r border-[var(--color-border)] z-40
          transform transition-transform duration-300 ease-in-out
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        <div className="p-6 border-b border-[var(--color-border)] pt-20 lg:pt-6">
          <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
            Admin Panel
          </h2>
        </div>

        <div className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-120px)]">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/manage' && pathname.startsWith(item.href));
            const IconComponent = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                  ${isActive
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-light)]'
                  }
                `}
              >
                <IconComponent className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[var(--color-border)]">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-light)] rounded-lg transition-colors text-left"
          >
            <LogOut className="w-5 h-5" />
            <span>Abmelden</span>
          </button>
        </div>
      </nav>

      {/* Overlay for mobile */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  );
}

