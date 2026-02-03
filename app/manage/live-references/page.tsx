'use client';

import { useState, useEffect } from 'react';
import DataTable from '@/app/components/admin/DataTable';
import FormField from '@/app/components/admin/FormField';
import MediaSelector from '@/app/components/admin/MediaSelector';
import ImagePreview from '@/app/components/admin/ImagePreview';
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
    menu_order: 0,
  });
  const [acfFields, setAcfFields] = useState({
    location: '',
    bild: '',
    year: '',
    stage: '',
    category: [] as string[],
  });
  // Category choices for live references
  const categoryOptions = [
    { value: 'Front Of House', label: 'Front Of House' },
    { value: 'Stagetech', label: 'Stagetech' },
    { value: 'Monitor', label: 'Monitor' },
  ];

  useEffect(() => {
    if (references.length === 0 && !loading.liveReferences) {
      refreshLiveReferences();
    }
  }, [references.length, loading.liveReferences, refreshLiveReferences]);

  // Helper function to decode HTML entities and strip HTML tags
  const decodeHtmlContent = (html: string): string => {
    if (!html) return '';
    // Create a temporary div to decode HTML entities
    const textarea = document.createElement('textarea');
    textarea.innerHTML = html;
    const decoded = textarea.value;
    // Strip HTML tags
    return decoded.replace(/<[^>]*>/g, '').trim();
  };

  // Helper function to decode HTML entities in title
  const decodeHtmlEntities = (text: string): string => {
    if (!text) return text;
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
  };

  const handleEdit = (reference: WPLiveReference) => {
    setFormData({
      title: decodeHtmlEntities(reference.title.rendered || ''),
      content: decodeHtmlContent(reference.content.rendered || ''),
      status: reference.status,
      menu_order: reference.menu_order || 0,
    });
    
    // Read ACF fields (location, bild, year, stage, category)
    // Category can be a string or array from WordPress
    const categoryValue = reference.acf?.category;
    const categoryArray = Array.isArray(categoryValue) 
      ? categoryValue 
      : categoryValue 
        ? [String(categoryValue)] 
        : [];
    
    setAcfFields({
      location: String(reference.acf?.location || ''),
      bild: String(reference.acf?.bild || ''),
      year: String(reference.acf?.year || ''),
      stage: String(reference.acf?.stage || ''),
      category: categoryArray,
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
        menu_order: formData.menu_order,
      };

      // ACF fields: location, bild, year, stage, category
      // Build ACF object and filter out only empty arrays (for category)
      const acfData: Record<string, any> = {
        location: acfFields.location || '',
        bild: acfFields.bild && acfFields.bild.trim() ? (acfFields.bild.startsWith('http') ? acfFields.bild : (isNaN(parseInt(acfFields.bild)) ? null : parseInt(acfFields.bild))) : null,
        year: acfFields.year || '',
        stage: acfFields.stage || '',
      };
      
      // Only include category if it has values (don't send empty array)
      if (Array.isArray(acfFields.category) && acfFields.category.length > 0) {
        acfData.category = acfFields.category;
      }
      
      payload.acf = acfData;

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
        setFormData({ title: '', content: '', status: 'publish', menu_order: 0 });
        setAcfFields({
          location: '',
          bild: '',
          year: '',
          stage: '',
          category: [],
        });
        refreshLiveReferences();
      } else {
        const error = await response.json();
        console.error('Error response:', error);
        alert(error.error || error.message || 'Fehler beim Speichern');
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
    if (mediaSelectorField === 'bild') {
      setAcfFields({ ...acfFields, bild: String(media.id) });
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
      key: 'menu_order',
      label: 'Reihenfolge',
      render: (ref: WPLiveReference) => ref.menu_order || 0,
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

          <FormField
            label="Sortier-Reihenfolge (0 = Standard)"
            name="menu_order"
            type="number"
            value={String(formData.menu_order)}
            onChange={(value) => setFormData({ ...formData, menu_order: parseInt(value) || 0 })}
          />

          <div className="mt-6 space-y-4">

            <FormField
              label="Location"
              name="location"
              value={acfFields.location}
              onChange={(value) => setAcfFields({ ...acfFields, location: value })}
            />

            <FormField
              label="Year"
              name="year"
              value={acfFields.year}
              onChange={(value) => setAcfFields({ ...acfFields, year: value })}
            />

            <FormField
              label="Stage"
              name="stage"
              value={acfFields.stage}
              onChange={(value) => setAcfFields({ ...acfFields, stage: value })}
            />

            <div className="mb-4">
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                Category
              </label>
              <div className="space-y-2">
                {categoryOptions.map((option) => {
                  const isChecked = Array.isArray(acfFields.category) && acfFields.category.includes(option.value);
                  return (
                    <label
                      key={option.value}
                      className="flex items-center gap-2 cursor-pointer hover:opacity-80"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          const currentCategories = Array.isArray(acfFields.category) ? acfFields.category : [];
                          if (e.target.checked) {
                            setAcfFields({
                              ...acfFields,
                              category: [...currentCategories, option.value],
                            });
                          } else {
                            setAcfFields({
                              ...acfFields,
                              category: currentCategories.filter((cat) => cat !== option.value),
                            });
                          }
                        }}
                        className="w-4 h-4 text-[var(--color-primary)] bg-[var(--color-surface-light)] border-[var(--color-border)] rounded focus:ring-2 focus:ring-[var(--color-primary)]"
                      />
                      <span className="text-[var(--color-text-primary)]">{option.label}</span>
                    </label>
                  );
                })}
              </div>
              {Array.isArray(acfFields.category) && acfFields.category.length > 0 && (
                <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                  {acfFields.category.length} ausgewählt
                </p>
              )}
            </div>

            <ImagePreview
              mediaId={acfFields.bild}
              onSelect={() => handleMediaSelect('bild')}
              onRemove={() => setAcfFields({ ...acfFields, bild: '' })}
              label="Bild"
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

