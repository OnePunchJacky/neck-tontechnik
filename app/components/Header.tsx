'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);

  const toggleMenu = () => {
    if (isMenuOpen) {
      setIsClosing(true);
      setTimeout(() => {
        setIsMenuOpen(false);
        setIsClosing(false);
        setActiveDropdown(null);
      }, 300);
    } else {
      setIsMenuOpen(true);
      setIsClosing(false);
    }
  };

  const closeMenu = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsMenuOpen(false);
      setIsClosing(false);
      setActiveDropdown(null);
    }, 300);
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
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-4 ${isScrolled ? 'bg-[var(--color-bg-dark)] bg-opacity-90' : 'bg-transparent'
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
                className="text-[var(--color-text-primary)] hover:text-[var(--color-primary-200)] px-3 py-2 text-sm font-medium transition-colors duration-200"
                onClick={closeDropdowns}
              >
                Home
              </Link>
              <Link 
                href="/leistungen" 
                className="text-[var(--color-text-primary)] hover:text-[var(--color-primary-200)] px-3 py-2 text-sm font-medium transition-colors duration-200"
                onClick={closeDropdowns}
              >
                Leistungen
              </Link>
              
              {/* Referenzen Dropdown */}
              <div className="relative">
                <button
                  onClick={() => handleDropdownToggle('referenzen')}
                  className="text-[var(--color-text-primary)] hover:text-[var(--color-primary-200)] px-3 py-2 text-sm font-medium transition-colors duration-200 flex items-center"
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
                  <div className="absolute top-full left-0 mt-1 w-48 bg-[var(--color-surface)] border border-[var(--color-neutral)] rounded-md shadow-lg z-50">
                    <Link
                      href="/referenzen/recordings"
                      className="block px-4 py-2 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-surface-light)] hover:text-[var(--color-primary-200)] transition-colors"
                      onClick={closeDropdowns}
                    >
                      Recordings & Produktionen
                    </Link>
                    <Link
                      href="/referenzen/mastering"
                      className="block px-4 py-2 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-surface-light)] hover:text-[var(--color-primary-200)] transition-colors"
                      onClick={closeDropdowns}
                    >
                      Mastering Vergleiche
                    </Link>
                    <Link
                      href="/referenzen/live"
                      className="block px-4 py-2 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-surface-light)] hover:text-[var(--color-primary-200)] transition-colors"
                      onClick={closeDropdowns}
                    >
                      Live Events
                    </Link>
                  </div>
                )}
              </div>

              {/* Equipment Verleih - Hidden until fully implemented
              <Link
                href="/equipment-verleih"
                className="text-[var(--color-text-primary)] hover:text-[var(--color-primary-200)] px-3 py-2 text-sm font-medium transition-colors duration-200"
                onClick={closeDropdowns}
              >
                Equipment Verleih
              </Link>
              */}

              <Link 
                href="/ueber-mich" 
                className="text-[var(--color-text-primary)] hover:text-[var(--color-primary-200)] px-3 py-2 text-sm font-medium transition-colors duration-200"
                onClick={closeDropdowns}
              >
                Über Mich
              </Link>
              <Link 
                href="/contact" 
                className="text-[var(--color-text-primary)] hover:text-[var(--color-primary-200)] px-3 py-2 text-sm font-medium transition-colors duration-200"
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
              className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-600)] text-[var(--color-text-primary)] px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
            >
              Anfrage
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-[var(--color-text-primary)] hover:text-[var(--color-primary-200)] focus:outline-none focus:text-[var(--color-primary-200)]"
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

        {/* Mobile Navigation - Full Screen */}
        {isMenuOpen && (
          <div className={`fixed inset-0 z-40 md:hidden ${isClosing ? 'animate-slide-out-bottom' : 'animate-slide-in-bottom'}`}>
            {/* Backdrop */}
            <div className="absolute inset-0 bg-[var(--color-bg)] bg-opacity-95 backdrop-blur-sm" onClick={closeMenu} />
            
            {/* Menu Content */}
            <div className="relative h-full flex flex-col justify-center items-center px-8">
              
              {/* Main Navigation Items */}
              <nav className="flex flex-col items-center space-y-8 text-center">
                <Link
                  href="/"
                  className="animate-stagger-item animate-stagger-1 text-3xl font-bold text-[var(--color-text-primary)] hover:text-[var(--color-primary-200)] transition-colors duration-300"
                  onClick={closeMenu}
                >
                  Home
                </Link>
                
                <Link
                  href="/leistungen"
                  className="animate-stagger-item animate-stagger-2 text-3xl font-bold text-[var(--color-text-primary)] hover:text-[var(--color-primary-200)] transition-colors duration-300"
                  onClick={closeMenu}
                >
                  Leistungen
                </Link>
                
                {/* Referenzen with Submenu */}
                <div className="animate-stagger-item animate-stagger-3 flex flex-col items-center space-y-4">
                  <button
                    onClick={() => handleDropdownToggle('mobile-referenzen')}
                    className="text-3xl font-bold text-[var(--color-text-primary)] hover:text-[var(--color-primary-200)] transition-colors duration-300 flex items-center"
                  >
                    Referenzen
                    <svg 
                      className={`ml-2 h-6 w-6 transition-transform duration-300 ${activeDropdown === 'mobile-referenzen' ? 'rotate-180' : ''}`} 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {activeDropdown === 'mobile-referenzen' && (
                    <div className="flex flex-col items-center space-y-3 mt-4">
                      <Link
                        href="/referenzen/recordings"
                        className="text-lg text-[var(--color-text-secondary)] hover:text-[var(--color-primary-200)] transition-colors duration-300"
                        onClick={closeMenu}
                      >
                        Recordings & Produktionen
                      </Link>
                      <Link
                        href="/referenzen/mastering"
                        className="text-lg text-[var(--color-text-secondary)] hover:text-[var(--color-primary-200)] transition-colors duration-300"
                        onClick={closeMenu}
                      >
                        Mastering Vergleiche
                      </Link>
                      <Link
                        href="/referenzen/live"
                        className="text-lg text-[var(--color-text-secondary)] hover:text-[var(--color-primary-200)] transition-colors duration-300"
                        onClick={closeMenu}
                      >
                        Live Events
                      </Link>
                    </div>
                  )}
                </div>

                {/* Equipment Verleih - Hidden until fully implemented
                <Link
                  href="/equipment-verleih"
                  className="animate-stagger-item animate-stagger-4 text-3xl font-bold text-[var(--color-text-primary)] hover:text-[var(--color-primary-200)] transition-colors duration-300"
                  onClick={closeMenu}
                >
                  Equipment Verleih
                </Link>
                */}

                <Link
                  href="/ueber-mich"
                  className="animate-stagger-item animate-stagger-4 text-3xl font-bold text-[var(--color-text-primary)] hover:text-[var(--color-primary-200)] transition-colors duration-300"
                  onClick={closeMenu}
                >
                  Über Mich
                </Link>
                
                <Link
                  href="/contact"
                  className="animate-stagger-item animate-stagger-6 text-3xl font-bold text-[var(--color-text-primary)] hover:text-[var(--color-primary-200)] transition-colors duration-300"
                  onClick={closeMenu}
                >
                  Kontakt
                </Link>
              </nav>
              
              {/* CTA Button */}
              <div className="animate-stagger-item animate-stagger-7 mt-12">
                <Link
                  href="/contact"
                  className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-600)] text-[var(--color-text-primary)] px-8 py-4 rounded-lg text-xl font-bold transition-all duration-300 transform hover:scale-105"
                  onClick={closeMenu}
                >
                  Jetzt Anfragen
                </Link>
              </div>
              
              {/* Close Button */}
              <button
                onClick={closeMenu}
                className="absolute top-8 right-8 text-[var(--color-text-primary)] hover:text-[var(--color-primary-200)] transition-colors duration-300"
                aria-label="Menu schließen"
              >
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
} 