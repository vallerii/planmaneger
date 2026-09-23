import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Planmaneger",
  description: "Планер проектов: фазы, задачи, сроки",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
