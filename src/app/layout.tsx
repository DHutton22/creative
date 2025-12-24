import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Creative Composites - Machine Checklist System",
  description: "Accountability checklist system for CNC machines and manufacturing processes",
  keywords: ["CNC", "checklist", "manufacturing", "aerospace", "automotive", "composites"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* DM Sans for headings, Plus Jakarta Sans for body - distinctive but professional */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
