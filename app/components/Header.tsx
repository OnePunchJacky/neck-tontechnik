'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleDropdownToggle = (dropdown: string) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  const closeDropdowns = () => {
    setActiveDropdown(null);
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 0);
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (activeDropdown && !(event.target as Element).closest('.relative')) {
        setActiveDropdown(null);
      }
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeDropdown]);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-4 ${isScrolled ? 'bg-black bg-opacity-90' : 'bg-transparent'
      }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
          {/* Left side: Logo and Navigation */}
          <div className="flex items-center space-x-8">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center">
                <Image src="/nt-logo.png" alt="Neck Tontechnik" width={100} height={100} className="w-auto h-12" />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              <Link 
                href="/" 
                className="text-white hover:text-blue-300 px-3 py-2 text-sm font-medium transition-colors duration-200"
                onClick={closeDropdowns}
              >
                Home
              </Link>
              <Link 
                href="/leistungen" 
                className="text-white hover:text-blue-300 px-3 py-2 text-sm font-medium transition-colors duration-200"
                onClick={closeDropdowns}
              >
                Leistungen
              </Link>
              
              {/* Referenzen Dropdown */}
              <div className="relative">
                <button
                  onClick={() => handleDropdownToggle('referenzen')}
                  className="text-white hover:text-blue-300 px-3 py-2 text-sm font-medium transition-colors duration-200 flex items-center"
                >
                  Referenzen
                  <svg 
                    className={`ml-1 h-4 w-4 transition-transform ${activeDropdown === 'referenzen' ? 'rotate-180' : ''}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {activeDropdown === 'referenzen' && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-zinc-800 border border-zinc-700 rounded-md shadow-lg z-50">
                    <Link
                      href="/referenzen/recordings"
                      className="block px-4 py-2 text-sm text-white hover:bg-zinc-700 hover:text-blue-300 transition-colors"
                      onClick={closeDropdowns}
                    >
                      Recordings & Produktionen
                    </Link>
                    <Link
                      href="/referenzen/mastering"
                      className="block px-4 py-2 text-sm text-white hover:bg-zinc-700 hover:text-blue-300 transition-colors"
                      onClick={closeDropdowns}
                    >
                      Mastering Vergleiche
                    </Link>
                    <Link
                      href="/referenzen/live"
                      className="block px-4 py-2 text-sm text-white hover:bg-zinc-700 hover:text-blue-300 transition-colors"
                      onClick={closeDropdowns}
                    >
                      Live Events
                    </Link>
                  </div>
                )}
              </div>
              
              <Link 
                href="/equipment-verleih" 
                className="text-white hover:text-blue-300 px-3 py-2 text-sm font-medium transition-colors duration-200"
                onClick={closeDropdowns}
              >
                Equipment Verleih
              </Link>
              
              <Link 
                href="/ueber-mich" 
                className="text-white hover:text-blue-300 px-3 py-2 text-sm font-medium transition-colors duration-200"
                onClick={closeDropdowns}
              >
                Über Mich
              </Link>
              <Link 
                href="/contact" 
                className="text-white hover:text-blue-300 px-3 py-2 text-sm font-medium transition-colors duration-200"
                onClick={closeDropdowns}
              >
                Kontakt
              </Link>
            </nav>
          </div>

          {/* Right side: CTA Button */}
          <div className="hidden md:flex items-center">
            <Link 
              href="/contact" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
            >
              Anfrage
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-white hover:text-blue-300 focus:outline-none focus:text-blue-300"
              aria-label="Toggle menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-black bg-opacity-90 border-t border-gray-700">
              <Link
                href="/"
                className="text-white hover:text-blue-300 block px-3 py-2 text-base font-medium transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/leistungen"
                className="text-white hover:text-blue-300 block px-3 py-2 text-base font-medium transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Leistungen
              </Link>
              
              {/* Mobile Referenzen Section */}
              <div>
                <button
                  onClick={() => handleDropdownToggle('mobile-referenzen')}
                  className="text-white hover:text-blue-300 block px-3 py-2 text-base font-medium transition-colors duration-200 w-full text-left flex items-center justify-between"
                >
                  Referenzen
                  <svg 
                    className={`h-4 w-4 transition-transform ${activeDropdown === 'mobile-referenzen' ? 'rotate-180' : ''}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {activeDropdown === 'mobile-referenzen' && (
                  <div className="pl-6 space-y-1">
                    <Link
                      href="/referenzen/recordings"
                      className="text-gray-300 hover:text-blue-300 block px-3 py-2 text-sm font-medium transition-colors duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Recordings & Produktionen
                    </Link>
                    <Link
                      href="/referenzen/mastering"
                      className="text-gray-300 hover:text-blue-300 block px-3 py-2 text-sm font-medium transition-colors duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Mastering Vergleiche
                    </Link>
                    <Link
                      href="/referenzen/live"
                      className="text-gray-300 hover:text-blue-300 block px-3 py-2 text-sm font-medium transition-colors duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Live Events
                    </Link>
                  </div>
                )}
              </div>
              
              <Link
                href="/equipment-verleih"
                className="text-white hover:text-blue-300 block px-3 py-2 text-base font-medium transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Equipment Verleih
              </Link>
              
              <Link
                href="/ueber-mich"
                className="text-white hover:text-blue-300 block px-3 py-2 text-base font-medium transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Über Mich
              </Link>
              <Link
                href="/contact"
                className="text-white hover:text-blue-300 block px-3 py-2 text-base font-medium transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Kontakt
              </Link>
              <div className="pt-4">
                <Link
                  href="/contact"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium block text-center transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Anfrage
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
} 