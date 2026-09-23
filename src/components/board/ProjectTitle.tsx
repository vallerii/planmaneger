"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Item = { id: string; name: string };

const iconBtn =
  "grid h-8 w-8 shrink-0 place-items-center rounded-[9px] text-muted transition hover:bg-white hover:text-ink";

/** Название проекта: ✎ — переименовать, ▾ — переключиться на другой проект. */
export default function ProjectTitle({
  projectId,
  name,
  onRename,
}: {
  projectId: string;
  name: string;
  onRename: (name: string) => void;
}) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(name);
  const [open, setOpen] = useState(false);
  const [projects, setProjects] = useState<Item[] | null>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const editingRef = useRef(false);

  // список проектов подгружаем при открытии меню
  useEffect(() => {
    if (!open) return;
    let alive = true;
    supabase
      .from("projects")
      .select("id,name")
      .order("created_at", { ascending: false })
      .then(({ data }) => alive && setProjects((data ?? []) as Item[]));
    const close = (e: MouseEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", close);
    window.addEventListener("keydown", esc);
    return () => {
      alive = false;
      document.removeEventListener("mousedown", close);
      window.removeEventListener("keydown", esc);
    };
  }, [open, supabase]);

  function startEdit() {
    setValue(name);
    setOpen(false);
    editingRef.current = true;
    setEditing(true);
  }

  function save() {
    if (!editingRef.current) return;
    editingRef.current = false;
    const v = value.trim();
    if (v && v !== name) onRename(v);
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="flex min-w-[200px] flex-1 items-center gap-1.5">
        <input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={(e) => e.currentTarget.select()}
          onBlur={save}
          onKeyDown={(e) => {
            if (e.key === "Enter") save();
            if (e.key === "Escape") {
              editingRef.current = false;
              setEditing(false);
            }
          }}
          className="w-full max-w-[420px] min-w-0 rounded-[9px] border border-ink/30 bg-white px-2.5 py-1.5 font-bold outline-none"
        />
        <button
          className={iconBtn + " text-ok"}
          title="Сохранить"
          onMouseDown={(e) => e.preventDefault()}
          onClick={save}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div
      ref={wrap}
      className="relative flex min-w-[200px] flex-1 items-center gap-0.5"
    >
      <h1
        className="min-w-0 truncate px-2 text-[15px] font-extrabold tracking-tight"
        title={name}
      >
        {name}
      </h1>
      <button
        className={iconBtn}
        title="Переименовать проект"
        aria-label="Переименовать проект"
        onClick={startEdit}
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </svg>
      </button>
      <button
        className={`${iconBtn} ${open ? "bg-white text-ink" : ""}`}
        title="Другие проекты"
        aria-label="Другие проекты"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 12 12"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
        >
          <path
            d="M2.5 4.5 6 8l3.5-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute top-[calc(100%+6px)] left-0 z-40 w-[300px] overflow-hidden rounded-xl border border-line bg-white shadow-[0_18px_50px_rgba(20,20,10,.16)] animate-[menuIn_.12s_ease-out]">
          <div className="px-3 pt-2.5 pb-1.5 text-[11px] font-extrabold tracking-[.08em] text-muted uppercase">
            Проекты
          </div>
          <div className="max-h-[320px] overflow-auto px-1.5 pb-1.5">
            {projects === null ? (
              <div className="px-2.5 py-2 text-sm text-muted">Загрузка…</div>
            ) : (
              projects.map((p) => {
                const current = p.id === projectId;
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      setOpen(false);
                      if (!current) router.push(`/projects/${p.id}`);
                    }}
                    className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm hover:bg-[#f3f2ed] ${
                      current ? "font-extrabold" : "font-semibold"
                    }`}
                  >
                    <span className="min-w-0 flex-1 truncate">{p.name}</span>
                    {current && <span className="text-ok">✓</span>}
                  </button>
                );
              })
            )}
          </div>
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="block border-t border-line px-3 py-2.5 text-sm font-bold text-muted hover:bg-[#f3f2ed] hover:text-ink"
          >
            Все проекты →
          </Link>
        </div>
      )}
    </div>
  );
}
