import Hero from "../components/Hero";
import ContactFooter from "../components/ContactFooter";

export default function UeberMich() {
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
        <div className="prose prose-lg prose-invert max-w-none">
          <p className="text-xl text-[var(--color-text-secondary)] leading-relaxed mb-8">
            Ich bin Vincent ein leidenschaftlicher Tontechniker und Musikproduzent. <strong className="text-[var(--color-text-primary)]">Seit 2017</strong> verbinde ich Tontechnik und Kreativität im Musik- und Veranstaltungsbereich.
          </p>

          <p className="text-[var(--color-text-secondary)] mb-8">
            Mein Herz schlägt für den Sound – egal ob <strong className="text-[var(--color-text-primary)]">live</strong> vor einem begeisterten Publikum oder im <strong className="text-[var(--color-text-primary)]">Studio</strong>, wo ich alles daran setze, die künstlerische Magie einzufangen. Seit dem ich das Studium am <strong className="text-[var(--color-text-primary)]">SAE-Institute Leipzig</strong> mit einem Bachelor of Arts (Hons.) in „Audio and Musicproduction" abgeschlossen habe, arbeite ich freiberuflich.
          </p>

          <p className="text-[var(--color-text-secondary)] mb-8">
            Man findet mich am <strong className="text-[var(--color-text-primary)]">FoH- oder Monitor-Pult</strong>, wo ich an Reglern und Fadern herumschraube, um den Sound auf die Musik abzustimmen, damit ein beeindruckendes Hörerlebnis entstehen kann. Aber auch als <strong className="text-[var(--color-text-primary)]">Stage- oder Drumtech</strong> fühle ich mich auf der Bühne zuhause.
          </p>

          <p className="text-[var(--color-text-secondary)] mb-8">
            In meiner Zeit als <strong className="text-[var(--color-text-primary)]">Tontechniker</strong> habe ich bereits mit Künstlern wie 102Boyz, Chris Norman, JuJu, Kool Savas und Ski Aggu an erfolgreichen Tourneen und Shows gearbeitet.
          </p>

          <p className="text-[var(--color-text-secondary)] mb-8">
            Neben dem Fokus auf eine erfolgreiche Show verliere ich aber nie den spaß an der Sache. Mein Portfolio umfasst nicht nur <strong className="text-[var(--color-text-primary)]">Live-Events und Festivals</strong>, sondern auch Studioarbeiten für diverse Künstler verschiedener Genres. Ich bin versiert in <strong className="text-[var(--color-text-primary)]">Recording, Mixing, Mastering und Writing/Producing</strong>.
          </p>

          <p className="text-[var(--color-text-secondary)] mb-8">
            Meine detailorientierte Arbeit zielt darauf ab, jede künstlerische Vision in die Realität umzusetzen.
          </p>

          <p className="text-[var(--color-text-secondary)] mb-12">
            Ob bei einem Live-Spektakel oder in einem kreativen Studio-Setting – mein Ziel ist es, gemeinsam an einer unvergesslichen musikalischen Erfahrung zu arbeiten.
          </p>

          <h2 className="text-3xl font-bold text-[var(--color-text-primary)] mb-6">Meine Expertise</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div className="bg-[var(--color-surface)] rounded-lg p-6">
              <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4">Live & Veranstaltungen</h3>
              <ul className="space-y-2 text-[var(--color-text-secondary)]">
                <li className="flex items-start">
                  <span className="text-[var(--color-accent-blue)] mr-2">▸</span>
                  Front of House (FoH) Mixing
                </li>
                <li className="flex items-start">
                  <span className="text-[var(--color-accent-blue)] mr-2">▸</span>
                  Monitor Mixing
                </li>
                <li className="flex items-start">
                  <span className="text-[var(--color-accent-blue)] mr-2">▸</span>
                  Stage & Drum Technician
                </li>
                <li className="flex items-start">
                  <span className="text-[var(--color-accent-blue)] mr-2">▸</span>
                  Live Events & Festivals
                </li>
              </ul>
            </div>
            
            <div className="bg-[var(--color-surface)] rounded-lg p-6">
              <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4">Studio</h3>
              <ul className="space-y-2 text-[var(--color-text-secondary)]">
                <li className="flex items-start">
                  <span className="text-[var(--color-accent-blue)] mr-2">▸</span>
                  Recording
                </li>
                <li className="flex items-start">
                  <span className="text-[var(--color-accent-blue)] mr-2">▸</span>
                  Mixing
                </li>
                <li className="flex items-start">
                  <span className="text-[var(--color-accent-blue)] mr-2">▸</span>
                  Mastering
                </li>
                <li className="flex items-start">
                  <span className="text-[var(--color-accent-blue)] mr-2">▸</span>
                  Writing & Producing
                </li>
              </ul>
            </div>
          </div>

        </div>
      </main>

      {/* Contact Section */}
      <ContactFooter />
    </div>
  );
}