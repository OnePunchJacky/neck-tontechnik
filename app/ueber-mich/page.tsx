import { Metadata } from "next";
import Hero from "../components/Hero";
import ContactFooter from "../components/ContactFooter";
import { getPageBySlug } from "@/app/lib/wp-pages";

export const metadata: Metadata = {
  title: 'Über mich',
  description: 'Lerne Vincent von Neck Tontechnik kennen - Tontechniker und Musikproduzent aus Leipzig mit Erfahrung in Live-Sound, Studio-Produktion und Audio Engineering.',
  openGraph: {
    title: 'Über mich - Vincent, Neck Tontechnik',
    description: 'Lerne Vincent kennen - Tontechniker und Musikproduzent aus Leipzig mit Erfahrung in Live-Sound und Studio-Produktion.',
    url: 'https://neck-tontechnik.com/ueber-mich',
  }
};

export default async function UeberMich() {
  const page = await getPageBySlug('ueber-mich');
  
  const heroImage = {
    src: "/images/ueber-mich/ueber-mich-hero.jpg",
    alt: "Vincent - Tontechniker und Musikproduzent",
    title: "Über Mich",
    description: ""
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Hero Section */}
      <Hero
        images={[heroImage]}
        height="h-[60vh]"
        autoPlay={false}
        showNavigation={false}
        showIndicators={false}
      />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {page ? (
          <div 
            className="prose prose-lg prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: page.content.rendered }}
          />
        ) : (
          <div className="prose prose-lg prose-invert max-w-none">
            <p className="text-[var(--color-text-secondary)]">Die Seite wird geladen...</p>
          </div>
        )}
      </main>

      {/* Contact Section */}
      <ContactFooter />
    </div>
  );
}