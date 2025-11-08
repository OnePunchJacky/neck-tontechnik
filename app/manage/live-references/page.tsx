'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DataTable from '@/app/components/admin/DataTable';
import FormField from '@/app/components/admin/FormField';
import ACFFieldEditor from '@/app/components/admin/ACFFieldEditor';
import MediaSelector from '@/app/components/admin/MediaSelector';
import { WPLiveReference } from '@/app/lib/types';

export default function LiveReferencesPage() {
  const router = useRouter();
  const [references, setReferences] = useState<WPLiveReference[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showMediaSelector, setShowMediaSelector] = useState(false);
  const [mediaSelectorField, setMediaSelectorField] = useState<string>('');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    status: 'publish',
    featured_media: '',
  });
  const [acfFields, setAcfFields] = useState({
    venue_name: '',
    event_date: '',
    location: '',
    capacity: '',
    event_type: '',
    equipment_used: '',
    featured_image: '',
    gallery: '',
    client_testimonial: '',
    client_name: '',
    client_position: '',
  });

  useEffect(() => {
    fetchReferences();
  }, []);

  const fetchReferences = async () => {
    try {
      const response = await fetch('/api/wp/live-references?per_page=100');
      if (response.ok) {
        const data = await response.json();
        setReferences(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching references:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (reference: WPLiveReference) => {
    setFormData({
      title: reference.title.rendered || '',
      content: reference.content.rendered || '',
      status: reference.status,
      featured_media: String(reference.featured_media || ''),
    });
    setAcfFields({
      venue_name: reference.acf?.venue_name || '',
      event_date: reference.acf?.event_date || '',
      location: reference.acf?.location || '',
      capacity: String(reference.acf?.capacity || ''),
      event_type: reference.acf?.event_type || '',
      equipment_used: reference.acf?.equipment_used || '',
      featured_image: String(reference.acf?.featured_image || ''),
      gallery: Array.isArray(reference.acf?.gallery) ? reference.acf.gallery.join(',') : '',
      client_testimonial: reference.acf?.client_testimonial || '',
      client_name: reference.acf?.client_name || '',
      client_position: reference.acf?.client_position || '',
    });
    setEditingId(reference.id);
    setShowForm(true);
  };

  const handleDelete = async (reference: WPLiveReference) => {
    if (!confirm(`Möchtest du "${reference.title.rendered}" wirklich löschen?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/wp/live-references/${reference.id}?force=true`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchReferences();
      }
    } catch (error) {
      console.error('Error deleting reference:', error);
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

      // Add ACF fields via meta (WordPress REST API structure)
      payload.meta = {
        venue_name: acfFields.venue_name,
        event_date: acfFields.event_date,
        location: acfFields.location,
        capacity: acfFields.capacity ? parseInt(acfFields.capacity) : null,
        event_type: acfFields.event_type,
        equipment_used: acfFields.equipment_used,
        featured_image: acfFields.featured_image ? parseInt(acfFields.featured_image) : null,
        gallery: acfFields.gallery ? acfFields.gallery.split(',').map((id) => parseInt(id.trim())).filter(Boolean) : [],
        client_testimonial: acfFields.client_testimonial,
        client_name: acfFields.client_name,
        client_position: acfFields.client_position,
      };

      const url = editingId
        ? `/api/wp/live-references/${editingId}`
        : '/api/wp/live-references';
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
        setAcfFields({
          venue_name: '',
          event_date: '',
          location: '',
          capacity: '',
          event_type: '',
          equipment_used: '',
          featured_image: '',
          gallery: '',
          client_testimonial: '',
          client_name: '',
          client_position: '',
        });
        fetchReferences();
      } else {
        const error = await response.json();
        alert(error.error || 'Fehler beim Speichern');
      }
    } catch (error) {
      console.error('Error saving reference:', error);
      alert('Fehler beim Speichern');
    }
  };

  const handleMediaSelect = (fieldKey: string) => {
    setMediaSelectorField(fieldKey);
    setShowMediaSelector(true);
  };

  const handleMediaSelected = (media: any) => {
    if (mediaSelectorField === 'featured_image') {
      setAcfFields({ ...acfFields, featured_image: String(media.id) });
    } else if (mediaSelectorField === 'featured_media') {
      setFormData({ ...formData, featured_media: String(media.id) });
    }
    setShowMediaSelector(false);
    setMediaSelectorField('');
  };

  const columns = [
    { key: 'id', label: 'ID' },
    {
      key: 'title',
      label: 'Titel',
      render: (ref: WPLiveReference) => ref.title.rendered || 'Kein Titel',
    },
    {
      key: 'status',
      label: 'Status',
      render: (ref: WPLiveReference) => (
        <span className={`px-2 py-1 rounded text-xs ${
          ref.status === 'publish' ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'
        }`}>
          {ref.status}
        </span>
      ),
    },
    {
      key: 'date',
      label: 'Datum',
      render: (ref: WPLiveReference) => new Date(ref.date).toLocaleDateString('de-DE'),
    },
  ];

  if (loading) {
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
            {editingId ? 'Live Reference bearbeiten' : 'Neue Live Reference'}
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
              Featured Media
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.featured_media}
                onChange={(e) => setFormData({ ...formData, featured_media: e.target.value })}
                placeholder="Media ID"
                className="flex-1 px-4 py-2 bg-[var(--color-surface-light)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)]"
              />
              <button
                type="button"
                onClick={() => handleMediaSelect('featured_media')}
                className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90"
              >
                Auswählen
              </button>
            </div>
          </div>

          <ACFFieldEditor
            fields={[
              { key: 'venue_name', label: 'Venue Name', type: 'text', value: acfFields.venue_name },
              { key: 'event_date', label: 'Event Date', type: 'date', value: acfFields.event_date },
              { key: 'location', label: 'Location', type: 'text', value: acfFields.location },
              { key: 'capacity', label: 'Capacity', type: 'number', value: acfFields.capacity },
              { key: 'event_type', label: 'Event Type', type: 'text', value: acfFields.event_type },
              { key: 'equipment_used', label: 'Equipment Used', type: 'textarea', value: acfFields.equipment_used },
              { key: 'featured_image', label: 'Featured Image', type: 'media', value: acfFields.featured_image },
              { key: 'gallery', label: 'Gallery (comma-separated IDs)', type: 'text', value: acfFields.gallery },
              { key: 'client_testimonial', label: 'Client Testimonial', type: 'textarea', value: acfFields.client_testimonial },
              { key: 'client_name', label: 'Client Name', type: 'text', value: acfFields.client_name },
              { key: 'client_position', label: 'Client Position', type: 'text', value: acfFields.client_position },
            ]}
            onChange={(fields) => setAcfFields({ ...acfFields, ...fields })}
            onMediaSelect={handleMediaSelect}
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
          Live References
        </h1>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90 transition-opacity"
        >
          + Neue Live Reference
        </button>
      </div>

      <DataTable
        data={references}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}

