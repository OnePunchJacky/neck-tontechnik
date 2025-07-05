export default function Leistungen() {
  return (
    <div className="min-h-screen bg-zinc-900">
      {/* Hero Section */}
      <section className="relative py-12 md:py-20 overflow-hidden">
        <div className="absolute inset-0 z-0 bg-[url('/magdeburg003-scaled.jpg')] bg-cover bg-center bg-fixed opacity-20"></div>
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4 md:px-8">
          <h1 className="text-3xl md:text-6xl font-bold text-white mb-4 md:mb-6 drop-shadow-2xl">
            Bock auf besseren Sound?
          </h1>
          <p className="text-lg md:text-2xl text-white leading-relaxed drop-shadow-2xl">
            Musik lebt von Emotion, Energie und Präzision – egal ob im Studio oder auf der Bühne. Mit meiner Erfahrung als Musiker und Tontechniker helfe ich dir, deinen Sound auf das nächste Level zu bringen.
          </p>
        </div>
      </section>

      {/* Main Services Section */}
      <section className="py-12 md:py-20 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-4 md:mb-6">
              Ob du deinen Mix veredeln willst oder ehrliches Feedback brauchst – ich helfe dir, den Sound zu erreichen, den dein Track verdient
            </h2>
          </div>

          {/* Mix & Mastering Section */}
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 md:gap-16 items-start mb-24 md:mb-32 min-h-[70vh]">
            <div className="text-white order-1">
              <h3 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-left">Mixing – Klare Definition, Druck und Transparenz für deinen Sound</h3>
              <p className="text-base md:text-lg leading-relaxed mb-6">
                Ein guter Mix bringt deine Musik auf das nächste Level. Ich sorge für klare Definition, ausgewogene Dynamik und den nötigen Punch – ob im Studio oder Live.
              </p>
              <a
                href="#contact"
                className="bg-white hover:bg-gray-100 text-black px-6 md:px-8 py-3 rounded-md text-base md:text-lg font-medium transition-colors duration-200 inline-block"
              >
                Jetzt anfragen
              </a>
            </div>
            <div className="order-2">
              <h4 className="text-6xl md:text-8xl font-bold text-white mb-8 text-right">Mix & Mastering</h4>
            </div>
          </div>

          {/* Mastering Section */}
          <div className="flex flex-col-reverse lg:grid lg:grid-cols-2 gap-8 md:gap-16 items-start mb-24 md:mb-32 min-h-[70vh]">
            <div className="order-1">
              <h4 className="text-6xl md:text-8xl font-bold text-white mb-8 text-left">Mastering</h4>
            </div>
            <div className="text-white order-2">
              <h3 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-right">Mastering – Perfekte Balance für jede Plattform und jedes Medium</h3>
              <p className="text-base md:text-lg leading-relaxed mb-6 text-right">
                Der letzte Feinschliff für deinen Sound. Ich optimiere deinen Mix für jede Streaming-Plattform, CD oder Vinyl und sorge für eine stimmige Lautheit und erhalte dabei die Dynamik und Klangtiefe deiner Produktion.
              </p>
              <div className="flex justify-end">
                <a
                  href="#contact"
                  className="bg-white hover:bg-gray-100 text-black px-6 md:px-8 py-3 rounded-md text-base md:text-lg font-medium transition-colors duration-200 inline-block"
                >
                  Jetzt anfragen
                </a>
              </div>
            </div>
          </div>

          {/* Musikproduktion Section */}
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 md:gap-16 items-start mb-24 md:mb-32 min-h-[70vh]">
            <div className="text-white order-1">
              <h3 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-left">Du hast einen Song, eine Idee oder einen unfertigen Track – und willst, dass daraus etwas richtig Gutes wird?</h3>
              <p className="text-base md:text-lg leading-relaxed mb-6">
                Ich begleite dich auf dem Weg von der ersten Skizze bis zur fertigen Produktion.
              </p>
              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 md:w-6 md:h-6 text-blue-500 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div className="text-sm md:text-base">
                    <strong className="text-white">Producing:</strong> Von der ersten Idee bis zur fertigen Produktion: Ich helfe Künstler*innen und Bands dabei, ihre musikalischen Visionen zu realisieren. Ob Arrangement, Sounddesign, als Musical Director oder kreativer Input – alles mit dem Ziel, das Beste aus der Musik herauszuholen.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 md:w-6 md:h-6 text-blue-500 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div className="text-sm md:text-base">
                    <strong className="text-white">Recording:</strong> Mit Gespür für Performance und Timing entstehen bei mir natürliche, dynamische Aufnahmen.
                  </div>
                </div>
              </div>
              <a
                href="#contact"
                className="bg-white hover:bg-gray-100 text-black px-6 md:px-8 py-3 rounded-md text-base md:text-lg font-medium transition-colors duration-200 inline-block"
              >
                Jetzt anfragen
              </a>
            </div>
            <div className="order-2">
              <h4 className="text-6xl md:text-8xl font-bold text-white mb-8 text-right">Musik-produktion</h4>
            </div>
          </div>

          {/* Live Section */}
          <div className="flex flex-col-reverse lg:grid lg:grid-cols-2 gap-8 md:gap-16 items-start mb-24 md:mb-32 min-h-[70vh]">
            <div className="order-1">
              <h4 className="text-6xl md:text-8xl font-bold text-white mb-8 text-left">Live</h4>
            </div>
            <div className="text-white order-2">
              <h3 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-right">Ich sorge für einen professionellen Sound auf jeder Bühne – vom Clubgig bis zum Festival</h3>
              <p className="text-base md:text-lg leading-relaxed mb-6 text-right">
                Als Musiker kenne ich beide Seiten des Mischpults und weiß, worauf es ankommt.
              </p>
              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 md:w-6 md:h-6 text-blue-500 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div className="text-sm md:text-base">
                    <strong className="text-white">Monitoring – Sicher auf der Bühne:</strong> Als Musiker weiß ich, wie essentiell ein gutes Monitoring für eine souveräne Performance ist. Ich sorge für ein klares, gut abgestimmtes Monitorsystem – egal ob In-Ear oder Wedges – damit sich alle auf der Bühne sicher fühlen und ihre beste Show abliefern können.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 md:w-6 md:h-6 text-blue-500 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div className="text-sm md:text-base">
                    <strong className="text-white">Front of House – Der perfekte Live-Sound:</strong> Eine Liveshow muss nicht nur laut sein – sie muss Emotionen transportieren. Durch meine Erfahrung im Studio habe ich ein Gespür dafür, wie sich Musik auch live druckvoll, ausgewogen und detailreich auf das Publikum übertragen lässt.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 md:w-6 md:h-6 text-blue-500 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div className="text-sm md:text-base">
                    <strong className="text-white">Stagetech/Backline:</strong> Ein reibungsloser technischer Ablauf ist die Basis für eine starke Performance. Ich übernehme die komplette technische Planung für deine Show und kümmere mich um Bühnenverkabelung, Mikrofonierung, Backline Aufbau und Pflege. So läuft alles rund – vom ersten Ton bis zum letzten Applaus.
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <a
                  href="#contact"
                  className="bg-white hover:bg-gray-100 text-black px-6 md:px-8 py-3 rounded-md text-base md:text-lg font-medium transition-colors duration-200 inline-block"
                >
                  Jetzt anfragen
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Test Mastering Section */}
      <section className="py-12 md:py-20 px-4 md:px-8 bg-zinc-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-4xl font-bold text-white mb-4 md:mb-6">
            Kostenloses Test-Mastering
          </h2>
          <p className="text-lg md:text-xl text-gray-300 mb-6 md:mb-8">
            Hole dir jetzt dein kostenloses Test-Master oder ein individuelles Mix-/Mastering-Angebot! Gerne können wir auch über <strong className="text-white">Bundle-Preise</strong> sprechen. Schreibe mir hier und teile mir mehr über deine Musik und Vision mit.
          </p>
          <a
            href="#contact"
            className="bg-white hover:bg-gray-100 text-black px-6 md:px-8 py-3 rounded-md text-base md:text-lg font-medium transition-colors duration-200 inline-block"
          >
            Jetzt anfragen
          </a>
        </div>
      </section>

      {/* Recording Section */}
      <section className="py-12 md:py-20 px-4 md:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-4xl font-bold text-white mb-4 md:mb-6">
            Du hast eine Vision, aber noch keine qualitativen Aufnahmen?
          </h2>
          <p className="text-lg md:text-xl text-gray-300 mb-6 md:mb-8">
            Ich biete auch <strong className="text-white">Recordings</strong> an und fange deine Ideen mit hochwertigem Equipment ein. Gern komme ich dafür auch mit meinem mobilen Equipment zu dir!
          </p>
          <a
            href="#contact"
            className="bg-white hover:bg-gray-100 text-black px-6 md:px-8 py-3 rounded-md text-base md:text-lg font-medium transition-colors duration-200 inline-block"
          >
            Jetzt anfragen
          </a>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-12 md:py-20 px-4 md:px-8 bg-zinc-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-4xl font-bold text-white mb-4 md:mb-6">
            Let's get in touch
          </h2>
          <p className="text-lg md:text-xl text-gray-300 mb-6 md:mb-8">
            Bereit für dein nächstes Projekt? Lass uns gemeinsam deine Audio-Vision verwirklichen.
          </p>
          <a
            href="#contact"
            className="bg-white hover:bg-gray-100 text-black px-6 md:px-8 py-3 rounded-md text-base md:text-lg font-medium transition-colors duration-200 inline-block"
          >
            Kontakt aufnehmen
          </a>
        </div>
      </section>
    </div>
  );
} 