'use client';

import { useState, useEffect } from 'react';
import FormField from './FormField';
import SearchableMultiSelect from './SearchableMultiSelect';
import { WPEquipment, WPRentalBooking } from '@/app/lib/types';

interface EquipmentSelection {
  id: number;
  title: string;
  quantity: number;
}

interface RentalBookingFormProps {
  booking?: WPRentalBooking | null;
  equipment: WPEquipment[];
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

export default function RentalBookingForm({
  booking,
  equipment,
  onSubmit,
  onCancel,
}: RentalBookingFormProps) {
  const [selectedEquipmentIds, setSelectedEquipmentIds] = useState<number[]>([]);
  const [equipmentSelections, setEquipmentSelections] = useState<EquipmentSelection[]>([]);
  const [rentalStart, setRentalStart] = useState('');
  const [rentalEnd, setRentalEnd] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerMessage, setCustomerMessage] = useState('');
  const [bookingStatus, setBookingStatus] = useState<'pending' | 'confirmed' | 'cancelled' | 'completed'>('pending');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form from booking if editing
  useEffect(() => {
    if (booking) {
      const meta = booking.meta || {};
      setRentalStart(meta._rental_start || '');
      setRentalEnd(meta._rental_end || '');
      setCustomerName(meta._customer_name || '');
      setCustomerEmail(meta._customer_email || '');
      setCustomerPhone(meta._customer_phone || '');
      setCustomerMessage(meta._customer_message || '');
      setBookingStatus(meta._booking_status || 'pending');

      // Handle equipment selection
      if (meta._booking_type === 'multi' && meta._cart_data) {
        try {
          const cartData = JSON.parse(meta._cart_data);
          const selections: EquipmentSelection[] = cartData.map((item: any) => ({
            id: item.equipmentId,
            title: item.title || `Equipment ${item.equipmentId}`,
            quantity: item.quantity || 1,
          }));
          setEquipmentSelections(selections);
          setSelectedEquipmentIds(selections.map((s) => s.id));
        } catch (e) {
          console.error('Error parsing cart data:', e);
        }
      } else if (meta._equipment_id) {
        // Single booking
        const eq = equipment.find((e) => e.id === meta._equipment_id);
        if (eq) {
          const title = typeof eq.title === 'string' ? eq.title : eq.title?.rendered || `Equipment ${eq.id}`;
          setEquipmentSelections([{
            id: meta._equipment_id,
            title,
            quantity: meta._quantity || 1,
          }]);
          setSelectedEquipmentIds([meta._equipment_id]);
        }
      }
    }
  }, [booking, equipment]);

