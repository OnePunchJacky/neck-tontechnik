'use client';

import { useState, useEffect, useMemo } from 'react';
import ContactFooter from '../components/ContactFooter';

// Type definitions for WordPress equipment
interface WPEquipment {
  id: number;
  title: { rendered: string };
  content: { rendered: string };
  date: string;
  slug: string;
  equipment_category: number[];
  meta: {
    _equipment_brand: string;
    _equipment_model: string;
    _equipment_menge: number;
    _equipment_preis: number;
    _tagesmiete: number;
    _wochenendmiete: number;
    _wochenmiete: number;
    _monatsmiete: number;
    _kaution: number;
    _availability_status: string;
    _insurance_value: number;
    _location: string;
    _rental_notes: string;
  };
  _embedded?: {
    'wp:term'?: Array<Array<{
      id: number;
      name: string;
      slug: string;
    }>>;
    'wp:featuredmedia'?: Array<{
      id: number;
      source_url: string;
      media_details?: {
        sizes?: {
          medium?: { source_url: string };
          large?: { source_url: string };
          full?: { source_url: string };
        };
      };
    }>;
  };
}

interface SelectedItem {
  equipmentId: number;
  equipment: WPEquipment;
  quantity: number;
}

interface CustomerData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

async function getEquipment(): Promise<WPEquipment[]> {
  try {
    const response = await fetch(
      `https://staging.neck-tontechnik.com/wp-json/wp/v2/gear?per_page=100&_embed&status=publish`,
      { 
        next: { revalidate: 60 },
        headers: {
          'Accept': 'application/json',
        }
      }
    );
    
    if (!response.ok) {
      console.error('Failed to fetch equipment:', response.status);
      return [];
    }
    
    const equipment: WPEquipment[] = await response.json();
    
    // Sort by brand and model
    return equipment.sort((a, b) => {
      const brandA = a.meta?._equipment_brand || '';
      const brandB = b.meta?._equipment_brand || '';
      const modelA = a.meta?._equipment_model || '';
      const modelB = b.meta?._equipment_model || '';
      
      if (brandA !== brandB) {
        return brandA.localeCompare(brandB);
      }
      return modelA.localeCompare(modelB);
    });
  } catch (error) {
    console.error('Error fetching equipment:', error);
    return [];
  }
}

