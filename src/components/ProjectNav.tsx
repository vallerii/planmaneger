"use client";

import Link from "next/link";
import { useT } from "@/i18n/client";

/** Переключатель «Доска | Профиль продукта | Заметки | Доступы» в шапке проекта. */
export default function ProjectNav({
  projectId,
  active,
  access = false,
}: {
  projectId: string;
  active: "board" | "profile" | "notes" | "access";
  /** вкладка «Доступы» — только владельцу и редакторам (клиенту не показываем) */
  access?: boolean;
}) {
  const t = useT();
  const tab = (on: boolean) =>
    `rounded-[9px] px-3 py-1.5 text-sm font-bold whitespace-nowrap transition ${
      on
        ? "bg-white text-ink shadow-[0_1px_4px_rgba(20,20,10,.08)]"
        : "text-muted hover:text-ink"
    }`;
  return (
    // на узком экране вкладки прокручиваются, а не вылезают за край
    <nav className="inline-flex max-w-full shrink-0 overflow-x-auto rounded-[11px] bg-[#e7e5dd] p-1">
      <Link href={`/projects/${projectId}`} className={tab(active === "board")}>
        {t("Доска")}
      </Link>
      <Link
        href={`/projects/${projectId}/profile`}
        className={tab(active === "profile")}
      >
        {/* на узких экранах — короче, чтобы влезли все вкладки */}
        <span className="xl:hidden">{t("Профиль")}</span>
        <span className="hidden xl:inline">{t("Профиль продукта")}</span>
      </Link>
      <Link
        href={`/projects/${projectId}/notes`}
        className={tab(active === "notes")}
      >
        {t("Заметки")}
      </Link>
      {access && (
        <Link
          href={`/projects/${projectId}/access`}
          className={tab(active === "access")}
        >
          {t("Доступы")}
        </Link>
      )}
    </nav>
  );
}
