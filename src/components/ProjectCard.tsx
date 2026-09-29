"use client";

import { useI18n } from "@/i18n/client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ConfirmDialog, TrashIcon, trashBtnCls } from "./ui";

export type ProjectCardData = {
  id: string;
  name: string;
  startDate: string;
  phases: number;
  tasks: number;
  members: number;
  isOwner: boolean;
  /** непрочитанные мной комментарии */
  unread?: number;
  /** клиент / партнёр — только просмотр */
  viewer?: boolean;
};

export default function ProjectCard({ p }: { p: ProjectCardData }) {
  const { t, rich, locale } = useI18n();
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function remove() {
    setDeleting(true);
    const { error } = await createClient()
      .from("projects")
      .delete()
      .eq("id", p.id);
    if (error) {
      setDeleting(false);
      setError(error.message);
      return;
    }
    router.refresh();
  }

  return (
    <div
      className={`group relative transition ${deleting ? "pointer-events-none opacity-40" : ""}`}
    >
      <Link
        href={`/projects/${p.id}`}
        className="block h-full rounded-[17px] border border-line bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-soft"
      >
        <div
          className={`flex items-start justify-between gap-2 ${p.isOwner ? "pr-8" : ""}`}
        >
          <h2 className="flex items-center gap-2 text-lg font-extrabold tracking-tight group-hover:text-accent">
            {p.name}
            {!!p.unread && (
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full bg-bad"
                title={t("Новых комментариев: {n}", { n: p.unread })}
                aria-label={t("Новых комментариев: {n}", { n: p.unread })}
              />
            )}
          </h2>
          {!p.isOwner &&
            (p.viewer ? (
              <span className="rounded-full bg-[#e6effc] px-2 py-0.5 text-[10px] font-extrabold text-[#1d4f9a]">
                {t("просмотр")}
              </span>
            ) : (
              <span className="rounded-full bg-[#efeee8] px-2 py-0.5 text-[10px] font-extrabold text-[#5d5b54]">
                {t("гость")}
              </span>
            ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted">
          <span>
            <b className="text-ink">{p.phases}</b>{" "}{t("фаз")}
          </span>
          <span>
            <b className="text-ink">{p.tasks}</b>{" "}{t("задач")}
          </span>
          <span>
            <b className="text-ink">{p.members}</b>{" "}{t("участн.")}
          </span>
          <span>{t("старт")} {new Date(p.startDate).toLocaleDateString(locale)}</span>
        </div>
        {error && (
          <p className="mt-2 text-xs text-bad">{t("Не удалось удалить:")} {error}</p>
        )}
      </Link>

      {p.isOwner && (
        <button
          className={`${trashBtnCls} absolute top-4 right-4`}
          title={t("Удалить проект")}
          aria-label={t("Удалить проект")}
          onClick={() => setConfirm(true)}
        >
          <TrashIcon />
        </button>
      )}

      <ConfirmDialog
        open={confirm}
        title={t("Удалить проект?")}
        confirmText={t("Удалить проект")}
        onClose={() => setConfirm(false)}
        onConfirm={remove}
      >
        {rich(
          "Проект «{name}» будет удалён вместе со всеми фазами ({phases}), задачами ({tasks}) и комментариями. Участники потеряют к нему доступ. Это действие нельзя отменить.",
          { name: <b>{p.name}</b>, phases: p.phases, tasks: p.tasks },
        )}
      </ConfirmDialog>
    </div>
  );
}
