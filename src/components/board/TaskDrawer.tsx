"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type {
  Comment,
  Member,
  Profile,
  SizeDays,
  Task,
  Size,
} from "@/lib/types";
import { SIZES } from "@/lib/types";
import {
  deadlineStatus,
  fmtDays,
  initials,
  remainingTaskDays,
  sizeDays as sizeOf,
  workdaysLabel,
} from "@/lib/schedule";
import { Btn, Select, TrashIcon, trashBtnCls } from "../ui";
import RichEditor from "./RichEditor";

type Props = {
  task: Task;
  phaseName: string;
  sizeDays: SizeDays;
  me: Profile;
  members: Member[];
  onClose: () => void;
  onUpdate: (patch: Partial<Task>) => void;
  onCommentAdded: () => void;
  onError: (e: { message: string } | null) => void;
  /** create — пустая форма новой задачи (ещё не сохранена в БД) */
  mode?: "edit" | "create";
  onCreate?: (fields: { name: string; description: string }) => void;
  onDelete?: () => void;
};

const commentTime = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

export default function TaskDrawer({
  task,
  phaseName,
  sizeDays,
  me,
  members,
  onClose,
  onUpdate,
  onCommentAdded,
  onError,
  mode = "edit",
  onCreate,
  onDelete,
}: Props) {
  const isCreate = mode === "create";
  const supabase = useMemo(() => createClient(), []);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(task.name);
  const [comments, setComments] = useState<Comment[] | null>(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  // debounce описания
  const pendingDesc = useRef<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onUpdateRef = useRef(onUpdate);
  useEffect(() => {
    onUpdateRef.current = onUpdate;
  });

  const flush = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    if (pendingDesc.current !== null) {
      onUpdateRef.current({ description: pendingDesc.current });
      pendingDesc.current = null;
    }
  }, []);

  const lastDesc = useRef(task.description);
  const onDescChange = (html: string) => {
    lastDesc.current = html;
    pendingDesc.current = html;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(flush, 700);
  };

  const close = useCallback(() => {
    flush();
    setOpen(false);
    setTimeout(onClose, 200);
  }, [flush, onClose]);

  useEffect(() => {
    requestAnimationFrame(() => setOpen(true));
    return () => flush();
  }, [flush]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [close]);

  // комментарии
  const nameOf = useCallback(
    (uid: string) => {
      const p = members.find((m) => m.user_id === uid)?.profile;
      return p ? { full_name: p.full_name, email: p.email } : null;
    },
    [members],
  );

  useEffect(() => {
    if (isCreate) return;
    let alive = true;
    supabase
      .from("comments")
      .select(
        "id,task_id,author_id,body,created_at, author:profiles(full_name,email)",
      )
      .eq("task_id", task.id)
      .order("created_at")
      .then(({ data, error }) => {
        if (!alive) return;
        onError(error);
        setComments((data ?? []) as unknown as Comment[]);
      });

    const ch = supabase
      .channel(`comments-${task.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "comments",
          filter: `task_id=eq.${task.id}`,
        },
        (payload) => {
          const row = payload.new as Comment;
          setComments((cs) =>
            cs && !cs.some((c) => c.id === row.id)
              ? [...cs, { ...row, author: nameOf(row.author_id) }]
              : cs,
          );
        },
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "comments" },
        (payload) => {
          setComments(
            (cs) =>
              cs?.filter((c) => c.id !== (payload.old as Comment).id) ?? cs,
          );
        },
      )
      .subscribe();
    return () => {
      alive = false;
      supabase.removeChannel(ch);
    };
  }, [supabase, task.id, onError, nameOf, isCreate]);

  function submitCreate() {
    const name = title.trim();
    if (!name || !onCreate) return;
    if (timer.current) clearTimeout(timer.current);
    pendingDesc.current = null;
    onCreate({ name, description: lastDesc.current });
    setOpen(false);
    setTimeout(onClose, 200);
  }

  async function addComment() {
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true);
    const { data, error } = await supabase
      .from("comments")
      .insert({ task_id: task.id, project_id: task.project_id, body })
      .select("id,task_id,author_id,body,created_at")
      .single();
    setSending(false);
    if (error) return onError(error);
    setDraft("");
    setComments((cs) =>
      cs?.some((c) => c.id === data.id)
        ? cs
        : [
            ...(cs ?? []),
            {
              ...(data as Comment),
              author: { full_name: me.full_name, email: me.email },
            },
          ],
    );
    onCommentAdded();
  }

  async function deleteComment(id: string) {
    if (!confirm("Удалить комментарий?")) return;
    setComments((cs) => cs?.filter((c) => c.id !== id) ?? cs);
    onError((await supabase.from("comments").delete().eq("id", id)).error);
  }

  const setProgress = (v: number) =>
    onUpdate({ progress: Math.max(0, Math.min(100, Math.round(v) || 0)) });
  const card = "rounded-xl border border-line p-[11px]";
  const lbl = "mb-1.5 block text-[11px] font-bold text-muted";
  const inp = "w-full rounded-lg border-0 bg-[#f5f4ef] p-2 outline-none";

  return (
    <>
      <div
        className={`fixed inset-0 z-[48] bg-black/30 transition-opacity duration-200 ${open ? "opacity-100" : "opacity-0"}`}
        onClick={close}
      />
      <aside
        className={`fixed top-0 right-0 bottom-0 z-50 flex w-full max-w-[640px] flex-col bg-white shadow-[-20px_0_70px_rgba(0,0,0,.16)] transition-transform duration-[240ms] ${
          open ? "translate-x-0" : "translate-x-[105%]"
        }`}
      >
        <div className="flex items-center gap-2.5 border-b border-line px-[18px] py-4">
          <button
            onClick={close}
            className="h-[34px] w-[34px] shrink-0 rounded-[9px] bg-[#f0efe9] text-xl"
          >
            ×
          </button>
          <input
            value={title}
            autoFocus={isCreate}
            placeholder={isCreate ? "Название задачи" : undefined}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => {
              if (isCreate) return;
              const v = title.trim();
              if (v && v !== task.name) onUpdate({ name: v });
              else setTitle(task.name);
            }}
            onKeyDown={(e) => {
              if (e.key !== "Enter") return;
              if (isCreate) submitCreate();
              else e.currentTarget.blur();
            }}
            className="min-w-0 flex-1 rounded-lg bg-transparent p-1 text-xl font-extrabold tracking-tight outline-none focus:outline focus:outline-line"
          />
          <span className="shrink-0 rounded-full bg-[#efeee8] px-2 py-1 text-[10px] font-extrabold text-[#5d5b54]">
            {phaseName}
          </span>
          {!isCreate && onDelete && (
            <button
              onClick={onDelete}
              title="Удалить задачу"
              aria-label="Удалить задачу"
              className={trashBtnCls + " h-[34px] w-[34px]"}
            >
              <TrashIcon size={16} />
            </button>
          )}
        </div>

        <div className="overflow-auto p-[18px]">
          <div className="grid gap-2.5 sm:grid-cols-2">
            <div className={card}>
              <label className={lbl}>Размер</label>
              <Select
                value={task.size}
                onChange={(v: Size) => onUpdate({ size: v })}
                className="!h-[37px] !rounded-lg !border-0 !bg-[#f5f4ef]"
                options={SIZES.map((s) => ({
                  value: s,
                  label: s,
                  hint: `${sizeDays[s]} ${sizeDays[s] === 1 ? "день" : "дн."}`,
                }))}
              />
            </div>
            <div className={card}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <label className={lbl + " !mb-0"}>Нужно обсудить</label>
                  <div className="mt-1 text-[11px] text-muted">
                    Помечает задачу как требующую совместного решения
                  </div>
                </div>
                <button
                  role="switch"
                  aria-checked={task.needs_discussion}
                  onClick={() =>
                    onUpdate({ needs_discussion: !task.needs_discussion })
                  }
                  className={`relative h-6 w-[42px] shrink-0 rounded-full transition ${task.needs_discussion ? "bg-warn" : "bg-[#d7d5ce]"}`}
                >
                  <span
                    className={`absolute top-[3px] left-[3px] h-[18px] w-[18px] rounded-full bg-white shadow transition ${
                      task.needs_discussion ? "translate-x-[18px]" : ""
                    }`}
                  />
                </button>
              </div>
            </div>
            <div className={card}>
              <label className={lbl}>Прогресс</label>
              <div className="grid grid-cols-[1fr_64px] items-center gap-2">
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={task.progress}
                  onChange={(e) => setProgress(+e.target.value)}
                  className="accent-ok"
                />
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={5}
                  value={task.progress}
                  onChange={(e) => setProgress(+e.target.value)}
                  className={inp}
                />
              </div>
            </div>
            <div className={card}>
              <label className={lbl}>Осталось работы</label>
              <div className="text-xl font-extrabold tracking-tight">
                {workdaysLabel(remainingTaskDays(task, sizeDays))}
              </div>
              <div className="mt-1 text-[11px] text-muted">
                {task.size} = {fmtDays(sizeOf(task, sizeDays))} дн. ·{" "}
                {task.progress}% готово
              </div>
            </div>
            <div className={card}>
              <label className={lbl}>Дедлайн</label>
              <input
                type="date"
                className={inp}
                value={task.deadline ?? ""}
                onChange={(e) => onUpdate({ deadline: e.target.value || null })}
              />
            </div>
            <div className={card}>
              <label className={lbl}>Успеваем к дедлайну?</label>
              <DeadlineHint task={task} sizeDays={sizeDays} />
            </div>
          </div>

          <SectionTitle>Описание</SectionTitle>
          <RichEditor initial={task.description} onChange={onDescChange} />

          {!isCreate && (
            <div className="mt-5 border-t border-line pt-1">
              <SectionTitle>Обсуждение</SectionTitle>
              {comments === null ? (
                <div className="py-4 text-[#999]">Загрузка…</div>
              ) : comments.length === 0 ? (
                <div className="py-4 text-[#999]">Пока нет комментариев.</div>
              ) : (
                comments.map((c) => {
                  const author =
                    c.author?.full_name || c.author?.email || "Пользователь";
                  return (
                    <div
                      key={c.id}
                      className="group grid grid-cols-[34px_1fr] gap-2.5 border-b border-[#efede6] py-[11px]"
                    >
                      <div className="grid h-[34px] w-[34px] place-items-center rounded-[10px] bg-ink text-[11px] font-black text-white">
                        {initials(author)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-baseline gap-2">
                          <strong className="text-xs">{author}</strong>
                          <time className="text-[10px] text-[#999]">
                            {commentTime.format(new Date(c.created_at))}
                          </time>
                          {c.author_id === me.id && (
                            <button
                              onClick={() => deleteComment(c.id)}
                              className="ml-auto text-xs text-[#aaa] opacity-0 group-hover:opacity-100 hover:text-bad"
                            >
                              удалить
                            </button>
                          )}
                        </div>
                        <div className="mt-0.5 leading-normal break-words whitespace-pre-wrap text-[#35342f]">
                          <Linkified text={c.body} />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div className="mt-3 rounded-xl border border-line bg-[#faf9f6] p-[9px]">
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if ((e.ctrlKey || e.metaKey) && e.key === "Enter")
                      addComment();
                  }}
                  placeholder="Напишите комментарий или вставьте ссылку… (Ctrl+Enter — отправить)"
                  className="min-h-[72px] w-full resize-y border-0 bg-transparent outline-none"
                />
                <div className="mt-1.5 flex justify-end">
                  <Btn
                    variant="primary"
                    onClick={addComment}
                    disabled={!draft.trim() || sending}
                  >
                    Отправить
                  </Btn>
                </div>
              </div>
            </div>
          )}
        </div>
        {isCreate && (
          <div className="mt-auto flex items-center justify-between gap-3 border-t border-line bg-white px-[18px] py-3.5">
            <span className="text-[11px] text-muted">
              Комментарии появятся после создания задачи
            </span>
            <div className="flex gap-2">
              <Btn onClick={close}>Отмена</Btn>
              <Btn
                variant="primary"
                onClick={submitCreate}
                disabled={!title.trim()}
              >
                Создать задачу
              </Btn>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-[22px] mb-2 text-xs font-extrabold tracking-[.07em] text-muted uppercase">
      {children}
    </div>
  );
}

function Linkified({ text }: { text: string }) {
  const parts = text.split(/(https?:\/\/[^\s<]+)/g);
  return (
    <>
      {parts.map((p, i) =>
        /^https?:\/\//.test(p) ? (
          <a
            key={i}
            href={p}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#165dca] underline"
          >
            {p}
          </a>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
}

function DeadlineHint({ task, sizeDays }: { task: Task; sizeDays: SizeDays }) {
  const st = deadlineStatus(task, sizeDays);
  const big = "text-xl font-extrabold tracking-tight";
  const sub = "mt-1 text-[11px] text-muted";
  if (!st)
    return (
      <>
        <div className={big + " text-[#b5b3aa]"}>—</div>
        <div className={sub}>Поставьте дедлайн, чтобы проверить сроки</div>
      </>
    );
  if (st.kind === "done")
    return (
      <>
        <div className={big + " text-ok"}>✓ Готово</div>
        <div className={sub}>Задача выполнена</div>
      </>
    );
  if (st.kind === "overdue")
    return (
      <>
        <div className={big + " text-bad"}>Просрочено</div>
        <div className={sub}>
          Дедлайн прошёл, осталось {workdaysLabel(st.need)} работы
        </div>
      </>
    );
  if (st.kind === "late")
    return (
      <>
        <div className={big + " text-bad"}>Не успеваем</div>
        <div className={sub}>
          Нужно {workdaysLabel(st.need)}, до дедлайна {workdaysLabel(st.avail)}
        </div>
      </>
    );
  if (st.kind === "tight")
    return (
      <>
        <div className={big + " text-[#9a6b00]"}>Впритык</div>
        <div className={sub}>
          Нужно {workdaysLabel(st.need)}, до дедлайна {workdaysLabel(st.avail)}{" "}
          — без запаса
        </div>
      </>
    );
  return (
    <>
      <div className={big + " text-ok"}>Успеваем</div>
      <div className={sub}>Запас {workdaysLabel(st.slack)}</div>
    </>
  );
}
