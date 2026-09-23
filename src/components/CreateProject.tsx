"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Btn, Field, Modal, inputCls } from "./ui";
import { todayISO } from "@/lib/schedule";
import { ROADMAP_TEMPLATE } from "@/lib/template";

export default function CreateProject() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [start, setStart] = useState(todayISO());
  const [template, setTemplate] = useState<"empty" | "roadmap">("empty");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function create() {
    if (!name.trim()) return;
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    const { data: project, error } = await supabase
      .from("projects")
      .insert({
        name: name.trim(),
        start_date: start,
        owner_id: userData.user!.id,
      })
      .select("id")
      .single();
    if (error || !project) {
      setBusy(false);
      return setError(error?.message ?? "Ошибка");
    }

    if (template === "roadmap") {
      const { data: phases } = await supabase
        .from("phases")
        .insert(
          ROADMAP_TEMPLATE.map((p, i) => ({
            project_id: project.id,
            name: p.name,
            position: i,
          })),
        )
        .select("id,position");
      if (phases) {
        const rows = phases.flatMap((ph) =>
          ROADMAP_TEMPLATE[ph.position].tasks.map(([n, size], i) => ({
            project_id: project.id,
            phase_id: ph.id,
            name: n,
            size,
            position: i,
          })),
        );
        await supabase.from("tasks").insert(rows);
      }
    } else {
      await supabase
        .from("phases")
        .insert({ project_id: project.id, name: "Phase 1", position: 0 });
    }
    router.push(`/projects/${project.id}`);
  }

  return (
    <>
      <Btn variant="primary" onClick={() => setOpen(true)}>
        ＋ Новый проект
      </Btn>
      <Modal open={open} onClose={() => setOpen(false)} title="Новый проект">
        <Field label="Название">
          <input
            autoFocus
            className={inputCls}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Например: Product Roadmap · 2026"
            onKeyDown={(e) => e.key === "Enter" && create()}
          />
        </Field>
        <Field label="Дата старта (первый рабочий день)">
          <input
            type="date"
            className={inputCls}
            value={start}
            onChange={(e) => setStart(e.target.value)}
          />
        </Field>
        <Field label="Начать с">
          <select
            className={inputCls}
            value={template}
            onChange={(e) => setTemplate(e.target.value as "empty" | "roadmap")}
          >
            <option value="empty">Пустой проект (одна фаза)</option>
            <option value="roadmap">
              Шаблон: продуктовая дорожная карта (7 фаз)
            </option>
          </select>
        </Field>
        {error && <p className="text-sm text-bad">{error}</p>}
        <div className="mt-5 flex justify-end gap-2">
          <Btn onClick={() => setOpen(false)}>Отмена</Btn>
          <Btn
            variant="primary"
            onClick={create}
            disabled={busy || !name.trim()}
          >
            {busy ? "Создаю…" : "Создать"}
          </Btn>
        </div>
      </Modal>
    </>
  );
}
