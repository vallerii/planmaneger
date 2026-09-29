import type { Metadata } from "next";
import { I18nProvider } from "@/i18n/client";
import { getI18n, getLang } from "@/i18n/server";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return {
    title: "Planmaneger",
    description: t("Планер проектов: фазы, задачи, сроки"),
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const lang = await getLang();
  return (
    <html lang={lang} className="h-full antialiased">
      <body className="min-h-full">
        <I18nProvider lang={lang}>{children}</I18nProvider>
      </body>
    </html>
  );
}
