'use client';

import { useState, useEffect } from 'react';
import { WPMedia } from '@/app/lib/types';
import { X } from 'lucide-react';

interface ImagePreviewProps {
  mediaId: string | number | null;
  onSelect: () => void;
  onRemove: () => void;
  label: string;
}

export default function ImagePreview({ mediaId, onSelect, onRemove, label }: ImagePreviewProps) {
  const [media, setMedia] = useState<WPMedia | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMedia = async () => {
      if (!mediaId || mediaId === '' || mediaId === '0') {
        setMedia(null);
        setLoading(false);
        return;
      }

      // If it's a URL, create a minimal media object for display
      if (typeof mediaId === 'string' && (mediaId.startsWith('http') || mediaId.startsWith('//'))) {
        setMedia({
          id: 0,
          date: '',
          slug: '',
          type: '',
          link: '',
          title: { rendered: 'External Image' },
          author: 0,
          comment_status: '',
          ping_status: '',
          template: '',
          meta: {},
          description: { rendered: '' },
          caption: { rendered: '' },
          alt_text: '',
          media_type: 'image',
          mime_type: 'image/jpeg',
          media_details: { width: 0, height: 0, file: '' },
          source_url: mediaId,
          _links: {},
        });
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const id = typeof mediaId === 'string' ? parseInt(mediaId) : mediaId;
        if (isNaN(id) || id <= 0) {
          setMedia(null);
          setLoading(false);
          return;
        }

        const response = await fetch(`/api/wp/media?id=${id}`);
        if (response.ok) {
          const data = await response.json();
          setMedia(data);
        } else {
          setError('Bild nicht gefunden');
          setMedia(null);
        }
      } catch (err) {
        console.error('Error fetching media:', err);
        setError('Fehler beim Laden');
        setMedia(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMedia();
  }, [mediaId]);

  if (loading) {
    return (
      <div>
        <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
          {label}
        </label>
        <div className="flex items-center justify-center h-48 bg-[var(--color-surface-light)] border border-[var(--color-border)] rounded-lg">
          <span className="text-[var(--color-text-secondary)]">Laden...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
          {label}
        </label>
        <div className="flex items-center justify-center h-48 bg-[var(--color-surface-light)] border border-[var(--color-border)] rounded-lg">
          <span className="text-red-500 text-sm">{error}</span>
        </div>
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={onSelect}
            className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90"
          >
            Bild auswählen
          </button>
        </div>
      </div>
    );
  }

  if (!media || !media.source_url) {
    return (
      <div>
        <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
          {label}
        </label>
        <div className="flex items-center justify-center h-48 bg-[var(--color-surface-light)] border border-[var(--color-border)] rounded-lg border-dashed">
          <div className="text-center">
            <p className="text-[var(--color-text-secondary)] mb-2">Kein Bild ausgewählt</p>
            <button
              type="button"
              onClick={onSelect}
              className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90"
            >
              Bild auswählen
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
        {label}
      </label>
      <div className="relative">
        <div className="relative w-full aspect-square border border-[var(--color-border)] rounded-lg overflow-hidden bg-[var(--color-surface-light)]">
          <img
            src={media.source_url}
            alt={media.alt_text || media.title?.rendered || 'Preview'}
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={onRemove}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            aria-label="Bild entfernen"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={onSelect}
            className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90"
          >
            Ändern
          </button>
        </div>
      </div>
    </div>
  );
}

