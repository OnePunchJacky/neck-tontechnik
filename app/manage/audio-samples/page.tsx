'use client';

import { useState, useEffect } from 'react';
import DataTable from '@/app/components/admin/DataTable';
import FormField from '@/app/components/admin/FormField';
import MediaUploader from '@/app/components/admin/MediaUploader';
import { WPAudioSample } from '@/app/lib/types';
import { useAdminDataCache } from '@/app/contexts/AdminDataCache';

export default function AudioSamplesPage() {
  const { audioSamples: samples, loading, refreshAudioSamples } = useAdminDataCache();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [beforeAudio, setBeforeAudio] = useState<any>(null);
  const [afterAudio, setAfterAudio] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    status: 'publish',
  });

  useEffect(() => {
    if (samples.length === 0 && !loading.audioSamples) {
      refreshAudioSamples();
    }
  }, [samples.length, loading.audioSamples, refreshAudioSamples]);

  const handleEdit = async (sample: WPAudioSample) => {
    setFormData({
      title: sample.title.rendered || '',
      content: sample.content.rendered || '',
      status: sample.status,
    });

    // Fetch media attachments
    try {
      const mediaResponse = await fetch(`/api/wp/media?parent=${sample.id}`);
      if (mediaResponse.ok) {
        const media = await mediaResponse.json();
        const mediaArray = Array.isArray(media) ? media : [];
        const before = mediaArray.find((m: any) =>
          m.title?.rendered?.toLowerCase().includes('vorher') ||
          m.slug?.includes('vorher')
        );
        const after = mediaArray.find((m: any) =>
          m.title?.rendered?.toLowerCase().includes('nachher') ||
          m.slug?.includes('nachher')
        );
        setBeforeAudio(before);
        setAfterAudio(after);
      }
    } catch (error) {
      console.error('Error fetching media:', error);
    }

    setEditingId(sample.id);
    setShowForm(true);
  };

  const handleDelete = async (sample: WPAudioSample) => {
    if (!confirm(`Möchtest du "${sample.title.rendered}" wirklich löschen?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/wp/audio-samples/${sample.id}?force=true`, {
        method: 'DELETE',
      });

      if (response.ok) {
        refreshAudioSamples();
      }
    } catch (error) {
      console.error('Error deleting sample:', error);
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

      const url = editingId
        ? `/api/wp/audio-samples/${editingId}`
        : '/api/wp/audio-samples';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const savedSample = await response.json();

        // Upload audio files if provided
        // Note: WordPress REST API requires uploading media separately and then attaching to post
        // This is a simplified version - in production, you'd handle the media uploads here

        setShowForm(false);
        setEditingId(null);
        setFormData({ title: '', content: '', status: 'publish' });
        setBeforeAudio(null);
        setAfterAudio(null);
        refreshAudioSamples();
      } else {
        const error = await response.json();
        alert(error.error || 'Fehler beim Speichern');
      }
    } catch (error) {
      console.error('Error saving sample:', error);
      alert('Fehler beim Speichern');
    }
  };

  const handleBeforeAudioUpload = (media: any) => {
    setBeforeAudio(media);
  };

  const handleAfterAudioUpload = (media: any) => {
    setAfterAudio(media);
  };

  const columns = [
    { key: 'id', label: 'ID' },
    {
      key: 'title',
      label: 'Titel',
      render: (sample: WPAudioSample) => sample.title.rendered || 'Kein Titel',
    },
    {
      key: 'status',
      label: 'Status',
      render: (sample: WPAudioSample) => (
        <span className={`px-2 py-1 rounded text-xs ${
          sample.status === 'publish' ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'
        }`}>
          {sample.status}
        </span>
      ),
    },
    {
      key: 'date',
      label: 'Datum',
      render: (sample: WPAudioSample) => new Date(sample.date).toLocaleDateString('de-DE'),
    },
  ];

  if (loading.audioSamples && samples.length === 0) {
    return <div className="text-[var(--color-text-secondary)]">Laden...</div>;
  }

  if (showForm) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
            {editingId ? 'Audio Sample bearbeiten' : 'Neues Audio Sample'}
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

          <div className="mb-4">
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
              Vorher Audio
            </label>
            {beforeAudio ? (
              <div className="mb-2 p-3 bg-[var(--color-surface-light)] border border-[var(--color-border)] rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-[var(--color-text-primary)]">{beforeAudio.title?.rendered || `Media ${beforeAudio.id}`}</span>
                  <button
                    type="button"
                    onClick={() => setBeforeAudio(null)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Entfernen
                  </button>
                </div>
              </div>
            ) : (
              <MediaUploader
                onUploadComplete={handleBeforeAudioUpload}
                accept="audio/*"
                maxSize={50}
              />
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
              Nachher Audio
            </label>
            {afterAudio ? (
              <div className="mb-2 p-3 bg-[var(--color-surface-light)] border border-[var(--color-border)] rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-[var(--color-text-primary)]">{afterAudio.title?.rendered || `Media ${afterAudio.id}`}</span>
                  <button
                    type="button"
                    onClick={() => setAfterAudio(null)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Entfernen
                  </button>
                </div>
              </div>
            ) : (
              <MediaUploader
                onUploadComplete={handleAfterAudioUpload}
                accept="audio/*"
                maxSize={50}
              />
            )}
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
          Audio Samples
        </h1>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90 transition-opacity"
        >
          + Neues Audio Sample
        </button>
      </div>

      <DataTable
        data={samples}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}

