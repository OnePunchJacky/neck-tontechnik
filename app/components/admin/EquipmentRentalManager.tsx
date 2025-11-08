'use client';

import { useState } from 'react';
import FormField from './FormField';
import { WPEquipment } from '@/app/lib/types';

interface EquipmentRentalManagerProps {
  equipment: WPEquipment;
  onUpdate: (equipment: WPEquipment) => void;
}

export default function EquipmentRentalManager({
  equipment,
  onUpdate,
}: EquipmentRentalManagerProps) {
  const [rentalData, setRentalData] = useState({
    _tagesmiete: String(equipment.meta?._tagesmiete || ''),
    _wochenendmiete: String(equipment.meta?._wochenendmiete || ''),
    _wochenmiete: String(equipment.meta?._wochenmiete || ''),
    _monatsmiete: String(equipment.meta?._monatsmiete || ''),
    _kaution: String(equipment.meta?._kaution || ''),
    _availability_status: equipment.meta?._availability_status || 'available',
    _insurance_value: String(equipment.meta?._insurance_value || ''),
    _location: equipment.meta?._location || '',
    _rental_notes: equipment.meta?._rental_notes || '',
    _last_maintenance: equipment.meta?._last_maintenance || '',
    _next_maintenance: equipment.meta?._next_maintenance || '',
  });

  const handleSave = async () => {
    try {
      const payload = {
        meta: {
          _tagesmiete: rentalData._tagesmiete ? parseFloat(rentalData._tagesmiete) : null,
          _wochenendmiete: rentalData._wochenendmiete ? parseFloat(rentalData._wochenendmiete) : null,
          _wochenmiete: rentalData._wochenmiete ? parseFloat(rentalData._wochenmiete) : null,
          _monatsmiete: rentalData._monatsmiete ? parseFloat(rentalData._monatsmiete) : null,
          _kaution: rentalData._kaution ? parseFloat(rentalData._kaution) : null,
          _availability_status: rentalData._availability_status,
          _insurance_value: rentalData._insurance_value ? parseFloat(rentalData._insurance_value) : null,
          _location: rentalData._location,
          _rental_notes: rentalData._rental_notes,
          _last_maintenance: rentalData._last_maintenance,
          _next_maintenance: rentalData._next_maintenance,
        },
      };

      const response = await fetch(`/api/wp/equipment/${equipment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const updated = await response.json();
        onUpdate(updated);
        alert('Erfolgreich gespeichert');
      } else {
        const error = await response.json();
        alert(error.error || 'Fehler beim Speichern');
      }
    } catch (error) {
      console.error('Error updating rental data:', error);
      alert('Fehler beim Speichern');
    }
  };

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-6">
      <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-6">
        Mietverwaltung: {equipment.title?.rendered || equipment.title || `Equipment ${equipment.id}`}
      </h3>

      <div className="space-y-6">
        <div>
          <h4 className="text-lg font-medium text-[var(--color-text-primary)] mb-4">
            Mietpreise
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Tagesmiete (€)"
              name="daily_rate"
              type="number"
              value={rentalData._tagesmiete}
              onChange={(value) => setRentalData({ ...rentalData, _tagesmiete: value })}
            />
            <FormField
              label="Wochenendmiete (€)"
              name="weekend_rate"
              type="number"
              value={rentalData._wochenendmiete}
              onChange={(value) => setRentalData({ ...rentalData, _wochenendmiete: value })}
            />
            <FormField
              label="Wochenmiete (€)"
              name="weekly_rate"
              type="number"
              value={rentalData._wochenmiete}
              onChange={(value) => setRentalData({ ...rentalData, _wochenmiete: value })}
            />
            <FormField
              label="Monatsmiete (€)"
              name="monthly_rate"
              type="number"
              value={rentalData._monatsmiete}
              onChange={(value) => setRentalData({ ...rentalData, _monatsmiete: value })}
            />
            <FormField
              label="Kaution (€)"
              name="deposit"
              type="number"
              value={rentalData._kaution}
              onChange={(value) => setRentalData({ ...rentalData, _kaution: value })}
            />
          </div>
        </div>

        <div>
          <h4 className="text-lg font-medium text-[var(--color-text-primary)] mb-4">
            Verfügbarkeit & Status
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Verfügbarkeitsstatus"
              name="availability"
              type="select"
              value={rentalData._availability_status}
              onChange={(value) => setRentalData({ ...rentalData, _availability_status: value })}
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
              value={rentalData._location}
              onChange={(value) => setRentalData({ ...rentalData, _location: value })}
            />
            <FormField
              label="Versicherungswert (€)"
              name="insurance_value"
              type="number"
              value={rentalData._insurance_value}
              onChange={(value) => setRentalData({ ...rentalData, _insurance_value: value })}
            />
          </div>
        </div>

        <div>
          <h4 className="text-lg font-medium text-[var(--color-text-primary)] mb-4">
            Wartung
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Letzte Wartung"
              name="last_maintenance"
              type="date"
              value={rentalData._last_maintenance}
              onChange={(value) => setRentalData({ ...rentalData, _last_maintenance: value })}
            />
            <FormField
              label="Nächste Wartung"
              name="next_maintenance"
              type="date"
              value={rentalData._next_maintenance}
              onChange={(value) => setRentalData({ ...rentalData, _next_maintenance: value })}
            />
          </div>
        </div>

        <div>
          <FormField
            label="Mietnotizen"
            name="rental_notes"
            type="textarea"
            value={rentalData._rental_notes}
            onChange={(value) => setRentalData({ ...rentalData, _rental_notes: value })}
            rows={4}
          />
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            Speichern
          </button>
        </div>
      </div>
    </div>
  );
}

