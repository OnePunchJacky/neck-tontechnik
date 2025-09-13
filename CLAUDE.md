# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15.3.4 website for Neck Tontechnik, a professional audio engineering and sound technology business. The site is built with the App Router pattern, React 19, and Tailwind CSS v4. The site features both informational content and a full equipment rental system with e-commerce-like functionality.

## Development Commands

```bash
npm run dev      # Start development server with Turbopack
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run Next.js linter
```

## Architecture & Structure

### Key Directories
- `app/` - Next.js App Router pages and components
  - `api/rental-request/` - Backend API for equipment rental requests
  - `components/` - Reusable React components (Header, Hero, ContactForm, TestimonialSlider, etc.)
  - `checkout/` - Equipment rental checkout system
  - `contact/` - Dedicated contact page with form and FAQ
  - `equipment-verleih/` - Equipment rental system with cart functionality
  - `leistungen/` - Services page
  - `referenzen/` - References/portfolio pages (live, mastering, recordings)
  - `ueber-mich/` - About page
- `public/` - Static assets (fonts, icons, images)
- `data/` - JSON data files (testimonials.json)
- `neck-tontechnik-features/` - WordPress plugin for equipment management
- `themes/` - Color palette JSON files

### Styling Approach
- Tailwind CSS v4 with `@tailwindcss/postcss` (no traditional config file)
- Dark theme (zinc-900 base) with comprehensive theming system
- Custom CSS properties for theme variations (theme.css)
- Custom Satoshi font family (located in `public/fonts/`)
- Mobile-first responsive design
- Background image effects with gradient overlays
- Custom animations for mobile menu and waveforms

### Component Patterns
- Server Components by default (App Router)
- Client Components marked with 'use client' for interactivity
- TypeScript with strict configuration
- Path aliases configured (@/* maps to ./*)

### Key Dependencies
- `embla-carousel-react` & `embla-carousel-autoplay` - Used for image carousels and testimonial sliders
- WordPress REST API integration for equipment data
- Next.js Image component for optimized image loading
- All external image domains allowed in next.config.ts

### Major Features

#### Equipment Rental System
- Full catalog with category filtering and search
- Shopping cart functionality with local storage persistence
- Date selection for rental periods
- Dynamic pricing calculation based on rental duration
- Integration with WordPress backend for equipment data
- Checkout flow with customer information form

#### Theming System
- CSS custom properties for colors in theme.css
- Multiple theme variations (dark, warm, cool)
- Comprehensive color palette with shades
- Surface and accent colors

### Content & Language
The website content is entirely in German (with minor English exceptions like "Let's get in touch" on contact page). Main sections include:
- Homepage with hero carousel, services, testimonials, and contact
- Leistungen (Services) - detailed service offerings
- Referenzen (References) - portfolio and client testimonials by category
- Equipment-Verleih (Equipment Rental) - full rental system
- Über mich (About) - personal and professional background
- Contact - dedicated contact page with FAQ

When making changes, maintain consistency with the existing dark theme, professional aesthetic, and German language content.