"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Btn, Field, Modal, inputCls } from "./ui";
import { CYCLE_TEMPLATE, stepDescription } from "@/lib/steps";
import { todayISO } from "@/lib/schedule";

export default function CreateProject() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [start, setStart] = useState(todayISO());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function create() {
    if (!name.trim() || busy) return;
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

    // Шаблон продуктового цикла: 8 фаз, задачи связаны с профилем
    const { data: phaseRows, error: phErr } = await supabase
      .from("phases")
      .insert(
        CYCLE_TEMPLATE.map((ph, i) => ({
          project_id: project.id,
          name: ph.name,
          position: i,
        })),
      )
      .select("id,position");
    if (phErr || !phaseRows) {
      setBusy(false);
      return setError(phErr?.message ?? "Ошибка");
    }
    const phaseId = (i: number) => phaseRows.find((p) => p.position === i)!.id;
    const rows = CYCLE_TEMPLATE.flatMap((ph, i) =>
      ph.tasks.map((t, k) => ({
        project_id: project.id,
        phase_id: phaseId(i),
        name: t.name,
        size: t.size,
        description: stepDescription(t, project.id),
        position: k,
        ...(t.step ? { profile_step: t.step } : {}),
      })),
    );
    const { error: tErr } = await supabase.from("tasks").insert(rows);
    // без миграции 0008 задачи нельзя связать с профилем — не создаём «немые» задачи
    if (tErr && /profile_step/.test(tErr.message)) {
      setBusy(false);
      return setError(
        "Запустите supabase/migrations/0008_cycle_template.sql в Supabase → SQL Editor: без неё задачи не свяжутся с профилем. Проект создан без задач — удалите его и создайте заново.",
      );
    }
    if (tErr) {
      setBusy(false);
      return setError(tErr.message);
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

        <p className="mb-1 text-sm text-muted">
          Проект начнётся с полного продуктового цикла:{" "}
          {CYCLE_TEMPLATE.map((p) => p.name).join(" → ")}. Задачи, связанные с
          профилем продукта, заполняются сами по мере заполнения профиля. Лишнее
          можно удалить на доске.
        </p>

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
