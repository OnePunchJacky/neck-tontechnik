'use client';

import useEmblaCarousel from 'embla-carousel-react';
import { useCallback, useEffect } from 'react';
import Autoplay from 'embla-carousel-autoplay';
import Image from 'next/image';

interface LogoCarouselProps {
  logos: {
    src: string;
    alt: string;
  }[];
  autoplayDelay?: number;
}

export default function LogoCarousel({ logos, autoplayDelay = 0 }: LogoCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { 
      loop: true,
      align: 'start',
      slidesToScroll: 1,
      containScroll: 'trimSnaps'
    },
    [Autoplay({ delay: autoplayDelay, stopOnInteraction: false })]
  );

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  useEffect(() => {
    if (emblaApi) {
      emblaApi.reInit();
    }
  }, [emblaApi, logos]);

  return (
    <div className="relative w-full">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {/* Duplicate logos for seamless infinite scroll effect */}
          {[...logos, ...logos].map((logo, index) => (
            <div
              key={index}
              className="flex-[0_0_auto] min-w-0 pl-8 flex items-center justify-center"
              style={{ width: '200px' }}
            >
              <div className="relative w-full h-32 flex items-center justify-center">
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  width={160}
                  height={100}
                  className="object-contain opacity-70 hover:opacity-100 transition-opacity duration-300"
                  style={{ maxHeight: '100%', width: 'auto' }}
                  unoptimized
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}