async function getEquipmentCategories() {
  try {
    const response = await fetch(
      `https://staging.neck-tontechnik.com/wp-json/wp/v2/equipment_category?per_page=100`,
      { 
        next: { revalidate: 3600 },
        headers: {
          'Accept': 'application/json',
        }
      }
    );
    
    if (!response.ok) {
      return [];
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

function getCategoryColor(categoryName: string): string {
  const colorMap: { [key: string]: string } = {
    'Mikrofone': 'bg-blue-100 text-blue-800',
    'Lautsprecher': 'bg-green-100 text-green-800',
    'Mischpulte': 'bg-purple-100 text-purple-800',
    'Verstärker': 'bg-red-100 text-red-800',
    'Kabel': 'bg-gray-100 text-gray-800',
    'Beleuchtung': 'bg-yellow-100 text-yellow-800',
    'DJ-Equipment': 'bg-pink-100 text-pink-800',
  };
  return colorMap[categoryName] || 'bg-zinc-100 text-zinc-800';
}

export default function EquipmentRentalPage() {
  const [equipment, setEquipment] = useState<WPEquipment[]>([]);
  const [filteredEquipment, setFilteredEquipment] = useState<WPEquipment[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState(true);
  
  // Date selection
  const [selectedStartDate, setSelectedStartDate] = useState('');
  const [selectedEndDate, setSelectedEndDate] = useState('');
  const [dateError, setDateError] = useState('');
  
  // Selected items (quantities per equipment)
  const [selectedItems, setSelectedItems] = useState<Map<number, SelectedItem>>(new Map());
  
  // Customer data
  const [customerData, setCustomerData] = useState<CustomerData>({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    async function fetchData() {
      const [equipmentData, categoriesData] = await Promise.all([
        getEquipment(),
        getEquipmentCategories()
      ]);
      
      setEquipment(equipmentData);
      setFilteredEquipment(equipmentData);
      setCategories(categoriesData);
      setLoading(false);
    }
    
    fetchData();
  }, []);

  useEffect(() => {
    let filtered = equipment;
    
    // Filter by category
    if (activeFilter !== 'all') {
      filtered = filtered.filter(item => {
        const itemCategories = item._embedded?.['wp:term']?.[0] || [];
        return itemCategories.some(cat => cat.slug === activeFilter);
      });
    }
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(item => {
        const brand = item.meta?._equipment_brand || '';
        const model = item.meta?._equipment_model || '';
        const searchText = `${brand} ${model}`.toLowerCase();
        return searchText.includes(searchTerm.toLowerCase());
      });
    }
    
    setFilteredEquipment(filtered);
  }, [equipment, activeFilter, searchTerm]);

  const validateDates = (start: string, end: string): boolean => {
    if (!start || !end) {
      setDateError('Bitte wählen Sie Start- und Enddatum');
      return false;
    }
    
    const startDate = new Date(start);
    const endDate = new Date(end);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (startDate < today) {
      setDateError('Startdatum darf nicht in der Vergangenheit liegen');
      return false;
    }
    
    if (endDate <= startDate) {
      setDateError('Enddatum muss nach dem Startdatum liegen');
      return false;
    }
    
    setDateError('');
    return true;
  };

  const calculatePrice = (equipment: WPEquipment, quantity: number, startDate: string, endDate: string): { rentalPrice: number; deposit: number } => {
    if (!startDate || !endDate || quantity <= 0) {
      return { rentalPrice: 0, deposit: 0 };
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    const dailyRate = equipment.meta?._tagesmiete || 0;
    const weekendRate = equipment.meta?._wochenendmiete || 0;
    const weeklyRate = equipment.meta?._wochenmiete || 0;
    const monthlyRate = equipment.meta?._monatsmiete || 0;
    const deposit = (equipment.meta?._kaution || 0) * quantity;
    
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
    
    return { rentalPrice, deposit };
  };

  const updateQuantity = (equipment: WPEquipment, quantity: number) => {
    const newSelectedItems = new Map(selectedItems);
    
    if (quantity > 0) {
      newSelectedItems.set(equipment.id, {
        equipmentId: equipment.id,
        equipment,
        quantity,
      });
    } else {
      newSelectedItems.delete(equipment.id);
    }
    
    setSelectedItems(newSelectedItems);
  };

  // Calculate totals
  const calculation = useMemo(() => {
    if (!selectedStartDate || !selectedEndDate || selectedItems.size === 0) {
      return {
        items: [],
        subtotal: 0,
        total: 0,
      };
    }

    const items = Array.from(selectedItems.values()).map(item => {
      const { rentalPrice } = calculatePrice(
        item.equipment,
        item.quantity,
        selectedStartDate,
        selectedEndDate
      );
      return {
        ...item,
        rentalPrice,
        total: rentalPrice,
      };
    });

    const subtotal = items.reduce((sum, item) => sum + item.rentalPrice, 0);
    const total = subtotal;

    return {
      items,
      subtotal,
      total,
    };
  }, [selectedItems, selectedStartDate, selectedEndDate]);

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateDates(selectedStartDate, selectedEndDate)) {
      return;
    }
    
    if (selectedItems.size === 0) {
      setSubmitError('Bitte wählen Sie mindestens ein Equipment aus');
      return;
    }
    
    if (!customerData.name || !customerData.email) {
      setSubmitError('Bitte füllen Sie alle Pflichtfelder aus');
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError('');
    
    try {
      const cartData = Array.from(selectedItems.values()).map(item => ({
        equipmentId: item.equipmentId,
        title: `${item.equipment.meta?._equipment_brand || ''} ${item.equipment.meta?._equipment_model || ''}`.trim(),
        quantity: item.quantity,
      }));
      
      const response = await fetch('/api/wp/rental-bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          equipment: cartData,
          rental_start: selectedStartDate,
          rental_end: selectedEndDate,
          customer_name: customerData.name,
          customer_email: customerData.email,
          customer_phone: customerData.phone,
          customer_message: customerData.message,
          booking_type: 'multi',
          cart_data: JSON.stringify(cartData),
        }),
      });
      
      if (response.ok) {
        setSubmitSuccess(true);
        // Reset form
        setSelectedItems(new Map());
        setCustomerData({
          name: '',
          email: '',
          phone: '',
          message: '',
        });
        setSelectedStartDate('');
        setSelectedEndDate('');
      } else {
        const error = await response.json();
        setSubmitError(error.error || 'Fehler beim Senden der Anfrage');
      }
    } catch (error) {
      console.error('Error submitting request:', error);
      setSubmitError('Fehler beim Senden der Anfrage. Bitte versuchen Sie es erneut.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-900">
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden flex items-center">
        <div className="absolute inset-0 z-0 bg-[url('/images/studio-bg.jpg')] bg-cover bg-center bg-fixed opacity-20"></div>
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4 md:px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-2xl">
            Equipment Verleih
          </h1>
          <p className="text-xl md:text-2xl text-white leading-relaxed drop-shadow-2xl">
            Professionelle Tontechnik mieten
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar - Filters and Date Selection */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="bg-zinc-800 rounded-lg p-6 sticky top-28">
              
              {/* Date Selection */}
              <div className="mb-8">
                <h3 className="text-white font-semibold text-lg mb-4">Mietzeitraum</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="start-date" className="block text-sm font-medium text-gray-300 mb-2">
                      Mietbeginn
                    </label>
                    <input
                      type="date"
                      id="start-date"
                      value={selectedStartDate}
                      onChange={(e) => {
                        setSelectedStartDate(e.target.value);
                        validateDates(e.target.value, selectedEndDate);
                      }}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="end-date" className="block text-sm font-medium text-gray-300 mb-2">
                      Mietende
                    </label>
                    <input
                      type="date"
                      id="end-date"
                      value={selectedEndDate}
                      onChange={(e) => {
                        setSelectedEndDate(e.target.value);
                        validateDates(selectedStartDate, e.target.value);
                      }}
                      min={selectedStartDate || new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  {dateError && (
                    <p className="text-red-400 text-sm">{dateError}</p>
                  )}
                  {selectedStartDate && selectedEndDate && !dateError && (
                    <div className="bg-green-900 border border-green-700 rounded-md p-3">
                      <p className="text-green-100 text-sm">
                        {Math.ceil((new Date(selectedEndDate).getTime() - new Date(selectedStartDate).getTime()) / (1000 * 60 * 60 * 24)) + 1} Tage ausgewählt
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Search */}
              <div className="mb-8">
                <h3 className="text-white font-semibold text-lg mb-4">Suche</h3>
                <input
                  type="text"
                  placeholder="Equipment suchen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Category Filter */}
              <div className="mb-8">
                <h3 className="text-white font-semibold text-lg mb-4">Kategorien</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setActiveFilter('all')}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                      activeFilter === 'all'
                        ? 'bg-blue-600 text-white'
                        : 'bg-zinc-700 text-gray-300 hover:bg-zinc-600'
                    }`}
                  >
                    Alle Kategorien
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setActiveFilter(category.slug)}
                      className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                        activeFilter === category.slug
                          ? 'bg-blue-600 text-white'
                          : 'bg-zinc-700 text-gray-300 hover:bg-zinc-600'
                      }`}
                    >
                      {category.name} ({category.count})
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 space-y-8">
            
            {/* Equipment Table */}
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center gap-2 text-gray-400">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Lade Equipment...</span>
                </div>
              </div>
            ) : filteredEquipment.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">
                  {searchTerm || activeFilter !== 'all' 
                    ? 'Keine Equipment-Artikel für die gewählten Filter gefunden.' 
                    : 'Kein Equipment verfügbar.'
                  }
                </p>
              </div>
            ) : (
              <div className="bg-zinc-800 rounded-lg overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-zinc-700">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Equipment</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Kategorien</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Tagesmiete</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Wochenende</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Woche</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Verfügbar</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Anzahl</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-700">
                      {filteredEquipment.map((item) => {
                        const categories = item._embedded?.['wp:term']?.[0] || [];
                        const brand = item.meta?._equipment_brand || '';
                        const model = item.meta?._equipment_model || '';
                        const title = item.title?.rendered || '';
                        const dailyRate = item.meta?._tagesmiete || 0;
                        const weekendRate = item.meta?._wochenendmiete || 0;
                        const weeklyRate = item.meta?._wochenmiete || 0;
                        const deposit = item.meta?._kaution || 0;
                        const totalUnits = item.meta?._equipment_menge || 1;
                        const selectedItem = selectedItems.get(item.id);
                        const quantity = selectedItem?.quantity || 0;
                        
                        const displayTitle = brand && model ? `${brand} ${model}` : title || `Equipment #${item.id}`;
                        const hasMetaData = !!(brand || model || dailyRate || weekendRate || weeklyRate);
                        
                        return (
                          <tr key={item.id} className="hover:bg-zinc-700/50 transition-colors">
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                {item._embedded?.['wp:featuredmedia']?.[0] && (
                                  <div className="w-12 h-12 flex-shrink-0 rounded overflow-hidden bg-zinc-700">
                                    <img
                                      src={item._embedded['wp:featuredmedia'][0].media_details?.sizes?.medium?.source_url || item._embedded['wp:featuredmedia'][0].source_url}
                                      alt={`${brand} ${model}`}
                                      className="w-full h-full object-cover"
                                      loading="lazy"
                                    />
                                  </div>
                                )}
                                <div>
                                  <div className="text-sm font-medium text-white">{displayTitle}</div>
                                  {!hasMetaData && (
                                    <div className="text-xs text-yellow-400 mt-1">Wird konfiguriert</div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex flex-wrap gap-1">
                                {categories.map((category) => (
                                  <span
                                    key={category.id}
                                    className={`text-xs font-medium px-2 py-0.5 rounded ${getCategoryColor(category.name)}`}
                                  >
                                    {category.name}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-white">
                              {dailyRate > 0 ? formatPrice(dailyRate) : '-'}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-white">
                              {weekendRate > 0 ? formatPrice(weekendRate) : '-'}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-white">
                              {weeklyRate > 0 ? formatPrice(weeklyRate) : '-'}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-white">
                              {totalUnits} Stück
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              {hasMetaData ? (
                                <input
                                  type="number"
                                  min="0"
                                  max={totalUnits}
                                  value={quantity}
                                  onChange={(e) => {
                                    const newQuantity = parseInt(e.target.value) || 0;
                                    updateQuantity(item, newQuantity);
                                  }}
                                  className="w-20 px-2 py-1 bg-zinc-700 border border-zinc-600 rounded text-white text-center text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              ) : (
                                <div className="text-xs">
                                  <span className="text-blue-400">Wird konfiguriert</span>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Live Calculation */}
            {selectedItems.size > 0 && (
              <div className="bg-zinc-800 rounded-lg p-6 shadow-xl">
                <h2 className="text-xl font-bold text-white mb-4">Preisberechnung</h2>
                {selectedStartDate && selectedEndDate && !dateError ? (
                  <div className="space-y-3">
                    {calculation.items.map((item) => {
                      const brand = item.equipment.meta?._equipment_brand || '';
                      const model = item.equipment.meta?._equipment_model || '';
                      const title = `${brand} ${model}`.trim() || `Equipment #${item.equipmentId}`;
                      
                      return (
                        <div key={item.equipmentId} className="flex justify-between items-center py-2 border-b border-zinc-700">
                          <div>
                            <div className="text-white font-medium">{title}</div>
                            <div className="text-sm text-gray-400">{item.quantity}x</div>
                          </div>
                          <div className="text-right">
                            <div className="text-white font-medium">{formatPrice(item.total)}</div>
                            <div className="text-xs text-gray-400">
                              {formatPrice(item.rentalPrice)} Miete
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div className="pt-3 space-y-2">
                      <div className="flex justify-between text-xl font-bold text-white pt-2 border-t border-zinc-700">
                        <span>Gesamtpreis (Miete):</span>
                        <span>{formatPrice(calculation.total)}</span>
                      </div>
                      <div className="mt-3 p-3 bg-blue-900/30 border border-blue-700/50 rounded-md">
                        <p className="text-sm text-blue-200">
                          <span className="font-semibold">Hinweis:</span> Eine angemessene Kaution wird dem finalen Angebot hinzugefügt.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-400 text-center py-4">
                    <p>Bitte wählen Sie einen Mietzeitraum aus, um die Preisberechnung zu sehen.</p>
                    <div className="mt-4 space-y-2">
                      {Array.from(selectedItems.values()).map((item) => {
                        const brand = item.equipment.meta?._equipment_brand || '';
                        const model = item.equipment.meta?._equipment_model || '';
                        const title = `${brand} ${model}`.trim() || `Equipment #${item.equipmentId}`;
                        return (
                          <div key={item.equipmentId} className="flex justify-between text-sm">
                            <span>{title}</span>
                            <span>{item.quantity}x</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Customer Data Form */}
            <form onSubmit={handleSubmit} className="bg-zinc-800 rounded-lg p-6 shadow-xl space-y-6">
                <h2 className="text-xl font-bold text-white mb-4">Ihre Kontaktdaten</h2>
                
                {submitSuccess && (
                  <div className="bg-green-900 border border-green-700 rounded-md p-4">
                    <p className="text-green-100">
                      Ihre Anfrage wurde erfolgreich gesendet! Wir melden uns in Kürze bei Ihnen.
                    </p>
                  </div>
                )}
                
                {submitError && (
                  <div className="bg-red-900 border border-red-700 rounded-md p-4">
                    <p className="text-red-100">{submitError}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="customer-name" className="block text-sm font-medium text-gray-300 mb-2">
                      Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      id="customer-name"
                      required
                      value={customerData.name}
                      onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
                      className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="customer-email" className="block text-sm font-medium text-gray-300 mb-2">
                      E-Mail <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      id="customer-email"
                      required
                      value={customerData.email}
                      onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
                      className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="customer-phone" className="block text-sm font-medium text-gray-300 mb-2">
                      Telefon
                    </label>
                    <input
                      type="tel"
                      id="customer-phone"
                      value={customerData.phone}
                      onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })}
                      className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="customer-message" className="block text-sm font-medium text-gray-300 mb-2">
                    Nachricht (optional)
                  </label>
                  <textarea
                    id="customer-message"
                    rows={4}
                    value={customerData.message}
                    onChange={(e) => setCustomerData({ ...customerData, message: e.target.value })}
                    placeholder="Besondere Wünsche oder Anmerkungen..."
                    className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-md font-medium transition-colors"
                >
                  {isSubmitting ? 'Wird gesendet...' : 'Anfrage senden'}
                </button>
              </form>
          </div>
        </div>
      </div>

      {/* Contact Footer */}
      <ContactFooter />
    </div>
  );
}
