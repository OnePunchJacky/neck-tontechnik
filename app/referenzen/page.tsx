import ContactFooter from '../components/ContactFooter';

export default function Referenzen() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Referenzen
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Erfolgreich umgesetzte Projekte und zufriedene Kunden - ein Überblick über unsere Arbeit
            </p>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Ausgewählte Projekte
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Project 1 */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-64 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <svg className="w-24 h-24 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  Stadthalle München
                </h3>
                <p className="text-gray-600 mb-4">
                  Komplette Beschallungsanlage für die neu renovierte Stadthalle mit 2000 Plätzen. 
                  Installation eines modernen Line-Array-Systems mit digitaler Signalverarbeitung.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">Line-Array</span>
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">DSP</span>
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">2000 Plätze</span>
                </div>
                <p className="text-sm text-gray-500">
                  <strong>Jahr:</strong> 2023 | <strong>Kategorie:</strong> Veranstaltungsort
                </p>
              </div>
            </div>

            {/* Project 2 */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-64 bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center">
                <svg className="w-24 h-24 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  St. Michael Kirche
                </h3>
                <p className="text-gray-600 mb-4">
                  Sanierung der Beschallungsanlage in der historischen St. Michael Kirche. 
                  Integration moderner Technik unter Berücksichtigung des denkmalgeschützten Gebäudes.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">Kirchen-Sound</span>
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">Denkmalschutz</span>
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">800 Plätze</span>
                </div>
                <p className="text-sm text-gray-500">
                  <strong>Jahr:</strong> 2023 | <strong>Kategorie:</strong> Kirche
                </p>
              </div>
            </div>

            {/* Project 3 */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-64 bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                <svg className="w-24 h-24 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  Konferenzzentrum Frankfurt
                </h3>
                <p className="text-gray-600 mb-4">
                  Multifunktionale Beschallungsanlage für das neue Konferenzzentrum. 
                  Flexible Systeme für verschiedene Veranstaltungsformate von 50 bis 500 Teilnehmern.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded">Konferenz</span>
                  <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded">Multifunktional</span>
                  <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded">500 Plätze</span>
                </div>
                <p className="text-sm text-gray-500">
                  <strong>Jahr:</strong> 2022 | <strong>Kategorie:</strong> Konferenzzentrum
                </p>
              </div>
            </div>

            {/* Project 4 */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-64 bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                <svg className="w-24 h-24 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  Jazz Club "Blue Note"
                </h3>
                <p className="text-gray-600 mb-4">
                  Komplette Neugestaltung der Beschallungsanlage für den renommierten Jazz Club. 
                  Optimierung für akustische Instrumente und intime Atmosphäre.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded">Jazz</span>
                  <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded">Akustik</span>
                  <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded">150 Plätze</span>
                </div>
                <p className="text-sm text-gray-500">
                  <strong>Jahr:</strong> 2022 | <strong>Kategorie:</strong> Club
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Kundenstimmen
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Testimonial 1 */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">MS</span>
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900">Michael Schmidt</h4>
                  <p className="text-sm text-gray-600">Stadthalle München</p>
                </div>
              </div>
              <p className="text-gray-700 italic">
                "Neck Tontechnik hat unsere Stadthalle mit einer erstklassigen Beschallungsanlage ausgestattet. 
                Die Qualität und der Service waren überragend. Sehr empfehlenswert!"
              </p>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-semibold">PF</span>
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900">Pfarrer Fischer</h4>
                  <p className="text-sm text-gray-600">St. Michael Kirche</p>
                </div>
              </div>
              <p className="text-gray-700 italic">
                "Die Integration der neuen Beschallungsanlage in unser historisches Gebäude war eine Herausforderung, 
                die Neck Tontechnik meisterhaft gelöst hat. Die Gemeinde ist begeistert."
              </p>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-semibold">AW</span>
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900">Anna Weber</h4>
                  <p className="text-sm text-gray-600">Konferenzzentrum Frankfurt</p>
                </div>
              </div>
              <p className="text-gray-700 italic">
                "Die flexible Beschallungsanlage ermöglicht uns verschiedene Veranstaltungsformate. 
                Die Bedienung ist intuitiv und der Support ist immer erreichbar."
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="bg-blue-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-white mb-2">150+</div>
              <div className="text-blue-100">Projekte</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">25+</div>
              <div className="text-blue-100">Jahre Erfahrung</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">98%</div>
              <div className="text-blue-100">Zufriedene Kunden</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">24/7</div>
              <div className="text-blue-100">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <ContactFooter />
    </div>
  );
} 