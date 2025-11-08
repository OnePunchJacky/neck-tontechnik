import { Metadata } from "next";
import Image from "next/image";
import Hero from "./components/Hero";
import TestimonialSlider from "./components/TestimonialSlider";
import ContactFooter from "./components/ContactFooter";
import NewsletterForm from "./components/NewsletterForm";
import LogoCarousel from "./components/LogoCarousel";
import { getHomepageConfig, getHomepageLogos, getTestimonials } from "./lib/homepage-config";

export const metadata: Metadata = {
  description: 'Neck Tontechnik - Dein Partner für professionelle Tontechnik in Leipzig. Mixing, Mastering, Live-Sound und Equipment-Verleih mit jahrelanger Erfahrung.',
  openGraph: {
    title: 'Neck Tontechnik - Professionelle Tontechnik & Musikproduktion',
    description: 'Dein Partner für professionelle Tontechnik in Leipzig. Mixing, Mastering, Live-Sound und Equipment-Verleih mit jahrelanger Erfahrung.',
    url: 'https://neck-tontechnik.com',
  }
};

export default async function Home() {
  // Load homepage configuration
  const homepageConfig = await getHomepageConfig();
  const heroImages = homepageConfig.images;
  const referenceLogos = await getHomepageLogos();
  const testimonials = getTestimonials();

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Hero Section */}
      <Hero
        images={heroImages}
        height="h-screen"
        autoPlay={true}
        autoPlayInterval={6000}
        showNavigation={true}
        showIndicators={true}
        ctaButtons={{
          primary: { text: "Get in Touch", href: "#contact" }
        }}
      />

      {/* Services Section */}
      <section className="py-16 md:py-20 px-4 md:px-8 min-h-[80vh] flex items-center">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            <div className="p-5 bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg hover:bg-[var(--color-surface-light)] transition-colors duration-200 text-center">
              <div className="flex justify-center mb-4">
                <Image src="/icons/production.png" alt="Musikproduktion" width={64} height={64} className="w-16 h-16" />
              </div>
              <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-4">Musikproduktion</h3>
              <p className="text-[var(--color-text-secondary)]">Professionelle Musikproduktion von der Aufnahme bis zum Release</p>
            </div>
            <div className="p-5 bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg hover:bg-[var(--color-surface-light)] transition-colors duration-200 text-center">
              <div className="flex justify-center mb-4">
                <Image src="/icons/mixing_mastering.png" alt="Mixing & Mastering" width={64} height={64} className="w-16 h-16" />
              </div>
              <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-4">Mixing & Mastering</h3>
              <p className="text-[var(--color-text-secondary)]">Hochwertiges Mixing und Mastering für optimale Klangqualität</p>
            </div>
            <div className="p-5 bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg hover:bg-[var(--color-surface-light)] transition-colors duration-200 text-center">
              <div className="flex justify-center mb-4">
                <Image src="/icons/live.png" alt="Live-Tontechnik" width={64} height={64} className="w-16 h-16" />
              </div>
              <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-4">Live-Tontechnik</h3>
              <p className="text-[var(--color-text-secondary)]">Ausgewogener Klang mit Impact für Konzerte und Veranstaltungen</p>
            </div>
            <div className="p-5 bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg hover:bg-[var(--color-surface-light)] transition-colors duration-200 text-center">
              <div className="flex justify-center mb-4">
                <Image src="/icons/workshops.png" alt="Workshops" width={64} height={64} className="w-16 h-16" />
              </div>
              <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-4">Workshops</h3>
              <p className="text-[var(--color-text-secondary)]">Workshops für Tontechnik-Interessierte</p>
            </div>
          </div>
        </div>
      </section>


      {/* Testimonials Section */}
      <section className="relative py-16 md:py-20 overflow-hidden min-h-[80vh] flex items-center">
        <div
          className="absolute inset-0 z-0 bg-[url('/images/102boyz_7.jpg')] bg-cover bg-center bg-fixed opacity-20"
          aria-hidden="true"
        ></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 w-full">
          <TestimonialSlider
            testimonials={testimonials}
            autoPlay={true}
            autoPlayInterval={8000}
            showNavigation={true}
            showIndicators={true}
          />
        </div>
      </section>

      {/* Features Highlights Section */}
      <section className="py-16 md:py-20 px-4 md:px-8 min-h-[80vh] flex items-center">
        <div className="lg:columns-2 gap-8 text-[var(--color-text-primary)] max-w-7xl mx-auto w-full">
          <div className="h-100 flex flex-col justify-center bg-[var(--color-surface)] p-5 rounded-xl"><h4 className="text-2xl mb-4 font-bold">Technik trifft musikalische Leidenschaft</h4><p>Ich bin nicht nur Tontechniker, sondern auch Multiinstrumentalist. Das gibt mir den ganzheitlichen Blick für einen Sound, der nicht nur technisch einwandfrei, sondern auch musikalisch überzeugt.</p></div>
          <div className="h-100 flex flex-col justify-center sm:items-center items-center">
            <h5 className="text-xl font-bold mb-6 text-center">Bei mir bekommt ihr</h5>
            <div className="p-5 bg-[var(--color-primary-100)] rounded-xl mb-5 text-[var(--color-text-dark)] font-bold sm:min-w-[400px] w-full max-w-[400px] flex items-center gap-3">
              <svg className="w-6 h-6 text-[var(--color-accent-blue)] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
              Genreübergreifenden Ansatz
            </div>
            <div className="p-5 bg-[var(--color-primary-100)] rounded-xl mb-5 text-[var(--color-text-dark)] font-bold sm:min-w-[400px] w-full max-w-[400px] flex items-center gap-3">
              <svg className="w-6 h-6 text-[var(--color-accent-blue)] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
              Hardware, Ableton & Logic Pro Expertise
            </div>
            <div className="p-5 bg-[var(--color-primary-100)] rounded-xl mb-5 text-[var(--color-text-dark)] font-bold sm:min-w-[400px] w-full max-w-[400px] flex items-center gap-3">
              <svg className="w-6 h-6 text-[var(--color-accent-blue)] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Live-Sound mit Musiker-Brille
            </div>
          </div>
        </div>
      </section>

      {/* Quote and References Section */}
      <section className="relative py-16 md:py-20 overflow-hidden min-h-[80vh] flex items-center">
        <div
          className="absolute inset-0 z-0 bg-[url('/magdeburg003-scaled.jpg')] bg-cover bg-center bg-fixed opacity-20"
          aria-hidden="true"
        ></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 w-full">
          <div className="max-w-4xl mx-auto text-center text-[var(--color-text-primary)] text-xl leading-relaxed mb-16">
            {homepageConfig.quoteText}
          </div>
          <div className="w-full">
            <LogoCarousel logos={referenceLogos} autoplayDelay={2000} />
          </div>
        </div>
      </section>

      {/* Special Offers & Newsletter Section */}
      <section className="bg-[var(--color-surface)] py-16 md:py-20 px-4 md:px-8 min-h-[80vh] flex items-center">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Gratis Testmaster */}
          <div className="bg-[var(--color-surface-dark)] rounded-xl p-8 flex flex-col justify-between shadow-lg">
            <div>
              <h3 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">Gratis Testmaster</h3>
              <p className="text-[var(--color-text-primary)] mb-8">Probiere einen kurzen Ausschnitt (45 Sek.) deines Tracks — kostenlos.</p>
            </div>
            <a href="#contact" className="inline-flex items-center bg-[var(--color-primary-100)] text-[var(--color-text-dark)] font-semibold px-6 py-3 rounded-lg shadow hover:bg-[var(--color-primary-50)] transition mb-2 w-fit">
              Jetzt anfragen <span className="ml-2">→</span>
            </a>
          </div>
          {/* Mix/Master-Bundle */}
          <div className="bg-[var(--color-surface-dark)] rounded-xl p-8 flex flex-col justify-between shadow-lg">
            <div>
              <h3 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">Mix/Master-Bundle</h3>
              <p className="text-[var(--color-text-primary)] mb-8">10 % Rabatt auf dein nächstes Mastering-Projekt.</p>
            </div>
            <a href="#contact" className="inline-flex items-center bg-[var(--color-primary-100)] text-[var(--color-text-dark)] font-semibold px-6 py-3 rounded-lg shadow hover:bg-[var(--color-primary-50)] transition mb-2 w-fit">
              Angebot sichern <span className="ml-2">→</span>
            </a>
          </div>
        </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Newsletter Text */}
            <div className="p-6">
              <h3 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">Sound-Insights & exklusive Angebote direkt in dein Postfach.</h3>
            <p className="text-[var(--color-text-primary)] leading-relaxed">Noch ein Newsletter? Dann miste doch mal aus und mach Platz für das, was dich weiterbringt. In meinem Newsletter bekommst du Branchen-Insights, Techniques und Tipps, wie du deine Karriere als Tontechniker und Produzent aufs nächste Level bringst. <strong>Plus: 20% Rabatt auf deine erste Mixing-Session!</strong> <span className="ml-1">→</span></p>
          </div>
          {/* Newsletter Signup */}
          <NewsletterForm />
          </div>
        </div>
      </section>

      {/* Equipment Rental Section */}
      <section className="relative py-16 md:py-20 overflow-hidden min-h-[80vh] flex items-center">
        <div className="absolute inset-0 z-0 bg-[url('/images/equipment-rack.jpg')] bg-cover bg-center bg-fixed opacity-30"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 w-full">

          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-text-primary)] mb-6">
              Equipment Verleih
            </h2>
            <p className="text-xl text-[var(--color-text-secondary)] max-w-3xl mx-auto">
              Professionelle Audio Equipment und Backline für deine Produktion
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            <div className="space-y-8">
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-[var(--color-accent-blue)] rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-[var(--color-text-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-[var(--color-text-primary)] font-semibold text-lg mb-2">Mikrofone & Aufnahmetechnik</h3>
                    <p className="text-[var(--color-text-secondary)]">
                      Hochwertige Kondensator- und Dynamikmikrofone für Studio und Live-Einsatz
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-[var(--color-accent-green)] rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-[var(--color-text-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M9 21V3l6 4v10l-6 4z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-[var(--color-text-primary)] font-semibold text-lg mb-2">Audio Equipment</h3>
                    <p className="text-[var(--color-text-secondary)]">
                      Hochwertige Mikrofone, Preamps und Effektgeräte für professionelle Aufnahmen
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-[var(--color-accent-purple)] rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-[var(--color-text-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-[var(--color-text-primary)] font-semibold text-lg mb-2">Backline</h3>
                    <p className="text-[var(--color-text-secondary)]">
                      Instrumente und Zubehör für Live-Performances und Studio-Sessions
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-[var(--color-surface)] bg-opacity-90 rounded-lg p-6 backdrop-blur-sm">
                <h4 className="text-[var(--color-text-primary)] font-semibold text-lg mb-3">Warum Equipment von mir mieten?</h4>
                <ul className="space-y-2 text-[var(--color-text-secondary)]">
                  <li className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-[var(--color-accent-green)] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Professionell gewartetes Equipment</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-[var(--color-accent-green)] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Flexible Mietzeiten (Tage, Wochen, Monate)</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-[var(--color-accent-green)] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Technischer Support inklusive</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-[var(--color-accent-green)] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Delivery & Setup Service verfügbar</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="text-center lg:text-left">
              <div className="bg-[var(--color-primary)] bg-opacity-90 backdrop-blur-sm rounded-xl p-8 text-[var(--color-text-primary)]">
                <div className="mb-6">
                  <svg className="w-16 h-16 mx-auto lg:mx-0 text-[var(--color-text-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13h10M9 19.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM20.5 19.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                  </svg>
                </div>

                <h3 className="text-2xl font-bold mb-4">
                  Equipment online mieten
                </h3>

                <p className="text-[var(--color-text-secondary)] mb-6">
                  Durchstöbere mein komplettes Equipment-Sortiment, wähle deine Mietdauer und sende mir direkt eine Anfrage.
                </p>

                <div className="space-y-3">
                  <div className="flex items-center justify-center lg:justify-start space-x-2 text-[var(--color-text-secondary)]">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm">Verfügbarkeit in Echtzeit prüfen</span>
                  </div>

                  <div className="flex items-center justify-center lg:justify-start space-x-2 text-[var(--color-text-secondary)]">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm">Automatische Preisberechnung</span>
                  </div>

                  <div className="flex items-center justify-center lg:justify-start space-x-2 text-[var(--color-text-secondary)]">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm">Direkte Anfrage per E-Mail</span>
                  </div>
                </div>

                <div className="mt-8">
                  <a
                    href="/equipment-verleih"
                    className="inline-block bg-[var(--color-text-primary)] text-[var(--color-primary)] px-8 py-3 rounded-lg font-semibold hover:bg-[var(--color-text-secondary)] transition-colors duration-200 shadow-lg"
                  >
                    Equipment durchstöbern
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <ContactFooter />
    </div>
  );
}
