// Utility functions for loading homepage configuration

import { readFile } from 'fs/promises';
import { join } from 'path';
import testimonialsData from '../../data/testimonials.json';

const HOMEPAGE_CONFIG_FILE = join(process.cwd(), 'data', 'homepage-config.json');
const LOGOS_FILE = join(process.cwd(), 'data', 'homepage-logos.json');

const defaultHeroConfig = {
  images: [
    {
      src: "/images/home/home-hero-1.jpg",
      alt: "Professional audio engineering setup",
      title: "Klang auf den Punkt – Live und im Studio",
      description: "Professionelle Tontechnik-Lösungen für Veranstaltungen und Studios"
    },
    {
      src: "/images/home/home-hero-2.jpg",
      alt: "2 Sound Engineers photgraphed from the side looking at a mixing desk",
      title: "Tontechnik",
      description: "Professionelle Tontechnik-Lösungen für Veranstaltungen und Studios"
    },
    {
      src: "/images/home/home-hero-3.jpg",
      alt: "2 Sound Engineers photgraphed from above looking at a mixing desk",
      title: "Live-Tontechnik",
      description: "Professionelle Beschallung für Ihre Veranstaltung"
    },
  ],
  quoteText: "Egal ob fette Liveshows, präzise Studioarbeit oder praxisnahe Workshops – ich bringe Sound auf die nächste Stufe. Mit jahrelanger Erfahrung als Live- und Studiotechniker sorge ich dafür, dass deine Musik genau so klingt, wie sie klingen soll.",
};

const defaultLogos = [
  { src: "/images/home/references-carousel/102boyz-1.png", alt: "102 Boyz" },
  { src: "/images/home/references-carousel/Korn_Logo_grey.png", alt: "Korn" },
  { src: "/images/home/references-carousel/SKIAGGU_SHADOW.png", alt: "Skiaggu" },
  { src: "/images/home/references-carousel/red-bull-symphonic-gold (1).png", alt: "Red Bull Symphonic" }
];

export async function getHomepageConfig() {
  try {
    const fileContent = await readFile(HOMEPAGE_CONFIG_FILE, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    return defaultHeroConfig;
  }
}

export async function getHomepageLogos() {
  try {
    const fileContent = await readFile(LOGOS_FILE, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    return defaultLogos;
  }
}

export function getTestimonials() {
  return testimonialsData;
}

