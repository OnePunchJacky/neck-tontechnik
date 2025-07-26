'use client';

import { useState, useEffect } from 'react';
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

async function getEquipment(): Promise<WPEquipment[]> {
  try {
    const response = await fetch(
      `https://staging.neck-tontechnik.com/wp-json/wp/v2/gear?per_page=100&_embed&status=publish`,
      { 
        next: { revalidate: 60 }, // Cache for 1 minute for testing
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
    console.log('Raw equipment data:', equipment); // Debug log
    
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

async function checkAvailabilityForPeriod(equipmentId: number, startDate: string, endDate: string): Promise<number> {
  try {
    const response = await fetch(`https://staging.neck-tontechnik.com/wp-json/wp/v2/gear/${equipmentId}`, {
      cache: 'no-store' // Always fetch fresh availability data
    });
    
    if (!response.ok) {
      return 0;
    }
    
    const equipment = await response.json();
    const totalUnits = equipment.meta?._equipment_menge || 0;
    
    // For now, return total units. In production, you'd check against booking data
    // This would require a custom REST endpoint to check availability
    return totalUnits;
  } catch (error) {
    console.error('Error checking availability:', error);
    return 0;
  }
}

async function submitRentalRequest(requestData: any): Promise<boolean> {
  try {
    const formData = new FormData();
    
    // Add all fields to FormData
    Object.keys(requestData).forEach(key => {
      if (typeof requestData[key] === 'object') {
        formData.append(key, JSON.stringify(requestData[key]));
      } else {
        formData.append(key, requestData[key]);
      }
    });
    
    formData.append('action', 'multi_rental_request');
    formData.append('nonce', 'rental_nonce'); // You'd get this from WordPress localization
    
    const response = await fetch('https://staging.neck-tontechnik.com/wp-admin/admin-ajax.php', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Error submitting rental request:', error);
    return false;
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
  
  // Cart state
  const [cart, setCart] = useState<RentalCart>({
    items: [],
    startDate: '',
    endDate: '',
    totalPrice: 0
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  
  // Date selection
  const [selectedStartDate, setSelectedStartDate] = useState('');
  const [selectedEndDate, setSelectedEndDate] = useState('');
  const [dateError, setDateError] = useState('');
  
  // Customer form
  const [customerForm, setCustomerForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: ''
  });
  
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

  const calculatePrice = (equipment: WPEquipment, quantity: number, startDate: string, endDate: string): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    const dailyRate = equipment.meta?._tagesmiete || 0;
    const weekendRate = equipment.meta?._wochenendmiete || 0;
    const weeklyRate = equipment.meta?._wochenmiete || 0;
    const monthlyRate = equipment.meta?._monatsmiete || 0;
    
    let price = 0;
    
    // Determine best pricing
    if (days >= 28 && monthlyRate > 0) {
      const months = Math.ceil(days / 28);
      price = monthlyRate * months * quantity;
    } else if (days >= 7 && weeklyRate > 0) {
      const weeks = Math.ceil(days / 7);
      price = weeklyRate * weeks * quantity;
    } else if (days === 3 && weekendRate > 0 && start.getDay() === 5) {
      // Weekend rental (Friday-Sunday)
      price = weekendRate * quantity;
    } else {
      price = dailyRate * days * quantity;
    }
    
    return price;
  };

  const addToCart = async (equipment: WPEquipment, quantity: number) => {
    if (!validateDates(selectedStartDate, selectedEndDate)) {
      return;
    }
    
    if (quantity <= 0) {
      return;
    }
    
    // Check availability for the selected period
    const availableUnits = await checkAvailabilityForPeriod(equipment.id, selectedStartDate, selectedEndDate);
    
    if (quantity > availableUnits) {
      alert(`Nur ${availableUnits} Einheiten verfügbar für den gewählten Zeitraum`);
      return;
    }
    
    const existingItemIndex = cart.items.findIndex(item => item.equipmentId === equipment.id);
    const brand = equipment.meta?._equipment_brand || '';
    const model = equipment.meta?._equipment_model || '';
    
    const cartItem: CartItem = {
      equipmentId: equipment.id,
      title: `${brand} ${model}`,
      quantity,
      dailyRate: equipment.meta?._tagesmiete || 0,
      weekendRate: equipment.meta?._wochenendmiete || 0,
      weeklyRate: equipment.meta?._wochenmiete || 0,
      monthlyRate: equipment.meta?._monatsmiete || 0,
      deposit: equipment.meta?._kaution || 0,
      availableUnits
    };
    
    let newItems;
    if (existingItemIndex >= 0) {
      newItems = [...cart.items];
      newItems[existingItemIndex] = {
        ...newItems[existingItemIndex],
        quantity: newItems[existingItemIndex].quantity + quantity
      };
    } else {
      newItems = [...cart.items, cartItem];
    }
    
    const totalPrice = newItems.reduce((total, item) => {
      const itemPrice = calculatePrice(
        equipment, 
        item.quantity, 
        selectedStartDate, 
        selectedEndDate
      );
      return total + itemPrice + (item.deposit * item.quantity);
    }, 0);
    
    setCart({
      items: newItems,
      startDate: selectedStartDate,
      endDate: selectedEndDate,
      totalPrice
    });
    
    setIsCartOpen(true);
  };

  const removeFromCart = (equipmentId: number) => {
    const newItems = cart.items.filter(item => item.equipmentId !== equipmentId);
    
    const totalPrice = newItems.reduce((total, item) => {
      return total + (item.quantity * item.dailyRate) + (item.deposit * item.quantity);
    }, 0);
    
    setCart({
      ...cart,
      items: newItems,
      totalPrice
    });
  };

  const clearCart = () => {
    setCart({
      items: [],
      startDate: '',
      endDate: '',
      totalPrice: 0
    });
    setIsCartOpen(false);
  };

  const handleCheckout = async () => {
    if (cart.items.length === 0) {
      return;
    }
    
    if (!customerForm.name || !customerForm.email) {
      alert('Bitte füllen Sie Name und E-Mail aus');
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
      cart_data: cart.items.map(item => ({
        equipmentId: item.equipmentId,
        quantity: item.quantity
      }))
    };
    
    const success = await submitRentalRequest(requestData);
    
    if (success) {
      alert('Ihre Anfrage wurde erfolgreich gesendet! Sie erhalten eine Bestätigung per E-Mail.');
      clearCart();
      setIsCheckoutOpen(false);
      setCustomerForm({ name: '', email: '', phone: '', company: '', message: '' });
    } else {
      alert('Fehler beim Senden der Anfrage. Bitte versuchen Sie es erneut.');
    }
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-zinc-900">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden min-h-[80vh] flex items-center">
        <div className="absolute inset-0 z-0 bg-[url('/images/studio-bg.jpg')] bg-cover bg-center bg-fixed opacity-20"></div>
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4 md:px-8">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 drop-shadow-2xl">
            Equipment Verleih
          </h1>
          <p className="text-xl md:text-2xl text-white leading-relaxed drop-shadow-2xl mb-8">
            Professionelle Tontechnik mieten - von Mikrofonen bis Beschallungsanlagen
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar - Filters and Date Selection */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="bg-zinc-800 rounded-lg p-6 sticky top-4">
              
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
                        {Math.ceil((new Date(selectedEndDate).getTime() - new Date(selectedStartDate).getTime()) / (1000 * 60 * 60 * 24))} Tage ausgewählt
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

          {/* Main Content - Equipment Grid */}
          <div className="flex-1">
            
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
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredEquipment.map((item) => {
                  const categories = item._embedded?.['wp:term']?.[0] || [];
                  const brand = item.meta?._equipment_brand || '';
                  const model = item.meta?._equipment_model || '';
                  const title = item.title?.rendered || '';
                  const dailyRate = item.meta?._tagesmiete || 0;
                  const weekendRate = item.meta?._wochenendmiete || 0;
                  const weeklyRate = item.meta?._wochenmiete || 0;
                  const deposit = item.meta?._kaution || 0;
                  const totalUnits = item.meta?._equipment_menge || 1; // Default to 1 unit
                  const status = item.meta?._availability_status || 'verfügbar';
                  
                  // Fallback display text when meta fields aren't available
                  const displayTitle = brand && model ? `${brand} ${model}` : title || `Equipment #${item.id}`;
                  const hasMetaData = !!(brand || model || dailyRate || weekendRate || weeklyRate);
                  
                  return (
                    <div
                      key={item.id}
                      className="bg-zinc-800 rounded-lg overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300 group"
                    >
                      {/* Equipment Image */}
                      <div className="relative h-48 bg-zinc-700 overflow-hidden">
                        {item._embedded?.['wp:featuredmedia']?.[0] ? (
                          <img
                            src={item._embedded['wp:featuredmedia'][0].media_details?.sizes?.medium?.source_url || item._embedded['wp:featuredmedia'][0].source_url}
                            alt={`${brand} ${model}`}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-700">
                            <svg className="w-16 h-16 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      
                      {/* Content */}
                      <div className="p-6">
                        {/* Categories */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          {categories.map((category) => (
                            <span
                              key={category.id}
                              className={`text-xs font-medium px-2.5 py-0.5 rounded ${getCategoryColor(category.name)}`}
                            >
                              {category.name}
                            </span>
                          ))}
                        </div>
                        
                        {/* Title */}
                        <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
                          {displayTitle}
                        </h3>
                        
                        {/* Debug info when meta data is missing */}
                        {!hasMetaData && (
                          <div className="text-xs text-yellow-400 mb-2 p-2 bg-yellow-900/20 rounded">
                            <p>Debug: Meta fields not available via REST API</p>
                            <p>Raw title: {title || 'No title'}</p>
                            <p>Item ID: {item.id}</p>
                          </div>
                        )}
                        
                        {/* Pricing */}
                        <div className="space-y-1 mb-4">
                          {hasMetaData ? (
                            <>
                              {dailyRate > 0 && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-400">Tagesmiete:</span>
                                  <span className="text-white font-medium">{formatPrice(dailyRate)}</span>
                                </div>
                              )}
                              {weekendRate > 0 && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-400">Wochenende:</span>
                                  <span className="text-white font-medium">{formatPrice(weekendRate)}</span>
                                </div>
                              )}
                              {weeklyRate > 0 && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-400">Wochenmiete:</span>
                                  <span className="text-white font-medium">{formatPrice(weeklyRate)}</span>
                                </div>
                              )}
                              {deposit > 0 && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-400">Kaution:</span>
                                  <span className="text-orange-400 font-medium">{formatPrice(deposit)}</span>
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="text-sm text-gray-400">
                              Preise werden geladen...
                            </div>
                          )}
                        </div>
                        
                        {/* Availability */}
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-gray-400 text-sm">Verfügbar:</span>
                          <span className="text-white font-medium">{totalUnits} Stück</span>
                        </div>
                        
                        {/* Quantity and Add to Cart */}
                        {hasMetaData && status === 'verfügbar' && selectedStartDate && selectedEndDate && !dateError ? (
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <label htmlFor={`qty-${item.id}`} className="text-gray-300 text-sm">
                                Anzahl:
                              </label>
                              <input
                                type="number"
                                id={`qty-${item.id}`}
                                min="1"
                                max={totalUnits}
                                defaultValue="1"
                                className="w-20 px-2 py-1 bg-zinc-700 border border-zinc-600 rounded text-white text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <button
                              onClick={() => {
                                const quantityInput = document.getElementById(`qty-${item.id}`) as HTMLInputElement;
                                const quantity = parseInt(quantityInput.value) || 1;
                                addToCart(item, quantity);
                              }}
                              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                            >
                              Zum Warenkorb hinzufügen
                            </button>
                          </div>
                        ) : (
                          <div className="text-center">
                            {!hasMetaData ? (
                              <div className="bg-blue-900/20 border border-blue-600 rounded p-3">
                                <span className="text-blue-400 text-sm">
                                  Equipment wird konfiguriert - bald verfügbar
                                </span>
                              </div>
                            ) : status !== 'verfügbar' ? (
                              <span className="text-red-400 text-sm">Derzeit nicht verfügbar</span>
                            ) : (
                              <span className="text-gray-400 text-sm">Bitte Mietzeitraum wählen</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Cart */}
      {cart.items.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className={`bg-white rounded-lg shadow-2xl border transition-all duration-300 ${
            isCartOpen ? 'w-96' : 'w-auto'
          }`}>
            {/* Cart Header */}
            <div
              className="flex items-center justify-between p-4 bg-zinc-800 text-white rounded-t-lg cursor-pointer"
              onClick={() => setIsCartOpen(!isCartOpen)}
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13h10M9 19.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM20.5 19.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                </svg>
                <span className="font-medium">Warenkorb ({cart.items.length})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold">{formatPrice(cart.totalPrice)}</span>
                <svg className={`w-4 h-4 transition-transform ${isCartOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Cart Content */}
            {isCartOpen && (
              <div className="p-4">
                {/* Rental Period */}
                <div className="mb-4 p-3 bg-gray-50 rounded-md">
                  <div className="text-sm font-medium text-gray-900">Mietzeitraum:</div>
                  <div className="text-sm text-gray-600">
                    {new Date(cart.startDate).toLocaleDateString('de-DE')} - {new Date(cart.endDate).toLocaleDateString('de-DE')}
                  </div>
                </div>

                {/* Cart Items */}
                <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                  {cart.items.map((item) => (
                    <div key={item.equipmentId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex-1">
                        <div className="font-medium text-sm text-gray-900">{item.title}</div>
                        <div className="text-xs text-gray-600">{item.quantity}x</div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.equipmentId)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>

                {/* Cart Actions */}
                <div className="space-y-2">
                  <button
                    onClick={() => setIsCheckoutOpen(true)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Zur Kasse
                  </button>
                  <button
                    onClick={clearCart}
                    className="w-full bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Warenkorb leeren
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Mietanfrage abschließen</h2>
                <button
                  onClick={() => setIsCheckoutOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Order Summary */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Bestellübersicht</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="mb-3">
                    <strong>Mietzeitraum:</strong> {new Date(cart.startDate).toLocaleDateString('de-DE')} - {new Date(cart.endDate).toLocaleDateString('de-DE')}
                  </div>
                  <div className="space-y-2">
                    {cart.items.map((item) => (
                      <div key={item.equipmentId} className="flex justify-between">
                        <span>{item.title} ({item.quantity}x)</span>
                        <span>{formatPrice(calculatePrice({ meta: item } as any, item.quantity, cart.startDate, cart.endDate))}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-bold">
                      <span>Gesamtpreis:</span>
                      <span>{formatPrice(cart.totalPrice)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Form */}
              <form onSubmit={(e) => {
                e.preventDefault();
                handleCheckout();
              }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label htmlFor="customer-name" className="block text-sm font-medium text-gray-700 mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      id="customer-name"
                      required
                      value={customerForm.name}
                      onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="customer-email" className="block text-sm font-medium text-gray-700 mb-1">
                      E-Mail *
                    </label>
                    <input
                      type="email"
                      id="customer-email"
                      required
                      value={customerForm.email}
                      onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="customer-phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Telefon
                    </label>
                    <input
                      type="tel"
                      id="customer-phone"
                      value={customerForm.phone}
                      onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="customer-company" className="block text-sm font-medium text-gray-700 mb-1">
                      Firma (optional)
                    </label>
                    <input
                      type="text"
                      id="customer-company"
                      value={customerForm.company}
                      onChange={(e) => setCustomerForm({ ...customerForm, company: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div className="mb-6">
                  <label htmlFor="customer-message" className="block text-sm font-medium text-gray-700 mb-1">
                    Nachricht (optional)
                  </label>
                  <textarea
                    id="customer-message"
                    rows={4}
                    value={customerForm.message}
                    onChange={(e) => setCustomerForm({ ...customerForm, message: e.target.value })}
                    placeholder="Besondere Wünsche oder Anmerkungen..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setIsCheckoutOpen(false)}
                    className="flex-1 bg-gray-400 hover:bg-gray-500 text-white px-6 py-3 rounded-md font-medium transition-colors"
                  >
                    Abbrechen
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
                  >
                    Anfrage senden
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Contact Footer */}
      <ContactFooter />
    </div>
  );
}