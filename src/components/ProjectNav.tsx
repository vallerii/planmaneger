import Link from "next/link";

/** Переключатель «Доска | Профиль продукта» в шапке проекта. */
export default function ProjectNav({
  projectId,
  active,
}: {
  projectId: string;
  active: "board" | "profile";
}) {
  const tab = (on: boolean) =>
    `rounded-[9px] px-3 py-1.5 text-sm font-bold whitespace-nowrap transition ${
      on
        ? "bg-white text-ink shadow-[0_1px_4px_rgba(20,20,10,.08)]"
        : "text-muted hover:text-ink"
    }`;
  return (
    <nav className="inline-flex shrink-0 rounded-[11px] bg-[#e7e5dd] p-1">
      <Link href={`/projects/${projectId}`} className={tab(active === "board")}>
        Доска
      </Link>
      <Link
        href={`/projects/${projectId}/profile`}
        className={tab(active === "profile")}
      >
        Профиль продукта
      </Link>
    </nav>
  );
}
