# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15.3.4 website for Neck Tontechnik, a professional audio engineering and sound technology business. The site is built with the App Router pattern, React 19, and Tailwind CSS v4.

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
  - `components/` - Reusable React components (Header, Hero, ContactForm, etc.)
  - `leistungen/` - Services page
  - `referenzen/` - References/portfolio pages
- `public/` - Static assets (fonts, icons, images)

### Styling Approach
- Tailwind CSS v4 with dark theme (zinc-900 base)
- Custom Satoshi font family (located in `public/fonts/`)
- Mobile-first responsive design
- Background image effects with gradient overlays

### Component Patterns
- Server Components by default (App Router)
- Client Components marked with 'use client' for interactivity
- TypeScript with strict configuration
- Path aliases configured (@/* maps to ./*)

### Key Dependencies
- `embla-carousel-react` - Used for image carousels and testimonial sliders
- Next.js Image component for optimized image loading
- All external image domains allowed in next.config.ts

### Content & Language
The website content is entirely in German. Main sections include:
- Homepage with hero carousel, services, testimonials, and contact
- Leistungen (Services) - detailed service offerings
- Referenzen (References) - portfolio and client testimonials

When making changes, maintain consistency with the existing dark theme, professional aesthetic, and German language content.