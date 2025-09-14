import { Metadata } from "next";
import ContactFooter from '../components/ContactFooter';
import ServiceAccordion from '../components/ServiceAccordion';

export const metadata: Metadata = {
  title: 'Leistungen',
  description: 'Professionelle Tontechnik-Services in Leipzig: Mixing & Mastering, Musikproduktion und Live-Tontechnik. Erfahre mehr über meine Audio Engineering Dienstleistungen.',
  openGraph: {
    title: 'Leistungen - Neck Tontechnik',
    description: 'Professionelle Tontechnik-Services: Mixing & Mastering, Musikproduktion und Live-Tontechnik für Künstler und Veranstaltungen.',
    url: 'https://neck-tontechnik.com/leistungen',
  }
};

export default function Leistungen() {
  const mixMasteringServices = [
    {
      title: "Mixing – Klare Definition, Druck und Transparenz für deinen Sound",
      content: "Ein guter Mix bringt deine Musik auf das nächste Level. Ich sorge für klare Definition, ausgewogene Dynamik und den nötigen Punch – ob im Studio oder Live"
    },
    {
      title: "Mastering – Perfekte Balance für jede Plattform und jedes Medium",
      content: "Der letzte Feinschliff für deinen Sound. Ich optimiere deinen Mix für jede Streaming-Plattform, CD oder Vinyl und sorge für eine stimmige Lautheit und erhalte dabei die Dynamik und Klangtiefe deiner Produktion."
    },
    {
      title: "Mastering für Live Versionen",
      content: "Spezielle Optimierung deiner Tracks für Live-Performances. Ich sorge dafür, dass deine Musik auf großen PA-Systemen kraftvoll und definiert klingt, ohne dabei die Nuancen zu verlieren."
    }
  ];

  const musikproduktionServices = [
    {
      title: "Producing",
      content: "Von der ersten Idee bis zur fertigen Produktion: Ich helfe Künstler*innen und Bands dabei, ihre musikalischen Visionen zu realisieren. Ob Arrangement, Sounddesign, als Musical Director oder kreativer Input – alles mit dem Ziel, das Beste aus der Musik herauszuholen."
    },
    {
      title: "Recording",
      content: "Mit Gespür für Performance und Timing entstehen bei mir natürliche, dynamische Aufnahmen."
    }
  ];

  const liveServices = [
    {
      title: "Monitoring – Sicher auf der Bühne",
      content: "Als Musiker weiß ich, wie essentiell ein gutes Monitoring für eine souveräne Performance ist. Ich sorge für ein klares, gut abgestimmtes Monitorsystem – egal ob In-Ear oder Wedges – damit sich alle auf der Bühne sicher fühlen und ihre beste Show abliefern können."
    },
    {
      title: "Front of House – Der perfekte Live-Sound",
      content: "Eine Liveshow muss nicht nur laut sein – sie muss Emotionen transportieren. Durch meine Erfahrung im Studio habe ich ein Gespür dafür, wie sich Musik auch live druckvoll, ausgewogen und detailreich auf das Publikum übertragen lässt."
    },
    {
      title: "Stagetech/Backline",
      content: "Ein reibungsloser technischer Ablauf ist die Basis für eine starke Performance. Ich übernehme die komplette technische Planung für deine Show und kümmere mich um Bühnenverkabelung, Mikrofonierung, Backline Aufbau und Pflege. So läuft alles rund – vom ersten Ton bis zum letzten Applaus."
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden min-h-[80vh] flex items-center">
        <div className="absolute inset-0 z-0 bg-[url('/magdeburg003-scaled.jpg')] bg-cover bg-center bg-fixed opacity-20"></div>
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4 md:px-8">
          <h1 className="text-3xl md:text-6xl font-bold text-[var(--color-text-primary)] mb-4 md:mb-6 drop-shadow-2xl">
            Bock auf besseren Sound?
          </h1>
          <p className="text-lg md:text-2xl text-[var(--color-text-primary)] leading-relaxed drop-shadow-2xl">
            Musik lebt von Emotion, Energie und Präzision – egal ob im Studio oder auf der Bühne. Mit meiner Erfahrung als Musiker und Tontechniker helfe ich dir, deinen Sound auf das nächste Level zu bringen.
          </p>
        </div>
      </section>

      {/* Main Services Section */}
      <section className="py-12 md:py-20 px-4 md:px-8 mt-12">
        <div className="max-w-7xl mx-auto">
          {/* Mix & Mastering Section */}
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 md:gap-16 items-start min-h-[70vh] mb-16 lg:mb-24">
            <div className="text-[var(--color-text-primary)] order-2 lg:order-1">
              <ServiceAccordion items={mixMasteringServices} />
            </div>
            <div className="order-1 lg:order-2">
              <h4 className="text-6xl md:text-8xl font-bold text-[var(--color-text-primary)] mb-8 text-center lg:text-right">Mix & Mastering</h4>
              <p className="text-base md:text-lg leading-relaxed text-[var(--color-text-primary)] mb-8 text-center lg:text-right">
                Ob du deinen Mix veredeln willst oder ehrliches Feedback brauchst – ich helfe dir, den Sound zu erreichen, den dein Track verdient
              </p>
              <div className="flex justify-center lg:justify-end">
                <a
                  href="#contact"
                  className="bg-[var(--color-primary-100)] hover:bg-[var(--color-primary-50)] text-[var(--color-text-dark)] px-6 md:px-8 py-3 rounded-md text-base md:text-lg font-medium transition-colors duration-200 inline-block"
                >
                  Jetzt anfragen
                </a>
              </div>
            </div>
          </div>

          {/* Musikproduktion Section */}
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 md:gap-16 items-start min-h-[70vh] mb-16 lg:mb-24">
            <div className="order-1 lg:order-1">
              <h4 className="text-6xl md:text-8xl font-bold text-[var(--color-text-primary)] mb-8 text-center lg:text-left">Musik-<br />produktion</h4>
              <p className="text-base md:text-lg leading-relaxed text-[var(--color-text-primary)] mb-8 text-center lg:text-left">
                Du hast einen Song, eine Idee oder einen unfertigen Track – und willst, dass daraus etwas richtig Gutes wird? Ich begleite dich auf dem Weg von der ersten Skizze bis zur fertigen Produktion.
              </p>
              <div className="flex justify-center lg:justify-start">
                <a
                  href="#contact"
                  className="bg-[var(--color-primary-100)] hover:bg-[var(--color-primary-50)] text-[var(--color-text-dark)] px-6 md:px-8 py-3 rounded-md text-base md:text-lg font-medium transition-colors duration-200 inline-block"
                >
                  Jetzt anfragen
                </a>
              </div>
            </div>
            <div className="text-[var(--color-text-primary)] order-2 lg:order-2">
              <ServiceAccordion items={musikproduktionServices} />
            </div>
          </div>

          {/* Live Section */}
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 md:gap-16 items-start min-h-[70vh] mb-16 lg:mb-24">
            <div className="text-[var(--color-text-primary)] order-2 lg:order-1">
              <ServiceAccordion items={liveServices} />
            </div>
            <div className="order-1 lg:order-2">
              <h4 className="text-6xl md:text-8xl font-bold text-[var(--color-text-primary)] mb-8 text-center lg:text-right">Live</h4>
              <p className="text-base md:text-lg leading-relaxed text-[var(--color-text-primary)] mb-8 text-center lg:text-right">
                Ich sorge für einen professionellen Sound auf jeder Bühne – vom Clubgig bis zum Festival. Als Musiker kenne ich beide Seiten des Mischpults und weiß, worauf es ankommt.
              </p>
              <div className="flex justify-center lg:justify-end">
                <a
                  href="#contact"
                  className="bg-[var(--color-primary-100)] hover:bg-[var(--color-primary-50)] text-[var(--color-text-dark)] px-6 md:px-8 py-3 rounded-md text-base md:text-lg font-medium transition-colors duration-200 inline-block"
                >
                  Jetzt anfragen
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Test Mastering Section */}
      <section className="py-12 md:py-20 px-4 md:px-8 bg-[var(--color-surface)]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-4xl font-bold text-[var(--color-text-primary)] mb-4 md:mb-6">
            Kostenloses Test-Mastering
          </h2>
          <p className="text-lg md:text-xl text-[var(--color-text-secondary)] mb-6 md:mb-8">
            Hole dir jetzt dein kostenloses Test-Master oder ein individuelles Mix-/Mastering-Angebot! Gerne können wir auch über <strong className="text-[var(--color-text-primary)]">Bundle-Preise</strong> sprechen. Schreibe mir hier und teile mir mehr über deine Musik und Vision mit.
          </p>
          <a
            href="#contact"
            className="bg-[var(--color-primary-100)] hover:bg-[var(--color-primary-50)] text-[var(--color-text-dark)] px-6 md:px-8 py-3 rounded-md text-base md:text-lg font-medium transition-colors duration-200 inline-block"
          >
            Jetzt anfragen
          </a>
        </div>
      </section>

      {/* Recording Section */}
      <section className="py-12 md:py-20 px-4 md:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-4xl font-bold text-[var(--color-text-primary)] mb-4 md:mb-6">
            Du hast eine Vision, aber noch keine qualitativen Aufnahmen?
          </h2>
          <p className="text-lg md:text-xl text-[var(--color-text-secondary)] mb-6 md:mb-8">
            Ich biete auch <strong className="text-[var(--color-text-primary)]">Recordings</strong> an und fange deine Ideen mit hochwertigem Equipment ein. Gern komme ich dafür auch mit meinem mobilen Equipment zu dir!
          </p>
          <a
            href="#contact"
            className="bg-[var(--color-primary-100)] hover:bg-[var(--color-primary-50)] text-[var(--color-text-dark)] px-6 md:px-8 py-3 rounded-md text-base md:text-lg font-medium transition-colors duration-200 inline-block"
          >
            Jetzt anfragen
          </a>
        </div>
      </section>

      {/* Contact Section */}
      <ContactFooter />
    </div>
  );
} 