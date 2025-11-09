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
  const [bookingStatus, setBookingStatus] = useState<'anfrage' | 'pending' | 'confirmed' | 'cancelled' | 'completed'>('anfrage');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form from booking if editing
  useEffect(() => {
    if (booking && equipment.length > 0) {
      const meta = booking.meta || {};
      setRentalStart(meta._rental_start || '');
      setRentalEnd(meta._rental_end || '');
      setCustomerName(meta._customer_name || '');
      setCustomerEmail(meta._customer_email || '');
      setCustomerPhone(meta._customer_phone || '');
      setCustomerMessage(meta._customer_message || '');
      setBookingStatus(meta._booking_status || 'anfrage');

      // Handle equipment selection
      if (meta._booking_type === 'multi' && meta._cart_data) {
        try {
          const cartData = JSON.parse(meta._cart_data);
          const selections: EquipmentSelection[] = cartData.map((item: any) => {
            // Get equipment ID - handle both equipmentId and id fields
            const rawId = item.equipmentId || item.id;
            
            // Validate and convert ID
            if (rawId === null || rawId === undefined || rawId === '') {
              console.error('Missing equipment ID in cart item:', item);
              return null;
            }
            
            const equipmentId = typeof rawId === 'number' ? rawId : parseInt(String(rawId), 10);
            
            if (isNaN(equipmentId) || equipmentId <= 0) {
              console.error('Invalid equipment ID:', rawId, item);
              return null;
            }
            
            // Use saved title first (it should be there from when booking was created)
            let title = item.title;
            
            // Try to find equipment in the array to verify or get better title
            const eq = equipment.find((e) => e.id === equipmentId);
            if (eq) {
              // If we found the equipment and title is missing or generic, get better title
              if (!title || title.trim() === '' || title === `Equipment ${equipmentId}`) {
                title = typeof eq.title === 'string' ? eq.title : eq.title?.rendered || '';
                // If still no title, try to build from brand/model
                if (!title || title.trim() === '') {
                  const brand = eq.meta?._equipment_brand || '';
                  const model = eq.meta?._equipment_model || '';
                  title = `${brand} ${model}`.trim();
                }
              }
            }
            
            // Final fallback if still no title
            if (!title || title.trim() === '') {
              title = `Equipment ${equipmentId}`;
            }
            
            return {
              id: equipmentId,
              title: title.trim(),
              quantity: item.quantity || 1,
            };
          }).filter((s: EquipmentSelection | null): s is EquipmentSelection => s !== null && s.id > 0);
          
          setEquipmentSelections(selections);
          setSelectedEquipmentIds(selections.map((s) => s.id));
        } catch (e) {
          console.error('Error parsing cart data:', e);
        }
      } else if (meta._equipment_id) {
        // Single booking
        const equipmentId = Number(meta._equipment_id);
        const eq = equipment.find((e) => e.id === equipmentId);
        if (eq) {
          let title = typeof eq.title === 'string' ? eq.title : eq.title?.rendered || '';
          if (!title) {
            const brand = eq.meta?._equipment_brand || '';
            const model = eq.meta?._equipment_model || '';
            title = `${brand} ${model}`.trim() || `Equipment ${equipmentId}`;
          }
          setEquipmentSelections([{
            id: equipmentId,
            title,
            quantity: meta._quantity || 1,
          }]);
          setSelectedEquipmentIds([equipmentId]);
        }
      }
    }
  }, [booking, equipment]);

  // Update equipment selections when selected IDs change (but not during initial load)
  useEffect(() => {
    // Skip if we're initializing from a booking (equipmentSelections already set by first useEffect)
    // Only run this effect when user manually changes selections
    if (booking && equipmentSelections.length > 0) {
      // Check if this is the initial load by comparing with what we expect from the booking
      const meta = booking.meta || {};
      if (meta._booking_type === 'multi' && meta._cart_data) {
        try {
          const cartData = JSON.parse(meta._cart_data);
          const expectedIds = cartData
            .map((item: any) => Number(item.equipmentId || item.id))
            .filter((id: number) => !isNaN(id) && id > 0);
          
          // If selectedEquipmentIds matches expected IDs, this is initial load - skip
          const currentIds = selectedEquipmentIds.map(id => Number(id)).sort();
          const expectedIdsSorted = expectedIds.sort();
          if (currentIds.length === expectedIdsSorted.length && 
              currentIds.every((id, idx) => id === expectedIdsSorted[idx])) {
            return; // This is initial load, skip
          }
        } catch (e) {
          // If parsing fails, continue with the effect
        }
      } else if (meta._equipment_id) {
        const expectedId = Number(meta._equipment_id);
        if (selectedEquipmentIds.length === 1 && Number(selectedEquipmentIds[0]) === expectedId) {
          return; // This is initial load, skip
        }
      }
    }

    // Only update if we have selected IDs and they don't match current selections
    if (selectedEquipmentIds.length === 0) {
      return;
    }

    const newSelections: EquipmentSelection[] = selectedEquipmentIds.map((id) => {
      const existing = equipmentSelections.find((s) => Number(s.id) === Number(id));
      if (existing) {
        // Preserve quantity from existing selection
        return existing;
      }

      // Look up equipment from array
      const eq = equipment.find((e) => e.id === Number(id));
      let title = '';
      
      if (eq) {
        title = typeof eq.title === 'string' ? eq.title : eq.title?.rendered || '';
        // If no title, try to build from brand/model
        if (!title) {
          const brand = eq.meta?._equipment_brand || '';
          const model = eq.meta?._equipment_model || '';
          title = `${brand} ${model}`.trim() || `Equipment ${id}`;
        }
      }
      
      // Fallback if equipment not found
      if (!title) {
        title = `Equipment ${id}`;
      }
      
      return { id: Number(id), title, quantity: 1 };
    });

    // Remove selections that are no longer selected, but preserve quantities
    const updatedSelections = newSelections.map((newSel) => {
      const existing = equipmentSelections.find((s) => Number(s.id) === Number(newSel.id));
      return existing ? { ...newSel, quantity: existing.quantity } : newSel;
    });

    setEquipmentSelections(updatedSelections);
  }, [selectedEquipmentIds, equipment, booking, equipmentSelections]);

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
        equipmentId: s.id,
        id: s.id, // Also include id for backward compatibility
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

  // Calculate price for a single equipment item
  const calculateEquipmentPrice = (equipmentId: number, quantity: number, startDate: string, endDate: string): number => {
    if (!startDate || !endDate || quantity <= 0) {
      return 0;
    }

    const eq = equipment.find((e) => e.id === equipmentId);
    if (!eq) return 0;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    const dailyRate = eq.meta?._tagesmiete || 0;
    const weekendRate = eq.meta?._wochenendmiete || 0;
    const weeklyRate = eq.meta?._wochenmiete || 0;
    const monthlyRate = eq.meta?._monatsmiete || 0;
    
    let rentalPrice = 0;
    
    // Determine best pricing
    if (days >= 28 && monthlyRate > 0) {
      const months = Math.ceil(days / 28);
      rentalPrice = monthlyRate * months * quantity;
    } else if (days >= 7 && weeklyRate > 0) {
      const weeks = Math.ceil(days / 7);
      rentalPrice = weeklyRate * weeks * quantity;
    } else if (days >= 2 && days <= 3 && weekendRate > 0) {
      rentalPrice = weekendRate * quantity;
    } else {
      rentalPrice = dailyRate * days * quantity;
    }
    
    return rentalPrice;
  };

  // Calculate total price for all selected equipment
  const totalPrice = equipmentSelections.reduce((sum, selection) => {
    return sum + calculateEquipmentPrice(selection.id, selection.quantity, rentalStart, rentalEnd);
  }, 0);

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  const equipmentOptions = equipment.map((eq) => {
    let name = typeof eq.title === 'string' ? eq.title : eq.title?.rendered || '';
    // If no title, try to build from brand/model
    if (!name) {
      const brand = eq.meta?._equipment_brand || '';
      const model = eq.meta?._equipment_model || '';
      name = `${brand} ${model}`.trim() || `Equipment ${eq.id}`;
    }
    return {
      id: eq.id,
      name,
    };
  });

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
            {equipmentSelections.map((selection) => {
              const itemPrice = calculateEquipmentPrice(selection.id, selection.quantity, rentalStart, rentalEnd);
              return (
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
                  {rentalStart && rentalEnd && (
                    <div className="w-32 text-right">
                      <div className="text-sm font-medium text-[var(--color-text-primary)]">
                        {formatPrice(itemPrice)}
                      </div>
                      <div className="text-xs text-[var(--color-text-secondary)]">
                        {selection.quantity}x
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {rentalStart && rentalEnd && totalPrice > 0 && (
            <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-[var(--color-text-primary)]">
                  Gesamtpreis (Miete):
                </span>
                <span className="text-lg font-bold text-[var(--color-text-primary)]">
                  {formatPrice(totalPrice)}
                </span>
              </div>
              <p className="mt-2 text-xs text-[var(--color-text-secondary)] italic">
                Hinweis: Eine angemessene Kaution wird dem finalen Angebot hinzugefügt.
              </p>
            </div>
          )}
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
          { value: 'anfrage', label: 'Anfrage' },
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

