import { Metadata } from "next";
import { getPageBySlug } from "@/app/lib/wp-pages";

export const metadata: Metadata = {
  title: 'Impressum',
  description: 'Impressum und rechtliche Angaben von Neck Tontechnik - Vincent, Leipzig. Tontechnik-Dienstleistungen und Equipment-Verleih.',
  robots: {
    index: false,
    follow: true,
  }
};

export default async function Impressum() {
  const page = await getPageBySlug('impressum');
  
  // Fallback content if page is not found
  if (!page) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] pt-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-text-primary)] mb-8">
            Impressum
          </h1>
          <div className="prose prose-lg prose-invert max-w-none text-[var(--color-text-secondary)]">
            <p>Die Seite wird geladen...</p>
          </div>
        </div>
      </div>
    );
  }
  
  const title = typeof page.title === 'string' ? page.title : page.title?.rendered || 'Impressum';
  const content = page.content.rendered;
  
  return (
    <div className="min-h-screen bg-[var(--color-bg)] pt-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-text-primary)] mb-8">
          {title}
        </h1>
        
        <div 
          className="prose prose-lg prose-invert max-w-none text-[var(--color-text-secondary)]"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </div>
  );
}
