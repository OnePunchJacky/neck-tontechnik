'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
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
  ChevronDown,
  ChevronRight,
  Globe,
  FolderOpen,
} from 'lucide-react';

interface NavItem {
  href?: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  { href: '/manage', label: 'Übersicht', icon: LayoutDashboard },
  {
    label: 'Website',
    icon: Globe,
    children: [
      { href: '/manage/homepage', label: 'Homepage', icon: Home },
      { href: '/manage/pages', label: 'Seiten', icon: FileText },
      { href: '/manage/media', label: 'Medien', icon: ImageIcon },
    ],
  },
  {
    label: 'Referenzen',
    icon: FolderOpen,
    children: [
      { href: '/manage/live-references', label: 'Live-Referenzen', icon: Mic },
      { href: '/manage/recordings', label: 'Aufnahmen', icon: Music },
      { href: '/manage/audio-samples', label: 'Audio-Samples', icon: Headphones },
    ],
  },
  { href: '/manage/equipment', label: 'Equipment-Verleih', icon: Settings },
  { href: '/manage/artists', label: 'Künstler', icon: Users },
  { href: '/manage/settings', label: 'Einstellungen', icon: UserCog },
];

export default function AdminNav() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState<Set<string>>(new Set());

  // Auto-expand submenus that contain the active page
  useEffect(() => {
    const activeSubmenus = new Set<string>();
    navItems.forEach((item, index) => {
      if (item.children) {
        const hasActiveChild = item.children.some(
          (child) => child.href && (pathname === child.href || pathname.startsWith(child.href + '/'))
        );
        if (hasActiveChild) {
          activeSubmenus.add(`submenu-${index}`);
        }
      }
    });
    setOpenSubmenus(activeSubmenus);
  }, [pathname]);

  const toggleSubmenu = (submenuKey: string) => {
    setOpenSubmenus((prev) => {
      const next = new Set(prev);
      if (next.has(submenuKey)) {
        next.delete(submenuKey);
      } else {
        next.add(submenuKey);
      }
      return next;
    });
  };

  const isSubmenuOpen = (submenuKey: string) => openSubmenus.has(submenuKey);

  const isItemActive = (item: NavItem): boolean => {
    if (item.href) {
      return pathname === item.href || (item.href !== '/manage' && pathname.startsWith(item.href + '/'));
    }
    if (item.children) {
      return item.children.some((child) => child.href && (pathname === child.href || pathname.startsWith(child.href + '/')));
    }
    return false;
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth', { method: 'DELETE' });
      window.location.href = '/manage/login';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const renderNavItem = (item: NavItem, index: number) => {
    const isActive = isItemActive(item);
    const IconComponent = item.icon;

    if (item.children) {
      const submenuKey = `submenu-${index}`;
      const isOpen = isSubmenuOpen(submenuKey);
      const hasActiveChild = item.children.some((child) => child.href && (pathname === child.href || pathname.startsWith(child.href + '/')));

      return (
        <div key={submenuKey}>
          <button
            onClick={() => toggleSubmenu(submenuKey)}
            className={`
              w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-colors text-left
              ${isActive || hasActiveChild
                ? 'bg-[var(--color-primary)] text-white'
                : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-light)]'
              }
            `}
          >
            <div className="flex items-center gap-3">
              <IconComponent className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </div>
            {isOpen ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="ml-4 mt-1 space-y-1 border-l-2 border-[var(--color-border)] pl-4">
              {item.children.map((child) => {
                const isChildActive = child.href && (pathname === child.href || pathname.startsWith(child.href + '/'));
                const ChildIcon = child.icon;
                return (
                  <Link
                    key={child.href}
                    href={child.href!}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`
                      flex items-center gap-3 px-4 py-2 rounded-lg transition-colors
                      ${isChildActive
                        ? 'bg-[var(--color-primary)] text-white'
                        : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-light)]'
                      }
                    `}
                  >
                    <ChildIcon className="w-4 h-4" />
                    <span className="text-sm font-medium">{child.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    return (
      <Link
        key={item.href}
        href={item.href!}
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

        <div className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-120px)]">
          {navItems.map((item, index) => renderNavItem(item, index))}
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

