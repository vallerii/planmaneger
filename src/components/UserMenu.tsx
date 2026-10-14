"use client";

import { useT } from "@/i18n/client";
import { initials } from "@/lib/schedule";
import LangSwitcher from "./LangSwitcher";
import NotifySettings from "./NotifySettings";

export default function UserMenu({
  name,
  email,
  emailEnabled = false,
}: {
  name: string | null;
  email: string;
  /** почта подключена на сервере */
  emailEnabled?: boolean;
}) {
  const t = useT();
  return (
    <div className="flex items-center gap-2">
      <NotifySettings emailEnabled={emailEnabled} />
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
