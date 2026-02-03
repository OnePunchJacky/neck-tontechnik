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
  menu_order?: number;
  acf?: {
    location?: string;
    bild?: number | string;
    year?: string;
    stage?: string;
    category?: string | string[];
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
        // Check for custom image in ACF field 'bild'
        else if (reference.acf?.bild) {
          const imageId = reference.acf.bild;
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
              console.error(`Error fetching bild image for reference ${reference.id}:`, error);
            }
          }
        }
        
        return { ...reference, featuredImage };
      })
    );
    
    // Sort by menu_order first (ascending), then by year/date for items with no order
    return referencesWithImages.sort((a, b) => {
      const orderA = a.menu_order || 0;
      const orderB = b.menu_order || 0;

      // If both have menu_order set (> 0), sort by menu_order ascending
      if (orderA > 0 && orderB > 0) {
        return orderA - orderB;
      }

      // If only A has menu_order, A comes first
      if (orderA > 0) return -1;

      // If only B has menu_order, B comes first
      if (orderB > 0) return 1;

      // Neither has menu_order, fall back to year/date sorting
      const yearA = a.acf?.year ? parseInt(a.acf.year) : null;
      const yearB = b.acf?.year ? parseInt(b.acf.year) : null;
      if (yearA && yearB) {
        return yearB - yearA; // Newest year first
      }
      if (yearA) return -1;
      if (yearB) return 1;
      // Fallback to post date
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  } catch (error) {
    console.error('Error fetching live references:', error);
    return [];
  }
}

function getCategoryColor(categoryName: string): string {
  const colorMap: { [key: string]: string } = {
    // ACF Categories (primary)
    'Front Of House': 'bg-blue-100 text-blue-800',
    'Stagetech': 'bg-purple-100 text-purple-800',
    'Monitor': 'bg-green-100 text-green-800',
    // WordPress Categories (legacy)
    'Concert': 'bg-violet-100 text-violet-800',
    'Corporate': 'bg-cyan-100 text-cyan-800',
    'Festival': 'bg-emerald-100 text-emerald-800',
    'Theatre': 'bg-red-100 text-red-800',
    'Church': 'bg-orange-100 text-orange-800',
    'Club': 'bg-pink-100 text-pink-800',
    'Conference': 'bg-indigo-100 text-indigo-800',
  };
  return colorMap[categoryName] || 'bg-gray-100 text-gray-800';
}

