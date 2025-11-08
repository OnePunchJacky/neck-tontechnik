'use client';

import { useState, useEffect } from 'react';
import MediaUploader from '@/app/components/admin/MediaUploader';
import { WPMedia } from '@/app/lib/types';
import { useAdminDataCache } from '@/app/contexts/AdminDataCache';

export default function MediaPage() {
  const { media, loading, refreshMedia } = useAdminDataCache();
  const [filter, setFilter] = useState<'all' | 'image' | 'audio'>('all');

  useEffect(() => {
    if (media.length === 0 && !loading.media) {
      refreshMedia();
    }
  }, [media.length, loading.media, refreshMedia]);

  const handleDelete = async (mediaItem: WPMedia) => {
    if (!confirm(`Möchtest du dieses Medium wirklich löschen?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/wp/media/${mediaItem.id}?force=true`, {
        method: 'DELETE',
      });

      if (response.ok) {
        refreshMedia();
      }
    } catch (error) {
      console.error('Error deleting media:', error);
      alert('Fehler beim Löschen');
    }
  };

  const handleUploadComplete = (uploadedMedia: WPMedia) => {
    fetchMedia();
  };

  const filteredMedia = filter === 'all'
    ? media
    : filter === 'image'
    ? media.filter((m) => m.mime_type?.startsWith('image/'))
    : media.filter((m) => m.mime_type?.startsWith('audio/'));

  if (loading.media && media.length === 0) {
    return <div className="text-[var(--color-text-secondary)]">Laden...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
          Media Library
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'all'
                ? 'bg-[var(--color-primary)] text-white'
                : 'bg-[var(--color-surface-light)] border border-[var(--color-border)] text-[var(--color-text-primary)]'
            }`}
          >
            Alle
          </button>
          <button
            onClick={() => setFilter('image')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'image'
                ? 'bg-[var(--color-primary)] text-white'
                : 'bg-[var(--color-surface-light)] border border-[var(--color-border)] text-[var(--color-text-primary)]'
            }`}
          >
            Bilder
          </button>
          <button
            onClick={() => setFilter('audio')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'audio'
                ? 'bg-[var(--color-primary)] text-white'
                : 'bg-[var(--color-surface-light)] border border-[var(--color-border)] text-[var(--color-text-primary)]'
            }`}
          >
            Audio
          </button>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
          Neues Medium hochladen
        </h2>
        <MediaUploader
          onUploadComplete={handleUploadComplete}
          accept="image/*,audio/*"
          maxSize={50}
        />
      </div>

      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-6">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
          Medien ({filteredMedia.length})
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredMedia.map((item) => (
            <div
              key={item.id}
              className="border border-[var(--color-border)] rounded-lg overflow-hidden hover:opacity-80 transition-opacity"
            >
              {item.mime_type?.startsWith('image/') ? (
                <img
                  src={item.source_url}
                  alt={item.title?.rendered || 'Media'}
                  className="w-full h-32 object-cover"
                />
              ) : (
                <div className="w-full h-32 bg-[var(--color-surface-light)] flex items-center justify-center">
                  <span className="text-4xl">🎵</span>
                </div>
              )}
              <div className="p-2">
                <div className="text-xs text-[var(--color-text-secondary)] truncate mb-1">
                  {item.title?.rendered || `Media ${item.id}`}
                </div>
                <div className="text-xs text-[var(--color-text-muted)] mb-2">
                  ID: {item.id}
                </div>
                <button
                  onClick={() => handleDelete(item)}
                  className="w-full px-2 py-1 text-xs bg-red-500/10 text-red-500 rounded hover:bg-red-500/20 transition-colors"
                >
                  Löschen
                </button>
              </div>
            </div>
          ))}
        </div>
        {filteredMedia.length === 0 && (
          <div className="text-center text-[var(--color-text-secondary)] py-8">
            Keine Medien gefunden
          </div>
        )}
      </div>
    </div>
  );
}

