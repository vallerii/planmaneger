"use client";
// Настройки email-уведомлений (миграция 0014): кнопка «✉» в шапке списка проектов.

import { useEffect, useMemo, useRef, useState } from "react";
import { useI18n } from "@/i18n/client";
import { createClient } from "@/lib/supabase/client";
import type { NotifyPrefs } from "@/lib/types";

export default function NotifySettings({
  emailEnabled,
}: {
  /** false — ключи почты ещё не заданы: настройки сохраняются, писем пока нет */
  emailEnabled: boolean;
}) {
  const { t, lang } = useI18n();
  const supabase = useMemo(() => createClient(), []);
  const [open, setOpen] = useState(false);
  const [uid, setUid] = useState<string | null>(null);
  const [prefs, setPrefs] = useState<NotifyPrefs | null>(null);
  const [error, setError] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || prefs) return;
    let alive = true;
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return;
      const { data, error } = await supabase
        .from("profiles")
        .select("notify_assign,notify_comments")
        .eq("id", auth.user.id)
        .single();
      if (!alive) return;
      setUid(auth.user.id);
      if (error) setError(true);
      else setPrefs(data as NotifyPrefs);
    })();
    return () => {
      alive = false;
    };
  }, [open, prefs, supabase]);

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) =>
      box.current && !box.current.contains(e.target as Node) && setOpen(false);
    const k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", h);
    window.addEventListener("keydown", k);
    return () => {
      document.removeEventListener("mousedown", h);
      window.removeEventListener("keydown", k);
    };
  }, [open]);

  async function toggle(key: keyof NotifyPrefs) {
    if (!prefs || !uid) return;
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    // язык писем — текущий язык интерфейса
    const { error } = await supabase
      .from("profiles")
      .update({ [key]: next[key], lang })
      .eq("id", uid);
    if (error) {
      setPrefs(prefs);
      setError(true);
    }
  }

  const row = (key: keyof NotifyPrefs, title: string, hint: string) => (
    <label className="flex cursor-pointer items-start gap-2.5 rounded-lg px-2 py-2 hover:bg-[#f5f4ef]">
      <input
        type="checkbox"
        checked={!!prefs?.[key]}
        disabled={!prefs}
        onChange={() => toggle(key)}
        className="mt-0.5 h-4 w-4 accent-ink"
      />
      <span>
        <span className="block text-sm font-bold">{title}</span>
        <span className="block text-xs text-muted">{hint}</span>
      </span>
    </label>
  );

  return (
    <div ref={box} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        title={t("Уведомления на почту")}
        className="rounded-[9px] px-2 py-1.5 text-sm font-bold text-muted hover:bg-white hover:text-ink"
      >
        {t("✉ Уведомления")}
      </button>
      {open && (
        <div className="absolute top-full right-0 z-30 mt-2 w-[300px] rounded-[13px] border border-line bg-white p-2 shadow-soft">
          <div className="px-2 pt-1 pb-1.5 text-[11px] font-extrabold tracking-[.08em] text-muted uppercase">
            {t("Письма на почту")}
          </div>
          {!emailEnabled && (
            <p className="mx-2 mb-1.5 rounded-lg bg-[#fff5d8] px-2.5 py-2 text-xs text-[#6b4c00]">
              {t("Почта пока не подключена. Настройки сохранятся — письма начнут приходить после подключения.")}
            </p>
          )}
          {error ? (
            <p className="px-2 py-2 text-sm text-bad">
              {t("Не удалось загрузить настройки. Возможно, не запущена миграция 0014.")}
            </p>
          ) : (
            <>
              {row(
                "notify_assign",
                t("Назначили задачу"),
                t("Сразу, когда вас делают исполнителем"),
              )}
              {row(
                "notify_comments",
                t("Непрочитанные комментарии"),
                t("Сводка, если комментарий не прочитан в планере за 10 минут"),
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
