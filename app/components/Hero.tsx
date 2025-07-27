'use client';

import { useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import Image from 'next/image';

interface HeroImage {
  src: string;
  alt: string;
  title?: string;
  description?: string;
}

interface HeroProps {
  images: HeroImage[];
  height?: string;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showNavigation?: boolean;
  showIndicators?: boolean;
  ctaButtons?: {
    primary?: { text: string; href: string };
    secondary?: { text: string; href: string };
  };
}

export default function Hero({
  images,
  height = 'min-h-screen',
  autoPlay = true,
  autoPlayInterval = 5000,
  showNavigation = true,
  showIndicators = true,
  ctaButtons,
}: HeroProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { 
      loop: true,
      align: 'start',
    },
    autoPlay ? [Autoplay({ delay: autoPlayInterval, stopOnInteraction: false })] : []
  );

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index);
  }, [emblaApi]);

  if (images.length === 0) {
    return null;
  }

  // Get the first image for static text content
  const firstImage = images[0];

  // Static image display
  if (images.length === 1) {
    const image = images[0];
    return (
      <div className={`relative w-full ${height} overflow-hidden`}>
        <Image
          src={image.src}
          alt={image.alt}
          fill
          className="object-cover object-[center_30%]"
          priority
        />
        {/* Gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/20"></div>
        {(image.title || image.description) && (
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="text-center text-[var(--color-text-primary)] px-4">
              {image.title && (
                <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-2xl">
                  {image.title}
                </h1>
              )}
              {image.description && (
                <p className="text-xl md:text-2xl max-w-2xl mx-auto drop-shadow-2xl">
                  {image.description}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Slider display with static text overlay
  return (
    <div className={`relative w-full ${height} overflow-hidden group`}>
      {/* Background image slider */}
      <div className="embla h-full" ref={emblaRef}>
        <div className="embla__container h-full">
          {images.map((image, index) => (
            <div key={index} className="embla__slide relative flex-[0_0_100%] min-w-0 h-full">
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Gradient overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/20"></div>

      {/* Static text overlay */}
      {(firstImage.title || firstImage.description) && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="text-center text-white px-4">
            {firstImage.title && (
              <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-2xl">
                {firstImage.title}
              </h1>
            )}
            {firstImage.description && (
              <p className="text-xl md:text-2xl max-w-2xl mx-auto mb-8 drop-shadow-2xl">
                {firstImage.description}
              </p>
            )}
            {/* CTA Buttons */}
            {ctaButtons && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {ctaButtons.primary && (
                  <a
                    href={ctaButtons.primary.href}
                    className="bg-[var(--color-primary-100)] hover:bg-[var(--color-primary-50)] text-[var(--color-text-dark)] px-8 py-3 rounded-md text-lg font-medium transition-colors duration-200 drop-shadow-lg"
                  >
                    {ctaButtons.primary.text}
                  </a>
                )}
                {ctaButtons.secondary && (
                  <a
                    href={ctaButtons.secondary.href}
                    className="bg-[var(--color-primary-100)] hover:bg-[var(--color-primary-50)] text-[var(--color-text-dark)] px-8 py-3 rounded-md text-lg font-medium transition-colors duration-200 drop-shadow-lg"
                  >
                    {ctaButtons.secondary.text}
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation arrows */}
      {showNavigation && (
        <>
          <button
            onClick={scrollPrev}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-[var(--color-bg-dark)] bg-opacity-50 hover:bg-opacity-75 text-[var(--color-text-primary)] p-3 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 z-30"
            aria-label="Previous slide"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            onClick={scrollNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-[var(--color-bg-dark)] bg-opacity-50 hover:bg-opacity-75 text-[var(--color-text-primary)] p-3 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 z-30"
            aria-label="Next slide"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </>
      )}

      {/* Indicators */}
      {showIndicators && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-30">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className="w-3 h-3 rounded-full bg-white bg-opacity-50 hover:bg-opacity-75 transition-all duration-300"
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
