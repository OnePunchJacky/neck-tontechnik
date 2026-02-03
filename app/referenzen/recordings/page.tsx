
'use client';

import { useState, useEffect } from 'react';
import ContactFooter from '../../components/ContactFooter';

// Type definitions for WordPress recordings
interface WPRecording {
  id: number;
  title: { rendered: string };
  content: { rendered: string };
  date: string;
  slug: string;
  link: string;
  categories: number[];
  menu_order?: number;
  acf?: {
    cover?: number | string; // Can be media ID (number) or external URL (string)
    spotify?: string;
    spotify_album_id?: string;
    soundcloud?: string;
    bandcamp?: string;
    youtube?: string;
    artist?: number[];
  };
  _embedded?: {
    'wp:term'?: Array<Array<{
      id: number;
      name: string;
      slug: string;
    }>>;
    'acf:post'?: Array<{
      id: number;
      title: { rendered: string };
      slug: string;
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

async function getRecordings(): Promise<(WPRecording & { coverImage?: WPMedia })[]> {
  try {
    // Fetch recordings from the custom post type
    const response = await fetch(
      `https://staging.neck-tontechnik.com/wp-json/wp/v2/recording?per_page=100&_embed`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );
    
    if (!response.ok) {
      console.error('Failed to fetch recordings:', response.status);
      return [];
    }
    
    const recordings: WPRecording[] = await response.json();
    
    // Fetch cover images for recordings that have them
    const recordingsWithCovers = await Promise.all(
      recordings.map(async (recording) => {
        // Priority order: direct cover, spotify_album_id, then fallback
        let coverImage = null;
        
        // 1. Check for direct cover (URL or media ID)
        if (recording.acf?.cover && recording.acf.cover !== '') {
          const cover = recording.acf.cover;
          
          // Check if it's a URL (starts with http) or a media ID (number)
          if (typeof cover === 'string' && cover.startsWith('http')) {
            // It's an external URL, use it directly
            console.log(`Using external cover URL for ${recording.title.rendered}:`, cover);
            coverImage = { 
              id: 0, 
              source_url: cover 
            };
          } else if (typeof cover === 'number' || (typeof cover === 'string' && !isNaN(Number(cover)))) {
            // It's a media ID, fetch from WordPress
            try {
              const mediaResponse = await fetch(
                `https://staging.neck-tontechnik.com/wp-json/wp/v2/media/${cover}`,
                { 
                  next: { revalidate: 3600 },
                  cache: 'force-cache'
                }
              );
              if (mediaResponse.ok) {
                const wpCoverImage = await mediaResponse.json();
                console.log(`Fetched WordPress media for ${recording.title.rendered}:`, wpCoverImage.source_url);
                coverImage = wpCoverImage;
              } else {
                console.error(`Failed to fetch media ${cover} for ${recording.title.rendered}: ${mediaResponse.status}`);
              }
            } catch (error) {
              console.error(`Error fetching cover for recording ${recording.id}:`, error);
            }
          }
        }
        
        // 2. If no cover found and there's a Spotify album ID, note it for potential future enhancement
        if (!coverImage && recording.acf?.spotify_album_id && recording.acf.spotify_album_id !== '') {
          console.log(`Recording "${recording.title.rendered}" has Spotify album ID but no cover image. ID: ${recording.acf.spotify_album_id}`);
          // TODO: Implement Spotify Web API integration to fetch album artwork
          // This would require client credentials and API calls to:
          // https://api.spotify.com/v1/albums/{album_id}
        }
        
        if (coverImage) {
          return { ...recording, coverImage };
        }
        return recording;
      })
    );
    
    // Sort by menu_order first (ascending), then by date (newest first) for items with no order
    return recordingsWithCovers.sort((a, b) => {
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

      // Neither has menu_order, sort by date (newest first)
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  } catch (error) {
    console.error('Error fetching recordings:', error);
    return [];
  }
}

function getCategoryColor(categoryName: string): string {
  const colorMap: { [key: string]: string } = {
    'Mixing': 'bg-blue-100 text-blue-800',
    'Mastering': 'bg-purple-100 text-purple-800',
    'Recording': 'bg-green-100 text-green-800',
    'Production': 'bg-orange-100 text-orange-800',
  };
  return colorMap[categoryName] || 'bg-[var(--color-surface-light)] text-[var(--color-text-primary)]';
}


export default function RecordingsPage() {
  const [recordings, setRecordings] = useState<(WPRecording & { coverImage?: WPMedia })[]>([]);
  const [filteredRecordings, setFilteredRecordings] = useState<(WPRecording & { coverImage?: WPMedia })[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecordings() {
      const data = await getRecordings();
      setRecordings(data);
      setFilteredRecordings(data);
      setLoading(false);
    }
    fetchRecordings();
  }, []);

  useEffect(() => {
    if (activeFilter === 'all') {
      setFilteredRecordings(recordings);
    } else {
      const filtered = recordings.filter(recording => {
        const categories = recording._embedded?.['wp:term']?.[0] || [];
        return categories.some(cat => cat.slug === activeFilter);
      });
      setFilteredRecordings(filtered);
    }
  }, [activeFilter, recordings]);

  // Count recordings per category
  const getCategoryCount = (categorySlug: string) => {
    if (categorySlug === 'all') return recordings.length;
    return recordings.filter(recording => {
      const categories = recording._embedded?.['wp:term']?.[0] || [];
      return categories.some(cat => cat.slug === categorySlug);
    }).length;
  };

  const filterButtons = [
    { label: 'Alle Produktionen', value: 'all' },
    { label: 'Mixing', value: 'mixing' },
    { label: 'Mastering', value: 'mastering' },
    { label: 'Recording', value: 'recording' },
    { label: 'Production', value: 'production' },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-[var(--color-surface)] to-[var(--color-bg)] pt-20 pb-32">
        <div className="absolute inset-0 bg-[url('/images/studio-bg.jpg')] bg-cover bg-center opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-[var(--color-text-primary)] mb-6">
            Recordings & Produktionen
          </h1>
          <p className="text-xl text-[var(--color-text-secondary)] max-w-3xl mx-auto">
            Entdecken Sie meine professionellen Audio-Produktionen aus den Bereichen Recording, Mixing, Mastering und Production
          </p>
        </div>
      </section>

      {/* Filter Tabs */}
      <section className="sticky top-0 z-40 bg-[var(--color-surface)] border-b border-[var(--color-border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto py-4">
            {filterButtons.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setActiveFilter(filter.value)}
                className={`font-medium whitespace-nowrap pb-2 border-b-2 transition-colors ${
                  activeFilter === filter.value
                    ? 'text-[var(--color-text-primary)] border-[var(--color-accent-blue)]'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] border-transparent hover:border-[var(--color-text-muted)]'
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

      {/* Recordings Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center gap-2 text-[var(--color-text-muted)]">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Lade Aufnahmen...</span>
              </div>
            </div>
          ) : filteredRecordings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[var(--color-text-muted)] text-lg">
                {activeFilter === 'all' 
                  ? 'Keine Aufnahmen gefunden.' 
                  : `Keine Aufnahmen in der Kategorie "${filterButtons.find(f => f.value === activeFilter)?.label}" gefunden.`
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredRecordings.map((recording) => {
                const categories = recording._embedded?.['wp:term']?.[0] || [];
                
                return (
                  <article
                    key={recording.id}
                    className="bg-[var(--color-surface)] rounded-lg overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300 group"
                  >
                    {/* Album Cover - Square */}
                    <div className="relative w-full aspect-square bg-[var(--color-surface-light)] overflow-hidden">
                      {recording.coverImage?.source_url ? (
                        <>
                          {/* Using regular img tag for better debugging */}
                          <img
                            src={recording.coverImage.source_url}
                            alt={recording.title.rendered}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                            onLoad={() => console.log(`Image loaded: ${recording.title.rendered}`)}
                            onError={(e) => {
                              console.error(`Image failed to load for ${recording.title.rendered}:`, recording.coverImage?.source_url);
                              // Hide the image and show fallback
                              e.currentTarget.style.display = 'none';
                              const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                          {/* Fallback for failed images */}
                          <div className="absolute inset-0 w-full h-full items-center justify-center bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-surface-light)]" style={{ display: 'none' }}>
                            <div className="flex items-center justify-center gap-1 h-32">
                              {[...Array(20)].map((_, i) => (
                                <div
                                  key={i}
                                  className="w-1 bg-gradient-to-t from-[var(--color-accent-blue)] to-[var(--color-accent-purple)] rounded-full transition-all duration-300 group-hover:from-[var(--color-accent-blue)] group-hover:to-[var(--color-accent-purple)] animate-waveform"
                                  style={{
                                    height: `${Math.random() * 100 + 20}%`,
                                    animationDelay: `${i * 0.05}s`,
                                    animationDuration: `${1 + Math.random()}s`
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-surface-light)]">
                          {/* Audio waveform visualization as fallback */}
                          <div className="flex items-center justify-center gap-1 h-32">
                            {[...Array(20)].map((_, i) => (
                              <div
                                key={i}
                                className="w-1 bg-gradient-to-t from-[var(--color-accent-blue)] to-[var(--color-accent-purple)] rounded-full transition-all duration-300 group-hover:from-[var(--color-accent-blue)] group-hover:to-[var(--color-accent-purple)] animate-waveform"
                                style={{
                                  height: `${Math.random() * 100 + 20}%`,
                                  animationDelay: `${i * 0.05}s`,
                                  animationDuration: `${1 + Math.random()}s`
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
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
                      <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-1 line-clamp-2 group-hover:text-[var(--color-accent-blue)] transition-colors">
                        {recording.title.rendered}
                      </h3>
                      
                      {/* Artist */}
                      {recording._embedded?.['acf:post']?.[0] && (
                        <p className="text-[var(--color-text-muted)] text-sm mb-4">
                          by {recording._embedded['acf:post'][0].title.rendered}
                        </p>
                      )}
                      
                      {/* Streaming Links */}
                      <div className="flex gap-3 mb-4">
                        {recording.acf?.spotify && (
                          <a
                            href={recording.acf.spotify}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[var(--color-accent-green)] hover:text-[var(--color-accent-green)] transition-colors"
                            title="Listen on Spotify"
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                            </svg>
                          </a>
                        )}
                        {recording.acf?.youtube && (
                          <a
                            href={recording.acf.youtube}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[var(--color-accent-red)] hover:text-[var(--color-accent-red)] transition-colors"
                            title="Watch on YouTube"
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                            </svg>
                          </a>
                        )}
                        {recording.acf?.soundcloud && (
                          <a
                            href={recording.acf.soundcloud}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[var(--color-accent-orange)] hover:text-[var(--color-accent-orange)] transition-colors"
                            title="Listen on SoundCloud"
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M1.175 12.225c-.051 0-.094.046-.101.1l-.233 2.154.233 2.105c.007.058.05.098.101.098.05 0 .09-.04.099-.098l.255-2.105-.27-2.154c-.007-.057-.05-.1-.101-.1m.7-.103c-.061 0-.107.05-.11.11l-.224 2.216.224 2.18c.003.06.05.11.11.11.055 0 .104-.05.106-.11l.252-2.18-.252-2.215c-.003-.06-.05-.11-.107-.11m1.395.115c-.002-.063-.053-.11-.113-.11-.061 0-.11.05-.113.115l-.21 2.21.21 2.155c.003.063.052.113.113.113.061 0 .11-.05.113-.113l.24-2.154-.24-2.21c0-.002 0-.002 0-.002m.674.002c-.002-.068-.056-.118-.119-.118-.064 0-.118.05-.12.12l-.196 2.206.196 2.17c.002.07.056.12.12.12.063 0 .116-.05.119-.12l.221-2.17-.221-2.208m.67-.003c0-.069-.058-.122-.125-.122s-.125.053-.127.125l-.18 2.203.18 2.15c.002.072.06.127.127.127s.125-.055.125-.127l.203-2.15-.203-2.206m.67.006c0-.074-.062-.13-.133-.13-.07 0-.13.056-.133.13l-.164 2.197.164 2.142c.003.075.063.133.133.133.071 0 .13-.058.133-.133l.185-2.142-.185-2.197m1.362-.613c-.095 0-.16.067-.162.164l-.135 2.808.135 2.125c.002.097.067.164.162.164.094 0 .159-.067.161-.164l.153-2.125-.153-2.808c-.002-.097-.067-.164-.161-.164m.514-.286c-.1 0-.174.073-.176.176l-.1 3.094.1 2.09c.002.103.076.176.176.176s.173-.073.175-.176l.111-2.09-.111-3.094c-.002-.103-.075-.176-.175-.176m1.176-1.377c-.113 0-.19.078-.192.194l-.065 4.463.065 2.062c.002.116.079.194.192.194.114 0 .19-.078.192-.194l.074-2.062-.074-4.463c-.002-.116-.078-.194-.192-.194m.665-.137c-.118 0-.203.084-.205.206l-.05 4.594.05 2.05c.002.122.087.206.205.206.119 0 .204-.084.206-.206l.056-2.05-.056-4.594c-.002-.122-.087-.206-.206-.206m.664-.113c-.125 0-.218.091-.22.22l-.035 4.699.035 2.034c.002.129.095.22.22.22.126 0 .218-.091.22-.22l.04-2.034-.04-4.699c-.002-.129-.094-.22-.22-.22M24 7.733v8.353c0 .912-.739 1.65-1.65 1.65h-8.64c-.305 0-.568-.252-.568-.58V5.062c0-.214.166-.496.47-.576C15.052 3.908 16.606 3.6 18 3.6c3.96 0 7.26 2.86 7.925 6.63.168-.069.35-.106.54-.106.915 0 1.655.74 1.655 1.654"/>
                            </svg>
                          </a>
                        )}
                        {recording.acf?.bandcamp && (
                          <a
                            href={recording.acf.bandcamp}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[var(--color-accent-blue)] hover:text-[var(--color-accent-blue)] transition-colors"
                            title="Listen on Bandcamp"
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M0 18.75l7.437-13.5H24l-7.438 13.5H0z"/>
                            </svg>
                          </a>
                        )}
                      </div>
                      
                      {/* Date */}
                      <time className="text-sm text-[var(--color-text-muted)] block">
                        {new Date(recording.date).toLocaleDateString('de-DE', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </time>
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