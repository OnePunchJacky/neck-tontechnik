import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Equipment Verleih',
  description: 'Professionelles Audio-Equipment mieten in Leipzig. Mikrofone, Preamps, Effektgeräte und Backline für Studio und Live-Einsatz bei Neck Tontechnik.',
  openGraph: {
    title: 'Equipment Verleih - Neck Tontechnik',
    description: 'Professionelles Audio-Equipment mieten in Leipzig. Mikrofone, Preamps, Effektgeräte und Backline für Studio und Live-Einsatz.',
    url: 'https://neck-tontechnik.com/equipment-verleih',
  }
};

export default function EquipmentVerleihLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}