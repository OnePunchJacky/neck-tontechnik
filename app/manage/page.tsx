'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface DashboardStats {
  liveReferences: number;
  recordings: number;
  audioSamples: number;
  equipment: number;
  artists: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch stats from WordPress API
    const fetchStats = async () => {
      try {
        const [liveRefs, recordings, audioSamples, equipment, artists] = await Promise.all([
          fetch('/api/wp/live-references?per_page=1').then(r => r.json().then(d => ({ total: d.total || 0 }))).catch(() => ({ total: 0 })),
          fetch('/api/wp/recordings?per_page=1').then(r => r.json().then(d => ({ total: d.total || 0 }))).catch(() => ({ total: 0 })),
          fetch('/api/wp/audio-samples?per_page=1').then(r => r.json().then(d => ({ total: d.total || 0 }))).catch(() => ({ total: 0 })),
          fetch('/api/wp/equipment?per_page=1').then(r => r.json().then(d => ({ total: d.total || 0 }))).catch(() => ({ total: 0 })),
          fetch('/api/wp/artists?per_page=1').then(r => r.json().then(d => ({ total: d.total || 0 }))).catch(() => ({ total: 0 })),
        ]);

        setStats({
          liveReferences: liveRefs.total,
          recordings: recordings.total,
          audioSamples: audioSamples.total,
          equipment: equipment.total,
          artists: artists.total,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Live References',
      count: stats?.liveReferences ?? 0,
      href: '/manage/live-references',
      icon: '🎤',
      color: 'bg-blue-500/10 border-blue-500/50',
    },
    {
      title: 'Recordings',
      count: stats?.recordings ?? 0,
      href: '/manage/recordings',
      icon: '🎵',
      color: 'bg-green-500/10 border-green-500/50',
    },
    {
      title: 'Audio Samples',
      count: stats?.audioSamples ?? 0,
      href: '/manage/audio-samples',
      icon: '🎧',
      color: 'bg-purple-500/10 border-purple-500/50',
    },
    {
      title: 'Equipment',
      count: stats?.equipment ?? 0,
      href: '/manage/equipment',
      icon: '🎛️',
      color: 'bg-orange-500/10 border-orange-500/50',
    },
    {
      title: 'Artists',
      count: stats?.artists ?? 0,
      href: '/manage/artists',
      icon: '👤',
      color: 'bg-pink-500/10 border-pink-500/50',
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-8">
        Dashboard
      </h1>

      {loading ? (
        <div className="text-[var(--color-text-secondary)]">Laden...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statCards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className={`${card.color} border rounded-lg p-6 hover:opacity-80 transition-opacity`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl mb-2">{card.icon}</div>
                  <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                    {card.title}
                  </h3>
                  <p className="text-2xl font-bold text-[var(--color-text-primary)] mt-2">
                    {card.count}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-8 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-6">
        <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4">
          Schnellzugriff
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/manage/media"
            className="p-4 bg-[var(--color-surface-light)] border border-[var(--color-border)] rounded-lg hover:opacity-80 transition-opacity"
          >
            <div className="text-2xl mb-2">🖼️</div>
            <div className="font-medium text-[var(--color-text-primary)]">Media Library</div>
            <div className="text-sm text-[var(--color-text-secondary)] mt-1">
              Medien hochladen und verwalten
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

