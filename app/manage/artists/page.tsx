'use client';

import { useState, useEffect } from 'react';
import DataTable from '@/app/components/admin/DataTable';
import FormField from '@/app/components/admin/FormField';
import { WPArtist } from '@/app/lib/types';

export default function ArtistsPage() {
  const [artists, setArtists] = useState<WPArtist[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    status: 'publish',
    featured_media: '',
  });

  useEffect(() => {
    fetchArtists();
  }, []);

  const fetchArtists = async () => {
    try {
      const response = await fetch('/api/wp/artists?per_page=100');
      if (response.ok) {
        const data = await response.json();
        setArtists(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching artists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (artist: WPArtist) => {
    setFormData({
      title: artist.title.rendered || '',
      content: artist.content.rendered || '',
      status: artist.status,
      featured_media: String(artist.featured_media || ''),
    });
    setEditingId(artist.id);
    setShowForm(true);
  };

  const handleDelete = async (artist: WPArtist) => {
    if (!confirm(`Möchtest du "${artist.title.rendered}" wirklich löschen?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/wp/artists/${artist.id}?force=true`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchArtists();
      }
    } catch (error) {
      console.error('Error deleting artist:', error);
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
        featured_media: formData.featured_media ? parseInt(formData.featured_media) : 0,
      };

      const url = editingId
        ? `/api/wp/artists/${editingId}`
        : '/api/wp/artists';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setShowForm(false);
        setEditingId(null);
        setFormData({ title: '', content: '', status: 'publish', featured_media: '' });
        fetchArtists();
      } else {
        const error = await response.json();
        alert(error.error || 'Fehler beim Speichern');
      }
    } catch (error) {
      console.error('Error saving artist:', error);
      alert('Fehler beim Speichern');
    }
  };

  const columns = [
    { key: 'id', label: 'ID' },
    {
      key: 'title',
      label: 'Name',
      render: (artist: WPArtist) => artist.title.rendered || 'Kein Name',
    },
    {
      key: 'status',
      label: 'Status',
      render: (artist: WPArtist) => (
        <span className={`px-2 py-1 rounded text-xs ${
          artist.status === 'publish' ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'
        }`}>
          {artist.status}
        </span>
      ),
    },
    {
      key: 'date',
      label: 'Datum',
      render: (artist: WPArtist) => new Date(artist.date).toLocaleDateString('de-DE'),
    },
  ];

  if (loading) {
    return <div className="text-[var(--color-text-secondary)]">Laden...</div>;
  }

  if (showForm) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
            {editingId ? 'Artist bearbeiten' : 'Neuer Artist'}
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
            label="Name"
            name="title"
            value={formData.title}
            onChange={(value) => setFormData({ ...formData, title: value })}
            required
          />

          <FormField
            label="Beschreibung"
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

          <FormField
            label="Featured Media ID"
            name="featured_media"
            type="number"
            value={formData.featured_media}
            onChange={(value) => setFormData({ ...formData, featured_media: value })}
            placeholder="Media ID"
          />

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
          Artists
        </h1>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90 transition-opacity"
        >
          + Neuer Artist
        </button>
      </div>

      <DataTable
        data={artists}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}

