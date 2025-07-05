'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
              >
                Home
              </Link>
              <Link 
                href="/leistungen" 
                className="text-white hover:text-blue-300 px-3 py-2 text-sm font-medium transition-colors duration-200"
              >
                Leistungen
              </Link>
              <Link 
                href="/referenzen" 
                className="text-white hover:text-blue-300 px-3 py-2 text-sm font-medium transition-colors duration-200"
              >
                Referenzen
              </Link>
              <Link 
                href="/ueber-mich" 
                className="text-white hover:text-blue-300 px-3 py-2 text-sm font-medium transition-colors duration-200"
              >
                Über Mich
              </Link>
              <Link 
                href="/contact" 
                className="text-white hover:text-blue-300 px-3 py-2 text-sm font-medium transition-colors duration-200"
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
              <Link
                href="/referenzen"
                className="text-white hover:text-blue-300 block px-3 py-2 text-base font-medium transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Referenzen
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