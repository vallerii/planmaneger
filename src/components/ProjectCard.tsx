"use client";

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
};

export default function ProjectCard({ p }: { p: ProjectCardData }) {
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
          <h2 className="text-lg font-extrabold tracking-tight group-hover:text-accent">
            {p.name}
          </h2>
          {!p.isOwner && (
            <span className="rounded-full bg-[#efeee8] px-2 py-0.5 text-[10px] font-extrabold text-[#5d5b54]">
              гость
            </span>
          )}
        </div>
        <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted">
          <span>
            <b className="text-ink">{p.phases}</b> фаз
          </span>
          <span>
            <b className="text-ink">{p.tasks}</b> задач
          </span>
          <span>
            <b className="text-ink">{p.members}</b> участн.
          </span>
          <span>старт {new Date(p.startDate).toLocaleDateString("ru-RU")}</span>
        </div>
        {error && (
          <p className="mt-2 text-xs text-bad">Не удалось удалить: {error}</p>
        )}
      </Link>

      {p.isOwner && (
        <button
          className={`${trashBtnCls} absolute top-4 right-4`}
          title="Удалить проект"
          aria-label="Удалить проект"
          onClick={() => setConfirm(true)}
        >
          <TrashIcon />
        </button>
      )}

      <ConfirmDialog
        open={confirm}
        title="Удалить проект?"
        confirmText="Удалить проект"
        onClose={() => setConfirm(false)}
        onConfirm={remove}
      >
        Проект «<b>{p.name}</b>» будет удалён вместе со всеми фазами ({p.phases}
        ), задачами ({p.tasks}) и комментариями. Участники потеряют к нему
        доступ. Это действие нельзя отменить.
      </ConfirmDialog>
    </div>
  );
}
