'use client';

import { useState, useEffect } from 'react';

interface MediaSelectorProps {
  onSelect: (media: any) => void;
  currentMediaId?: number | string;
  type?: 'image' | 'audio' | 'all';
}

export default function MediaSelector({
  onSelect,
  currentMediaId,
  type = 'all',
}: MediaSelectorProps) {
  const [media, setMedia] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | string | undefined>(currentMediaId);

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    try {
      const response = await fetch('/api/wp/media');
      if (response.ok) {
        const data = await response.json();
        let filtered = Array.isArray(data) ? data : [];

        // Filter by type if specified
        if (type === 'image') {
          filtered = filtered.filter((m: any) => m.mime_type?.startsWith('image/'));
        } else if (type === 'audio') {
          filtered = filtered.filter((m: any) => m.mime_type?.startsWith('audio/'));
        }

        setMedia(filtered);
      }
    } catch (error) {
      console.error('Error fetching media:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (mediaItem: any) => {
    setSelectedId(mediaItem.id);
    onSelect(mediaItem);
  };

  if (loading) {
    return <div className="text-[var(--color-text-secondary)]">Laden...</div>;
  }

  return (
    <div className="border border-[var(--color-border)] rounded-lg p-4 h-[calc(100vh-200px)] overflow-y-auto">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {media.map((item) => (
          <div
            key={item.id}
            onClick={() => handleSelect(item)}
            className={`
              cursor-pointer border-2 rounded-lg overflow-hidden transition-all
              ${
                selectedId === item.id
                  ? 'border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]'
                  : 'border-[var(--color-border)] hover:border-[var(--color-primary)]/50'
              }
            `}
          >
            {item.mime_type?.startsWith('image/') ? (
              <img
                src={item.source_url}
                alt={item.title?.rendered || 'Media'}
                className="w-full h-24 object-cover"
              />
            ) : (
              <div className="w-full h-24 bg-[var(--color-surface-light)] flex items-center justify-center">
                <span className="text-2xl">🎵</span>
              </div>
            )}
            <div className="p-2 text-xs text-[var(--color-text-secondary)] truncate">
              {item.title?.rendered || `Media ${item.id}`}
            </div>
          </div>
        ))}
      </div>
      {media.length === 0 && (
        <div className="text-center text-[var(--color-text-secondary)] py-8">
          Keine Medien gefunden
        </div>
      )}
    </div>
  );
}

