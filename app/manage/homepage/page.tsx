'use client';

import { useState, useEffect } from 'react';
import DataTable from '@/app/components/admin/DataTable';
import FormField from '@/app/components/admin/FormField';
import MediaSelector from '@/app/components/admin/MediaSelector';

interface Testimonial {
  id: number;
  text: string;
  author: string;
  role?: string;
  company?: string;
}

interface HeroImage {
  src: string;
  alt: string;
  title: string;
  description: string;
}

interface HomepageConfig {
  images: HeroImage[];
  quoteText: string;
}

interface Logo {
  src: string;
  alt: string;
}

export default function HomepagePage() {
  const [activeTab, setActiveTab] = useState<'hero' | 'testimonials' | 'logos'>('hero');
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [config, setConfig] = useState<HomepageConfig | null>(null);
  const [logos, setLogos] = useState<Logo[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Testimonial form
  const [showTestimonialForm, setShowTestimonialForm] = useState(false);
  const [editingTestimonialId, setEditingTestimonialId] = useState<number | null>(null);
  const [testimonialForm, setTestimonialForm] = useState({
    text: '',
    author: '',
    role: '',
    company: '',
  });

  // Hero form
  const [showHeroForm, setShowHeroForm] = useState(false);
  const [editingHeroIndex, setEditingHeroIndex] = useState<number | null>(null);
  const [heroForm, setHeroForm] = useState({
    src: '',
    alt: '',
    title: '',
    description: '',
  });
  const [showMediaSelector, setShowMediaSelector] = useState(false);

  // Logo form
  const [showLogoForm, setShowLogoForm] = useState(false);
  const [editingLogoIndex, setEditingLogoIndex] = useState<number | null>(null);
  const [logoForm, setLogoForm] = useState({
    src: '',
    alt: '',
  });
  const [showLogoMediaSelector, setShowLogoMediaSelector] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [testimonialsRes, configRes, logosRes] = await Promise.all([
        fetch('/api/homepage/testimonials'),
        fetch('/api/homepage/hero'),
        fetch('/api/homepage/logos'),
      ]);

      if (testimonialsRes.ok) {
        const data = await testimonialsRes.json();
        setTestimonials(Array.isArray(data) ? data : []);
      }

      if (configRes.ok) {
        const data = await configRes.json();
        setConfig(data);
      }

      if (logosRes.ok) {
        const data = await logosRes.json();
        setLogos(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Testimonials CRUD
  const handleEditTestimonial = (testimonial: Testimonial) => {
    setTestimonialForm({
      text: testimonial.text,
      author: testimonial.author,
      role: testimonial.role || '',
      company: testimonial.company || '',
    });
    setEditingTestimonialId(testimonial.id);
    setShowTestimonialForm(true);
  };

  const handleDeleteTestimonial = async (testimonial: Testimonial) => {
    if (!confirm(`Möchtest du das Testimonial von "${testimonial.author}" wirklich löschen?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/homepage/testimonials?id=${testimonial.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      alert('Fehler beim Löschen');
    }
  };

  const handleSubmitTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = '/api/homepage/testimonials';
      const method = editingTestimonialId ? 'PUT' : 'POST';
      const body = editingTestimonialId
        ? { id: editingTestimonialId, ...testimonialForm }
        : testimonialForm;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        setShowTestimonialForm(false);
        setEditingTestimonialId(null);
        setTestimonialForm({ text: '', author: '', role: '', company: '' });
        fetchData();
      } else {
        const error = await response.json();
        alert(error.error || 'Fehler beim Speichern');
      }
    } catch (error) {
      console.error('Error saving testimonial:', error);
      alert('Fehler beim Speichern');
    }
  };

  // Hero CRUD
  const handleEditHero = (image: HeroImage, index: number) => {
    setHeroForm({
      src: image.src,
      alt: image.alt,
      title: image.title,
      description: image.description,
    });
    setEditingHeroIndex(index);
    setShowHeroForm(true);
  };

  const handleDeleteHero = async (index: number) => {
    if (!config) return;
    
    if (!confirm('Möchtest du dieses Hero-Bild wirklich löschen?')) {
      return;
    }

    const updatedImages = config.images.filter((_, i) => i !== index);
    const updatedConfig = { ...config, images: updatedImages };

    try {
      const response = await fetch('/api/homepage/hero', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedConfig),
      });

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error deleting hero image:', error);
      alert('Fehler beim Löschen');
    }
  };

  const handleSubmitHero = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;

    try {
      const updatedImages = [...config.images];
      
      if (editingHeroIndex !== null) {
        updatedImages[editingHeroIndex] = heroForm;
      } else {
        updatedImages.push(heroForm);
      }

      const updatedConfig = { ...config, images: updatedImages };

      const response = await fetch('/api/homepage/hero', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedConfig),
      });

      if (response.ok) {
        setShowHeroForm(false);
        setEditingHeroIndex(null);
        setHeroForm({ src: '', alt: '', title: '', description: '' });
        fetchData();
      } else {
        const error = await response.json();
        alert(error.error || 'Fehler beim Speichern');
      }
    } catch (error) {
      console.error('Error saving hero:', error);
      alert('Fehler beim Speichern');
    }
  };

  const handleUpdateQuote = async (quoteText: string) => {
    if (!config) return;

    try {
      const updatedConfig = { ...config, quoteText };
      const response = await fetch('/api/homepage/hero', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedConfig),
      });

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error updating quote:', error);
      alert('Fehler beim Speichern');
    }
  };

  // Logos CRUD
  const handleEditLogo = (logo: Logo, index: number) => {
    setLogoForm({
      src: logo.src,
      alt: logo.alt,
    });
    setEditingLogoIndex(index);
    setShowLogoForm(true);
  };

  const handleDeleteLogo = async (index: number) => {
    if (!confirm('Möchtest du dieses Logo wirklich löschen?')) {
      return;
    }

    const updatedLogos = logos.filter((_, i) => i !== index);

    try {
      const response = await fetch('/api/homepage/logos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedLogos),
      });

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error deleting logo:', error);
      alert('Fehler beim Löschen');
    }
  };

  const handleSubmitLogo = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const updatedLogos = [...logos];
      
      if (editingLogoIndex !== null) {
        updatedLogos[editingLogoIndex] = logoForm;
      } else {
        updatedLogos.push(logoForm);
      }

      const response = await fetch('/api/homepage/logos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedLogos),
      });

      if (response.ok) {
        const savedLogos = await response.json();
        // Update state immediately with saved data
        setLogos(Array.isArray(savedLogos) ? savedLogos : []);
        setShowLogoForm(false);
        setEditingLogoIndex(null);
        setLogoForm({ src: '', alt: '' });
        // Also refresh all data to ensure consistency
        setTimeout(() => {
          fetchData();
        }, 500);
      } else {
        const error = await response.json();
        alert(error.error || 'Fehler beim Speichern');
      }
    } catch (error) {
      console.error('Error saving logo:', error);
      alert('Fehler beim Speichern');
    }
  };

  const handleMediaSelected = (media: any) => {
    if (activeTab === 'hero') {
      setHeroForm({ ...heroForm, src: media.source_url });
    } else if (activeTab === 'logos') {
      setLogoForm({ ...logoForm, src: media.source_url });
    }
    setShowMediaSelector(false);
    setShowLogoMediaSelector(false);
  };

  if (loading) {
    return <div className="text-[var(--color-text-secondary)]">Laden...</div>;
  }

  if (showMediaSelector || showLogoMediaSelector) {
    return (
      <div>
        <button
          onClick={() => {
            setShowMediaSelector(false);
            setShowLogoMediaSelector(false);
          }}
          className="mb-4 px-4 py-2 bg-[var(--color-surface-light)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] hover:opacity-80"
        >
          ← Zurück
        </button>
        <MediaSelector
          onSelect={handleMediaSelected}
          type="image"
        />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-6">
        Homepage Verwaltung
      </h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-[var(--color-border)]">
        <button
          onClick={() => setActiveTab('hero')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'hero'
              ? 'border-b-2 border-[var(--color-primary)] text-[var(--color-primary)]'
              : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
          }`}
        >
          Hero Section
        </button>
        <button
          onClick={() => setActiveTab('testimonials')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'testimonials'
              ? 'border-b-2 border-[var(--color-primary)] text-[var(--color-primary)]'
              : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
          }`}
        >
          Testimonials
        </button>
        <button
          onClick={() => setActiveTab('logos')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'logos'
              ? 'border-b-2 border-[var(--color-primary)] text-[var(--color-primary)]'
              : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
          }`}
        >
          Logo Carousel
        </button>
      </div>

      {/* Hero Section */}
      {activeTab === 'hero' && (
        <div className="space-y-6">
          {showHeroForm ? (
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-6">
              <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4">
                {editingHeroIndex !== null ? 'Hero-Bild bearbeiten' : 'Neues Hero-Bild'}
              </h2>
              <form onSubmit={handleSubmitHero} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                    Bild URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={heroForm.src}
                      onChange={(e) => setHeroForm({ ...heroForm, src: e.target.value })}
                      placeholder="/images/home/home-hero-1.jpg"
                      className="flex-1 px-4 py-2 bg-[var(--color-surface-light)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowMediaSelector(true)}
                      className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90"
                    >
                      Auswählen
                    </button>
                  </div>
                </div>
                <FormField
                  label="Alt Text"
                  name="alt"
                  value={heroForm.alt}
                  onChange={(value) => setHeroForm({ ...heroForm, alt: value })}
                  required
                />
                <FormField
                  label="Titel"
                  name="title"
                  value={heroForm.title}
                  onChange={(value) => setHeroForm({ ...heroForm, title: value })}
                />
                <FormField
                  label="Beschreibung"
                  name="description"
                  type="textarea"
                  value={heroForm.description}
                  onChange={(value) => setHeroForm({ ...heroForm, description: value })}
                  rows={3}
                />
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90"
                  >
                    Speichern
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowHeroForm(false);
                      setEditingHeroIndex(null);
                    }}
                    className="px-6 py-2 bg-[var(--color-surface-light)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] hover:opacity-80"
                  >
                    Abbrechen
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <>
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-6">
                <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4">
                  Hero-Bilder
                </h2>
                <button
                  onClick={() => setShowHeroForm(true)}
                  className="mb-4 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90"
                >
                  + Neues Hero-Bild
                </button>
                <div className="space-y-4">
                  {config?.images.map((image, index) => (
                    <div
                      key={index}
                      className="p-4 bg-[var(--color-surface-light)] border border-[var(--color-border)] rounded-lg"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-medium text-[var(--color-text-primary)] mb-2">
                            {image.title || 'Kein Titel'}
                          </div>
                          <div className="text-sm text-[var(--color-text-secondary)] mb-2">
                            {image.description}
                          </div>
                          <div className="text-xs text-[var(--color-text-muted)]">
                            Bild: {image.src}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditHero(image, index)}
                            className="px-3 py-1 text-sm bg-blue-500/10 text-blue-500 rounded hover:bg-blue-500/20"
                          >
                            Bearbeiten
                          </button>
                          <button
                            onClick={() => handleDeleteHero(index)}
                            className="px-3 py-1 text-sm bg-red-500/10 text-red-500 rounded hover:bg-red-500/20"
                          >
                            Löschen
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-6">
                <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4">
                  Zitat-Text
                </h2>
                <FormField
                  label="Zitat"
                  name="quoteText"
                  type="textarea"
                  value={config?.quoteText || ''}
                  onChange={(value) => handleUpdateQuote(value)}
                  rows={4}
                />
              </div>
            </>
          )}
        </div>
      )}

      {/* Testimonials Section */}
      {activeTab === 'testimonials' && (
        <div>
          {showTestimonialForm ? (
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-6">
              <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4">
                {editingTestimonialId ? 'Testimonial bearbeiten' : 'Neues Testimonial'}
              </h2>
              <form onSubmit={handleSubmitTestimonial} className="space-y-4">
                <FormField
                  label="Text"
                  name="text"
                  type="textarea"
                  value={testimonialForm.text}
                  onChange={(value) => setTestimonialForm({ ...testimonialForm, text: value })}
                  required
                  rows={4}
                />
                <FormField
                  label="Autor"
                  name="author"
                  value={testimonialForm.author}
                  onChange={(value) => setTestimonialForm({ ...testimonialForm, author: value })}
                  required
                />
                <FormField
                  label="Rolle (optional)"
                  name="role"
                  value={testimonialForm.role}
                  onChange={(value) => setTestimonialForm({ ...testimonialForm, role: value })}
                />
                <FormField
                  label="Firma (optional)"
                  name="company"
                  value={testimonialForm.company}
                  onChange={(value) => setTestimonialForm({ ...testimonialForm, company: value })}
                />
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90"
                  >
                    Speichern
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowTestimonialForm(false);
                      setEditingTestimonialId(null);
                    }}
                    className="px-6 py-2 bg-[var(--color-surface-light)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] hover:opacity-80"
                  >
                    Abbrechen
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
                  Testimonials
                </h2>
                <button
                  onClick={() => setShowTestimonialForm(true)}
                  className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90"
                >
                  + Neues Testimonial
                </button>
              </div>
              <DataTable
                data={testimonials}
                columns={[
                  { key: 'id', label: 'ID' },
                  {
                    key: 'author',
                    label: 'Autor',
                    render: (t: Testimonial) => t.author,
                  },
                  {
                    key: 'text',
                    label: 'Text',
                    render: (t: Testimonial) => (
                      <div className="max-w-md truncate">{t.text}</div>
                    ),
                  },
                ]}
                onEdit={handleEditTestimonial}
                onDelete={handleDeleteTestimonial}
              />
            </>
          )}
        </div>
      )}

      {/* Logos Section */}
      {activeTab === 'logos' && (
        <div>
          {showLogoForm ? (
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-6">
              <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4">
                {editingLogoIndex !== null ? 'Logo bearbeiten' : 'Neues Logo'}
              </h2>
              <form onSubmit={handleSubmitLogo} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                    Logo URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={logoForm.src}
                      onChange={(e) => setLogoForm({ ...logoForm, src: e.target.value })}
                      placeholder="/images/home/references-carousel/logo.png"
                      className="flex-1 px-4 py-2 bg-[var(--color-surface-light)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLogoMediaSelector(true)}
                      className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90"
                    >
                      Auswählen
                    </button>
                  </div>
                </div>
                <FormField
                  label="Alt Text"
                  name="alt"
                  value={logoForm.alt}
                  onChange={(value) => setLogoForm({ ...logoForm, alt: value })}
                  required
                />
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90"
                  >
                    Speichern
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowLogoForm(false);
                      setEditingLogoIndex(null);
                    }}
                    className="px-6 py-2 bg-[var(--color-surface-light)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] hover:opacity-80"
                  >
                    Abbrechen
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
                  Logo Carousel
                </h2>
                <button
                  onClick={() => setShowLogoForm(true)}
                  className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90"
                >
                  + Neues Logo
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {logos.map((logo, index) => (
                  <div
                    key={index}
                    className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg"
                  >
                    <div className="mb-2">
                      <img
                        src={logo.src}
                        alt={logo.alt}
                        className="w-full h-24 object-contain"
                      />
                    </div>
                    <div className="text-sm text-[var(--color-text-primary)] mb-2">
                      {logo.alt}
                    </div>
                    <div className="text-xs text-[var(--color-text-muted)] mb-4">
                      {logo.src}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditLogo(logo, index)}
                        className="flex-1 px-3 py-1 text-sm bg-blue-500/10 text-blue-500 rounded hover:bg-blue-500/20"
                      >
                        Bearbeiten
                      </button>
                      <button
                        onClick={() => handleDeleteLogo(index)}
                        className="flex-1 px-3 py-1 text-sm bg-red-500/10 text-red-500 rounded hover:bg-red-500/20"
                      >
                        Löschen
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

