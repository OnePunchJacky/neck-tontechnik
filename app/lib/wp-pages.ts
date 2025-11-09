// Helper functions for WordPress pages

import { WPPage } from './types';

const WORDPRESS_API_URL = process.env.WORDPRESS_API_URL || 'https://staging.neck-tontechnik.com/wp-json/wp/v2';

/**
 * Fetch a WordPress page by slug
 */
export async function getPageBySlug(slug: string): Promise<WPPage | null> {
  try {
    const response = await fetch(
      `${WORDPRESS_API_URL}/pages?slug=${slug}&_embed`,
      { 
        next: { revalidate: 3600 }, // Cache for 1 hour
      }
    );
    
    if (!response.ok) {
      console.error(`Failed to fetch page with slug "${slug}":`, response.status);
      return null;
    }
    
    const pages: WPPage[] = await response.json();
    
    if (pages.length === 0) {
      return null;
    }
    
    return pages[0];
  } catch (error) {
    console.error(`Error fetching page with slug "${slug}":`, error);
    return null;
  }
}

/**
 * Decode HTML entities and strip HTML tags for admin panel editing
 */
export function decodeHtmlContent(html: string): string {
  if (!html) return '';
  
  // For browser environments, use textarea to decode HTML entities
  if (typeof document !== 'undefined') {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = html;
    const decoded = textarea.value;
    // Strip HTML tags
    return decoded.replace(/<[^>]*>/g, '').trim();
  }
  
  // For SSR, use regex-based decoding for common entities
  const decoded = html
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&#038;/g, '&')
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&nbsp;/g, ' ');
  
  // Strip HTML tags
  return decoded.replace(/<[^>]*>/g, '').trim();
}

