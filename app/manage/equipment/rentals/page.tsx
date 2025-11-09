'use client';

import { useState, useEffect } from 'react';
import DataTable from '@/app/components/admin/DataTable';
import RentalBookingForm from '@/app/components/admin/RentalBookingForm';
import { WPRentalBooking, WPEquipment } from '@/app/lib/types';
import { useAdminDataCache } from '@/app/contexts/AdminDataCache';

export default function RentalBookingsPage() {
  const { equipment, loading: cacheLoading, refreshEquipment } = useAdminDataCache();
  const [bookings, setBookings] = useState<WPRentalBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBooking, setEditingBooking] = useState<WPRentalBooking | null>(null);

  useEffect(() => {
    fetchBookings();
    if (equipment.length === 0 && !cacheLoading.equipment) {
      refreshEquipment();
    }
  }, [equipment.length, cacheLoading.equipment, refreshEquipment]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/wp/rental-bookings');
      if (response.ok) {
        const data = await response.json();
        setBookings(Array.isArray(data) ? data : []);
      } else {
        console.error('Failed to fetch bookings');
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (booking: WPRentalBooking) => {
    setEditingBooking(booking);
    setShowForm(true);
  };

  const handleDelete = async (booking: WPRentalBooking) => {
    const bookingTitle = booking.title?.rendered || `Buchung ${booking.id}`;
    if (!confirm(`Möchtest du "${bookingTitle}" wirklich löschen?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/wp/rental-bookings/${booking.id}?force=true`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchBookings();
      } else {
        alert('Fehler beim Löschen');
      }
    } catch (error) {
      console.error('Error deleting booking:', error);
      alert('Fehler beim Löschen');
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      const url = editingBooking
        ? `/api/wp/rental-bookings/${editingBooking.id}`
        : '/api/wp/rental-bookings';
      const method = editingBooking ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setShowForm(false);
        setEditingBooking(null);
        fetchBookings();
      } else {
        const error = await response.json();
        alert(error.error || 'Fehler beim Speichern');
      }
    } catch (error) {
      console.error('Error saving booking:', error);
      alert('Fehler beim Speichern');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingBooking(null);
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      pending: { label: 'Ausstehend', className: 'bg-yellow-500/20 text-yellow-500' },
      confirmed: { label: 'Bestätigt', className: 'bg-green-500/20 text-green-500' },
      cancelled: { label: 'Storniert', className: 'bg-red-500/20 text-red-500' },
      completed: { label: 'Abgeschlossen', className: 'bg-blue-500/20 text-blue-500' },
    };

    const statusInfo = statusMap[status] || { label: status, className: 'bg-gray-500/20 text-gray-500' };

    return (
      <span className={`px-2 py-1 rounded text-xs ${statusInfo.className}`}>
        {statusInfo.label}
      </span>
    );
  };

  const getEquipmentDisplay = (booking: WPRentalBooking) => {
    const meta = booking.meta || {};
    
    if (meta._booking_type === 'multi' && meta._cart_data) {
      try {
        const cartData = JSON.parse(meta._cart_data);
        if (Array.isArray(cartData) && cartData.length > 0) {
          const items = cartData.slice(0, 2).map((item: any) => `${item.title || `Equipment ${item.equipmentId}`} (${item.quantity}x)`);
          const more = cartData.length > 2 ? ` +${cartData.length - 2} weitere` : '';
          return items.join(', ') + more;
        }
      } catch (e) {
        console.error('Error parsing cart data:', e);
      }
    } else if (meta._equipment_id) {
      const eq = equipment.find((e) => e.id === meta._equipment_id);
      const title = eq ? (typeof eq.title === 'string' ? eq.title : eq.title?.rendered || `Equipment ${meta._equipment_id}`) : `Equipment ${meta._equipment_id}`;
      return `${title} (${meta._quantity || 1}x)`;
    }

    return '-';
  };

  const columns = [
    { key: 'id', label: 'ID' },
    {
      key: 'equipment',
      label: 'Equipment',
      render: (booking: WPRentalBooking) => getEquipmentDisplay(booking),
    },
    {
      key: 'customer',
      label: 'Kunde',
      render: (booking: WPRentalBooking) => booking.meta?._customer_name || '-',
    },
    {
      key: 'dates',
      label: 'Zeitraum',
      render: (booking: WPRentalBooking) => {
        const start = booking.meta?._rental_start;
        const end = booking.meta?._rental_end;
        if (start && end) {
          const startDate = new Date(start).toLocaleDateString('de-DE');
          const endDate = new Date(end).toLocaleDateString('de-DE');
          return `${startDate} - ${endDate}`;
        }
        return '-';
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (booking: WPRentalBooking) => getStatusBadge(booking.meta?._booking_status || 'pending'),
    },
    {
      key: 'date',
      label: 'Buchungsdatum',
      render: (booking: WPRentalBooking) => {
        const bookingDate = booking.meta?._booking_date || booking.date;
        return bookingDate ? new Date(bookingDate).toLocaleDateString('de-DE') : '-';
      },
    },
  ];

  if (loading && bookings.length === 0) {
    return <div className="text-[var(--color-text-secondary)]">Laden...</div>;
  }

  if (showForm) {
    return (
      <div>
        <button
          onClick={handleCancel}
          className="mb-4 px-4 py-2 bg-[var(--color-surface-light)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] hover:opacity-80"
        >
          ← Zurück zur Liste
        </button>
        <RentalBookingForm
          booking={editingBooking}
          equipment={equipment}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
          Vermietungen
        </h1>
        <button
          onClick={() => {
            setEditingBooking(null);
            setShowForm(true);
          }}
          className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90 transition-opacity"
        >
          + Neue Vermietung anlegen
        </button>
      </div>

      <DataTable
        data={bookings}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}

