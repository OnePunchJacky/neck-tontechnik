// Shared TypeScript types for WordPress data

export interface WPUser {
  id: number;
  name: string;
  url: string;
  description: string;
  link: string;
  slug: string;
  avatar_urls: {
    [key: string]: string;
  };
  meta: Record<string, any>;
  capabilities: Record<string, boolean>;
  email: string;
}

export interface WPMedia {
  id: number;
  date: string;
  slug: string;
  type: string;
  link: string;
  title: { rendered: string };
  author: number;
  comment_status: string;
  ping_status: string;
  template: string;
  meta: Record<string, any>;
  description: { rendered: string };
  caption: { rendered: string };
  alt_text: string;
  media_type: string;
  mime_type: string;
  media_details: {
    width: number;
    height: number;
    file: string;
    sizes?: {
      [key: string]: {
        file: string;
        width: number;
        height: number;
        mime_type: string;
        source_url: string;
      };
    };
  };
  source_url: string;
  _links: Record<string, any>;
}

export interface WPLiveReference {
  id: number;
  date: string;
  date_gmt: string;
  guid: { rendered: string };
  modified: string;
  modified_gmt: string;
  slug: string;
  status: 'publish' | 'draft' | 'private' | 'pending';
  type: string;
  link: string;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  author: number;
  featured_media: number;
  comment_status: string;
  ping_status: string;
  sticky: boolean;
  template: string;
  format: string;
  meta: Record<string, any>;
  categories: number[];
  tags: number[];
  acf?: {
    location?: string;
    bild?: number | string;
    year?: string;
    stage?: string;
    category?: string | string[];
  };
  _links: Record<string, any>;
}

export interface WPRecording {
  id: number;
  date: string;
  date_gmt: string;
  guid: { rendered: string };
  modified: string;
  modified_gmt: string;
  slug: string;
  status: 'publish' | 'draft' | 'private' | 'pending';
  type: string;
  link: string;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  author: number;
  featured_media: number;
  comment_status: string;
  ping_status: string;
  sticky: boolean;
  template: string;
  format: string;
  meta: Record<string, any>;
  categories: number[];
  tags: number[];
  acf?: {
    cover?: number | string;
    spotify?: string;
    spotify_album_id?: string;
    soundcloud?: string;
    bandcamp?: string;
    youtube?: string;
    artist?: number[];
  };
  _links: Record<string, any>;
}

export interface WPAudioSample {
  id: number;
  date: string;
  date_gmt: string;
  guid: { rendered: string };
  modified: string;
  modified_gmt: string;
  slug: string;
  status: 'publish' | 'draft' | 'private' | 'pending';
  type: string;
  link: string;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  author: number;
  featured_media: number;
  comment_status: string;
  ping_status: string;
  sticky: boolean;
  template: string;
  format: string;
  meta: Record<string, any>;
  categories: number[];
  tags: number[];
  _links: Record<string, any>;
}

export interface WPEquipment {
  id: number;
  date: string;
  date_gmt: string;
  guid: { rendered: string };
  modified: string;
  modified_gmt: string;
  slug: string;
  status: 'publish' | 'draft' | 'private' | 'pending';
  type: string;
  link: string;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  author: number;
  featured_media: number;
  comment_status: string;
  ping_status: string;
  sticky: boolean;
  template: string;
  format: string;
  meta: {
    _equipment_brand?: string;
    _equipment_model?: string;
    _equipment_menge?: number;
    _equipment_preis?: number;
    _tagesmiete?: number;
    _wochenendmiete?: number;
    _wochenmiete?: number;
    _monatsmiete?: number;
    _kaution?: number;
    _availability_status?: string;
    _insurance_value?: number;
    _location?: string;
    _rental_notes?: string;
    _last_maintenance?: string;
    _next_maintenance?: string;
  };
  equipment_category: number[];
  _links: Record<string, any>;
}

export interface WPArtist {
  id: number;
  date: string;
  date_gmt: string;
  guid: { rendered: string };
  modified: string;
  modified_gmt: string;
  slug: string;
  status: 'publish' | 'draft' | 'private' | 'pending';
  type: string;
  link: string;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  author: number;
  featured_media: number;
  comment_status: string;
  ping_status: string;
  sticky: boolean;
  template: string;
  format: string;
  meta: Record<string, any>;
  categories: number[];
  tags: number[];
  _links: Record<string, any>;
}

export interface WPPage {
  id: number;
  date: string;
  date_gmt: string;
  guid: { rendered: string };
  modified: string;
  modified_gmt: string;
  slug: string;
  status: 'publish' | 'draft' | 'private' | 'pending';
  type: string;
  link: string;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  author: number;
  featured_media: number;
  comment_status: string;
  ping_status: string;
  menu_order: number;
  template: string;
  meta: Record<string, any>;
  _links: Record<string, any>;
}

export interface WPRentalBooking {
  id: number;
  date: string;
  date_gmt: string;
  guid: { rendered: string };
  modified: string;
  modified_gmt: string;
  slug: string;
  status: 'publish' | 'draft' | 'private' | 'pending';
  type: string;
  link: string;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  author: number;
  featured_media: number;
  comment_status: string;
  ping_status: string;
  sticky: boolean;
  template: string;
  format: string;
  meta: {
    _equipment_id?: number;
    _quantity?: number;
    _rental_start?: string;
    _rental_end?: string;
    _customer_name?: string;
    _customer_email?: string;
    _customer_phone?: string;
    _customer_message?: string;
    _booking_status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
    _booking_date?: string;
    _booking_type?: 'single' | 'multi' | null;
    _cart_data?: string; // JSON string for multi-bookings
    _total_items?: number;
    _total_quantity?: number;
  };
  _links: Record<string, any>;
}

export interface WPSession {
  user: {
    id: number;
    name: string;
    email: string;
    capabilities: Record<string, boolean>;
  };
  token: string;
  expiresAt: number;
}

