import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Datenschutz',
  description: 'Datenschutzerklärung von Neck Tontechnik - Vincent, Leipzig. Informationen zum Datenschutz und zur DSGVO-konformen Datenverarbeitung.',
  robots: {
    index: false,
    follow: true,
  }
};

export default function Datenschutz() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] pt-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-text-primary)] mb-8">
          Datenschutzerklärung
        </h1>
        
        <div className="prose prose-lg prose-invert max-w-none text-[var(--color-text-secondary)]">
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">1. Datenschutz auf einen Blick</h2>
          
          <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-3">Allgemeine Hinweise</h3>
          <div className="mb-8">
            <p className="mb-4">
              Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.
            </p>
          </div>

          <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-3">Datenerfassung auf dieser Website</h3>
          <div className="mb-8">
            <p className="mb-4">
              <strong className="text-[var(--color-text-primary)]">Wer ist verantwortlich für die Datenerfassung auf dieser Website?</strong>
            </p>
            <p className="mb-4">
              Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen Kontaktdaten können Sie dem Impressum dieser Website entnehmen.
            </p>
            
            <p className="mb-4">
              <strong className="text-[var(--color-text-primary)]">Wie erfassen wir Ihre Daten?</strong>
            </p>
            <p className="mb-4">
              Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen. Hierbei kann es sich z.B. um Daten handeln, die Sie in ein Kontaktformular eingeben.
            </p>
            <p className="mb-4">
              Andere Daten werden automatisch oder nach Ihrer Einwilligung beim Besuch der Website durch unsere IT-Systeme erfasst. Das sind vor allem technische Daten (z.B. Internetbrowser, Betriebssystem oder Uhrzeit des Seitenaufrufs).
            </p>
          </div>

          <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">2. Hosting</h2>
          <div className="mb-8">
            <p className="mb-4">
              Wir hosten die Inhalte unserer Website bei folgendem Anbieter:
            </p>
            
            <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-3">Externes Hosting</h3>
            <p className="mb-4">
              Diese Website wird extern gehostet. Die personenbezogenen Daten, die auf dieser Website erfasst werden, werden auf den Servern des Hosters / der Hoster gespeichert. Hierbei kann es sich v. a. um IP-Adressen, Kontaktanfragen, Meta- und Kommunikationsdaten, Vertragsdaten, Kontaktdaten, Namen, Websitezugriffe und sonstige Daten, die über eine Website generiert werden, handeln.
            </p>
            <p className="mb-4">
              Das externe Hosting erfolgt zum Zwecke der Vertragserfüllung gegenüber unseren potenziellen und bestehenden Kunden (Art. 6 Abs. 1 lit. b DSGVO) und im Interesse einer sicheren, schnellen und effizienten Bereitstellung unseres Online-Angebots durch einen professionellen Anbieter (Art. 6 Abs. 1 lit. f DSGVO).
            </p>
          </div>

          <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">3. Allgemeine Hinweise und Pflichtinformationen</h2>
          
          <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-3">Datenschutz</h3>
          <div className="mb-8">
            <p className="mb-4">
              Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend den gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung.
            </p>
            <p className="mb-4">
              Wenn Sie diese Website benutzen, werden verschiedene personenbezogene Daten erhoben. Personenbezogene Daten sind Daten, mit denen Sie persönlich identifiziert werden können.
            </p>
          </div>

          <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-3">Hinweis zur verantwortlichen Stelle</h3>
          <div className="mb-8">
            <p className="mb-4">Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:</p>
            <p className="mb-4">
              Vincent [Nachname]<br />
              Neck Tontechnik<br />
              [Straße und Hausnummer]<br />
              [PLZ] [Stadt]<br />
              <br />
              E-Mail: vincent@neck-tontechnik.com
            </p>
            <p>
              Verantwortliche Stelle ist die natürliche oder juristische Person, die allein oder gemeinsam mit anderen über die Zwecke und Mittel der Verarbeitung von personenbezogenen Daten (z.B. Namen, E-Mail-Adressen o. Ä.) entscheidet.
            </p>
          </div>

          <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-3">Speicherdauer</h3>
          <div className="mb-8">
            <p>
              Soweit innerhalb dieser Datenschutzerklärung keine speziellere Speicherdauer genannt wurde, verbleiben Ihre personenbezogenen Daten bei uns, bis der Zweck für die Datenverarbeitung entfällt. Wenn Sie ein berechtigtes Löschersuchen geltend machen oder eine Einwilligung zur Datenverarbeitung widerrufen, werden Ihre Daten gelöscht, sofern wir keine anderen rechtlich zulässigen Gründe für die Speicherung Ihrer personenbezogenen Daten haben.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">4. Datenerfassung auf dieser Website</h2>
          
          <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-3">Server-Log-Dateien</h3>
          <div className="mb-8">
            <p className="mb-4">
              Der Provider der Seiten erhebt und speichert automatisch Informationen in so genannten Server-Log-Dateien, die Ihr Browser automatisch an uns übermittelt. Dies sind:
            </p>
            <ul className="list-disc list-inside mb-4 space-y-2">
              <li>Browsertyp und Browserversion</li>
              <li>verwendetes Betriebssystem</li>
              <li>Referrer URL</li>
              <li>Hostname des zugreifenden Rechners</li>
              <li>Uhrzeit der Serveranfrage</li>
              <li>IP-Adresse</li>
            </ul>
            <p>
              Eine Zusammenführung dieser Daten mit anderen Datenquellen wird nicht vorgenommen. Die Erfassung dieser Daten erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO.
            </p>
          </div>

          <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-3">Kontaktformular</h3>
          <div className="mb-8">
            <p className="mb-4">
              Wenn Sie uns per Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben aus dem Anfrageformular inklusive der von Ihnen dort angegebenen Kontaktdaten zwecks Bearbeitung der Anfrage und für den Fall von Anschlussfragen bei uns gespeichert.
            </p>
            <p>
              Die Verarbeitung dieser Daten erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO, sofern Ihre Anfrage mit der Erfüllung eines Vertrags zusammenhängt oder zur Durchführung vorvertraglicher Maßnahmen erforderlich ist. In allen übrigen Fällen beruht die Verarbeitung auf unserem berechtigten Interesse an der effektiven Bearbeitung der an uns gerichteten Anfragen (Art. 6 Abs. 1 lit. f DSGVO).
            </p>
          </div>

          <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-3">Anfrage per E-Mail oder Telefon</h3>
          <div className="mb-8">
            <p>
              Wenn Sie uns per E-Mail oder Telefon kontaktieren, wird Ihre Anfrage inklusive aller daraus hervorgehenden personenbezogenen Daten (Name, Anfrage) zum Zwecke der Bearbeitung Ihres Anliegens bei uns gespeichert und verarbeitet. Diese Daten geben wir nicht ohne Ihre Einwilligung weiter.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">5. Newsletter</h2>
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-3">Newsletter­daten</h3>
            <p className="mb-4">
              Wenn Sie den auf der Website angebotenen Newsletter beziehen möchten, benötigen wir von Ihnen eine E-Mail-Adresse sowie Informationen, welche uns die Überprüfung gestatten, dass Sie der Inhaber der angegebenen E-Mail-Adresse sind und mit dem Empfang des Newsletters einverstanden sind.
            </p>
            <p className="mb-4">
              Die Datenverarbeitung zum Zwecke des Newsletterversands erfolgt auf Grundlage Ihrer Einwilligung (Art. 6 Abs. 1 lit. a DSGVO). Eine erteilte Einwilligung zur Speicherung der Daten, der E-Mail-Adresse sowie deren Nutzung zum Versand des Newsletters können Sie jederzeit widerrufen.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">6. Ihre Rechte</h2>
          <div className="mb-8">
            <p className="mb-4">Sie haben jederzeit das Recht:</p>
            <ul className="list-disc list-inside mb-4 space-y-2">
              <li>Auskunft über Ihre bei uns gespeicherten personenbezogenen Daten zu erhalten</li>
              <li>Berichtigung unrichtiger personenbezogener Daten zu verlangen</li>
              <li>Löschung Ihrer bei uns gespeicherten personenbezogenen Daten zu verlangen</li>
              <li>Einschränkung der Verarbeitung Ihrer personenbezogenen Daten zu verlangen</li>
              <li>Widerspruch gegen die Verarbeitung Ihrer personenbezogenen Daten einzulegen</li>
              <li>Datenübertragbarkeit zu verlangen</li>
            </ul>
            <p>
              Bei Fragen zur Erhebung, Verarbeitung oder Nutzung Ihrer personenbezogenen Daten, bei Auskünften, Berichtigung, Sperrung oder Löschung von Daten sowie Widerruf von erteilten Einwilligungen wenden Sie sich bitte an: vincent@neck-tontechnik.com
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