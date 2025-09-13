import ContactFooter from '../components/ContactFooter';

export default function Leistungen() {
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
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 md:gap-16 items-start min-h-[70vh] mb-16 lg:mb-0">
            <div className="text-[var(--color-text-primary)] order-2 lg:order-1">
              <h4 className="text-base md:text-lg leading-relaxed mb-8">
                Ob du deinen Mix veredeln willst oder ehrliches Feedback brauchst – ich helfe dir, den Sound zu erreichen, den dein Track verdient
              </h4>
              <ul className="list-disc mb-4 md:mb-6 text-left pl-4">
                <li className="font-bold mb-4 md:mb-6 text-left"><b>Mixing – Klare Definition, Druck und Transparenz für deinen Sound: </b>
                  Ein guter Mix bringt deine Musik auf das nächste Level. Ich sorge für klare Definition, ausgewogene Dynamik und den nötigen Punch – oh im Studio oder Live
                </li>
                <li className="font-bold mb-4 md:mb-6 text-left"><b>Mastering – Perfekte Balance für jede Plattform und jedes Medium: </b>
                  Der letzte Feinschliff für deinen Sound. Ich optimiere deinen Mix für jede Streaming-Plattform, CD oder Vinyl und sorge für eine stimmige Lautheit und erhalte dabei die Dynamik und Klangtiefe deiner Produktion.
                </li>
                <li className="font-bold mb-4 md:mb-6 text-left"><b>Mastering für Live Versionen: </b>
                  Spezielle Optimierung deiner Tracks für Live-Performances. Ich sorge dafür, dass deine Musik auf großen PA-Systemen kraftvoll und definiert klingt, ohne dabei die Nuancen zu verlieren.
                </li>
              </ul>
              <div className="flex justify-center lg:justify-start">
                <a
                  href="#contact"
                  className="bg-[var(--color-primary-100)] hover:bg-[var(--color-primary-50)] text-[var(--color-text-dark)] px-6 md:px-8 py-3 rounded-md text-base md:text-lg font-medium transition-colors duration-200 inline-block"
                >
                  Jetzt anfragen
                </a>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h4 className="text-6xl md:text-8xl font-bold text-[var(--color-text-primary)] mb-8 text-center lg:text-right">Mix & Mastering</h4>
            </div>
          </div>

          {/* Musikproduktion Section */}
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 md:gap-16 items-start min-h-[70vh] mb-16 lg:mb-0">
            <div className="order-1 lg:order-1">
              <h4 className="text-6xl md:text-8xl font-bold text-[var(--color-text-primary)] mb-8 text-center lg:text-left">Musik-produktion</h4>
            </div>
            <div className="text-[var(--color-text-primary)] order-2 lg:order-2">
              <h4 className="text-base md:text-lg leading-relaxed mb-8 text-left lg:text-right">
                Du hast einen Song, eine Idee oder einen unfertigen Track – und willst, dass daraus etwas richtig Gutes wird? Ich begleite dich auf dem Weg von der ersten Skizze bis zur fertigen Produktion.
              </h4>
              <ul className="list-disc mb-4 md:mb-6 text-left lg:text-right lg:list-none pl-4 lg:pl-0">
                <li className="font-bold mb-4 md:mb-6 text-left lg:text-right"><b>Producing: </b>
                  Von der ersten Idee bis zur fertigen Produktion: Ich helfe Künstler*innen und Bands dabei, ihre musikalischen Visionen zu realisieren. Ob Arrangement, Sounddesign, als Musical Director oder kreativer Input – alles mit dem Ziel, das Beste aus der Musik herauszuholen.
                </li>
                <li className="font-bold mb-4 md:mb-6 text-left lg:text-right"><b>Recording: </b>
                  Mit Gespür für Performance und Timing entstehen bei mir natürliche, dynamische Aufnahmen.
                </li>
              </ul>
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

          {/* Live Section */}
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 md:gap-16 items-start min-h-[70vh] mb-16 lg:mb-0">
            <div className="text-[var(--color-text-primary)] order-2 lg:order-1">
              <h4 className="text-base md:text-lg leading-relaxed mb-8 text-left">
                Ich sorge für einen professionellen Sound auf jeder Bühne – vom Clubgig bis zum Festival. Als Musiker kenne ich beide Seiten des Mischpults und weiß, worauf es ankommt.
              </h4>
              <ul className="list-disc mb-4 md:mb-6 text-left pl-4">
                <li className="font-bold mb-4 md:mb-6 text-left"><b>Monitoring – Sicher auf der Bühne: </b>
                  Als Musiker weiß ich, wie essentiell ein gutes Monitoring für eine souveräne Performance ist. Ich sorge für ein klares, gut abgestimmtes Monitorsystem – egal ob In-Ear oder Wedges – damit sich alle auf der Bühne sicher fühlen und ihre beste Show abliefern können.
                </li>
                <li className="font-bold mb-4 md:mb-6 text-left"><b>Front of House – Der perfekte Live-Sound: </b>
                  Eine Liveshow muss nicht nur laut sein – sie muss Emotionen transportieren. Durch meine Erfahrung im Studio habe ich ein Gespür dafür, wie sich Musik auch live druckvoll, ausgewogen und detailreich auf das Publikum übertragen lässt.
                </li>
                <li className="font-bold mb-4 md:mb-6 text-left"><b>Stagetech/Backline: </b>
                  Ein reibungsloser technischer Ablauf ist die Basis für eine starke Performance. Ich übernehme die komplette technische Planung für deine Show und kümmere mich um Bühnenverkabelung, Mikrofonierung, Backline Aufbau und Pflege. So läuft alles rund – vom ersten Ton bis zum letzten Applaus.
                </li>
              </ul>
              <div className="flex justify-center lg:justify-start">
                <a
                  href="#contact"
                  className="bg-[var(--color-primary-100)] hover:bg-[var(--color-primary-50)] text-[var(--color-text-dark)] px-6 md:px-8 py-3 rounded-md text-base md:text-lg font-medium transition-colors duration-200 inline-block"
                >
                  Jetzt anfragen
                </a>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h4 className="text-6xl md:text-8xl font-bold text-[var(--color-text-primary)] mb-8 text-center lg:text-right">Live</h4>
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