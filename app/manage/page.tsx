'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useAdminDataCache } from '@/app/contexts/AdminDataCache';

export default function DashboardPage() {
  const { 
    liveReferences, 
    recordings, 
    audioSamples, 
    equipment, 
    artists, 
    loading,
    refreshLiveReferences,
    refreshRecordings,
    refreshAudioSamples,
    refreshEquipment,
    refreshArtists,
  } = useAdminDataCache();

  useEffect(() => {
    // Preload all data if not already loaded
    if (liveReferences.length === 0 && !loading.liveReferences) {
      refreshLiveReferences();
    }
    if (recordings.length === 0 && !loading.recordings) {
      refreshRecordings();
    }
    if (audioSamples.length === 0 && !loading.audioSamples) {
      refreshAudioSamples();
    }
    if (equipment.length === 0 && !loading.equipment) {
      refreshEquipment();
    }
    if (artists.length === 0 && !loading.artists) {
      refreshArtists();
    }
  }, [
    liveReferences.length,
    recordings.length,
    audioSamples.length,
    equipment.length,
    artists.length,
    loading,
    refreshLiveReferences,
    refreshRecordings,
    refreshAudioSamples,
    refreshEquipment,
    refreshArtists,
  ]);

  const isLoading = loading.liveReferences || loading.recordings || loading.audioSamples || loading.equipment || loading.artists;

  const statCards = [
    {
      title: 'Live-Referenzen',
      count: liveReferences.length,
      href: '/manage/live-references',
      icon: '🎤',
      color: 'bg-blue-500/10 border-blue-500/50',
    },
    {
      title: 'Aufnahmen',
      count: recordings.length,
      href: '/manage/recordings',
      icon: '🎵',
      color: 'bg-green-500/10 border-green-500/50',
    },
    {
      title: 'Audio-Samples',
      count: audioSamples.length,
      href: '/manage/audio-samples',
      icon: '🎧',
      color: 'bg-purple-500/10 border-purple-500/50',
    },
    {
      title: 'Equipment',
      count: equipment.length,
      href: '/manage/equipment',
      icon: '🎛️',
      color: 'bg-orange-500/10 border-orange-500/50',
    },
    {
      title: 'Künstler',
      count: artists.length,
      href: '/manage/artists',
      icon: '👤',
      color: 'bg-pink-500/10 border-pink-500/50',
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-6">
        Übersicht
      </h1>

      {isLoading ? (
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
            <div className="font-medium text-[var(--color-text-primary)]">Medien</div>
            <div className="text-sm text-[var(--color-text-secondary)] mt-1">
              Medien hochladen und verwalten
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

