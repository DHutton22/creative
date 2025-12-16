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
      <body>{children}</body>
    </html>
  );
}
