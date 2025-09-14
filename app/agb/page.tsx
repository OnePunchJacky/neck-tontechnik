import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'AGB',
  description: 'Allgemeine Geschäftsbedingungen von Neck Tontechnik - Vincent, Leipzig. Bedingungen für Tontechnik-Services und Equipment-Verleih.',
  robots: {
    index: false,
    follow: true,
  }
};

export default function AGB() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] pt-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-text-primary)] mb-8">
          Allgemeine Geschäftsbedingungen (AGB)
        </h1>
        
        <div className="prose prose-lg prose-invert max-w-none text-[var(--color-text-secondary)]">
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">§ 1 Geltungsbereich</h2>
          <div className="mb-8">
            <p className="mb-4">
              Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Verträge über tontechnische Dienstleistungen zwischen Vincent [Nachname] (nachfolgend "Anbieter") und dem Auftraggeber (nachfolgend "Kunde").
            </p>
            <p>
              Abweichende Bedingungen des Kunden werden nur wirksam, wenn sie ausdrücklich schriftlich anerkannt werden.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">§ 2 Vertragsgegenstand</h2>
          <div className="mb-8">
            <p className="mb-4">Der Anbieter erbringt folgende Dienstleistungen:</p>
            <ul className="list-disc list-inside mb-4 space-y-2">
              <li>Mixing und Mastering von Audioaufnahmen</li>
              <li>Musikproduktion und Recording</li>
              <li>Live-Tontechnik (FoH, Monitoring, Stagetech)</li>
              <li>Equipment-Verleih</li>
              <li>Beratungsleistungen im Bereich Tontechnik</li>
            </ul>
            <p>
              Der genaue Leistungsumfang ergibt sich aus der jeweiligen Auftragsbestätigung oder dem geschlossenen Vertrag.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">§ 3 Vertragsschluss</h2>
          <div className="mb-8">
            <p className="mb-4">
              Angebote des Anbieters sind freibleibend und unverbindlich. Ein Vertrag kommt erst durch schriftliche Auftragsbestätigung oder durch Beginn der Leistungserbringung zustande.
            </p>
            <p>
              Mündliche Nebenabreden bedürfen zu ihrer Wirksamkeit der schriftlichen Bestätigung.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">§ 4 Preise und Zahlungsbedingungen</h2>
          <div className="mb-8">
            <p className="mb-4">
              Es gelten die zum Zeitpunkt der Auftragserteilung gültigen Preise. Alle Preise verstehen sich zzgl. der gesetzlichen Mehrwertsteuer.
            </p>
            <p className="mb-4">
              <strong className="text-[var(--color-text-primary)]">Zahlungsbedingungen:</strong>
            </p>
            <ul className="list-disc list-inside mb-4 space-y-2">
              <li>Bei Projekten bis 500€: Zahlung nach Fertigstellung</li>
              <li>Bei Projekten über 500€: 50% Anzahlung, Rest nach Fertigstellung</li>
              <li>Equipment-Verleih: Vollständige Zahlung vor Übergabe</li>
            </ul>
            <p>
              Zahlungsfrist: 14 Tage netto. Bei Zahlungsverzug werden Verzugszinsen in Höhe von 9% über dem Basiszinssatz berechnet.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">§ 5 Leistungserbringung und Termine</h2>
          <div className="mb-8">
            <p className="mb-4">
              Vereinbarte Termine sind nach Möglichkeit einzuhalten. Sie sind nur dann verbindlich, wenn sie ausdrücklich als verbindlich vereinbart wurden.
            </p>
            <p>
              Der Anbieter ist berechtigt, Unterauftragnehmer zur Erfüllung seiner Verpflichtungen einzusetzen.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">§ 6 Mitwirkungspflichten des Kunden</h2>
          <div className="mb-8">
            <p className="mb-4">Der Kunde verpflichtet sich:</p>
            <ul className="list-disc list-inside mb-4 space-y-2">
              <li>Alle für die Leistungserbringung erforderlichen Unterlagen rechtzeitig bereitzustellen</li>
              <li>Audiomaterial in vereinbarter Qualität und Format zu liefern</li>
              <li>Bei Live-Events für ordnungsgemäße Rahmenbedingungen zu sorgen</li>
              <li>Entliehenes Equipment pfleglich zu behandeln und termingerecht zurückzugeben</li>
            </ul>
          </div>

          <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">§ 7 Equipment-Verleih</h2>
          <div className="mb-8">
            <p className="mb-4">Besondere Bedingungen für den Equipment-Verleih:</p>
            <ul className="list-disc list-inside mb-4 space-y-2">
              <li>Der Kunde haftet für Beschädigungen und Verlust</li>
              <li>Bei verspäteter Rückgabe wird die nächste Mietperiode berechnet</li>
              <li>Das Equipment ist in gereinigtem Zustand zurückzugeben</li>
              <li>Eine Kaution kann verlangt werden</li>
            </ul>
          </div>

          <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">§ 8 Urheberrecht und Nutzungsrechte</h2>
          <div className="mb-8">
            <p className="mb-4">
              Der Kunde versichert, dass er über alle erforderlichen Rechte an dem zu bearbeitenden Material verfügt.
            </p>
            <p className="mb-4">
              Die erstellten Werke (Mixes, Masters, Aufnahmen) dürfen vom Anbieter zu Referenzzwecken und Eigenwerbung verwendet werden, sofern nicht ausdrücklich anders vereinbart.
            </p>
            <p>
              Alle Nutzungsrechte am fertiggestellten Material verbleiben beim Kunden.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">§ 9 Gewährleistung und Haftung</h2>
          <div className="mb-8">
            <p className="mb-4">
              Der Anbieter erbringt seine Leistungen nach bestem Wissen und mit der erforderlichen Sorgfalt. Eine Gewährleistung für den künstlerischen oder kommerziellen Erfolg wird nicht übernommen.
            </p>
            <p className="mb-4">
              Bei Mängeln hat der Kunde zunächst Anspruch auf Nacherfüllung. Schlägt diese fehl, kann der Kunde Minderung oder Rücktritt verlangen.
            </p>
            <p>
              Die Haftung ist auf Vorsatz und grobe Fahrlässigkeit beschränkt, außer bei Schäden an Leben, Körper oder Gesundheit.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">§ 10 Kündigung und Stornierung</h2>
          <div className="mb-8">
            <p className="mb-4">
              Stornierungen sind grundsätzlich möglich, jedoch können Stornogebühren anfallen:
            </p>
            <ul className="list-disc list-inside mb-4 space-y-2">
              <li>Bis 14 Tage vor Termin: kostenfrei</li>
              <li>7-14 Tage vor Termin: 50% der Vertragssumme</li>
              <li>Unter 7 Tage vor Termin: 100% der Vertragssumme</li>
            </ul>
          </div>

          <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">§ 11 Datenschutz</h2>
          <div className="mb-8">
            <p>
              Der Anbieter behandelt alle Kundendaten vertraulich und gemäß der geltenden Datenschutzbestimmungen. Details regelt die separate Datenschutzerklärung.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">§ 12 Schlussbestimmungen</h2>
          <div className="mb-8">
            <p className="mb-4">
              Es gilt deutsches Recht unter Ausschluss des UN-Kaufrechts.
            </p>
            <p className="mb-4">
              Erfüllungsort und Gerichtsstand ist [Stadt des Anbieters].
            </p>
            <p>
              Sollten einzelne Bestimmungen unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.
            </p>
          </div>

          <div className="mt-12 p-4 bg-[var(--color-surface)] rounded-lg">
            <p className="text-sm">
              <strong className="text-[var(--color-text-primary)]">Stand:</strong> [Aktuelles Datum]<br />
              <strong className="text-[var(--color-text-primary)]">Neck Tontechnik</strong><br />
              Vincent [Nachname]
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}