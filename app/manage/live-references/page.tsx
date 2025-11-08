'use client';

import { useState, useEffect } from 'react';
import DataTable from '@/app/components/admin/DataTable';
import FormField from '@/app/components/admin/FormField';
import MediaSelector from '@/app/components/admin/MediaSelector';
import { WPLiveReference } from '@/app/lib/types';
import { useAdminDataCache } from '@/app/contexts/AdminDataCache';

export default function LiveReferencesPage() {
  const { liveReferences: references, loading, refreshLiveReferences } = useAdminDataCache();
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
    if (references.length === 0 && !loading.liveReferences) {
      refreshLiveReferences();
    }
  }, [references.length, loading.liveReferences, refreshLiveReferences]);

  const handleEdit = (reference: WPLiveReference) => {
    setFormData({
      title: reference.title.rendered || '',
      content: reference.content.rendered || '',
      status: reference.status,
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
        refreshLiveReferences();
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
      };

      // ACF fields should be sent in an 'acf' object
      payload.acf = {
        venue_name: acfFields.venue_name || '',
        event_date: acfFields.event_date || '',
        location: acfFields.location || '',
        capacity: acfFields.capacity ? parseInt(acfFields.capacity) : null,
        event_type: acfFields.event_type || '',
        equipment_used: acfFields.equipment_used || '',
        featured_image: acfFields.featured_image && acfFields.featured_image.trim() ? (acfFields.featured_image.startsWith('http') ? acfFields.featured_image : (isNaN(parseInt(acfFields.featured_image)) ? null : parseInt(acfFields.featured_image))) : null,
        gallery: acfFields.gallery ? acfFields.gallery.split(',').map((id) => parseInt(id.trim())).filter(Boolean) : [],
        client_testimonial: acfFields.client_testimonial || '',
        client_name: acfFields.client_name || '',
        client_position: acfFields.client_position || '',
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
        setFormData({ title: '', content: '', status: 'publish' });
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
        refreshLiveReferences();
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
    } else if (mediaSelectorField === 'gallery') {
      const currentGallery = acfFields.gallery ? acfFields.gallery.split(',').filter(Boolean) : [];
      const newGallery = [...currentGallery, String(media.id)];
      setAcfFields({ ...acfFields, gallery: newGallery.join(',') });
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

  if (loading.liveReferences && references.length === 0) {
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

          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
              Event Details
            </h3>

            <FormField
              label="Venue Name"
              name="venue_name"
              value={acfFields.venue_name}
              onChange={(value) => setAcfFields({ ...acfFields, venue_name: value })}
            />

            <FormField
              label="Event Date"
              name="event_date"
              type="date"
              value={acfFields.event_date}
              onChange={(value) => setAcfFields({ ...acfFields, event_date: value })}
            />

            <FormField
              label="Location"
              name="location"
              value={acfFields.location}
              onChange={(value) => setAcfFields({ ...acfFields, location: value })}
            />

            <FormField
              label="Capacity"
              name="capacity"
              type="number"
              value={acfFields.capacity}
              onChange={(value) => setAcfFields({ ...acfFields, capacity: value })}
            />

            <FormField
              label="Event Type"
              name="event_type"
              value={acfFields.event_type}
              onChange={(value) => setAcfFields({ ...acfFields, event_type: value })}
            />

            <FormField
              label="Equipment Used"
              name="equipment_used"
              type="textarea"
              value={acfFields.equipment_used}
              onChange={(value) => setAcfFields({ ...acfFields, equipment_used: value })}
              rows={3}
            />
          </div>

          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
              Bilder
            </h3>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                Hauptbild
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={acfFields.featured_image}
                  onChange={(e) => setAcfFields({ ...acfFields, featured_image: e.target.value })}
                  placeholder="Media ID oder URL"
                  className="flex-1 px-4 py-2 bg-[var(--color-surface-light)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)]"
                />
                <button
                  type="button"
                  onClick={() => handleMediaSelect('featured_image')}
                  className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90"
                >
                  Auswählen
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                Galerie (IDs durch Komma getrennt)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={acfFields.gallery}
                  onChange={(e) => setAcfFields({ ...acfFields, gallery: e.target.value })}
                  placeholder="z.B. 1, 2, 3"
                  className="flex-1 px-4 py-2 bg-[var(--color-surface-light)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)]"
                />
                <button
                  type="button"
                  onClick={() => handleMediaSelect('gallery')}
                  className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90"
                >
                  Hinzufügen
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
              Kundenbewertung
            </h3>

            <FormField
              label="Testimonial"
              name="client_testimonial"
              type="textarea"
              value={acfFields.client_testimonial}
              onChange={(value) => setAcfFields({ ...acfFields, client_testimonial: value })}
              rows={4}
            />

            <FormField
              label="Kundenname"
              name="client_name"
              value={acfFields.client_name}
              onChange={(value) => setAcfFields({ ...acfFields, client_name: value })}
            />

            <FormField
              label="Position"
              name="client_position"
              value={acfFields.client_position}
              onChange={(value) => setAcfFields({ ...acfFields, client_position: value })}
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

