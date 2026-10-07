"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useI18n } from "@/i18n/client";
import { createClient } from "@/lib/supabase/client";
import type { TrMap } from "@/lib/translate/content";
import { ContentTrProvider, useMakeContentTr } from "@/lib/translate/client";
import { Brand } from "./ui";
import ProjectTitle from "./board/ProjectTitle";
import ProjectNav from "./ProjectNav";
import LangSwitcher from "./LangSwitcher";
import RichEditor from "./board/RichEditor";
import RichViewer from "./RichViewer";
import { TranslationBar } from "./Translation";

type SaveState = "idle" | "dirty" | "saving" | "saved" | "error";

/** Страница «Заметки»: свободный текст по проекту, сохраняется сам. */
export default function NotesApp({
  project,
  initialNotes,
  needsMigration,
  readOnly: isViewer,
  translations,
}: {
  project: { id: string; name: string };
  initialNotes: string;
  needsMigration: boolean;
  readOnly: boolean;
  translations: TrMap | null;
}) {
  const { t, lang } = useI18n();
  const tr = useMakeContentTr(translations);
  // EN / DE — показываем перевод, редактирование только в русской версии
  const readOnly = isViewer || tr.active || needsMigration;
  const supabase = useMemo(() => createClient(), []);
  const [name, setName] = useState(project.name);
  const [notes, setNotes] = useState(initialNotes);
  const [state, setState] = useState<SaveState>("idle");
  const [error, setError] = useState<string | null>(null);
  const latest = useRef(initialNotes);
  const saved = useRef(initialNotes);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saving = useRef(false);

  const save = useCallback(async () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    if (saving.current || latest.current === saved.current) return;
    saving.current = true;
    setState("saving");
    // пока сохраняли, могли напечатать ещё — сохраняем, пока не догоним
    while (latest.current !== saved.current) {
      const value = latest.current;
      const { error: e } = await supabase
        .from("product_profiles")
        .upsert({ project_id: project.id, notes: value });
      if (e) {
        saving.current = false;
        setError(e.message);
        setState("error");
        return;
      }
      saved.current = value;
    }
    saving.current = false;
    setError(null);
    setState("saved");
  }, [supabase, project.id]);

  const onChange = useCallback(
    (html: string) => {
      latest.current = html;
      setNotes(html);
      setState("dirty");
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(save, 1000);
    },
    [save],
  );

  // Ctrl/Cmd + S — сохранить сразу
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (!readOnly) save();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [save, readOnly]);

  // закрывают вкладку, а изменения ещё не записаны — предупредить и дописать
  useEffect(() => {
    const h = (e: BeforeUnloadEvent) => {
      if (latest.current !== saved.current) {
        save();
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [save]);

  // уходим со страницы внутри приложения — дописать несохранённое
  useEffect(
    () => () => {
      if (latest.current !== saved.current) save();
    },
    [save],
  );

  async function rename(v: string) {
    setName(v);
    await supabase.from("projects").update({ name: v }).eq("id", project.id);
  }

  const status =
    state === "saving"
      ? t("Сохраняю…")
      : state === "dirty"
        ? t("Есть изменения…")
        : state === "error"
          ? t("Не удалось сохранить")
          : state === "saved"
            ? t("Сохранено ✓")
            : "";

  const shown = tr.text("profile.notes", notes);

  return (
    <ContentTrProvider value={tr}>
      <div className="min-h-screen">
        <header className="z-10 border-b border-line bg-bg/90 px-3.5 py-4 backdrop-blur md:sticky md:top-0 md:px-6">
          <div className="flex flex-wrap items-center gap-3 md:flex-nowrap md:gap-4">
            <div className="flex min-w-0 basis-full items-center gap-3 md:flex-1 md:basis-0 md:gap-4">
              <Link href="/" className="shrink-0" title={t("Все проекты")}>
                <Brand />
              </Link>
              <ProjectTitle
                projectId={project.id}
                name={tr.projectName(name)}
                onRename={readOnly ? undefined : rename}
              />
            </div>
            <ProjectNav projectId={project.id} active="notes" />
            <div className="flex shrink-0 items-center justify-end gap-2 md:flex-1 md:basis-0">
              <LangSwitcher />
              {isViewer ? (
                <span
                  className="rounded-[10px] bg-[#e6effc] px-3.5 py-2 text-sm font-bold whitespace-nowrap text-[#1d4f9a]"
                  title={t("Вы можете смотреть заметки, но не менять их")}
                >
                  {t("👁 Только просмотр")}
                </span>
              ) : (
                !readOnly &&
                status && (
                  <span
                    className={`px-2 text-sm font-bold whitespace-nowrap ${state === "error" ? "text-bad" : "text-muted"}`}
                    title={error ?? undefined}
                  >
                    {status}
                  </span>
                )
              )}
            </div>
          </div>
          {tr.active && !isViewer && <TranslationBar projectId={project.id} />}
        </header>

        <main key={lang} className="mx-auto max-w-4xl px-4 pt-6 pb-16 md:px-6">
          {needsMigration && (
            <div className="mb-5 rounded-[13px] border border-[#edd48e] bg-[#fff5d8] px-4 py-3 text-sm text-[#6b4c00]">
              {t("Для материалов и заметок запустите {file} в Supabase → SQL Editor, затем обновите страницу.", {
                file: "supabase/migrations/0013_materials_notes.sql",
              })}
            </div>
          )}
          {error && (
            <div className="mb-4 rounded-[13px] border border-[#f3c7bd] bg-[#fff0ed] px-4 py-3 text-sm text-bad">
              {t("Ошибка сохранения:")} {error}
            </div>
          )}
          {readOnly ? (
            <div className="rounded-[17px] border border-line bg-white p-5 md:p-7">
              {shown.trim() ? (
                <RichViewer html={shown} />
              ) : (
                <p className="text-sm text-muted">{t("Заметок пока нет.")}</p>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-[13px]">
              <RichEditor
                initial={initialNotes}
                onChange={onChange}
                headings
                className="!min-h-[60vh] !p-5 md:!p-7"
                placeholder={t("Заметки по проекту: договорённости, идеи, контекст, протоколы встреч…")}
              />
            </div>
          )}
        </main>
      </div>
    </ContentTrProvider>
  );
}
