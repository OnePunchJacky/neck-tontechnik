'use client';

import { useState, useEffect } from 'react';
import DataTable from '@/app/components/admin/DataTable';
import FormField from '@/app/components/admin/FormField';
import MediaSelector from '@/app/components/admin/MediaSelector';
import { WPRecording } from '@/app/lib/types';
import { useAdminDataCache } from '@/app/contexts/AdminDataCache';

export default function RecordingsPage() {
  const { recordings, loading, refreshRecordings } = useAdminDataCache();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showMediaSelector, setShowMediaSelector] = useState(false);
  const [mediaSelectorField, setMediaSelectorField] = useState<string>('');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    status: 'publish',
  });
  const [acfFields, setAcfFields] = useState({
    cover: '',
    spotify: '',
    spotify_album_id: '',
    soundcloud: '',
    bandcamp: '',
    youtube: '',
    artist: '',
  });

  // Data is already loaded from cache, but refresh if needed
  useEffect(() => {
    if (recordings.length === 0 && !loading.recordings) {
      refreshRecordings();
    }
  }, [recordings.length, loading.recordings, refreshRecordings]);

  const handleEdit = (recording: WPRecording) => {
    setFormData({
      title: recording.title.rendered || '',
      content: recording.content.rendered || '',
      status: recording.status,
    });
    setAcfFields({
      cover: String(recording.acf?.cover || ''),
      spotify: recording.acf?.spotify || '',
      spotify_album_id: recording.acf?.spotify_album_id || '',
      soundcloud: recording.acf?.soundcloud || '',
      bandcamp: recording.acf?.bandcamp || '',
      youtube: recording.acf?.youtube || '',
      artist: Array.isArray(recording.acf?.artist) ? recording.acf.artist.join(',') : '',
    });
    setEditingId(recording.id);
    setShowForm(true);
  };

  const handleDelete = async (recording: WPRecording) => {
    if (!confirm(`Möchtest du "${recording.title.rendered}" wirklich löschen?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/wp/recordings/${recording.id}?force=true`, {
        method: 'DELETE',
      });

      if (response.ok) {
        refreshRecordings();
      }
    } catch (error) {
      console.error('Error deleting recording:', error);
      alert('Fehler beim Löschen');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload: any = {
        title: formData.title,
        content: formData.content,
        status: formData.status,
      };

      // ACF fields should be sent in an 'acf' object, not 'meta'
      payload.acf = {
        cover: acfFields.cover ? (acfFields.cover.startsWith('http') ? acfFields.cover : parseInt(acfFields.cover)) : null,
        spotify: acfFields.spotify || '',
        spotify_album_id: acfFields.spotify_album_id || '',
        soundcloud: acfFields.soundcloud || '',
        bandcamp: acfFields.bandcamp || '',
        youtube: acfFields.youtube || '',
        artist: acfFields.artist ? acfFields.artist.split(',').map((id) => parseInt(id.trim())).filter(Boolean) : [],
      };

      const url = editingId
        ? `/api/wp/recordings/${editingId}`
        : '/api/wp/recordings';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setShowForm(false);
        setEditingId(null);
        setFormData({ title: '', content: '', status: 'publish' });
        setAcfFields({
          cover: '',
          spotify: '',
          spotify_album_id: '',
          soundcloud: '',
          bandcamp: '',
          youtube: '',
          artist: '',
        });
        refreshRecordings();
      } else {
        const error = await response.json();
        alert(error.error || 'Fehler beim Speichern');
      }
    } catch (error) {
      console.error('Error saving recording:', error);
      alert('Fehler beim Speichern');
    }
  };

  const handleMediaSelect = (fieldKey: string) => {
    setMediaSelectorField(fieldKey);
    setShowMediaSelector(true);
  };

  const handleMediaSelected = (media: any) => {
    if (mediaSelectorField === 'cover') {
      setAcfFields({ ...acfFields, cover: String(media.id) });
    }
    setShowMediaSelector(false);
    setMediaSelectorField('');
  };

  const columns = [
    { key: 'id', label: 'ID' },
    {
      key: 'title',
      label: 'Titel',
      render: (rec: WPRecording) => rec.title.rendered || 'Kein Titel',
    },
    {
      key: 'status',
      label: 'Status',
      render: (rec: WPRecording) => (
        <span className={`px-2 py-1 rounded text-xs ${
          rec.status === 'publish' ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'
        }`}>
          {rec.status}
        </span>
      ),
    },
    {
      key: 'date',
      label: 'Datum',
      render: (rec: WPRecording) => new Date(rec.date).toLocaleDateString('de-DE'),
    },
  ];

  if (loading.recordings && recordings.length === 0) {
    return <div className="text-[var(--color-text-secondary)]">Laden...</div>;
  }

  if (showMediaSelector) {
    return (
      <div>
        <button
          onClick={() => {
            setShowMediaSelector(false);
            setMediaSelectorField('');
          }}
          className="mb-4 px-4 py-2 bg-[var(--color-surface-light)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] hover:opacity-80"
        >
          ← Zurück
        </button>
        <MediaSelector
          onSelect={handleMediaSelected}
          type="image"
        />
      </div>
    );
  }

  if (showForm) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
            {editingId ? 'Recording bearbeiten' : 'Neues Recording'}
          </h1>
          <button
            onClick={() => {
              setShowForm(false);
              setEditingId(null);
            }}
            className="px-4 py-2 bg-[var(--color-surface-light)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] hover:opacity-80"
          >
            Abbrechen
          </button>
        </div>

        <form onSubmit={handleSubmit} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-6">
          <FormField
            label="Titel"
            name="title"
            value={formData.title}
            onChange={(value) => setFormData({ ...formData, title: value })}
            required
          />

          <FormField
            label="Inhalt"
            name="content"
            type="textarea"
            value={formData.content}
            onChange={(value) => setFormData({ ...formData, content: value })}
            rows={6}
          />

          <FormField
            label="Status"
            name="status"
            type="select"
            value={formData.status}
            onChange={(value) => setFormData({ ...formData, status: value })}
            options={[
              { value: 'publish', label: 'Veröffentlicht' },
              { value: 'draft', label: 'Entwurf' },
              { value: 'private', label: 'Privat' },
            ]}
          />

          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                Cover Bild
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={acfFields.cover}
                  onChange={(e) => setAcfFields({ ...acfFields, cover: e.target.value })}
                  placeholder="Media ID oder URL"
                  className="flex-1 px-4 py-2 bg-[var(--color-surface-light)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)]"
                />
                <button
                  type="button"
                  onClick={() => handleMediaSelect('cover')}
                  className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90"
                >
                  Auswählen
                </button>
              </div>
            </div>

            <FormField
              label="Spotify URL"
              name="spotify"
              type="url"
              value={acfFields.spotify}
              onChange={(value) => setAcfFields({ ...acfFields, spotify: value })}
            />

            <FormField
              label="Spotify Album ID"
              name="spotify_album_id"
              value={acfFields.spotify_album_id}
              onChange={(value) => setAcfFields({ ...acfFields, spotify_album_id: value })}
            />

            <FormField
              label="SoundCloud URL"
              name="soundcloud"
              type="url"
              value={acfFields.soundcloud}
              onChange={(value) => setAcfFields({ ...acfFields, soundcloud: value })}
            />

            <FormField
              label="Bandcamp URL"
              name="bandcamp"
              type="url"
              value={acfFields.bandcamp}
              onChange={(value) => setAcfFields({ ...acfFields, bandcamp: value })}
            />

            <FormField
              label="YouTube URL"
              name="youtube"
              type="url"
              value={acfFields.youtube}
              onChange={(value) => setAcfFields({ ...acfFields, youtube: value })}
            />

            <FormField
              label="Artist IDs (durch Komma getrennt)"
              name="artist"
              value={acfFields.artist}
              onChange={(value) => setAcfFields({ ...acfFields, artist: value })}
              placeholder="z.B. 1, 2, 3"
            />
          </div>

          <div className="mt-6 flex gap-4">
            <button
              type="submit"
              className="px-6 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              Speichern
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
              }}
              className="px-6 py-2 bg-[var(--color-surface-light)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] hover:opacity-80"
            >
              Abbrechen
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
          Recordings
        </h1>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90 transition-opacity"
        >
          + Neues Recording
        </button>
      </div>

      <DataTable
        data={recordings}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}

