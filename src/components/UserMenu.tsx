"use client";

import { useT } from "@/i18n/client";
import { initials } from "@/lib/schedule";
import LangSwitcher from "./LangSwitcher";

export default function UserMenu({
  name,
  email,
}: {
  name: string | null;
  email: string;
}) {
  const t = useT();
  return (
    <div className="flex items-center gap-2">
      <LangSwitcher />
      <div
        className="grid h-[34px] w-[34px] place-items-center rounded-[10px] bg-ink text-[11px] font-black text-white"
        title={email}
      >
        {initials(name || email)}
      </div>
      <form action="/auth/signout" method="post">
        <button className="rounded-[9px] px-2 py-1.5 text-sm font-bold text-muted hover:bg-white hover:text-ink">
          {t("Выйти")}
        </button>
      </form>
    </div>
  );
}
