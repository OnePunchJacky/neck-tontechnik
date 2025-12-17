import { Metadata } from "next";
import ContactForm from '../components/ContactForm';

export const metadata: Metadata = {
  title: 'Kontakt',
  description: 'Kontaktiere Vincent von Neck Tontechnik für dein nächstes Audio-Projekt. Mixing, Mastering, Live-Sound und Equipment-Verleih in Leipzig.',
  openGraph: {
    title: 'Kontakt - Neck Tontechnik',
    description: 'Kontaktiere Vincent für dein nächstes Audio-Projekt. Professionelle Tontechnik-Services in Leipzig.',
    url: 'https://neck-tontechnik.com/contact',
  }
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden min-h-[80vh] flex items-center">
        <div className="absolute inset-0 z-0 bg-[url('/images/live.jpeg')] bg-cover bg-center bg-fixed opacity-20"></div>
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4 md:px-8">
          <h1 className="text-4xl md:text-6xl font-bold text-[var(--color-text-primary)] mb-6 drop-shadow-2xl">
            Let's get in touch
          </h1>
          <p className="text-xl md:text-2xl text-[var(--color-text-primary)] leading-relaxed drop-shadow-2xl mb-8">
            Bereit für dein nächstes Projekt? Lass uns gemeinsam deine Audio-Vision verwirklichen.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Contact Form */}
            <div>
              <h2 className="text-3xl font-bold text-[var(--color-text-primary)] mb-6">
                Schreibst du mir?
              </h2>
              <p className="text-[var(--color-text-secondary)] mb-8">
                Erzähl mir von deinem Projekt. Egal ob Studio-Recording, Live-Event oder Workshop – 
                ich freue mich auf deine Nachricht und melde mich schnellstmöglich bei dir.
              </p>
              <ContactForm />
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-[var(--color-text-primary)] mb-6">
                  Kontakt & Info
                </h2>
                <div className="space-y-6">
                  
                  {/* Email */}
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-[var(--color-accent-blue)] rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-[var(--color-text-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-[var(--color-text-primary)] font-semibold mb-1">E-Mail</h3>
                      <a href="mailto:vincent@neck-tontechnik.com" className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">
                        vincent@neck-tontechnik.com
                      </a>
                    </div>
                  </div>


                  {/* Location */}
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-[var(--color-accent-blue)] rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-[var(--color-text-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-[var(--color-text-primary)] font-semibold mb-1">Standort</h3>
                      <p className="text-[var(--color-text-secondary)]">
                        Leipzig<br />
                        Bundesweit verfügbar
                      </p>
                    </div>
                  </div>

                  {/* Social Media */}
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-[var(--color-accent-blue)] rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-[var(--color-text-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 3v10a2 2 0 002 2h6a2 2 0 002-2V7M7 7h10M9 11h6m-6 4h6" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-[var(--color-text-primary)] font-semibold mb-2">Social Media</h3>
                      <div className="flex space-x-3">
                        <a 
                          href="https://www.instagram.com/_in.vince.ible_/" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                          aria-label="Instagram"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                          </svg>
                        </a>
                        <a 
                          href="https://www.linkedin.com/in/vincent-neck/" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                          aria-label="LinkedIn"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                          </svg>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Services Overview */}
              <div className="bg-[var(--color-surface)] rounded-lg p-6">
                <h3 className="text-[var(--color-text-primary)] font-bold text-xl mb-4">Meine Services</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-[var(--color-accent-blue)] rounded-lg mx-auto mb-2 flex items-center justify-center">
                      <svg className="w-6 h-6 text-[var(--color-text-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                      </svg>
                    </div>
                    <p className="text-[var(--color-text-secondary)] text-sm">Musikproduktion</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-[var(--color-accent-blue)] rounded-lg mx-auto mb-2 flex items-center justify-center">
                      <svg className="w-6 h-6 text-[var(--color-text-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4l7 7v11a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-[var(--color-text-secondary)] text-sm">Mixing & Mastering</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-[var(--color-accent-blue)] rounded-lg mx-auto mb-2 flex items-center justify-center">
                      <svg className="w-6 h-6 text-[var(--color-text-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                    </div>
                    <p className="text-[var(--color-text-secondary)] text-sm">Live-Tontechnik</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-[var(--color-accent-blue)] rounded-lg mx-auto mb-2 flex items-center justify-center">
                      <svg className="w-6 h-6 text-[var(--color-text-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <p className="text-[var(--color-text-secondary)] text-sm">Workshops</p>
                  </div>
                </div>
              </div>

              {/* Quick Response */}
              <div className="bg-[var(--color-accent-blue)] rounded-lg p-6 text-center">
                <h3 className="text-[var(--color-text-primary)] font-bold text-lg mb-2">Schnelle Antwort garantiert</h3>
                <p className="text-[var(--color-text-secondary)] text-sm">
                  Ich melde mich in der Regel innerhalb von 24 Stunden bei dir zurück.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-[var(--color-surface)] py-16 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-[var(--color-text-primary)] text-center mb-12">
            Häufige Fragen
          </h2>
          <div className="space-y-6">
            <div className="bg-[var(--color-surface-dark)] rounded-lg p-6">
              <h3 className="text-[var(--color-text-primary)] font-semibold mb-2">Wie läuft ein Recording-Projekt ab?</h3>
              <p className="text-[var(--color-text-secondary)] text-sm">
                Nach unserem ersten Gespräch besprechen wir deine Vorstellungen und den Zeitplan. 
                Dann geht's ins Studio oder zu dir vor Ort – je nachdem, was für dein Projekt am besten passt.
              </p>
            </div>
            <div className="bg-[var(--color-surface-dark)] rounded-lg p-6">
              <h3 className="text-[var(--color-text-primary)] font-semibold mb-2">Was kostet eine Live-Beschallung?</h3>
              <p className="text-[var(--color-text-secondary)] text-sm">
                Die Kosten hängen von der Größe der Veranstaltung, der Technik und der Dauer ab. 
                Schick mir einfach die Details zu deinem Event und ich erstelle dir ein individuelles Angebot.
              </p>
            </div>
            <div className="bg-[var(--color-surface-dark)] rounded-lg p-6">
              <h3 className="text-[var(--color-text-primary)] font-semibold mb-2">Arbeitest du auch remote?</h3>
              <p className="text-[var(--color-text-secondary)] text-sm">
                Ja! Für Mixing und Mastering arbeite ich auch remote. Du schickst mir deine Tracks, 
                wir besprechen deine Wünsche und ich liefere dir das fertige Ergebnis.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}