'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ContactFooter from '../components/ContactFooter';

interface CartItem {
  equipmentId: number;
  title: string;
  quantity: number;
  dailyRate: number;
  weekendRate: number;
  weeklyRate: number;
  monthlyRate: number;
  deposit: number;
  availableUnits: number;
}

interface RentalCart {
  items: CartItem[];
  startDate: string;
  endDate: string;
  totalPrice: number;
}

async function submitRentalRequest(data: any): Promise<boolean> {
  try {
    const response = await fetch('/api/rental-request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error submitting rental request:', error);
    return false;
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  
  const [cart, setCart] = useState<RentalCart>({
    items: [],
    startDate: '',
    endDate: '',
    totalPrice: 0
  });
  
  const [customerForm, setCustomerForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    // Get cart data from localStorage
    const savedCart = localStorage.getItem('rentalCart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCart(parsedCart);
      } catch (error) {
        console.error('Error parsing saved cart:', error);
        router.push('/equipment-verleih');
      }
    } else {
      // No cart data found, redirect back
      router.push('/equipment-verleih');
    }
  }, [router]);

  const calculatePrice = (item: CartItem, startDate: string, endDate: string): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    let price = 0;
    
    // Determine best pricing
    if (days >= 28 && item.monthlyRate > 0) {
      const months = Math.ceil(days / 28);
      price = item.monthlyRate * months * item.quantity;
    } else if (days >= 7 && item.weeklyRate > 0) {
      const weeks = Math.ceil(days / 7);
      price = item.weeklyRate * weeks * item.quantity;
    } else if (days >= 2 && days <= 3 && item.weekendRate > 0) {
      // Weekend rental (2-3 days)
      price = item.weekendRate * item.quantity;
    } else {
      price = item.dailyRate * days * item.quantity;
    }
    
    return price;
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  const formatDateRange = (startDate: string, endDate: string): string => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    const startFormatted = start.toLocaleDateString('de-DE', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    
    const endFormatted = end.toLocaleDateString('de-DE', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    
    return `${startFormatted} bis ${endFormatted} (${days} Tag${days !== 1 ? 'e' : ''})`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');
    
    if (!customerForm.name || !customerForm.email) {
      setSubmitError('Bitte füllen Sie Name und E-Mail aus.');
      setIsSubmitting(false);
      return;
    }
    
    const requestData = {
      customer_name: customerForm.name,
      customer_email: customerForm.email,
      customer_phone: customerForm.phone,
      customer_company: customerForm.company,
      customer_message: customerForm.message,
      rental_start: cart.startDate,
      rental_end: cart.endDate,
      total_price: cart.totalPrice,
      cart_data: cart.items.map(item => ({
        equipmentId: item.equipmentId,
        title: item.title,
        quantity: item.quantity,
        individual_price: calculatePrice(item, cart.startDate, cart.endDate)
      }))
    };
    
    const success = await submitRentalRequest(requestData);
    
    if (success) {
      setSubmitSuccess(true);
      // Clear cart from localStorage
      localStorage.removeItem('rentalCart');
    } else {
      setSubmitError('Fehler beim Senden der Anfrage. Bitte versuchen Sie es erneut.');
    }
    
    setIsSubmitting(false);
  };

  const recalculatedTotal = cart.items.reduce((total, item) => {
    return total + calculatePrice(item, cart.startDate, cart.endDate);
  }, 0);

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-zinc-900 pt-24">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-white rounded-lg p-8 text-center">
            <div className="mb-6">
              <svg className="w-16 h-16 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Anfrage erfolgreich gesendet!</h1>
            <p className="text-gray-600 mb-8">
              Vielen Dank für Ihre Equipment-Anfrage. Sie erhalten in Kürze eine Bestätigung per E-Mail mit weiteren Details zur Verfügbarkeit und dem Abhol-/Liefertermin.
            </p>
            <button
              onClick={() => router.push('/equipment-verleih')}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Zurück zum Equipment
            </button>
          </div>
        </div>
        <ContactFooter />
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-900 pt-24">
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Warenkorb ist leer</h1>
          <p className="text-gray-400 mb-8">
            Fügen Sie Equipment zu Ihrem Warenkorb hinzu, um eine Anfrage zu stellen.
          </p>
          <button
            onClick={() => router.push('/equipment-verleih')}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Equipment durchstöbern
          </button>
        </div>
        <ContactFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-900 pt-24">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Equipment Anfrage</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="bg-zinc-800 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-6">Bestellübersicht</h2>
            
            {/* Rental Period */}
            <div className="mb-6 p-4 bg-zinc-700 rounded-lg">
              <h3 className="font-semibold text-white mb-2">Mietzeitraum</h3>
              <p className="text-gray-300">
                {formatDateRange(cart.startDate, cart.endDate)}
              </p>
            </div>
            
            {/* Items */}
            <div className="space-y-4 mb-6">
              {cart.items.map((item, index) => {
                const itemPrice = calculatePrice(item, cart.startDate, cart.endDate);
                return (
                  <div key={index} className="border-b border-zinc-700 pb-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-white">{item.title}</h3>
                      <span className="text-white font-medium">{formatPrice(itemPrice)}</span>
                    </div>
                    <div className="text-sm text-gray-400">
                      <p>Anzahl: {item.quantity}</p>
                      <p>Einzelpreis: {formatPrice(itemPrice / item.quantity)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Total */}
            <div className="border-t border-zinc-700 pt-4">
              <div className="flex justify-between items-center text-xl font-bold text-white">
                <span>Gesamtsumme:</span>
                <span>{formatPrice(recalculatedTotal)}</span>
              </div>
              <p className="text-sm text-gray-400 mt-2">
                * Unverbindliche Preisschätzung. Finale Preise werden in der Antwort-E-Mail bestätigt.
              </p>
            </div>
          </div>
          
          {/* Customer Form */}
          <div className="bg-zinc-800 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-6">Ihre Kontaktdaten</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={customerForm.name}
                  onChange={(e) => setCustomerForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ihr vollständiger Name"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                  E-Mail *
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={customerForm.email}
                  onChange={(e) => setCustomerForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="ihre@email.de"
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1">
                  Telefon
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={customerForm.phone}
                  onChange={(e) => setCustomerForm(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+49 123 456789"
                />
              </div>
              
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-300 mb-1">
                  Unternehmen
                </label>
                <input
                  type="text"
                  id="company"
                  value={customerForm.company}
                  onChange={(e) => setCustomerForm(prev => ({ ...prev, company: e.target.value }))}
                  className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ihr Unternehmen (optional)"
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-1">
                  Nachricht
                </label>
                <textarea
                  id="message"
                  rows={4}
                  value={customerForm.message}
                  onChange={(e) => setCustomerForm(prev => ({ ...prev, message: e.target.value }))}
                  className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Zusätzliche Anmerkungen, Wünsche oder Fragen..."
                />
              </div>
              
              {submitError && (
                <div className="p-3 bg-red-900/50 border border-red-600 rounded-md">
                  <p className="text-red-400 text-sm">{submitError}</p>
                </div>
              )}
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Wird gesendet...
                  </div>
                ) : (
                  'Anfrage senden'
                )}
              </button>
              
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => router.push('/equipment-verleih')}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ← Zurück zum Equipment
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      <ContactFooter />
    </div>
  );
}