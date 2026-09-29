"use client";

import { LANG_LABEL, LANG_NAME, LANGS } from "@/i18n/core";
import { useI18n } from "@/i18n/client";

/** Переключатель языка интерфейса в шапке: RU · EN · DE. */
export default function LangSwitcher({ className = "" }: { className?: string }) {
  const { lang, setLang, t } = useI18n();
  return (
    <div
      role="group"
      aria-label={t("Язык интерфейса")}
      className={`inline-flex shrink-0 items-center rounded-lg border border-line bg-white p-0.5 text-[11px] font-semibold ${className}`}
    >
      {LANGS.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => l !== lang && setLang(l)}
          aria-pressed={l === lang}
          title={LANG_NAME[l]}
          className={`rounded-md px-1.5 py-0.5 transition-colors ${
            l === lang ? "bg-ink text-white" : "text-muted hover:text-ink"
          }`}
        >
          {LANG_LABEL[l]}
        </button>
      ))}
    </div>
  );
}
