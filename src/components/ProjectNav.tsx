"use client";

import Link from "next/link";
import { useT } from "@/i18n/client";

/** Переключатель «Доска | Профиль продукта | Заметки» в шапке проекта. */
export default function ProjectNav({
  projectId,
  active,
}: {
  projectId: string;
  active: "board" | "profile" | "notes";
}) {
  const t = useT();
  const tab = (on: boolean) =>
    `rounded-[9px] px-3 py-1.5 text-sm font-bold whitespace-nowrap transition ${
      on
        ? "bg-white text-ink shadow-[0_1px_4px_rgba(20,20,10,.08)]"
        : "text-muted hover:text-ink"
    }`;
  return (
    <nav className="inline-flex shrink-0 rounded-[11px] bg-[#e7e5dd] p-1">
      <Link href={`/projects/${projectId}`} className={tab(active === "board")}>
        {t("Доска")}
      </Link>
      <Link
        href={`/projects/${projectId}/profile`}
        className={tab(active === "profile")}
      >
        {t("Профиль продукта")}
      </Link>
      <Link
        href={`/projects/${projectId}/notes`}
        className={tab(active === "notes")}
      >
        {t("Заметки")}
      </Link>
    </nav>
  );
}
