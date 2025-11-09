'use client';

import { useState, useEffect } from 'react';
import FormField from '@/app/components/admin/FormField';
import { WPPage } from '@/app/lib/types';
import { decodeHtmlContent } from '@/app/lib/wp-pages';
import Editor from 'react-simple-wysiwyg';

interface PageData {
  slug: string;
  title: string;
  label: string;
}

const pages: PageData[] = [
  { slug: 'agb', title: 'AGB', label: 'Allgemeine Geschäftsbedingungen' },
  { slug: 'impressum', title: 'Impressum', label: 'Impressum' },
  { slug: 'datenschutz', title: 'Datenschutz', label: 'Datenschutzerklärung' },
  { slug: 'ueber-mich', title: 'Über mich', label: 'Über mich' },
];

export default function PagesPage() {
  const [activePage, setActivePage] = useState<string>('agb');
  const [pageData, setPageData] = useState<Record<string, WPPage | null>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [formData, setFormData] = useState<Record<string, { title: string; content: string }>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Load all pages on mount
    pages.forEach((page) => {
      fetchPage(page.slug);
    });
  }, []);

  const fetchPage = async (slug: string) => {
    setLoading((prev) => ({ ...prev, [slug]: true }));
    setErrors((prev) => ({ ...prev, [slug]: '' }));
    
    try {
      const response = await fetch(`/api/wp/pages/${slug}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setPageData((prev) => ({ ...prev, [slug]: null }));
          // Initialize form data with default title if page doesn't exist
          const pageInfo = pages.find((p) => p.slug === slug);
          if (pageInfo && !formData[slug]) {
            setFormData((prev) => ({
              ...prev,
              [slug]: {
                title: pageInfo.label,
                content: '',
              },
            }));
          }
          return;
        }
        
        // Try to get error message from response
        let errorMessage = 'Fehler beim Laden der Seite';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // If response is not JSON, use status text
          errorMessage = `${errorMessage} (${response.status} ${response.statusText})`;
        }
        
        setErrors((prev) => ({ 
          ...prev, 
          [slug]: errorMessage 
        }));
        return;
      }
      
      const data: WPPage = await response.json();
      setPageData((prev) => ({ ...prev, [slug]: data }));
      
      // Use HTML content directly for WYSIWYG editor (no decoding needed)
      const content = data.content.rendered || '';
      const title = typeof data.title === 'string' ? data.title : data.title?.rendered || '';
      
      setFormData((prev) => ({
        ...prev,
        [slug]: {
          title,
          content,
        },
      }));
    } catch (error: any) {
      console.error(`Error fetching page ${slug}:`, error);
      setErrors((prev) => ({ 
        ...prev, 
        [slug]: error.message || 'Fehler beim Laden der Seite' 
      }));
    } finally {
      setLoading((prev) => ({ ...prev, [slug]: false }));
    }
  };

  const handleSave = async (slug: string) => {
    setSaving((prev) => ({ ...prev, [slug]: true }));
    setErrors((prev) => ({ ...prev, [slug]: '' }));
    
    try {
      const data = formData[slug];
      if (!data) {
        throw new Error('No form data');
      }
      
      const isNewPage = !pageData[slug];
      
      const response = await fetch(`/api/wp/pages/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: data.title,
          content: data.content,
          status: 'publish',
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save page');
      }
      
      // Refresh page data
      await fetchPage(slug);
      
      alert(isNewPage ? 'Seite erfolgreich erstellt!' : 'Seite erfolgreich gespeichert!');
    } catch (error: any) {
      console.error(`Error saving page ${slug}:`, error);
      setErrors((prev) => ({ 
        ...prev, 
        [slug]: error.message || 'Fehler beim Speichern der Seite' 
      }));
    } finally {
      setSaving((prev) => ({ ...prev, [slug]: false }));
    }
  };

  const currentPage = pages.find((p) => p.slug === activePage);
  const currentPageData = pageData[activePage];
  const currentFormData = formData[activePage] || { title: '', content: '' };
  const isLoading = loading[activePage];
  const isSaving = saving[activePage];
  const error = errors[activePage];

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-6">
        Seiten Verwaltung
      </h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-[var(--color-border)] overflow-x-auto">
        {pages.map((page) => (
          <button
            key={page.slug}
            onClick={() => setActivePage(page.slug)}
            className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
              activePage === page.slug
                ? 'border-b-2 border-[var(--color-primary)] text-[var(--color-primary)]'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            {page.label}
          </button>
        ))}
      </div>

      {/* Page Editor */}
      {isLoading ? (
        <div className="text-[var(--color-text-secondary)]">Laden...</div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 text-red-500">
          {error}
        </div>
      ) : currentPageData ? (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-6">
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4">
            {currentPage?.label} bearbeiten
          </h2>
          
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSave(activePage);
            }}
            className="space-y-4"
          >
            <FormField
              label="Titel"
              name="title"
              value={currentFormData.title}
              onChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  [activePage]: { ...currentFormData, title: value },
                }))
              }
              required
            />
            
            <div className="mb-4">
              <label
                htmlFor="content"
                className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2"
              >
                Inhalt <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="border border-[var(--color-border)] rounded-lg overflow-hidden">
                <Editor
                  value={currentFormData.content}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      [activePage]: { ...currentFormData, content: e.target.value },
                    }))
                  }
                  containerProps={{
                    style: {
                      minHeight: '400px',
                      backgroundColor: 'var(--color-surface-light)',
                      color: 'var(--color-text-primary)',
                    },
                  }}
                />
              </div>
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                Verwende die Toolbar zum Formatieren des Textes.
              </p>
            </div>
            
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90 disabled:opacity-50"
              >
                {isSaving ? 'Speichern...' : 'Speichern'}
              </button>
              <button
                type="button"
                onClick={() => fetchPage(activePage)}
                disabled={isSaving}
                className="px-6 py-2 bg-[var(--color-surface-light)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] hover:opacity-80 disabled:opacity-50"
              >
                Zurücksetzen
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-6">
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4">
            {currentPage?.label} erstellen
          </h2>
          <p className="text-[var(--color-text-secondary)] mb-6">
            Diese Seite existiert noch nicht in WordPress. Fülle das Formular aus, um sie zu erstellen.
          </p>
          
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSave(activePage);
            }}
            className="space-y-4"
          >
            <FormField
              label="Titel"
              name="title"
              value={currentFormData.title}
              onChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  [activePage]: { ...currentFormData, title: value },
                }))
              }
              required
            />
            
            <div className="mb-4">
              <label
                htmlFor="content"
                className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2"
              >
                Inhalt <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="border border-[var(--color-border)] rounded-lg overflow-hidden">
                <Editor
                  value={currentFormData.content}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      [activePage]: { ...currentFormData, content: e.target.value },
                    }))
                  }
                  containerProps={{
                    style: {
                      minHeight: '400px',
                      backgroundColor: 'var(--color-surface-light)',
                      color: 'var(--color-text-primary)',
                    },
                  }}
                />
              </div>
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                Verwende die Toolbar zum Formatieren des Textes.
              </p>
            </div>
            
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90 disabled:opacity-50"
              >
                {isSaving ? 'Erstellen...' : 'Seite erstellen'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

