import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Impressum',
  description: 'Impressum und rechtliche Angaben von Neck Tontechnik - Vincent, Leipzig. Tontechnik-Dienstleistungen und Equipment-Verleih.',
  robots: {
    index: false,
    follow: true,
  }
};

export default function Impressum() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] pt-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-text-primary)] mb-8">
          Impressum
        </h1>
        
        <div className="prose prose-lg prose-invert max-w-none text-[var(--color-text-secondary)]">
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">Angaben gemäß § 5 TMG</h2>
          
          <div className="mb-8">
            <p className="mb-2">
              <strong className="text-[var(--color-text-primary)]">Vincent [Nachname]</strong><br />
              Neck Tontechnik<br />
              [Straße und Hausnummer]<br />
              [PLZ] [Stadt]
            </p>
          </div>

          <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">Kontakt</h2>
          <div className="mb-8">
            <p className="mb-2">
              <strong className="text-[var(--color-text-primary)]">E-Mail:</strong> vincent[at]neck-tontechnik.com
            </p>
          </div>

          <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">Umsatzsteuer-ID</h2>
          <div className="mb-8">
            <p className="mb-2">
              Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:<br />
              [USt-IdNr. falls vorhanden]
            </p>
          </div>

          <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">Redaktionell verantwortlich</h2>
          <div className="mb-8">
            <p className="mb-2">
              Vincent [Nachname]<br />
              [Adresse wie oben]
            </p>
          </div>

          <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">EU-Streitschlichtung</h2>
          <div className="mb-8">
            <p className="mb-4">
              Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:
              <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent-green)] hover:underline ml-1">
                https://ec.europa.eu/consumers/odr/
              </a>
            </p>
            <p>Unsere E-Mail-Adresse finden Sie oben im Impressum.</p>
          </div>

          <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">Verbraucherstreitbeilegung/Universalschlichtungsstelle</h2>
          <div className="mb-8">
            <p>
              Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">Haftung für Inhalte</h2>
          <div className="mb-8">
            <p className="mb-4">
              Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht unter der Verpflichtung, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
            </p>
            <p>
              Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">Haftung für Links</h2>
          <div className="mb-8">
            <p className="mb-4">
              Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar.
            </p>
            <p>
              Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Links umgehend entfernen.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">Urheberrecht</h2>
          <div className="mb-8">
            <p className="mb-4">
              Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers. Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch gestattet.
            </p>
            <p>
              Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden, werden die Urheberrechte Dritter beachtet. Insbesondere werden Inhalte Dritter als solche gekennzeichnet. Sollten Sie trotzdem auf eine Urheberrechtsverletzung aufmerksam werden, bitten wir um einen entsprechenden Hinweis. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Inhalte umgehend entfernen.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}