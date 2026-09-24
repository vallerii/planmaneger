"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Btn, Field, Modal, inputCls } from "./ui";
import { PHASE0_NAME, STEPS, stepDescription } from "@/lib/steps";
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

    // Фаза 0: задачи на заполнение профиля продукта
    const { data: phase, error: phErr } = await supabase
      .from("phases")
      .insert({ project_id: project.id, name: PHASE0_NAME, position: 0 })
      .select("id")
      .single();
    if (phErr || !phase) {
      setBusy(false);
      return setError(phErr?.message ?? "Ошибка");
    }
    const rows = STEPS.map((s, i) => ({
      project_id: project.id,
      phase_id: phase.id,
      name: s.name,
      size: s.size,
      description: stepDescription(s.step, project.id),
      position: i,
      profile_step: s.step,
    }));
    let { error: tErr } = await supabase.from("tasks").insert(rows);
    // миграция 0006 ещё не применена — создаём задачи без связи с профилем
    if (tErr && /profile_step/.test(tErr.message)) {
      ({ error: tErr } = await supabase
        .from("tasks")
        .insert(rows.map(({ profile_step: _s, ...r }) => (void _s, r))));
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
          Проект начнётся с фазы «{PHASE0_NAME}»: задачи по заполнению профиля
          продукта. Остальные фазы добавите на доске, когда будет понятно, что
          делать.
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
