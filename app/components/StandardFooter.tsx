import Link from 'next/link';
import Image from 'next/image';

export default function StandardFooter() {
  return (
    <footer className="bg-zinc-900 border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center mb-4">
              <Image 
                src="/nt-logo.png" 
                alt="Neck Tontechnik" 
                width={100} 
                height={100} 
                className="w-auto h-12" 
              />
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              Professionelle Tontechnik-Lösungen für Studio, Live und Veranstaltungen. 
              Vom Recording bis zum Mastering – mit Leidenschaft für perfekten Sound.
            </p>
            <div className="flex space-x-4">
              {/* Social Media Links */}
              <a
                href="https://www.linkedin.com/in/vincent-neck/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="LinkedIn"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Navigation</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/leistungen" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Leistungen
                </Link>
              </li>
              <li>
                <Link href="/referenzen" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Referenzen
                </Link>
              </li>
              <li>
                <Link href="/recordings" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Recordings
                </Link>
              </li>
              <li>
                <Link href="/ueber-mich" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Über Mich
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              <li>
                <span className="text-gray-400 text-sm">Musikproduktion</span>
              </li>
              <li>
                <span className="text-gray-400 text-sm">Mixing & Mastering</span>
              </li>
              <li>
                <span className="text-gray-400 text-sm">Live-Tontechnik</span>
              </li>
              <li>
                <span className="text-gray-400 text-sm">Recording</span>
              </li>
              <li>
                <span className="text-gray-400 text-sm">Workshops</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-zinc-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © {new Date().getFullYear()} Neck Tontechnik. Alle Rechte vorbehalten.
            </div>
            <div className="flex space-x-6">
              <Link href="/impressum" className="text-gray-400 hover:text-white transition-colors text-sm">
                Impressum
              </Link>
              <Link href="/datenschutz" className="text-gray-400 hover:text-white transition-colors text-sm">
                Datenschutz
              </Link>
              <Link href="/agb" className="text-gray-400 hover:text-white transition-colors text-sm">
                AGB
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}