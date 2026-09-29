"use client";

import { useI18n } from "@/i18n/client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { STATUSES, STATUS_META, type Status } from "@/lib/types";
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
} from "@/lib/schedule";
import Link from "next/link";
import {
  WAITING,
  countSince,
  countedFromPatch,
  stepChecklist,
  checkLabel,
  stepHref,
  stepProgress,
  type CheckItem,
  type ProfileStep,
} from "@/lib/steps";
import {
  emptyProfile,
  type ProductProfile,
  type ProfileItem,
} from "@/lib/profile";
import { Btn, Select, TrashIcon, trashBtnCls } from "../ui";
import RichEditor from "./RichEditor";
import ShareDialog, { LinkIcon } from "./ShareDialog";

export type HypothesisRef = { id: string; title: string; status: string };

type Props = {
  task: Task;
  projectId?: string;
  /** null/undefined — связь с гипотезами недоступна */
  hypotheses?: HypothesisRef[] | null;
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
  /** комментарии, которые были для меня новыми, — подсветить */
  freshCommentIds?: Set<string>;
  /** клиент / партнёр: только просмотр */
  readOnly?: boolean;
};


export default function TaskDrawer({
  task,
  projectId,
  hypotheses,
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
  freshCommentIds,
  readOnly = false,
}: Props) {
  const { t, locale, workdays, html, lang } = useI18n();
  const commentTime = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }),
    [locale],
  );
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
      .subscribe((status, err) => {
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT")
          console.warn("[realtime] комментарии:", status, err?.message ?? "");
        else console.info("[realtime] комментарии:", status);
      });

    // страховка: если веб-сокет отвалился — подтянуть при возврате и раз в 30 с
    const refetch = async () => {
      if (document.visibilityState !== "visible") return;
      const { data } = await supabase
        .from("comments")
        .select(
          "id,task_id,author_id,body,created_at, author:profiles(full_name,email)",
        )
        .eq("task_id", task.id)
        .order("created_at");
      if (alive && data) setComments(data as unknown as Comment[]);
    };
    const iv = setInterval(refetch, 30_000);
    document.addEventListener("visibilitychange", refetch);
    window.addEventListener("focus", refetch);
    return () => {
      alive = false;
      clearInterval(iv);
      document.removeEventListener("visibilitychange", refetch);
      window.removeEventListener("focus", refetch);
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
    if (!confirm(t("Удалить комментарий?"))) return;
    setComments((cs) => cs?.filter((c) => c.id !== id) ?? cs);
    onError((await supabase.from("comments").delete().eq("id", id)).error);
  }

  const setProgress = (v: number) => {
    const progress = Math.max(0, Math.min(100, Math.round(v) || 0));
    if (progress === 100 && task.status !== "done")
      onUpdate({ progress, status: "done" });
    else if (progress < 100 && task.status === "done")
      onUpdate({ progress, status: "in_progress" });
    else if (progress > 0 && task.status === "todo")
      onUpdate({ progress, status: "in_progress" });
    else onUpdate({ progress });
  };
  // задача фазы 0: прогресс считается из заполненности профиля
  const step = (isCreate ? null : task.profile_step) as ProfileStep | null;
  const [check, setCheck] = useState<CheckItem[] | null>(null);
  useEffect(() => {
    if (!step) return;
    let alive = true;
    (async () => {
      try {
        const [pr, it] = await Promise.all([
          supabase
            .from("product_profiles")
            .select("*")
            .eq("project_id", task.project_id)
            .maybeSingle(),
          supabase
            .from("profile_items")
            .select("*")
            .eq("project_id", task.project_id),
        ]);
        if (!alive) return;
        const profile: ProductProfile = {
          ...emptyProfile(task.project_id),
          ...((pr.data as Partial<ProductProfile>) ?? {}),
        };
        setCheck(
          stepChecklist(
            step,
            profile,
            (it.data ?? []) as ProfileItem[],
            countSince(task),
          ),
        );
      } catch {
        if (alive) setCheck([]);
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, supabase, task.project_id, task.status, task.counted_from]);
  const stepPct = check ? stepProgress(check) : task.progress;
  const since = step ? countSince(task) : null;

  const setStatus = (status: Status) => {
    if (step) {
      // закрыли — 100%; на пересмотр или повторная задача стартовала — считаем заново;
      // открыли снова — прогресс по профилю
      const cf = countedFromPatch(task, status);
      if (status === "done") onUpdate({ status, progress: 100, ...cf });
      else if ("counted_from" in cf) onUpdate({ status, progress: 0, ...cf });
      else onUpdate({ status, progress: stepPct });
      return;
    }
    if (status === "done") onUpdate({ status, progress: 100 });
    else if (status === "revisit") onUpdate({ status, progress: 0 });
    else if (task.status === "done" && task.progress === 100)
      onUpdate({ status, progress: status === "todo" ? 0 : 90 });
    else onUpdate({ status });
  };
  const [shareOpen, setShareOpen] = useState(false);
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
            value={readOnly ? t(title) : title}
            readOnly={readOnly}
            autoFocus={isCreate}
            placeholder={isCreate ? t("Название задачи") : undefined}
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
          {!isCreate && !readOnly && (
            <button
              onClick={() => setShareOpen(true)}
              title={t("Поделиться ссылкой на задачу")}
              aria-label={t("Поделиться ссылкой")}
              className={`grid h-[34px] w-[34px] shrink-0 place-items-center rounded-[8px] transition hover:bg-[#f0efe9] hover:text-ink ${task.share_token ? "text-[#1d4f9a]" : "text-[#9a988f]"}`}
            >
              <LinkIcon />
            </button>
          )}
          {!isCreate && !readOnly && onDelete && (
            <button
              onClick={onDelete}
              title={t("Удалить задачу")}
              aria-label={t("Удалить задачу")}
              className={trashBtnCls + " h-[34px] w-[34px]"}
            >
              <TrashIcon size={16} />
            </button>
          )}
        </div>

        <div className="overflow-auto p-[18px]">
          {readOnly && (
            <div className="mb-3 rounded-[10px] bg-[#e6effc] px-3 py-2 text-sm text-[#1d4f9a]">
              {t("👁 Только просмотр — изменять задачу и писать комментарии может команда проекта.")}
            </div>
          )}
          {/* fieldset disabled — все поля ниже недоступны для правки */}
          <fieldset disabled={readOnly} className="m-0 min-w-0 border-0 p-0">
          <div className="grid gap-2.5 sm:grid-cols-2">
            <div className={card}>
              <label className={lbl}>{t("Размер")}</label>
              <Select
                value={task.size}
                onChange={(v: Size) => onUpdate({ size: v })}
                className="!h-[37px] !rounded-lg !border-0 !bg-[#f5f4ef]"
                options={SIZES.map((s) => ({
                  value: s,
                  label: s,
                  hint: `${sizeDays[s]} ${sizeDays[s] === 1 ? t("день") : t("дн.")}`,
                }))}
              />
            </div>
            <div className={card}>
              <label className={lbl}>{t("Статус")}</label>
              <Select
                value={task.status}
                onChange={(v: Status) => setStatus(v)}
                className="!h-[37px] !rounded-lg !border-0 !bg-[#f5f4ef]"
                // «На пересмотре» — только для уже сделанных задач
                options={STATUSES.filter(
                  (st) =>
                    st !== "revisit" ||
                    task.status === "done" ||
                    task.status === "revisit",
                ).map((st) => ({
                  value: st,
                  label: (
                    <span className="inline-flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full ${STATUS_META[st].dot}`}
                      />
                      {t(STATUS_META[st].label)}
                    </span>
                  ),
                }))}
              />
            </div>
            {step ? (
              <div className={card}>
                <label className={lbl}>{t("Прогресс · из профиля")}</label>
                <div className="flex items-center gap-2">
                  <div className="h-[6px] flex-1 overflow-hidden rounded-full bg-[#eceae3]">
                    <span
                      className="block h-full rounded-full bg-ok"
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                  <span className="w-10 text-right text-sm font-extrabold">
                    {task.progress}%
                  </span>
                </div>
                <div className="mt-1 text-[11px] text-muted">
                  {task.status === "done"
                    ? t("Задача закрыта вручную")
                    : since === WAITING
                      ? t("Начнёт считать, когда задача будет взята в работу")
                      : since
                        ? t("Считает изменения с {date}", {
                            date: new Date(since).toLocaleDateString(locale),
                          })
                        : t("До 99% — закройте статусом «Готово», когда решите")}
                </div>
              </div>
            ) : (
              <div className={card}>
                <label className={lbl}>{t("Прогресс")}</label>
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
            )}
            <div className={card}>
              <label className={lbl}>{t("Осталось работы")}</label>
              <div className="text-xl font-extrabold tracking-tight">
                {workdays(remainingTaskDays(task, sizeDays))}
              </div>
              <div className="mt-1 text-[11px] text-muted">
                {task.size} = {fmtDays(sizeOf(task, sizeDays))} {t("дн.")} ·{" "}
                {task.progress}% {t("готово")}
              </div>
            </div>
            <div className={card}>
              <label className={lbl}>{t("Дедлайн")}</label>
              <input
                type="date"
                className={inp}
                value={task.deadline ?? ""}
                onChange={(e) => onUpdate({ deadline: e.target.value || null })}
              />
            </div>
            <div className={card}>
              <label className={lbl}>{t("Успеваем к дедлайну?")}</label>
              <DeadlineHint task={task} sizeDays={sizeDays} />
            </div>
            {step && (
              <div className={card + " sm:col-span-2"}>
                <div className="flex items-baseline gap-2">
                  <label className={lbl}>{t("Что заполнено в профиле")}</label>
                  {check && (
                    <span className="ml-auto text-[11px] font-bold text-muted">
                      {t("{k} из {of}", { k: check.filter((c) => c.done).length, of: check.length })}
                    </span>
                  )}
                </div>
                {!check ? (
                  <div className="text-sm text-muted">{t("Загрузка…")}</div>
                ) : check.length === 0 ? (
                  <div className="text-sm text-muted">
                    {t("Не удалось загрузить профиль.")}
                  </div>
                ) : (
                  <ul className="flex flex-col gap-0.5">
                    {check.map((c) => (
                      <li key={c.label}>
                        <Link
                          href={stepHref(task.project_id, c)}
                          className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-[#f5f4ef]"
                        >
                          <span
                            className={`grid h-4 w-4 shrink-0 place-items-center rounded-full text-[10px] font-black ${
                              c.done
                                ? "bg-ok text-white"
                                : "border border-[#c9c6bb] text-transparent"
                            }`}
                          >
                            ✓
                          </span>
                          <span
                            className={c.done ? "text-muted" : "font-semibold"}
                          >
                            {checkLabel(c, t)}
                          </span>
                          {!c.done && (
                            <span className="ml-auto text-xs font-bold text-muted">
                              {t("заполнить →")}
                            </span>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
                {check &&
                  task.status === "done" &&
                  check.some((c) => !c.done) && (
                    <p className="mt-1.5 text-xs text-[#6b4c00]">
                      {t("Задача закрыта, но в профиле есть пустые пункты.")}
                    </p>
                  )}
              </div>
            )}
            {hypotheses && !step && (
              <div className={card + " sm:col-span-2"}>
                <div className="flex items-baseline gap-2">
                  <label className={lbl}>{t("Проверяет гипотезу")}</label>
                  {task.hypothesis_id && projectId && (
                    <Link
                      href={`/projects/${projectId}/profile?tab=hypotheses&item=${task.hypothesis_id}`}
                      className="ml-auto text-[11px] font-bold text-muted hover:text-ink"
                    >
                      {t("Открыть в профиле →")}
                    </Link>
                  )}
                </div>
                <Select
                  value={task.hypothesis_id ?? ""}
                  onChange={(v: string) =>
                    onUpdate({ hypothesis_id: v || null })
                  }
                  menuWidth={360}
                  className="!h-[37px] !rounded-lg !border-0 !bg-[#f5f4ef]"
                  options={[
                    {
                      value: "",
                      label: (
                        <span className="text-muted">
                          {hypotheses.length
                            ? t("— не связана")
                            : t("— гипотез пока нет в профиле")}
                        </span>
                      ),
                    },
                    ...hypotheses.map((h) => ({
                      value: h.id,
                      label: h.title.trim() || t("Гипотеза без формулировки"),
                    })),
                  ]}
                />
              </div>
            )}
          </div>

          <SectionTitle>{t("Описание")}</SectionTitle>
          </fieldset>
          <RichEditor
            // только просмотр — показываем перевод шаблонных абзацев; в редактор — оригинал
            key={readOnly ? lang : "edit"}
            initial={readOnly ? html(task.description) : task.description}
            onChange={onDescChange}
            readOnly={readOnly}
          />

          {!isCreate && (
            <div className="mt-5 border-t border-line pt-1">
              <SectionTitle>{t("Обсуждение")}</SectionTitle>
              {comments === null ? (
                <div className="py-4 text-[#999]">{t("Загрузка…")}</div>
              ) : comments.length === 0 ? (
                <div className="py-4 text-[#999]">{t("Пока нет комментариев.")}</div>
              ) : (
                comments.map((c) => {
                  const author =
                    c.author?.full_name || c.author?.email || t("Пользователь");
                  const fresh =
                    !!freshCommentIds?.has(c.id) && c.author_id !== me.id;
                  return (
                    <div
                      key={c.id}
                      className={`group grid grid-cols-[34px_1fr] gap-2.5 border-b border-[#efede6] py-[11px] ${
                        fresh
                          ? "-mx-2 rounded-lg border-l-[3px] border-l-bad bg-[#fff6f4] px-2"
                          : ""
                      }`}
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
                          {fresh && (
                            <span className="rounded-full bg-bad px-1.5 text-[10px] leading-4 font-black text-white">
                              {t("новое")}
                            </span>
                          )}
                          {c.author_id === me.id && (
                            <button
                              onClick={() => deleteComment(c.id)}
                              className="ml-auto text-xs text-[#aaa] opacity-0 group-hover:opacity-100 hover:text-bad"
                            >
                              {t("удалить")}
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
              <div
                hidden={readOnly}
                className="mt-3 rounded-xl border border-line bg-[#faf9f6] p-[9px]"
              >
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if ((e.ctrlKey || e.metaKey) && e.key === "Enter")
                      addComment();
                  }}
                  placeholder={t("Напишите комментарий или вставьте ссылку… (Ctrl+Enter — отправить)")}
                  className="min-h-[72px] w-full resize-y border-0 bg-transparent outline-none"
                />
                <div className="mt-1.5 flex justify-end">
                  <Btn
                    variant="primary"
                    onClick={addComment}
                    disabled={!draft.trim() || sending}
                  >
                    {t("Отправить")}
                  </Btn>
                </div>
              </div>
            </div>
          )}
        </div>
        {isCreate && (
          <div className="mt-auto flex items-center justify-between gap-3 border-t border-line bg-white px-[18px] py-3.5">
            <span className="text-[11px] text-muted">
              {t("Комментарии появятся после создания задачи")}
            </span>
            <div className="flex gap-2">
              <Btn onClick={close}>{t("Отмена")}</Btn>
              <Btn
                variant="primary"
                onClick={submitCreate}
                disabled={!title.trim()}
              >
                {t("Создать задачу")}
              </Btn>
            </div>
          </div>
        )}
      </aside>
      {!isCreate && (
        <ShareDialog
          open={shareOpen}
          onClose={() => setShareOpen(false)}
          taskName={task.name}
          token={task.share_token ?? null}
          onChange={(share_token) => onUpdate({ share_token })}
        />
      )}
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
  const { t, workdays } = useI18n();
  const st = deadlineStatus(task, sizeDays);
  const big = "text-xl font-extrabold tracking-tight";
  const sub = "mt-1 text-[11px] text-muted";
  if (!st)
    return (
      <>
        <div className={big + " text-[#b5b3aa]"}>—</div>
        <div className={sub}>{t("Поставьте дедлайн, чтобы проверить сроки")}</div>
      </>
    );
  if (st.kind === "done")
    return (
      <>
        <div className={big + " text-ok"}>{t("✓ Готово")}</div>
        <div className={sub}>{t("Задача выполнена")}</div>
      </>
    );
  if (st.kind === "overdue")
    return (
      <>
        <div className={big + " text-bad"}>{t("Просрочено")}</div>
        <div className={sub}>
          {t("Дедлайн прошёл, осталось {n} работы", { n: workdays(st.need) })}
        </div>
      </>
    );
  if (st.kind === "late")
    return (
      <>
        <div className={big + " text-bad"}>{t("Не успеваем")}</div>
        <div className={sub}>
          {t("Нужно {need}, до дедлайна {avail}", {
            need: workdays(st.need),
            avail: workdays(st.avail),
          })}
        </div>
      </>
    );
  if (st.kind === "tight")
    return (
      <>
        <div className={big + " text-[#9a6b00]"}>{t("Впритык")}</div>
        <div className={sub}>
          {t("Нужно {need}, до дедлайна {avail} — без запаса", {
            need: workdays(st.need),
            avail: workdays(st.avail),
          })}
        </div>
      </>
    );
  return (
    <>
      <div className={big + " text-ok"}>{t("Успеваем")}</div>
      <div className={sub}>{t("Запас {n}", { n: workdays(st.slack) })}</div>
    </>
  );
}
