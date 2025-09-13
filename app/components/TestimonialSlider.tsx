'use client';

import { useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

interface Testimonial {
  id: number;
  text: string;
  author: string;
  role?: string;
  company?: string;
}

interface TestimonialSliderProps {
  testimonials: Testimonial[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showNavigation?: boolean;
  showIndicators?: boolean;
}

export default function TestimonialSlider({
  testimonials,
  autoPlay = true,
  autoPlayInterval = 5000,
  showNavigation = true,
  showIndicators = true,
}: TestimonialSliderProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { 
      loop: true,
      align: 'start',
    },
    autoPlay ? [Autoplay({ delay: autoPlayInterval, stopOnInteraction: false, stopOnMouseEnter: true })] : []
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

  if (testimonials.length === 0) {
    return null;
  }

  // Single testimonial display
  if (testimonials.length === 1) {
    const testimonial = testimonials[0];
    return (
      <div className="max-w-4xl mx-auto text-center">
        <div className="text-white text-xl md:text-2xl leading-relaxed mb-6 italic">
          "{testimonial.text}"
        </div>
        <div className="text-white">
          <div className="font-semibold text-lg">{testimonial.author}</div>
          {(testimonial.role || testimonial.company) && (
            <div className="text-gray-300 text-sm">
              {testimonial.role && testimonial.company 
                ? `${testimonial.role} bei ${testimonial.company}`
                : testimonial.role || testimonial.company
              }
            </div>
          )}
        </div>
      </div>
    );
  }

  // Slider display
  return (
    <div className="relative max-w-4xl mx-auto group w-full">
      <div className="embla" ref={emblaRef}>
        <div className="embla__container">
          {testimonials.map((testimonial, index) => (
            <div key={testimonial.id} className="embla__slide flex-[0_0_100%] min-w-0 text-center">
              <div className="text-white text-xl md:text-2xl leading-relaxed mb-6 italic">
                "{testimonial.text}"
              </div>
              <div className="text-white">
                <div className="font-semibold text-lg">{testimonial.author}</div>
                {(testimonial.role || testimonial.company) && (
                  <div className="text-gray-300 text-sm">
                    {testimonial.role && testimonial.company 
                      ? `${testimonial.role} bei ${testimonial.company}`
                      : testimonial.role || testimonial.company
                    }
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation arrows */}
      {showNavigation && (
        <>
          <button
            onClick={scrollPrev}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-3 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 z-30"
            aria-label="Previous testimonial"
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
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-3 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 z-30"
            aria-label="Next testimonial"
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
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 z-30">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className="w-3 h-3 rounded-full bg-white bg-opacity-50 hover:bg-opacity-75 transition-all duration-300"
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
} 