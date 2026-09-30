"use client";

// «Обновить перевод»: блок в настройках проекта (RU) и плашка режима просмотра (EN / DE).
import { useEffect, useMemo, useState } from "react";
import { useI18n } from "@/i18n/client";
import { createClient } from "@/lib/supabase/client";
import { useTranslation } from "@/lib/translate/client";
import { Btn } from "./ui";

function useFmt() {
  const { locale, t } = useI18n();
  return (iso: string | null) =>
    iso
      ? new Date(iso).toLocaleString(locale, {
          day: "2-digit",
          month: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        })
      : t("ещё не переводили");
}

function RunButton({
  tr,
  size = "md",
}: {
  tr: ReturnType<typeof useTranslation>;
  size?: "sm" | "md";
}) {
  const { t } = useI18n();
  const { status, running, progress, run } = tr;
  const nothing = !!status && status.pending === 0;
  return (
    <Btn
      variant="primary"
      onClick={run}
      disabled={running || !status || !status.configured || nothing}
      className={size === "sm" ? "!px-3 !py-1.5 text-sm" : ""}
      title={
        status && !status.configured
          ? t("Не задан OPENAI_API_KEY в переменных окружения (Vercel → Settings → Environment Variables).")
          : undefined
      }
    >
      {running
        ? t("Перевожу {done} / {total}…", {
            done: progress?.done ?? 0,
            total: progress?.total ?? 0,
          })
        : nothing
          ? t("✓ Перевод актуален")
          : t("Обновить перевод")}
    </Btn>
  );
}

/** Блок «Перевод для партнёров» в настройках проекта. */
export function TranslatePanel({ projectId }: { projectId: string }) {
  const { t } = useI18n();
  const fmt = useFmt();
  const tr = useTranslation(projectId);
  const { status, error, load, setStatus } = tr;
  const supabase = useMemo(() => createClient(), []);
  const [savingComments, setSavingComments] = useState(false);

  useEffect(() => {
    load();
  }, [load]);

  async function toggleComments(v: boolean) {
    if (!status) return;
    setSavingComments(true);
    setStatus({ ...status, translateComments: v });
    await supabase.from("projects").update({ translate_comments: v }).eq("id", projectId);
    setSavingComments(false);
    load();
  }

  return (
    <div className="rounded-[13px] border border-line p-4">
      <div className="flex items-baseline justify-between gap-2">
        <b>{t("Перевод для партнёров")}</b>
        <span className="text-xs text-muted">EN · DE</span>
      </div>
      <p className="mt-1 text-sm text-muted">
        {t("Задачи, профиль и названия переводятся на английский и немецкий по кнопке. Переводятся только новые и изменённые тексты.")}
      </p>
      {status && (
        <div className="mt-3 flex flex-col gap-1 text-sm">
          {(["en", "de"] as const).map((l) => (
            <div key={l} className="flex flex-wrap items-baseline gap-x-2">
              <b className="w-7">{l.toUpperCase()}</b>
              <span className="text-muted">
                {t("обновлён")}: {fmt(status[l].updated_at)}
              </span>
              {status[l].pending > 0 && (
                <span className="font-bold text-[#9a6b00]">
                  · {t("ждут перевода: {n}", { n: status[l].pending })}
                </span>
              )}
            </div>
          ))}
          <label className="mt-2 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={status.translateComments}
              disabled={savingComments}
              onChange={(e) => toggleComments(e.target.checked)}
            />
            {t("Переводить комментарии")}
          </label>
        </div>
      )}
      {error && <p className="mt-2 text-sm text-bad">{error}</p>}
      <div className="mt-3 flex justify-end">
        {status ? <RunButton tr={tr} /> : !error && <span className="text-sm text-muted">{t("Загрузка…")}</span>}
      </div>
    </div>
  );
}

/** EN / DE: плашка режима просмотра для владельца и редактора. */
export function TranslationBar({ projectId }: { projectId: string }) {
  const { t, setLang } = useI18n();
  const fmt = useFmt();
  const tr = useTranslation(projectId);
  const { status, error, load } = tr;

  useEffect(() => {
    load();
  }, [load]);

  const at = status
    ? [status.en.updated_at, status.de.updated_at].filter(Boolean).sort().at(-1) ?? null
    : null;

  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-[11px] border border-[#cfdcf3] bg-[#eef3fc] px-3 py-2 text-sm text-[#1d4f9a]">
      <span className="min-w-0 flex-1">
        {t("Вы смотрите перевод — здесь ничего не редактируется. Редактирование — в русской версии.")}
        {status && (
          <span className="text-[#5a7bb0]">
            {" "}
            {t("Перевод обновлён")}: {fmt(at)}
            {status.pending > 0 &&
              ` · ${t("не переведено изменений: {n}", { n: status.pending })}`}
          </span>
        )}
        {error && <span className="block text-bad">{error}</span>}
      </span>
      <RunButton tr={tr} size="sm" />
      <Btn className="!px-3 !py-1.5 text-sm" onClick={() => setLang("ru")}>
        {t("Редактировать на русском")}
      </Btn>
    </div>
  );
}
