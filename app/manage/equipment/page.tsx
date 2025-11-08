'use client';

import { useState, useEffect } from 'react';
import DataTable from '@/app/components/admin/DataTable';
import FormField from '@/app/components/admin/FormField';
import EquipmentRentalManager from '@/app/components/admin/EquipmentRentalManager';
import { WPEquipment } from '@/app/lib/types';
import { useAdminDataCache } from '@/app/contexts/AdminDataCache';

export default function EquipmentPage() {
  const { equipment, loading, refreshEquipment } = useAdminDataCache();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showRentalManager, setShowRentalManager] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<WPEquipment | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    status: 'publish',
    featured_media: '',
  });
  const [metaFields, setMetaFields] = useState({
    _equipment_brand: '',
    _equipment_model: '',
    _equipment_menge: '1',
    _equipment_preis: '',
    _tagesmiete: '',
    _wochenendmiete: '',
    _wochenmiete: '',
    _monatsmiete: '',
    _kaution: '',
    _availability_status: 'available',
    _insurance_value: '',
    _location: '',
    _rental_notes: '',
    _last_maintenance: '',
    _next_maintenance: '',
  });

  useEffect(() => {
    if (equipment.length === 0 && !loading.equipment) {
      refreshEquipment();
    }
  }, [equipment.length, loading.equipment, refreshEquipment]);

  const handleEdit = (item: WPEquipment) => {
    setFormData({
      title: item.title?.rendered || item.title || '',
      content: item.content?.rendered || item.content || '',
      status: item.status,
      featured_media: String(item.featured_media || ''),
    });
    setMetaFields({
      _equipment_brand: item.meta?._equipment_brand || '',
      _equipment_model: item.meta?._equipment_model || '',
      _equipment_menge: String(item.meta?._equipment_menge || 1),
      _equipment_preis: String(item.meta?._equipment_preis || ''),
      _tagesmiete: String(item.meta?._tagesmiete || ''),
      _wochenendmiete: String(item.meta?._wochenendmiete || ''),
      _wochenmiete: String(item.meta?._wochenmiete || ''),
      _monatsmiete: String(item.meta?._monatsmiete || ''),
      _kaution: String(item.meta?._kaution || ''),
      _availability_status: item.meta?._availability_status || 'available',
      _insurance_value: String(item.meta?._insurance_value || ''),
      _location: item.meta?._location || '',
      _rental_notes: item.meta?._rental_notes || '',
      _last_maintenance: item.meta?._last_maintenance || '',
      _next_maintenance: item.meta?._next_maintenance || '',
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = async (item: WPEquipment) => {
    const itemTitle = item.title?.rendered || item.title || `Equipment ${item.id}`;
    if (!confirm(`Möchtest du "${itemTitle}" wirklich löschen?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/wp/equipment/${item.id}?force=true`, {
        method: 'DELETE',
      });

      if (response.ok) {
        refreshEquipment();
      }
    } catch (error) {
      console.error('Error deleting equipment:', error);
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
        meta: {
          _equipment_brand: metaFields._equipment_brand,
          _equipment_model: metaFields._equipment_model,
          _equipment_menge: parseInt(metaFields._equipment_menge) || 1,
          _equipment_preis: metaFields._equipment_preis ? parseFloat(metaFields._equipment_preis) : null,
          _tagesmiete: metaFields._tagesmiete ? parseFloat(metaFields._tagesmiete) : null,
          _wochenendmiete: metaFields._wochenendmiete ? parseFloat(metaFields._wochenendmiete) : null,
          _wochenmiete: metaFields._wochenmiete ? parseFloat(metaFields._wochenmiete) : null,
          _monatsmiete: metaFields._monatsmiete ? parseFloat(metaFields._monatsmiete) : null,
          _kaution: metaFields._kaution ? parseFloat(metaFields._kaution) : null,
          _availability_status: metaFields._availability_status,
          _insurance_value: metaFields._insurance_value ? parseFloat(metaFields._insurance_value) : null,
          _location: metaFields._location,
          _rental_notes: metaFields._rental_notes,
          _last_maintenance: metaFields._last_maintenance,
          _next_maintenance: metaFields._next_maintenance,
        },
      };

      const url = editingId
        ? `/api/wp/equipment/${editingId}`
        : '/api/wp/equipment';
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
        setMetaFields({
          _equipment_brand: '',
          _equipment_model: '',
          _equipment_menge: '1',
          _equipment_preis: '',
          _tagesmiete: '',
          _wochenendmiete: '',
          _wochenmiete: '',
          _monatsmiete: '',
          _kaution: '',
          _availability_status: 'available',
          _insurance_value: '',
          _location: '',
          _rental_notes: '',
          _last_maintenance: '',
          _next_maintenance: '',
        });
        refreshEquipment();
      } else {
        const error = await response.json();
        alert(error.error || 'Fehler beim Speichern');
      }
    } catch (error) {
      console.error('Error saving equipment:', error);
      alert('Fehler beim Speichern');
    }
  };

  const handleRentalManage = (item: WPEquipment) => {
    setSelectedEquipment(item);
    setShowRentalManager(true);
  };

  const handleRentalUpdate = (updated: WPEquipment) => {
    setEquipment(equipment.map((eq) => (eq.id === updated.id ? updated : eq)));
    setShowRentalManager(false);
    setSelectedEquipment(null);
  };

  const columns = [
    { key: 'id', label: 'ID' },
    {
      key: 'title',
      label: 'Titel',
      render: (item: WPEquipment) => item.title?.rendered || item.title || 'Kein Titel',
    },
    {
      key: 'brand',
      label: 'Marke',
      render: (item: WPEquipment) => item.meta?._equipment_brand || '-',
    },
    {
      key: 'model',
      label: 'Modell',
      render: (item: WPEquipment) => item.meta?._equipment_model || '-',
    },
    {
      key: 'availability',
      label: 'Verfügbarkeit',
      render: (item: WPEquipment) => (
        <span className={`px-2 py-1 rounded text-xs ${
          item.meta?._availability_status === 'available'
            ? 'bg-green-500/20 text-green-500'
            : 'bg-red-500/20 text-red-500'
        }`}>
          {item.meta?._availability_status || 'unknown'}
        </span>
      ),
    },
    {
      key: 'daily_rate',
      label: 'Tagesmiete',
      render: (item: WPEquipment) => item.meta?._tagesmiete ? `€${item.meta._tagesmiete}` : '-',
    },
  ];

  if (loading.equipment && equipment.length === 0) {
    return <div className="text-[var(--color-text-secondary)]">Laden...</div>;
  }

  if (showRentalManager && selectedEquipment) {
    return (
      <div>
        <button
          onClick={() => {
            setShowRentalManager(false);
            setSelectedEquipment(null);
          }}
          className="mb-4 px-4 py-2 bg-[var(--color-surface-light)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] hover:opacity-80"
        >
          ← Zurück zur Liste
        </button>
        <EquipmentRentalManager
          equipment={selectedEquipment}
          onUpdate={handleRentalUpdate}
        />
      </div>
    );
  }

  if (showForm) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
            {editingId ? 'Equipment bearbeiten' : 'Neues Equipment'}
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

        <form onSubmit={handleSubmit} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Grundinformationen</h3>
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
              rows={4}
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
          </div>

          <div>
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Equipment Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Marke"
                name="brand"
                value={metaFields._equipment_brand}
                onChange={(value) => setMetaFields({ ...metaFields, _equipment_brand: value })}
              />
              <FormField
                label="Modell"
                name="model"
                value={metaFields._equipment_model}
                onChange={(value) => setMetaFields({ ...metaFields, _equipment_model: value })}
              />
              <FormField
                label="Menge"
                name="quantity"
                type="number"
                value={metaFields._equipment_menge}
                onChange={(value) => setMetaFields({ ...metaFields, _equipment_menge: value })}
              />
              <FormField
                label="Preis"
                name="price"
                type="number"
                value={metaFields._equipment_preis}
                onChange={(value) => setMetaFields({ ...metaFields, _equipment_preis: value })}
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Mietpreise</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Tagesmiete (€)"
                name="daily_rate"
                type="number"
                value={metaFields._tagesmiete}
                onChange={(value) => setMetaFields({ ...metaFields, _tagesmiete: value })}
              />
              <FormField
                label="Wochenendmiete (€)"
                name="weekend_rate"
                type="number"
                value={metaFields._wochenendmiete}
                onChange={(value) => setMetaFields({ ...metaFields, _wochenendmiete: value })}
              />
              <FormField
                label="Wochenmiete (€)"
                name="weekly_rate"
                type="number"
                value={metaFields._wochenmiete}
                onChange={(value) => setMetaFields({ ...metaFields, _wochenmiete: value })}
              />
              <FormField
                label="Monatsmiete (€)"
                name="monthly_rate"
                type="number"
                value={metaFields._monatsmiete}
                onChange={(value) => setMetaFields({ ...metaFields, _monatsmiete: value })}
              />
              <FormField
                label="Kaution (€)"
                name="deposit"
                type="number"
                value={metaFields._kaution}
                onChange={(value) => setMetaFields({ ...metaFields, _kaution: value })}
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Verwaltung</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Verfügbarkeitsstatus"
                name="availability"
                type="select"
                value={metaFields._availability_status}
                onChange={(value) => setMetaFields({ ...metaFields, _availability_status: value })}
                options={[
                  { value: 'available', label: 'Verfügbar' },
                  { value: 'rented', label: 'Vermietet' },
                  { value: 'maintenance', label: 'Wartung' },
                  { value: 'unavailable', label: 'Nicht verfügbar' },
                ]}
              />
              <FormField
                label="Standort"
                name="location"
                value={metaFields._location}
                onChange={(value) => setMetaFields({ ...metaFields, _location: value })}
              />
              <FormField
                label="Versicherungswert (€)"
                name="insurance_value"
                type="number"
                value={metaFields._insurance_value}
                onChange={(value) => setMetaFields({ ...metaFields, _insurance_value: value })}
              />
              <FormField
                label="Letzte Wartung"
                name="last_maintenance"
                type="date"
                value={metaFields._last_maintenance}
                onChange={(value) => setMetaFields({ ...metaFields, _last_maintenance: value })}
              />
              <FormField
                label="Nächste Wartung"
                name="next_maintenance"
                type="date"
                value={metaFields._next_maintenance}
                onChange={(value) => setMetaFields({ ...metaFields, _next_maintenance: value })}
              />
            </div>
            <FormField
              label="Mietnotizen"
              name="rental_notes"
              type="textarea"
              value={metaFields._rental_notes}
              onChange={(value) => setMetaFields({ ...metaFields, _rental_notes: value })}
              rows={3}
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
          Equipment
        </h1>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90 transition-opacity"
        >
          + Neues Equipment
        </button>
      </div>

      <DataTable
        data={equipment}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {equipment.length > 0 && (
        <div className="mt-6 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-6">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
            Schnellzugriff Mietverwaltung
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {equipment.slice(0, 6).map((item) => (
              <button
                key={item.id}
                onClick={() => handleRentalManage(item)}
                className="p-4 bg-[var(--color-surface-light)] border border-[var(--color-border)] rounded-lg hover:opacity-80 transition-opacity text-left"
              >
                <div className="font-medium text-[var(--color-text-primary)]">
                  {item.title?.rendered || item.title || `Equipment ${item.id}`}
                </div>
                <div className="text-sm text-[var(--color-text-secondary)] mt-1">
                  {item.meta?._equipment_brand} {item.meta?._equipment_model}
                </div>
                <div className="text-xs text-[var(--color-text-muted)] mt-2">
                  Status: {item.meta?._availability_status || 'unknown'}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

