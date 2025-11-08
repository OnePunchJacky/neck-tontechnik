import type { Metadata } from "next";
import "./globals.css";
import ConditionalLayout from "./components/ConditionalLayout";


export const metadata: Metadata = {
  metadataBase: new URL('https://neck-tontechnik.com'),
  title: {
    default: 'Neck Tontechnik Leipzig - Mixing, Mastering & Live-Sound',
    template: '%s | Neck Tontechnik'
  },
  description: 'Professionelle Tontechnik-Lösungen in Leipzig: Mixing, Mastering, Live-Sound & Equipment-Verleih. Mit Expertise in Hardware, Ableton & Logic Pro.',
  keywords: ['Tontechnik', 'Mixing', 'Mastering', 'Live-Sound', 'Musikproduktion', 'Leipzig', 'Equipment-Verleih', 'Audio Engineering', 'Vincent Neck'],
  authors: [{ name: 'Vincent', url: 'https://neck-tontechnik.com' }],
  creator: 'Neck Tontechnik',
  publisher: 'Neck Tontechnik',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'de_DE',
    url: 'https://neck-tontechnik.com',
    siteName: 'Neck Tontechnik',
    title: 'Neck Tontechnik - Professionelle Tontechnik & Musikproduktion',
    description: 'Professionelle Tontechnik-Lösungen in Leipzig: Mixing, Mastering, Live-Sound & Equipment-Verleih.',
    images: [{
      url: '/images/home/home-hero-1.jpg',
      width: 1200,
      height: 630,
      alt: 'Neck Tontechnik Studio'
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Neck Tontechnik - Professionelle Tontechnik & Musikproduktion',
    description: 'Professionelle Tontechnik-Lösungen in Leipzig: Mixing, Mastering, Live-Sound & Equipment-Verleih.',
    images: ['/images/home/home-hero-1.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code', // Add your actual verification code
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "@id": "https://neck-tontechnik.com",
              "name": "Neck Tontechnik",
              "alternateName": "Vincent Neck Tontechnik",
              "description": "Professionelle Tontechnik-Lösungen in Leipzig: Mixing, Mastering, Live-Sound & Equipment-Verleih",
              "url": "https://neck-tontechnik.com",
              "telephone": "",
              "email": "vincent@neck-tontechnik.com",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Leipzig",
                "addressCountry": "DE"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": "51.3396955",
                "longitude": "12.3730747"
              },
              "openingHours": "Mo-Fr 09:00-18:00",
              "serviceArea": {
                "@type": "GeoCircle",
                "geoMidpoint": {
                  "@type": "GeoCoordinates",
                  "latitude": "51.3396955",
                  "longitude": "12.3730747"
                },
                "geoRadius": "100000"
              },
              "founder": {
                "@type": "Person",
                "name": "Vincent",
                "jobTitle": "Audio Engineer & Music Producer"
              },
              "services": [
                "Audio Mixing",
                "Audio Mastering", 
                "Music Production",
                "Live Sound Engineering",
                "Equipment Rental",
                "Audio Workshops"
              ],
              "areaServed": ["Leipzig", "Sachsen", "Deutschland"],
              "sameAs": []
            })
          }}
        />
        <ConditionalLayout>
          {children}
        </ConditionalLayout>
      </body>
    </html>
  );
}