function stripHtml(html: string): string {
  if (!html) return '';
  // Decode HTML entities and strip HTML tags
  // Use browser's built-in decoding if available, otherwise fallback to regex
  if (typeof document !== 'undefined') {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = html;
    const decoded = textarea.value;
    return decoded.replace(/<[^>]*>/g, '').trim();
  }
  // Fallback for SSR or when document is not available
  // Basic entity decoding
  let decoded = html
    .replace(/&#038;/g, '&')
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  return decoded.replace(/<[^>]*>/g, '').trim();
}

export default function LiveReferencesPage() {
  const [references, setReferences] = useState<(WPLiveReference & { featuredImage?: WPMedia })[]>([]);
  const [filteredReferences, setFilteredReferences] = useState<(WPLiveReference & { featuredImage?: WPMedia })[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  // Available ACF categories
  const acfCategories = ['Front Of House', 'Stagetech', 'Monitor'];

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
    let filtered = references;

    // Filter by ACF category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(reference => {
        const categories = reference.acf?.category;
        if (Array.isArray(categories)) {
          return categories.includes(selectedCategory);
        } else if (typeof categories === 'string') {
          return categories === selectedCategory;
        }
        return false;
      });
    }

    // Filter by WordPress categories (legacy support)
    if (activeFilter !== 'all') {
      filtered = filtered.filter(reference => {
        const categories = reference._embedded?.['wp:term']?.[0] || [];
        return categories.some(cat => cat.slug === activeFilter);
      });
    }

    setFilteredReferences(filtered);
  }, [activeFilter, selectedCategory, references]);

  // Get unique WordPress categories for filter buttons (legacy)
  const getWordPressCategories = () => {
    const categorySet = new Set<string>();
    references.forEach(reference => {
      const categories = reference._embedded?.['wp:term']?.[0] || [];
      categories.forEach(cat => categorySet.add(cat.slug));
    });
    return Array.from(categorySet);
  };

  // Count references per ACF category
  const getACFCategoryCount = (category: string) => {
    if (category === 'all') return references.length;
    return references.filter(reference => {
      const categories = reference.acf?.category;
      if (Array.isArray(categories)) {
        return categories.includes(category);
      } else if (typeof categories === 'string') {
        return categories === category;
      }
      return false;
    }).length;
  };

  const wpCategories = getWordPressCategories();

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden min-h-[80vh] flex items-center">
        <div className="absolute inset-0 z-0 bg-[url('/images/live.jpeg')] bg-cover bg-center bg-fixed opacity-20"></div>
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4 md:px-8">
          <h1 className="text-4xl md:text-6xl font-bold text-[var(--color-text-primary)] mb-6 drop-shadow-2xl">
            Live Events & Referenzen
          </h1>
          <p className="text-xl md:text-2xl text-[var(--color-text-primary)] leading-relaxed drop-shadow-2xl mb-8">
            Erfolgreich umgesetzte Live-Events, Konzerte und Veranstaltungen mit professioneller Tontechnik
          </p>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="sticky top-0 z-40 bg-[var(--color-surface)] border-b border-[var(--color-border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <h3 className="text-sm font-medium text-[var(--color-text-secondary)] mb-3">Filter nach Kategorie:</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'bg-[var(--color-surface-light)] text-[var(--color-text-primary)] hover:bg-[var(--color-surface)] border border-[var(--color-border)]'
                }`}
              >
                Alle ({references.length})
              </button>
              {acfCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-[var(--color-primary)] text-white'
                      : 'bg-[var(--color-surface-light)] text-[var(--color-text-primary)] hover:bg-[var(--color-surface)] border border-[var(--color-border)]'
                  }`}
                >
                  {category} ({getACFCategoryCount(category)})
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* References Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center gap-2 text-[var(--color-text-muted)]">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Lade Live-Referenzen...</span>
              </div>
            </div>
          ) : filteredReferences.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[var(--color-text-muted)] text-lg">
                {selectedCategory === 'all' 
                  ? 'Keine Live-Referenzen gefunden.' 
                  : `Keine Referenzen in der Kategorie "${selectedCategory}" gefunden.`
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredReferences.map((reference) => {
                const categories = reference._embedded?.['wp:term']?.[0] || [];
                
                return (
                  <article
                    key={reference.id}
                    className="bg-[var(--color-surface)] rounded-lg overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300 group"
                  >
                    {/* Featured Image */}
                    <div className="relative h-64 bg-[var(--color-surface-light)] overflow-hidden">
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
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-surface-light)]">
                          {/* Audio/Live icon as fallback */}
                          <div className="flex items-center justify-center">
                            <svg className="w-16 h-16 text-[var(--color-accent-blue)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="p-6">
                      {/* ACF Categories */}
                      {reference.acf?.category && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {(Array.isArray(reference.acf.category)
                            ? reference.acf.category
                            : [reference.acf.category]
                          ).map((category, index) => (
                            <span
                              key={index}
                              className={`text-xs font-medium px-2.5 py-0.5 rounded ${getCategoryColor(category)}`}
                            >
                              {category}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      {/* Title */}
                      <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-2 line-clamp-2 group-hover:text-[var(--color-accent-blue)] transition-colors">
                        {reference.title.rendered}
                      </h3>
                      
                      {/* Location, Year & Stage */}
                      {(reference.acf?.location || reference.acf?.year || reference.acf?.stage) && (
                        <div className="text-[var(--color-text-muted)] text-sm mb-3 space-y-1">
                          {reference.acf?.location && (
                            <div className="flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              {reference.acf.location}
                            </div>
                          )}
                          {reference.acf?.year && (
                            <div className="flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {reference.acf.year}
                            </div>
                          )}
                          {reference.acf?.stage && (
                            <div className="flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                              </svg>
                              {reference.acf.stage}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Description */}
                      {reference.content.rendered && (
                        <p className="text-[var(--color-text-secondary)] text-sm mb-4 line-clamp-3">
                          {stripHtml(reference.content.rendered)}
                        </p>
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