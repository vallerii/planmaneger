"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Btn, Field, Modal, Stepper, inputCls } from "./ui";
import { todayISO } from "@/lib/schedule";

const MAX_PHASES = 20;
const defaultName = (i: number) => `Фаза ${i + 1}`;

export default function CreateProject() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [start, setStart] = useState(todayISO());
  const [count, setCount] = useState(3);
  const [phaseNames, setPhaseNames] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const phaseName = (i: number) => phaseNames[i]?.trim() || defaultName(i);

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

    const { error: phErr } = await supabase.from("phases").insert(
      Array.from({ length: count }, (_, i) => ({
        project_id: project.id,
        name: phaseName(i),
        position: i,
      })),
    );
    if (phErr) {
      setBusy(false);
      return setError(phErr.message);
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

        <div className="my-3">
          <span className="mb-1.5 block text-xs font-bold text-muted">
            На сколько фаз разбить проект
          </span>
          <div className="flex items-center gap-3">
            <Stepper
              value={count}
              onChange={setCount}
              min={1}
              max={MAX_PHASES}
            />
            <span className="text-sm text-muted">
              {count} {plural(count, "фаза", "фазы", "фаз")} · названия можно
              поменять ниже или позже на доске
            </span>
          </div>

          <div className="mt-3 grid max-h-[220px] grid-cols-2 gap-2 overflow-auto pr-1">
            {Array.from({ length: count }, (_, i) => (
              <label
                key={i}
                className="flex items-center gap-2 rounded-[10px] border border-line bg-[#fafafa] px-2.5 py-1.5 focus-within:border-ink/40 focus-within:bg-white"
              >
                <span className="shrink-0 text-[10px] font-extrabold tracking-[.08em] text-muted uppercase">
                  {i}
                </span>
                <input
                  value={phaseNames[i] ?? ""}
                  placeholder={defaultName(i)}
                  onChange={(e) =>
                    setPhaseNames((ns) => {
                      const next = [...ns];
                      next[i] = e.target.value;
                      return next;
                    })
                  }
                  className="min-w-0 flex-1 bg-transparent py-1 text-sm font-bold outline-none placeholder:font-semibold placeholder:text-[#aaa]"
                />
              </label>
            ))}
          </div>
        </div>

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

function plural(n: number, one: string, few: string, many: string) {
  const m10 = n % 10,
    m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
}
