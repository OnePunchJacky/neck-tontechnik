import type { Metadata } from "next";
import "./globals.css";
import Header from "./components/Header";


export const metadata: Metadata = {
  title: "Neck Tontechnik - Professional Audio Engineering",
  description: "Professional audio engineering and sound technology solutions. Expert sound system design, installation, and maintenance services.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Header />
        {children}
      </body>
    </html>
  );
}
