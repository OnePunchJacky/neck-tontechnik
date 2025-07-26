'use client';

import { useState, useEffect } from 'react';
import ContactFooter from '../../components/ContactFooter';

// Type definitions for WordPress live references
interface WPLiveReference {
  id: number;
  title: { rendered: string };
  content: { rendered: string };
  date: string;
  slug: string;
  categories: number[];
  acf?: {
    venue_name?: string;
    event_date?: string;
    location?: string;
    capacity?: number;
    event_type?: string;
    equipment_used?: string;
    featured_image?: number | string;
    gallery?: number[];
    client_testimonial?: string;
    client_name?: string;
    client_position?: string;
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

interface WPMedia {
  id: number;
  source_url: string;
  media_details?: {
    sizes?: {
      medium?: { source_url: string };
      large?: { source_url: string };
      full?: { source_url: string };
    };
  };
}

async function getLiveReferences(): Promise<(WPLiveReference & { featuredImage?: WPMedia })[]> {
  try {
    // Fetch live references from the custom post type
    const response = await fetch(
      `https://staging.neck-tontechnik.com/wp-json/wp/v2/live_reference?per_page=100&_embed`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );
    
    if (!response.ok) {
      console.error('Failed to fetch live references:', response.status);
      return [];
    }
    
    const references: WPLiveReference[] = await response.json();
    
    // Process featured images
    const referencesWithImages = await Promise.all(
      references.map(async (reference) => {
        let featuredImage = null;
        
        // Check for featured image in _embedded
        if (reference._embedded?.['wp:featuredmedia']?.[0]) {
          featuredImage = reference._embedded['wp:featuredmedia'][0];
        }
        // Check for custom featured image in ACF
        else if (reference.acf?.featured_image) {
          const imageId = reference.acf.featured_image;
          if (typeof imageId === 'number' || (typeof imageId === 'string' && !isNaN(Number(imageId)))) {
            try {
              const mediaResponse = await fetch(
                `https://staging.neck-tontechnik.com/wp-json/wp/v2/media/${imageId}`,
                { 
                  next: { revalidate: 3600 },
                  cache: 'force-cache'
                }
              );
              if (mediaResponse.ok) {
                featuredImage = await mediaResponse.json();
              }
            } catch (error) {
              console.error(`Error fetching featured image for reference ${reference.id}:`, error);
            }
          }
        }
        
        return { ...reference, featuredImage };
      })
    );
    
    // Sort by event date if available, otherwise by post date (newest first)
    return referencesWithImages.sort((a, b) => {
      const dateA = a.acf?.event_date ? new Date(a.acf.event_date) : new Date(a.date);
      const dateB = b.acf?.event_date ? new Date(b.acf.event_date) : new Date(b.date);
      return dateB.getTime() - dateA.getTime();
    });
  } catch (error) {
    console.error('Error fetching live references:', error);
    return [];
  }
}

function getCategoryColor(categoryName: string): string {
  const colorMap: { [key: string]: string } = {
    'Concert': 'bg-purple-100 text-purple-800',
    'Corporate': 'bg-blue-100 text-blue-800',
    'Festival': 'bg-green-100 text-green-800',
    'Theatre': 'bg-red-100 text-red-800',
    'Church': 'bg-orange-100 text-orange-800',
    'Club': 'bg-pink-100 text-pink-800',
    'Conference': 'bg-indigo-100 text-indigo-800',
  };
  return colorMap[categoryName] || 'bg-gray-100 text-gray-800';
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

export default function LiveReferencesPage() {
  const [references, setReferences] = useState<(WPLiveReference & { featuredImage?: WPMedia })[]>([]);
  const [filteredReferences, setFilteredReferences] = useState<(WPLiveReference & { featuredImage?: WPMedia })[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReferences() {
      const data = await getLiveReferences();
      setReferences(data);
      setFilteredReferences(data);
      setLoading(false);
    }
    fetchReferences();
  }, []);

  useEffect(() => {
    if (activeFilter === 'all') {
      setFilteredReferences(references);
    } else {
      const filtered = references.filter(reference => {
        const categories = reference._embedded?.['wp:term']?.[0] || [];
        return categories.some(cat => cat.slug === activeFilter);
      });
      setFilteredReferences(filtered);
    }
  }, [activeFilter, references]);

  // Get unique categories for filter buttons
  const getCategories = () => {
    const categorySet = new Set<string>();
    references.forEach(reference => {
      const categories = reference._embedded?.['wp:term']?.[0] || [];
      categories.forEach(cat => categorySet.add(cat.slug));
    });
    return Array.from(categorySet);
  };

  // Count references per category
  const getCategoryCount = (categorySlug: string) => {
    if (categorySlug === 'all') return references.length;
    return references.filter(reference => {
      const categories = reference._embedded?.['wp:term']?.[0] || [];
      return categories.some(cat => cat.slug === categorySlug);
    }).length;
  };

  const categories = getCategories();
  const filterButtons = [
    { label: 'Alle Events', value: 'all' },
    ...categories.map(cat => ({
      label: cat.charAt(0).toUpperCase() + cat.slice(1),
      value: cat
    }))
  ];

  return (
    <div className="min-h-screen bg-zinc-900">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden min-h-[80vh] flex items-center">
        <div className="absolute inset-0 z-0 bg-[url('/images/live.jpeg')] bg-cover bg-center bg-fixed opacity-20"></div>
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4 md:px-8">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 drop-shadow-2xl">
            Live Events & Referenzen
          </h1>
          <p className="text-xl md:text-2xl text-white leading-relaxed drop-shadow-2xl mb-8">
            Erfolgreich umgesetzte Live-Events, Konzerte und Veranstaltungen mit professioneller Tontechnik
          </p>
        </div>
      </section>

      {/* Filter Tabs */}
      {categories.length > 0 && (
        <section className="sticky top-0 z-40 bg-zinc-800 border-b border-zinc-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8 overflow-x-auto py-4">
              {filterButtons.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setActiveFilter(filter.value)}
                  className={`font-medium whitespace-nowrap pb-2 border-b-2 transition-colors ${
                    activeFilter === filter.value
                      ? 'text-white border-blue-500'
                      : 'text-gray-400 hover:text-white border-transparent hover:border-gray-400'
                  }`}
                >
                  {filter.label}
                  <span className="ml-2 text-sm opacity-60">
                    ({getCategoryCount(filter.value)})
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* References Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center gap-2 text-gray-400">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Lade Live-Referenzen...</span>
              </div>
            </div>
          ) : filteredReferences.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">
                {activeFilter === 'all' 
                  ? 'Keine Live-Referenzen gefunden.' 
                  : `Keine Referenzen in der Kategorie "${filterButtons.find(f => f.value === activeFilter)?.label}" gefunden.`
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredReferences.map((reference) => {
                const categories = reference._embedded?.['wp:term']?.[0] || [];
                const eventDate = reference.acf?.event_date ? new Date(reference.acf.event_date) : null;
                
                return (
                  <article
                    key={reference.id}
                    className="bg-zinc-800 rounded-lg overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300 group"
                  >
                    {/* Featured Image */}
                    <div className="relative h-64 bg-zinc-700 overflow-hidden">
                      {reference.featuredImage?.source_url ? (
                        <>
                          <img
                            src={reference.featuredImage.media_details?.sizes?.large?.source_url || reference.featuredImage.source_url}
                            alt={reference.title.rendered}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-700">
                          {/* Audio/Live icon as fallback */}
                          <div className="flex items-center justify-center">
                            <svg className="w-16 h-16 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                            </svg>
                          </div>
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
                      <h3 className="text-xl font-semibold text-white mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
                        {reference.title.rendered}
                      </h3>
                      
                      {/* Venue & Location */}
                      {(reference.acf?.venue_name || reference.acf?.location) && (
                        <div className="text-gray-400 text-sm mb-3">
                          {reference.acf?.venue_name && (
                            <div className="font-medium">{reference.acf.venue_name}</div>
                          )}
                          {reference.acf?.location && (
                            <div className="flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              {reference.acf.location}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Event Details */}
                      <div className="flex flex-wrap gap-4 text-xs text-gray-400 mb-4">
                        {eventDate && (
                          <div className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {eventDate.toLocaleDateString('de-DE')}
                          </div>
                        )}
                        {reference.acf?.capacity && (
                          <div className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            {reference.acf.capacity} Plätze
                          </div>
                        )}
                        {reference.acf?.event_type && (
                          <div className="bg-zinc-700 px-2 py-1 rounded">
                            {reference.acf.event_type}
                          </div>
                        )}
                      </div>
                      
                      {/* Description */}
                      {reference.content.rendered && (
                        <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                          {stripHtml(reference.content.rendered)}
                        </p>
                      )}
                      
                      {/* Equipment Used */}
                      {reference.acf?.equipment_used && (
                        <div className="text-xs text-gray-500 border-t border-zinc-700 pt-3">
                          <strong>Equipment:</strong> {reference.acf.equipment_used}
                        </div>
                      )}
                      
                      {/* Client Testimonial */}
                      {reference.acf?.client_testimonial && (
                        <div className="mt-4 p-3 bg-zinc-700 rounded-lg">
                          <p className="text-gray-300 text-sm italic mb-2">
                            "{reference.acf.client_testimonial}"
                          </p>
                          {reference.acf?.client_name && (
                            <div className="text-xs text-gray-400">
                              — {reference.acf.client_name}
                              {reference.acf?.client_position && `, ${reference.acf.client_position}`}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <ContactFooter />
    </div>
  );
}