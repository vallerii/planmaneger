"use client";

// Показ AI-перевода в браузере и запуск «Обновить перевод».
import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useI18n } from "@/i18n/client";
import { makeContentTr, type ContentTr, type TrMap } from "./content";

const Ctx = createContext<ContentTr | null>(null);

/** Перевод контента для текущего языка интерфейса (RU — без изменений). */
export function useMakeContentTr(map: TrMap | null | undefined) {
  const { lang } = useI18n();
  return useMemo(() => makeContentTr(lang, map ?? null), [lang, map]);
}

export function ContentTrProvider({
  value,
  children,
}: {
  value: ContentTr;
  children: React.ReactNode;
}) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

const ruTr = makeContentTr("ru", null);
export const useContentTr = () => useContext(Ctx) ?? ruTr;

// ---------------------------------------------------------------
// Статус и запуск перевода
// ---------------------------------------------------------------

export type TrStatus = {
  total: number;
  pending: number;
  translateComments: boolean;
  configured: boolean;
  en: { updated_at: string | null; pending: number };
  de: { updated_at: string | null; pending: number };
};

/** Ответ API; если пришёл HTML (сессия истекла → редирект на вход) — понятная ошибка. */
async function readJson(res: Response) {
  if (!(res.headers.get("content-type") ?? "").includes("application/json"))
    return { error: "SESSION" };
  return res.json();
}

export function useTranslation(projectId: string) {
  const { t } = useI18n();
  const router = useRouter();
  const [status, setStatus] = useState<TrStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(
    null,
  );

  const explain = useCallback(
    (code: string) =>
      code === "MIGRATION"
        ? t("Запустите supabase/migrations/0012_translations.sql в Supabase → SQL Editor.")
        : code === "SESSION"
          ? t("Сессия истекла — обновите страницу и войдите снова.")
        : code === "NO_KEY"
          ? t("Не задан OPENAI_API_KEY в переменных окружения (Vercel → Settings → Environment Variables).")
          : code,
    [t],
  );

  const url = `/api/projects/${projectId}/translate`;

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch(url, { cache: "no-store" });
      const json = await readJson(res);
      if (!res.ok || json.error)
        return setError(explain(json.error ?? String(res.status)));
      setStatus(json);
    } catch (e) {
      setError(String(e));
    }
  }, [url, explain]);

  const run = useCallback(async () => {
    if (running) return;
    setRunning(true);
    setError(null);
    const total = status?.pending ?? 0;
    let done = 0;
    setProgress({ done, total });
    try {
      // порциями, пока есть что переводить; стоп, если порция ничего не дала
      for (let i = 0; i < 200; i++) {
        const res = await fetch(url, { method: "POST" });
        const json = await readJson(res);
        if (!res.ok || json.error) {
          setError(explain(json.error ?? String(res.status)));
          break;
        }
        done += json.translated;
        setProgress({ done, total: Math.max(total, done + json.remaining) });
        if (!json.remaining || !json.translated) {
          if (json.remaining && !json.translated)
            setError(t("Часть текстов не удалось перевести — попробуйте ещё раз."));
          break;
        }
      }
    } catch (e) {
      setError(String(e));
    }
    setRunning(false);
    await load();
    router.refresh();
  }, [running, status, url, explain, load, router, t]);

  return { status, error, running, progress, load, run, setStatus };
}
