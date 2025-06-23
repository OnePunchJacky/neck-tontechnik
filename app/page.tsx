import Hero from "./components/Hero";
import TestimonialSlider from "./components/TestimonialSlider";
import ContactForm from "./components/ContactForm";
import NewsletterForm from "./components/NewsletterForm";

export default function Home() {
  // Example images for the Hero component
  const heroImages = [
    {
      src: "/magdeburg003-scaled.jpg",
      alt: "Professional audio engineering setup",
      title: "Klang auf den Punkt – Live und im Studio",
      description: "Professionelle Tontechnik-Lösungen für Veranstaltungen, Studios und Installationen"
    },
    {
      src: "https://picsum.photos/1200/800?random=1",
      alt: "Live sound engineering",
      title: "Live-Tontechnik",
      description: "Professionelle Beschallung für Ihre Veranstaltung"
    },
    {
      src: "https://picsum.photos/1200/800?random=2",
      alt: "Studio recording setup",
      title: "Studio & Produktion",
      description: "Hochwertige Aufnahmen und Produktion in unserem Studio"
    }
  ];

  // Sample testimonials
  const testimonials = [
    {
      id: 1,
      text: "Neck hat unseren Live-Sound auf ein komplett neues Level gebracht. Die Klangqualität war atemberaubend und das Publikum war begeistert.",
      author: "Max Mustermann",
      role: "Bandleader",
      company: "The Rockstars"
    },
    {
      id: 2,
      text: "Das Mixing und Mastering meines Albums war einfach perfekt. Neck versteht genau, was ein Song braucht, um zu glänzen.",
      author: "Anna Schmidt",
      role: "Sängerin",
      company: "Solo Artist"
    },
    {
      id: 3,
      text: "Der Workshop war unglaublich lehrreich. Ich habe in einem Tag mehr gelernt als in Monaten des Selbststudiums.",
      author: "Tom Weber",
      role: "Aspiring Producer",
      company: "Home Studio"
    }
  ];

  return (
    <div className="min-h-screen bg-zinc-900">
      {/* Hero Section */}
      <Hero
        images={heroImages}
        height="h-[80vh]"
        autoPlay={true}
        autoPlayInterval={6000}
        showNavigation={true}
        showIndicators={true}
        ctaButtons={{
          primary: { text: "Jetzt Mixing anfragen", href: "#contact" },
          secondary: { text: "Get in Touch", href: "#contact" }
        }}
      />

      {/* Services Section */}
      <main className="flex flex-col items-center justify-center p-8 pb-20 gap-16 sm:p-20">
        <div className="text-center w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mt-5">
            <div className="p-5 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors duration-200">
              <div className="flex justify-center mb-4">
                <img src="/icons/production.png" alt="Musikproduktion" className="w-16 h-16" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Musikproduktion</h3>
              <p className="text-gray-300">Professionelle Musikproduktion von der Aufnahme bis zum fertigen Track</p>
            </div>
            <div className="p-5 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors duration-200">
              <div className="flex justify-center mb-4">
                <img src="/icons/mixing_mastering.png" alt="Mixing & Mastering" className="w-16 h-16" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Mixing & Mastering</h3>
              <p className="text-gray-300">Hochwertiges Mixing und Mastering für optimale Klangqualität</p>
            </div>
            <div className="p-5 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors duration-200">
              <div className="flex justify-center mb-4">
                <img src="/icons/live.png" alt="Live-Tontechnik" className="w-16 h-16" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Live-Tontechnik</h3>
              <p className="text-gray-300">Professionelle Beschallung für Konzerte und Veranstaltungen</p>
            </div>
            <div className="p-5 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors duration-200">
              <div className="flex justify-center mb-4">
                <img src="/icons/workshops.png" alt="Workshops" className="w-16 h-16" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Workshops</h3>
              <p className="text-gray-300">Schulungen und Workshops für Tontechnik-Interessierte</p>
            </div>
          </div>
        </div>
      </main>

      {/* Full-width background section with testimonials */}
      <div className="relative py-16 overflow-hidden w-full min-h-[700px] flex items-center justify-center">
        <div
          className="absolute inset-0 z-0 bg-[url('/images/102boyz_7.jpg')] bg-cover bg-center bg-fixed opacity-20"
          aria-hidden="true"
        ></div>
        <div className="relative z-10 px-8 w-full">
          <TestimonialSlider
            testimonials={testimonials}
            autoPlay={true}
            autoPlayInterval={6000}
            showNavigation={true}
            showIndicators={true}
          />
        </div>
      </div>

      {/* Full-width content section */}
      <section className="w-full px-8 py-16">
        <div className="lg:columns-2 gap-8 text-white max-w-7xl mx-auto">
          <div className="h-100 flex flex-col justify-center bg-zinc-800 p-5 rounded-xl"><h4 className="text-2xl mb-4 font-bold">Technik trifft musikalische Leidenschaft</h4><p>Ich bin nicht nur Tontechniker, sondern auch Multiinstrumentalist. Das gibt mir den ganzheitlichen Blick für einen Sound, der nicht nur technisch einwandfrei, sondern auch musikalisch überzeugt.</p><p className="mt-6 text-xl font-bold">Bei mir bekommt ihr →</p></div>
          <div className="h-100 flex flex-col justify-center sm:items-center items-center">
            <div className="p-5 bg-white rounded-xl mb-5 text-black font-bold sm:min-w-[400px] w-full max-w-[400px] flex items-center gap-3">
              <svg className="w-6 h-6 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
              Genreübergreifenden Ansatz
            </div>
            <div className="p-5 bg-white rounded-xl mb-5 text-black font-bold sm:min-w-[400px] w-full max-w-[400px] flex items-center gap-3">
              <svg className="w-6 h-6 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
              Outboard-Hardware & Logic Pro Expertise
            </div>
            <div className="p-5 bg-white rounded-xl mb-5 text-black font-bold sm:min-w-[400px] w-full max-w-[400px] flex items-center gap-3">
              <svg className="w-6 h-6 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Live-Sound mit Musiker-Brille
            </div>
          </div>
        </div>
      </section>

      {/* Full-width background section with original text */}
      <div className="relative py-16 overflow-hidden w-full min-h-[700px] flex items-center">
        <div
          className="absolute inset-0 z-0 bg-[url('/magdeburg003-scaled.jpg')] bg-cover bg-center bg-fixed opacity-20"
          aria-hidden="true"
        ></div>
        <div className="relative z-10 max-w-3xl mx-auto text-center text-white text-xl leading-relaxed px-8">
          Egal ob fette Liveshows, präzise Studioarbeit oder praxisnahe Workshops – ich bringe Sound auf die nächste Stufe. Mit jahrelanger Erfahrung als Live- und Studiotechniker sorge ich dafür, dass deine Musik genau so klingt, wie sie klingen soll.
        </div>
      </div>

      {/* Special Offers & Newsletter Section */}
      <section className="w-full bg-zinc-800 py-20 px-4 md:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Gratis Testmaster */}
          <div className="bg-zinc-900 rounded-xl p-8 flex flex-col justify-between shadow-lg">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">Gratis Testmaster</h3>
              <p className="text-white mb-8">Probiere einen kurzen Ausschnitt (45 Sek.) deines Tracks — kostenlos.</p>
            </div>
            <a href="#contact" className="inline-flex items-center bg-white text-zinc-900 font-semibold px-6 py-3 rounded-lg shadow hover:bg-gray-100 transition mb-2 w-fit">
              Jetzt anfragen <span className="ml-2">→</span>
            </a>
          </div>
          {/* Mix/Master-Bundle */}
          <div className="bg-zinc-900 rounded-xl p-8 flex flex-col justify-between shadow-lg">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">Mix/Master-Bundle</h3>
              <p className="text-white mb-8">10 % Rabatt auf dein nächstes Mastering-Projekt.</p>
            </div>
            <a href="#contact" className="inline-flex items-center bg-white text-zinc-900 font-semibold px-6 py-3 rounded-lg shadow hover:bg-gray-100 transition mb-2 w-fit">
              Angebot sichern <span className="ml-2">→</span>
            </a>
          </div>
        </div>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Newsletter Text */}
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">Sound-Insights & exklusive Angebote direkt in dein Postfach.</h3>
            <p className="text-white">Noch ein Newsletter? Dann miste doch mal aus und mach Platz für das, was dich weiterbringt. In meinem Newsletter bekommst du Branchen-Insights, Techniques und Tipps, wie du deine Karriere als Tontechniker und Produzent aufs nächste Level bringst. <span className="ml-1">→</span></p>
          </div>
          {/* Newsletter Signup */}
          <NewsletterForm />
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="relative py-20 overflow-hidden w-full min-h-[700px] flex items-center">
        <div
          className="absolute inset-0 z-0 bg-[url('/images/live.jpeg')] bg-cover bg-center bg-fixed opacity-20"
          aria-hidden="true"
        ></div>
        <div className="relative z-10 w-full px-4 md:px-8">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 drop-shadow-2xl">
              Let's get in touch
            </h2>
            <p className="text-xl md:text-2xl text-white leading-relaxed drop-shadow-2xl">
              Bereit für dein nächstes Projekt? Lass uns gemeinsam deine Audio-Vision verwirklichen.
            </p>
          </div>
          <ContactForm />
        </div>
      </section>
    </div>
  );
}