  // Update equipment selections when selected IDs change
  useEffect(() => {
    const newSelections: EquipmentSelection[] = selectedEquipmentIds.map((id) => {
      const existing = equipmentSelections.find((s) => s.id === id);
      if (existing) return existing;

      const eq = equipment.find((e) => e.id === id);
      const title = eq ? (typeof eq.title === 'string' ? eq.title : eq.title?.rendered || `Equipment ${id}`) : `Equipment ${id}`;
      return { id, title, quantity: 1 };
    });

    // Remove selections that are no longer selected
    setEquipmentSelections(newSelections);
  }, [selectedEquipmentIds, equipment]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (selectedEquipmentIds.length === 0) {
      newErrors.equipment = 'Mindestens ein Equipment muss ausgewählt werden';
    }

    if (!rentalStart) {
      newErrors.rentalStart = 'Mietbeginn ist erforderlich';
    } else {
      const start = new Date(rentalStart);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (start < today) {
        newErrors.rentalStart = 'Mietbeginn darf nicht in der Vergangenheit liegen';
      }
    }

    if (!rentalEnd) {
      newErrors.rentalEnd = 'Mietende ist erforderlich';
    } else if (rentalStart) {
      const start = new Date(rentalStart);
      const end = new Date(rentalEnd);
      if (end <= start) {
        newErrors.rentalEnd = 'Mietende muss nach Mietbeginn liegen';
      }
    }

    // Validate quantities
    equipmentSelections.forEach((selection, index) => {
      if (selection.quantity < 1) {
        newErrors[`quantity_${selection.id}`] = 'Menge muss mindestens 1 sein';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const equipmentData = equipmentSelections.map((s) => ({
        id: s.id,
        title: s.title,
        quantity: s.quantity,
      }));

      const payload: any = {
        equipment: equipmentData,
        rental_start: rentalStart,
        rental_end: rentalEnd,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        customer_message: customerMessage,
        booking_status: bookingStatus,
      };

      await onSubmit(payload);
    } catch (error) {
      console.error('Error submitting booking:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateQuantity = (equipmentId: number, quantity: number) => {
    setEquipmentSelections((prev) =>
      prev.map((s) => (s.id === equipmentId ? { ...s, quantity: Math.max(1, quantity) } : s))
    );
  };

  const equipmentOptions = equipment.map((eq) => ({
    id: eq.id,
    name: typeof eq.title === 'string' ? eq.title : eq.title?.rendered || `Equipment ${eq.id}`,
  }));

  return (
    <form onSubmit={handleSubmit} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
          {booking ? 'Vermietung bearbeiten' : 'Neue Vermietung anlegen'}
        </h3>
      </div>

      {/* Equipment Selection */}
      <div>
        <SearchableMultiSelect
          label="Equipment"
          options={equipmentOptions}
          selectedIds={selectedEquipmentIds}
          onChange={(ids) => setSelectedEquipmentIds(ids.map((id) => typeof id === 'number' ? id : parseInt(String(id))).filter((id) => !isNaN(id)))}
          placeholder="Equipment auswählen..."
          searchPlaceholder="Equipment durchsuchen..."
        />
        {errors.equipment && (
          <p className="mt-1 text-sm text-red-500">{errors.equipment}</p>
        )}
      </div>

      {/* Quantity inputs for selected equipment */}
      {equipmentSelections.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
            Mengen
          </label>
          <div className="space-y-3">
            {equipmentSelections.map((selection) => (
              <div key={selection.id} className="flex items-center gap-3">
                <span className="flex-1 text-[var(--color-text-primary)]">{selection.title}</span>
                <div className="w-24">
                  <input
                    type="number"
                    min="1"
                    value={selection.quantity}
                    onChange={(e) => updateQuantity(selection.id, parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 bg-[var(--color-surface-light)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  />
                  {errors[`quantity_${selection.id}`] && (
                    <p className="mt-1 text-xs text-red-500">{errors[`quantity_${selection.id}`]}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Date Range */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Mietbeginn"
          name="rental_start"
          type="date"
          value={rentalStart}
          onChange={(value) => setRentalStart(value)}
          required
          error={errors.rentalStart}
        />
        <FormField
          label="Mietende"
          name="rental_end"
          type="date"
          value={rentalEnd}
          onChange={(value) => setRentalEnd(value)}
          required
          error={errors.rentalEnd}
        />
      </div>

      {/* Customer Information */}
      <div>
        <h4 className="text-md font-medium text-[var(--color-text-primary)] mb-4">
          Kundeninformationen (optional)
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Name"
            name="customer_name"
            value={customerName}
            onChange={(value) => setCustomerName(value)}
          />
          <FormField
            label="E-Mail"
            name="customer_email"
            type="email"
            value={customerEmail}
            onChange={(value) => setCustomerEmail(value)}
          />
          <FormField
            label="Telefon"
            name="customer_phone"
            value={customerPhone}
            onChange={(value) => setCustomerPhone(value)}
          />
        </div>
        <FormField
          label="Nachricht"
          name="customer_message"
          type="textarea"
          value={customerMessage}
          onChange={(value) => setCustomerMessage(value)}
          rows={3}
        />
      </div>

      {/* Booking Status */}
      <FormField
        label="Status"
        name="booking_status"
        type="select"
        value={bookingStatus}
        onChange={(value) => setBookingStatus(value as any)}
        options={[
          { value: 'pending', label: 'Ausstehend' },
          { value: 'confirmed', label: 'Bestätigt' },
          { value: 'cancelled', label: 'Storniert' },
          { value: 'completed', label: 'Abgeschlossen' },
        ]}
      />

      {/* Actions */}
      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isSubmitting ? 'Speichern...' : booking ? 'Aktualisieren' : 'Anlegen'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 bg-[var(--color-surface-light)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] hover:opacity-80"
        >
          Abbrechen
        </button>
      </div>
    </form>
  );
}

