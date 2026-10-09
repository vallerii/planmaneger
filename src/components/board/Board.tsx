"use client";

import { useI18n, useT } from "@/i18n/client";
import LangSwitcher from "../LangSwitcher";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  closestCorners,
  pointerWithin,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { createClient } from "@/lib/supabase/client";
import type {
  Member,
  Phase,
  Profile,
  Project,
  Size,
  SizeDays,
  Task,
} from "@/lib/types";
import { SIZES } from "@/lib/types";
import { buildSchedule, initials, parseDate } from "@/lib/schedule";
import {
  Brand,
  Btn,
  ConfirmDialog,
  Field,
  Modal,
  Select,
  Toast,
  TrashIcon,
  inputCls,
} from "../ui";
import PhaseColumn from "./PhaseColumn";
import { TaskCardView } from "./TaskCard";
import TaskDrawer from "./TaskDrawer";
import CommentsBell from "./CommentsBell";
import { useUnreadComments } from "@/lib/unread";
import MembersModal from "./MembersModal";
import ProjectTitle from "./ProjectTitle";
import ProjectNav from "../ProjectNav";
import type { HypothesisRef } from "./TaskDrawer";
import type { TrMap } from "@/lib/translate/content";
import { ContentTrProvider, useMakeContentTr } from "@/lib/translate/client";
import { TranslatePanel, TranslationBar } from "../Translation";

type Props = {
  initialProject: Project;
  initialPhases: Phase[];
  initialTasks: Task[];
  initialMembers: Member[];
  me: Profile;
  mission?: string | null;
  /** null — миграция 0004 ещё не применена, связь с гипотезами скрыта */
  hypotheses?: HypothesisRef[] | null;
  initialTaskId?: string | null;
  /** AI-перевод контента для EN / DE (миграция 0012) */
  translations?: TrMap | null;
};

const byPos = <T extends { position: number }>(a: T, b: T) =>
  a.position - b.position;

export default function Board({
  initialProject,
  initialPhases,
  initialTasks,
  initialMembers,
  me,
  mission,
  hypotheses = null,
  initialTaskId = null,
  translations = null,
}: Props) {
  const i18n = useI18n();
  const { t } = i18n;
  // EN / DE — показываем перевод, редактирование только в русской версии
  const tr = useMakeContentTr(translations);
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const [project, setProject] = useState(initialProject);
  const [phases, setPhases] = useState(() => [...initialPhases].sort(byPos));
  const [tasks, setTasks] = useState(initialTasks);
  const [members, setMembers] = useState(initialMembers);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(() =>
    initialTaskId && initialTasks.some((t) => t.id === initialTaskId)
      ? initialTaskId
      : null,
  );
  const [toastText, setToastText] = useState<string | null>(null);
  const [modal, setModal] = useState<
    null | "phase" | "task" | "settings" | "members"
  >(null);
  const [draftTask, setDraftTask] = useState<Task | null>(null);
  // участники открыты из настроек — по закрытию вернёмся в настройки
  const [membersFromSettings, setMembersFromSettings] = useState(false);
  const [confirmTask, setConfirmTask] = useState<string | null>(null);
  const [confirmPhase, setConfirmPhase] = useState<string | null>(null);
  const [confirmProject, setConfirmProject] = useState(false);
  const [dragging, setDragging] = useState<{
    type: "task" | "phase";
    id: string;
    fromPhase?: string;
  } | null>(null);
  const draggingRef = useRef(dragging);
  useEffect(() => {
    draggingRef.current = dragging;
  }, [dragging]);
  const lastDragEnd = useRef(0);

  // ---------- непрочитанные комментарии ----------
  const unread = useUnreadComments(supabase, project.id);
  const markReadRef = useRef(unread.markRead);
  const reloadUnreadRef = useRef(unread.reload);
  useEffect(() => {
    markReadRef.current = unread.markRead;
    reloadUnreadRef.current = unread.reload;
  });
  const activeTaskRef = useRef(activeTaskId);
  /** комментарии, которые были новыми, когда открыли задачу, — подсвечиваем */
  const [fresh, setFresh] = useState<{ task: string | null; ids: Set<string> }>(
    () => ({ task: null, ids: new Set() }),
  );
  useEffect(() => {
    activeTaskRef.current = activeTaskId;
    if (!activeTaskId) return;
    // открыл задачу — прочитал
    markReadRef
      .current([activeTaskId])
      .then((ids) => setFresh({ task: activeTaskId, ids }));
  }, [activeTaskId]);

  const sd = project.size_days;
  const isOwner = project.owner_id === me.id;
  /** клиент / партнёр — только просмотр */
  const isViewer =
    members.find((m) => m.user_id === me.id)?.role === "viewer";
  /** в EN / DE ничего не редактируется: источник правды — русский текст */
  const readOnly = isViewer || tr.active;

  const toast = useCallback((t: string) => {
    setToastText(t);
    setTimeout(() => setToastText(null), 1800);
  }, []);

  const fail = useCallback(
    (error: { message: string } | null) => {
      if (error) toast(t("Ошибка:") + " " + error.message);
    },
    [toast, t],
  );

  // ---------- derived ----------
  const columns = useMemo(() => {
    const map: Record<string, Task[]> = {};
    for (const p of phases) map[p.id] = [];
    for (const t of tasks)
      (map[t.phase_id] ??= []).push(
        tr.task({ ...t, unread: unread.byTask[t.id] ?? 0 }),
      );
    for (const k in map) map[k].sort(byPos);
    return map;
  }, [phases, tasks, unread.byTask, tr]);
  const phasesView = useMemo(() => phases.map(tr.phase), [phases, tr]);
  const hypothesesView = useMemo(
    () =>
      hypotheses?.map((h) => ({
        ...h,
        title: tr.text(`item:${h.id}.title`, h.title),
      })) ?? null,
    [hypotheses, tr],
  );

  const schedule = useMemo(
    () => buildSchedule(project.start_date, phases, columns, sd),
    [project.start_date, phases, columns, sd],
  );

  // ---------- realtime ----------
  useEffect(() => {
    const ch = supabase
      .channel(`project-${project.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tasks",
          filter: `project_id=eq.${project.id}`,
        },
        (payload) => {
          if (draggingRef.current) return;
          if (payload.eventType === "DELETE") {
            setTasks((ts) =>
              ts.filter((t) => t.id !== (payload.old as Task).id),
            );
            return;
          }
          const row = payload.new as Task;
          setTasks((ts) => {
            const i = ts.findIndex((t) => t.id === row.id);
            if (i < 0) return [...ts, { ...row, comment_count: 0 }];
            const copy = [...ts];
            copy[i] = { ...copy[i], ...row };
            return copy;
          });
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "phases",
          filter: `project_id=eq.${project.id}`,
        },
        (payload) => {
          if (draggingRef.current) return;
          if (payload.eventType === "DELETE") {
            setPhases((ps) =>
              ps.filter((p) => p.id !== (payload.old as Phase).id),
            );
            return;
          }
          const row = payload.new as Phase;
          setPhases((ps) => {
            const i = ps.findIndex((p) => p.id === row.id);
            const next =
              i < 0
                ? [...ps, row]
                : ps.map((p) => (p.id === row.id ? { ...p, ...row } : p));
            return next.sort(byPos);
          });
        },
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "tasks" },
        (payload) => {
          setTasks((ts) => ts.filter((t) => t.id !== (payload.old as Task).id));
        },
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "phases" },
        (payload) => {
          setPhases((ps) =>
            ps.filter((p) => p.id !== (payload.old as Phase).id),
          );
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "projects",
          filter: `id=eq.${project.id}`,
        },
        (payload) => {
          const row = payload.new as Project;
          setProject((p) => ({
            ...p,
            ...row,
            size_days: { ...p.size_days, ...(row.size_days ?? {}) },
          }));
        },
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "comments",
          filter: `project_id=eq.${project.id}`,
        },
        (payload) => {
          const row = payload.new as {
            id: string;
            task_id: string;
            author_id: string;
          };
          if (row.author_id === me.id) return; // свои учитываем сразу
          if (row.task_id === activeTaskRef.current) {
            // задача открыта — комментарий сразу прочитан, но подсвечен
            markReadRef.current([row.task_id]);
            setFresh((f) => ({
              task: row.task_id,
              ids: new Set(f.task === row.task_id ? f.ids : []).add(row.id),
            }));
          } else reloadUnreadRef.current();
          setTasks((ts) =>
            ts.map((t) =>
              t.id === row.task_id
                ? { ...t, comment_count: (t.comment_count ?? 0) + 1 }
                : t,
            ),
          );
        },
      )
      .subscribe((status, err) => {
        // помогает понять, почему не приходят обновления
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT")
          console.warn("[realtime] доска:", status, err?.message ?? "");
        else console.info("[realtime] доска:", status);
      });
    return () => {
      supabase.removeChannel(ch);
    };
  }, [supabase, project.id, me.id]);

  // Страховка, если веб-сокет молча отвалился (сон, смена сети):
  // при возврате на вкладку и раз в минуту подтягиваем счётчики комментариев.
  useEffect(() => {
    const refresh = async () => {
      if (document.visibilityState !== "visible") return;
      reloadUnreadRef.current();
      const { data } = await supabase
        .from("tasks")
        .select("id, comments(count)")
        .eq("project_id", project.id);
      if (!data) return;
      const counts = new Map(
        data.map((r) => [
          r.id as string,
          Array.isArray(r.comments) && r.comments[0]
            ? (r.comments[0] as { count: number }).count
            : 0,
        ]),
      );
      setTasks((ts) =>
        ts.map((t) =>
          counts.has(t.id) && counts.get(t.id) !== t.comment_count
            ? { ...t, comment_count: counts.get(t.id) }
            : t,
        ),
      );
    };
    const iv = setInterval(refresh, 60_000);
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      clearInterval(iv);
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, [supabase, project.id]);

  // ---------- project ----------
  async function updateProject(patch: Partial<Project>) {
    setProject((p) => ({ ...p, ...patch }));
    const { error } = await supabase
      .from("projects")
      .update(patch)
      .eq("id", project.id);
    fail(error);
  }

  async function deleteProject() {
    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", project.id);
    if (error) return fail(error);
    router.push("/");
    router.refresh();
  }

  // ---------- phases ----------
  async function addPhase(name: string) {
    const position = phases.length
      ? Math.max(...phases.map((p) => p.position)) + 1
      : 0;
    const { data, error } = await supabase
      .from("phases")
      .insert({ project_id: project.id, name, position })
      .select()
      .single();
    if (error) return fail(error);
    setPhases((ps) =>
      (ps.some((p) => p.id === data.id) ? ps : [...ps, data as Phase]).sort(
        byPos,
      ),
    );
  }

  async function renamePhase(id: string, name: string) {
    setPhases((ps) => ps.map((p) => (p.id === id ? { ...p, name } : p)));
    fail((await supabase.from("phases").update({ name }).eq("id", id)).error);
  }

  async function removePhase(id: string, moveTo: string | null) {
    const moving = columns[id] ?? [];
    if (moveTo && moving.length) {
      // переносим задачи в конец выбранной фазы, потом удаляем фазу
      await persistColumn(moveTo, [...(columns[moveTo] ?? []), ...moving]);
    }
    setPhases((ps) => ps.filter((p) => p.id !== id));
    setTasks((ts) => ts.filter((t) => t.phase_id !== id));
    fail((await supabase.from("phases").delete().eq("id", id)).error);
  }

  async function persistPhaseOrder(ordered: Phase[]) {
    const next = ordered.map((p, i) => ({ ...p, position: i }));
    setPhases(next);
    fail(
      (
        await supabase.rpc("reorder_phases", {
          p_project: project.id,
          p_ids: next.map((p) => p.id),
        })
      ).error,
    );
  }

  function movePhase(id: string, dir: -1 | 1) {
    const i = phases.findIndex((p) => p.id === id);
    const j = i + dir;
    if (j < 0 || j >= phases.length) return;
    persistPhaseOrder(arrayMove(phases, i, j));
  }

  // ---------- tasks ----------
  async function addTask(draft: Task) {
    const phaseId = draft.phase_id;
    const col = columns[phaseId] ?? [];
    const position = col.length
      ? Math.max(...col.map((t) => t.position)) + 1
      : 0;
    const { data, error } = await supabase
      .from("tasks")
      .insert({
        project_id: project.id,
        phase_id: phaseId,
        name: draft.name,
        size: draft.size,
        description: draft.description,
        progress: draft.progress,
        needs_discussion: draft.needs_discussion,
        status: draft.status,
        deadline: draft.deadline,
        ...(draft.hypothesis_id ? { hypothesis_id: draft.hypothesis_id } : {}),
        position,
      })
      .select()
      .single();
    if (error) return fail(error);
    setTasks((ts) =>
      ts.some((t) => t.id === data.id)
        ? ts
        : [...ts, { ...(data as Task), comment_count: 0 }],
    );
  }

  const updateTask = useCallback(
    async (id: string, patch: Partial<Task>) => {
      setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, ...patch } : t)));
      const { comment_count: _c, unread: _u, ...dbPatch } = patch;
      void _c;
      void _u;
      if (Object.keys(dbPatch).length)
        fail((await supabase.from("tasks").update(dbPatch).eq("id", id)).error);
    },
    [supabase, fail],
  );

  async function deleteTask(id: string) {
    setTasks((ts) => ts.filter((t) => t.id !== id));
    if (activeTaskId === id) setActiveTaskId(null);
    fail((await supabase.from("tasks").delete().eq("id", id)).error);
  }

  async function persistColumn(phaseId: string, ordered: Task[]) {
    const ids = ordered.map((t) => t.id);
    setTasks((ts) =>
      ts.map((t) => {
        const i = ids.indexOf(t.id);
        return i < 0 ? t : { ...t, phase_id: phaseId, position: i };
      }),
    );
    fail(
      (await supabase.rpc("reorder_tasks", { p_phase: phaseId, p_ids: ids }))
        .error,
    );
  }

  // ---------- drag & drop ----------
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const collision: CollisionDetection = useCallback((args) => {
    const type = args.active.data.current?.type;
    if (type === "phase") {
      return closestCenter({
        ...args,
        droppableContainers: args.droppableContainers.filter(
          (c) => c.data.current?.type === "phase",
        ),
      });
    }
    const containers = args.droppableContainers.filter(
      (c) => c.data.current?.type !== "phase",
    );
    const within = pointerWithin({ ...args, droppableContainers: containers });
    if (within.length) {
      const overTask = within.find(
        (c) =>
          containers.find((x) => x.id === c.id)?.data.current?.type === "task",
      );
      return overTask ? [overTask] : within;
    }
    return closestCorners({ ...args, droppableContainers: containers });
  }, []);

  const taskPhaseOf = (overId: string, overData?: Record<string, unknown>) => {
    if (overData?.type === "column") return overData.phaseId as string;
    return tasks.find((t) => t.id === overId)?.phase_id;
  };

  function onDragStart(e: DragStartEvent) {
    const type = e.active.data.current?.type as "task" | "phase";
    const id = String(e.active.id);
    setDragging({
      type,
      id,
      fromPhase:
        type === "task" ? tasks.find((t) => t.id === id)?.phase_id : undefined,
    });
  }

  function onDragOver(e: DragOverEvent) {
    const { active, over } = e;
    if (!over || active.data.current?.type !== "task") return;
    const activeId = String(active.id);
    const overId = String(over.id);
    const task = tasks.find((t) => t.id === activeId);
    const toPhase = taskPhaseOf(overId, over.data.current);
    if (!task || !toPhase || task.phase_id === toPhase) return;

    // переносим карточку в другую фазу (временная позиция — рядом с целевой карточкой)
    const col = columns[toPhase] ?? [];
    let position: number;
    if (over.data.current?.type === "column") {
      position = col.length ? col[col.length - 1].position + 1 : 0;
    } else {
      const overTask = col.find((t) => t.id === overId);
      const rect = active.rect.current.translated;
      const below =
        rect && over.rect
          ? rect.top > over.rect.top + over.rect.height / 2
          : false;
      position = (overTask?.position ?? 0) + (below ? 0.5 : -0.5);
    }
    setTasks((ts) =>
      ts.map((t) =>
        t.id === activeId ? { ...t, phase_id: toPhase, position } : t,
      ),
    );
  }

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    const drag = dragging;
    setDragging(null);
    lastDragEnd.current = Date.now();
    if (!drag) return;

    if (drag.type === "phase") {
      if (!over || active.id === over.id) return;
      const from = phases.findIndex((p) => p.id === active.id);
      const to = phases.findIndex((p) => p.id === over.id);
      if (from < 0 || to < 0) return;
      persistPhaseOrder(arrayMove(phases, from, to));
      return;
    }

    const task = tasks.find((t) => t.id === active.id);
    if (!task) return;
    let col = columns[task.phase_id] ?? [];
    if (over && over.data.current?.type === "task" && over.id !== active.id) {
      const from = col.findIndex((t) => t.id === active.id);
      const to = col.findIndex((t) => t.id === over.id);
      if (from >= 0 && to >= 0) col = arrayMove(col, from, to);
    }
    persistColumn(task.phase_id, col);
    if (drag.fromPhase && drag.fromPhase !== task.phase_id) {
      persistColumn(
        drag.fromPhase,
        (columns[drag.fromPhase] ?? []).filter((t) => t.id !== task.id),
      );
    }
  }

  function onDragCancel() {
    setDragging(null);
    router.refresh();
  }

  const draggedTask =
    dragging?.type === "task" ? tasks.find((t) => t.id === dragging.id) : null;
  const draggedPhase =
    dragging?.type === "phase"
      ? phases.find((p) => p.id === dragging.id)
      : null;
  const activeTaskRaw = activeTaskId
    ? (tasks.find((t) => t.id === activeTaskId) ?? null)
    : null;
  const activeTask = activeTaskRaw ? tr.task(activeTaskRaw) : null;
  const activePhase = activeTask
    ? phasesView.find((p) => p.id === activeTask.phase_id)
    : null;

  // ---------- export ----------
  function exportJson() {
    const data = {
      title: project.name,
      start: project.start_date,
      sizeDays: sd,
      phases: phases.map((p) => ({
        name: p.name,
        tasks: (columns[p.id] ?? []).map((t) => ({
          name: t.name,
          size: t.size,
          progress: t.progress,
          needsDiscussion: t.needs_discussion,
          deadline: t.deadline,
          description: t.description,
        })),
      })),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${project.name.replace(/[^\p{L}\p{N}]+/gu, "-").toLowerCase() || "roadmap"}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 500);
    toast(t("Roadmap экспортирован"));
  }

  return (
    <ContentTrProvider value={tr}>
    <div className="min-h-screen">
      <header className="z-10 md:sticky md:top-0 border-b border-line bg-bg/90 px-3.5 py-4 backdrop-blur md:px-6">
        <div className="flex flex-wrap items-center gap-3 md:flex-nowrap md:gap-4">
          <div className="flex min-w-0 basis-full items-center gap-3 md:flex-1 md:basis-auto md:gap-4 2xl:basis-0">
            <Link href="/" className="shrink-0" title={t("Все проекты")}>
              <Brand />
            </Link>
            <ProjectTitle
              projectId={project.id}
              name={tr.projectName(project.name)}
              onRename={readOnly ? undefined : (name) => updateProject({ name })}
            />
          </div>
          <ProjectNav projectId={project.id} active="board" />
          <div className="flex w-full gap-2 overflow-x-auto md:w-auto 2xl:flex-1 2xl:basis-0 2xl:justify-end">
            {readOnly ? (
              isViewer && (
                <span
                  className="inline-flex items-center rounded-[11px] bg-[#e6effc] px-3 py-2 text-sm font-bold whitespace-nowrap text-[#1d4f9a]"
                  title={t("Вы можете смотреть проект, но не менять его")}
                >
                  {t("👁 Только просмотр")}
                </span>
              )
            ) : (
              <Btn
                onClick={() => setModal("settings")}
                title={`${t("Старт:")} ${i18n.date(parseDate(project.start_date))} · 👥 ${members.length}`}
              >
                {t("⚙ Настройки")}
              </Btn>
            )}
            <LangSwitcher />
            {readOnly && (
              <Btn onClick={() => setModal("members")}>👥 {members.length}</Btn>
            )}
            {unread.enabled && (
              <CommentsBell
                list={unread.list}
                onOpenTask={(id) => {
                  setDraftTask(null);
                  setActiveTaskId(id);
                }}
                onReadAll={() =>
                  unread.markRead([...new Set(unread.list.map((c) => c.task_id))])
                }
              />
            )}
            <Btn onClick={exportJson}>{t("Экспорт JSON")}</Btn>
            {!readOnly && (
              <Btn variant="primary" onClick={() => setModal("phase")}>
                {t("＋ Фаза")}
              </Btn>
            )}
          </div>
        </div>

        <Link
          href={`/projects/${project.id}/profile?tab=foundation`}
          className="group mt-3 flex items-center gap-2.5 rounded-[11px] border border-dashed border-line px-3 py-2 text-sm hover:border-[#c9c6bb] hover:bg-white"
          title={t("Открыть профиль продукта")}
        >
          <span className="shrink-0 text-[11px] font-extrabold tracking-[.08em] text-muted uppercase">
            {t("Миссия")}
          </span>
          {mission?.trim() ? (
            <span className="min-w-0 flex-1 truncate font-semibold">
              {tr.text("profile.mission", mission)}
            </span>
          ) : (
            <span className="min-w-0 flex-1 truncate text-muted">
              {t("Не заполнена — добавьте миссию и позиционирование, чтобы не терять фокус")}
            </span>
          )}
          <span className="shrink-0 text-xs font-bold text-muted group-hover:text-ink">
            {t("Профиль →")}
          </span>
        </Link>
        {tr.active && !isViewer && <TranslationBar projectId={project.id} />}
      </header>

      <main className="px-4 pt-5 pb-10 md:px-6">
          <div className="mb-4 flex flex-wrap items-center gap-3 text-muted">
          <span>{t("Размер задачи:")}</span>
          {SIZES.map((k) => (
            <span
              key={k}
              className="rounded-full bg-[#e7e5dd] px-2 py-1 font-extrabold text-ink"
            >
              {k} · {sd[k]} {sd[k] === 1 ? t("день") : t("дн.")}
            </span>
          ))}
          <span>
            <b>P1</b>{" "}{t("— приоритет. Клик по карточке открывает детали. Отменённые задачи не учитываются в сроках.")}
          </span>
        </div>

        <DndContext
          id="board-dnd"
          // key: при смене режима (RU ↔ EN/DE) список сенсоров меняет длину — пересоздаём
          key={readOnly ? "view" : "edit"}
          sensors={readOnly ? [] : sensors}
          collisionDetection={collision}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDragEnd={onDragEnd}
          onDragCancel={onDragCancel}
        >
          <SortableContext
            items={phases.map((p) => p.id)}
            strategy={horizontalListSortingStrategy}
          >
            <section className="grid auto-cols-[minmax(285px,88vw)] grid-flow-col items-start gap-3.5 overflow-x-auto pb-4 md:auto-cols-[minmax(310px,350px)]">
              {phasesView.map((p, idx) => (
                <PhaseColumn
                  key={p.id}
                  phase={p}
                  index={idx}
                  tasks={columns[p.id] ?? []}
                  sizeDays={sd}
                  dates={schedule.perPhase[p.id]}
                  onRename={renamePhase}
                  onRemove={setConfirmPhase}
                  onMove={movePhase}
                  onAddTask={() => {
                    setActiveTaskId(null);
                    setDraftTask({
                      id: "new",
                      project_id: project.id,
                      phase_id: p.id,
                      name: "",
                      size: "M",
                      description: "",
                      progress: 0,
                      needs_discussion: false,
                      status: "todo",
                      deadline: null,
                      position: 0,
                      comment_count: 0,
                    });
                  }}
                  onOpenTask={(id) =>
                    Date.now() - lastDragEnd.current > 300 &&
                    setActiveTaskId(id)
                  }
                  onUpdateTask={updateTask}
                  onDeleteTask={setConfirmTask}
                  isFirst={idx === 0}
                  isLast={idx === phases.length - 1}
                  readOnly={readOnly}
                />
              ))}
              {!readOnly && (
                <button
                  onClick={() => setModal("phase")}
                  className="min-h-[120px] rounded-[17px] border border-dashed border-[#bdbbb2] font-bold text-muted hover:bg-white"
                >
                  {t("＋ Добавить фазу")}
                </button>
              )}
            </section>
          </SortableContext>
          <DragOverlay>
            {draggedTask ? (
              <div className="rotate-2">
                <TaskCardView
                  task={draggedTask}
                  index={(columns[draggedTask.phase_id] ?? []).findIndex(
                    (t) => t.id === draggedTask.id,
                  )}
                  sizeDays={sd}
                  overlay
                />
              </div>
            ) : draggedPhase ? (
              <div className="rounded-[17px] border border-line bg-column px-4 py-5 text-lg font-extrabold opacity-90 shadow-soft">
                {draggedPhase.name}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </main>

      {activeTask && (
        <TaskDrawer
          key={`${activeTask.id}-${i18n.lang}`}
          task={activeTask}
          phaseName={activePhase?.name ?? ""}
          sizeDays={sd}
          me={me}
          members={members}
          projectId={project.id}
          hypotheses={hypothesesView}
          freshCommentIds={fresh.task === activeTask.id ? fresh.ids : undefined}
          readOnly={readOnly}
          onClose={() => setActiveTaskId(null)}
          onUpdate={(patch) => updateTask(activeTask.id, patch)}
          onDelete={() => setConfirmTask(activeTask.id)}
          onCommentAdded={() =>
            setTasks((ts) =>
              ts.map((t) =>
                t.id === activeTask.id
                  ? { ...t, comment_count: (t.comment_count ?? 0) + 1 }
                  : t,
              ),
            )
          }
          onError={fail}
        />
      )}

      <NameModal
        open={modal === "phase"}
        title={t("Новая фаза")}
        placeholder={t("Например: Partnerships")}
        cta={t("Добавить фазу")}
        onClose={() => setModal(null)}
        onSubmit={(name) => addPhase(name)}
      />
      {draftTask && (
        <TaskDrawer
          key={"new-" + draftTask.phase_id}
          mode="create"
          task={draftTask}
          phaseName={
            phases.find((p) => p.id === draftTask.phase_id)?.name ?? ""
          }
          sizeDays={sd}
          me={me}
          members={members}
          projectId={project.id}
          hypotheses={hypotheses}
          onClose={() => setDraftTask(null)}
          onUpdate={(patch) =>
            setDraftTask((d) => (d ? { ...d, ...patch } : d))
          }
          onCreate={({ name, description }) => {
            if (draftTask) addTask({ ...draftTask, name, description });
          }}
          onCommentAdded={() => {}}
          onError={fail}
        />
      )}
      {modal === "settings" && (
        <SettingsModal
          open
          projectId={project.id}
          sizeDays={sd}
          startDate={project.start_date}
          members={members}
          isOwner={isOwner}
          onClose={() => setModal(null)}
          onMembers={() => {
            setMembersFromSettings(true);
            setModal("members");
          }}
          onSave={({ sizeDays, startDate }) => {
            updateProject(
              startDate && startDate !== project.start_date
                ? { size_days: sizeDays, start_date: startDate }
                : { size_days: sizeDays },
            );
            toast(t("Настройки сохранены"));
          }}
          onDelete={() => {
            setModal(null);
            setConfirmProject(true);
          }}
        />
      )}
      <MembersModal
        open={modal === "members"}
        onClose={() => {
          setModal(membersFromSettings ? "settings" : null);
          setMembersFromSettings(false);
        }}
        projectId={project.id}
        projectName={project.name}
        isOwner={isOwner}
        me={me}
        members={members}
        setMembers={setMembers}
        toast={toast}
      />
      <ConfirmDialog
        open={confirmProject}
        title={t("Удалить проект?")}
        confirmText={t("Удалить проект")}
        onClose={() => setConfirmProject(false)}
        onConfirm={deleteProject}
      >
        {i18n.rich(
          "Проект «{name}» будет удалён вместе со всеми фазами ({phases}), задачами ({tasks}) и комментариями. Участники потеряют к нему доступ. Это действие нельзя отменить.",
          { name: <b>{project.name}</b>, phases: phases.length, tasks: tasks.length },
        )}
      </ConfirmDialog>
      <ConfirmDialog
        open={!!confirmTask}
        title={t("Удалить задачу?")}
        onClose={() => setConfirmTask(null)}
        onConfirm={() => confirmTask && deleteTask(confirmTask)}
      >
        {i18n.rich(
          "Задача «{name}» будет удалена вместе с описанием и комментариями. Это действие нельзя отменить.",
          { name: <b>{t(tasks.find((x) => x.id === confirmTask)?.name ?? "")}</b> },
        )}
      </ConfirmDialog>
      {confirmPhase && (
        <DeletePhaseDialog
          phase={phases.find((p) => p.id === confirmPhase)!}
          taskCount={(columns[confirmPhase] ?? []).length}
          otherPhases={phases.filter((p) => p.id !== confirmPhase)}
          onClose={() => setConfirmPhase(null)}
          onConfirm={(moveTo) => removePhase(confirmPhase, moveTo)}
        />
      )}
      <Toast text={toastText} />
    </div>
    </ContentTrProvider>
  );
}

function NameModal({
  open,
  title,
  placeholder,
  cta,
  withSize,
  sizeDays,
  onClose,
  onSubmit,
}: {
  open: boolean;
  title: string;
  placeholder: string;
  cta: string;
  withSize?: boolean;
  sizeDays?: SizeDays;
  onClose: () => void;
  onSubmit: (name: string, size: Size) => void;
}) {
  const t = useT();
  const [name, setName] = useState("");
  const [size, setSize] = useState<Size>("M");
  const submit = () => {
    if (!name.trim()) return;
    onSubmit(name.trim(), size);
    setName("");
    setSize("M");
    onClose();
  };
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <Field label={t("Название")}>
        <input
          autoFocus
          className={inputCls}
          placeholder={placeholder}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
        />
      </Field>
      {withSize && (
        <Field label={t("Размер")}>
          <Select
            value={size}
            onChange={setSize}
            options={SIZES.map((s) => ({
              value: s,
              label: s,
              hint: sizeDays
                ? `${sizeDays[s]} ${sizeDays[s] === 1 ? t("день") : t("дн.")}`
                : undefined,
            }))}
          />
        </Field>
      )}
      <div className="mt-5 flex justify-end gap-2">
        <Btn onClick={onClose}>{t("Отмена")}</Btn>
        <Btn variant="primary" onClick={submit} disabled={!name.trim()}>
          {cta}
        </Btn>
      </div>
    </Modal>
  );
}

function SettingsModal({
  open,
  projectId,
  sizeDays,
  startDate,
  members,
  isOwner,
  onClose,
  onMembers,
  onSave,
  onDelete,
}: {
  open: boolean;
  projectId: string;
  sizeDays: SizeDays;
  startDate: string;
  members: Member[];
  isOwner: boolean;
  onClose: () => void;
  onMembers: () => void;
  onSave: (v: { sizeDays: SizeDays; startDate: string }) => void;
  onDelete: () => void;
}) {
  const t = useT();
  const [v, setV] = useState<Record<string, string>>(() =>
    Object.fromEntries(SIZES.map((k) => [k, String(sizeDays[k])])),
  );
  const [start, setStart] = useState(startDate);
  return (
    <Modal open={open} onClose={onClose} title={t("Настройки проекта")}>
      <Field label={t("Дата старта (первый рабочий день)")}>
        <input
          type="date"
          className={inputCls}
          value={start}
          onChange={(e) => setStart(e.target.value)}
        />
      </Field>
      <Field label={t("Участники")}>
        <button
          type="button"
          onClick={onMembers}
          className="flex w-full items-center gap-3 rounded-[11px] border border-line bg-white px-3 py-2 text-left hover:border-[#c9c6bb]"
        >
          <span className="flex -space-x-1.5">
            {members.slice(0, 5).map((m) => (
              <span
                key={m.user_id}
                className="grid h-7 w-7 place-items-center rounded-full border-2 border-white bg-[#e7e5dd] text-[11px] font-extrabold"
              >
                {initials(m.profile?.full_name || m.profile?.email || "?")}
              </span>
            ))}
          </span>
          <span className="flex-1 text-sm font-semibold">
            👥 {members.length}
          </span>
          <span className="text-sm font-bold text-muted">
            {t("Управлять →")}
          </span>
        </button>
      </Field>
      <Field label={t("Размер задачи → рабочих дней")}>
        <span className="grid grid-cols-[1fr_110px] items-center gap-2">
          {SIZES.map((k) => (
            <span key={k} className="contents">
              <span className="font-extrabold">{k}</span>
              <input
                type="number"
                min={0.25}
                step={0.25}
                className={inputCls + " py-2"}
                value={v[k] ?? ""}
                onChange={(e) => setV((s) => ({ ...s, [k]: e.target.value }))}
              />
            </span>
          ))}
        </span>
      </Field>
      <p className="text-[11px] text-muted">
        {t("Изменение длительности сразу пересчитает оставшиеся дни, прогресс фаз и дату запуска.")}
      </p>
      <div className="mt-4">
        <TranslatePanel projectId={projectId} />
      </div>
      <div className="mt-5 flex flex-wrap justify-between gap-2">
        {isOwner ? (
          <Btn variant="danger" onClick={onDelete}>
            <TrashIcon size={14} />
            {t("Удалить проект")}
          </Btn>
        ) : (
          <span />
        )}
        <div className="flex gap-2">
          <Btn onClick={onClose}>{t("Отмена")}</Btn>
          <Btn
            variant="primary"
            onClick={() => {
              const next = Object.fromEntries(
                SIZES.map((k) => [k, Math.max(0.25, Number(v[k]) || 1)]),
              ) as SizeDays;
              onSave({ sizeDays: next, startDate: start });
              onClose();
            }}
          >
            {t("Сохранить")}
          </Btn>
        </div>
      </div>
    </Modal>
  );
}

function DeletePhaseDialog({
  phase,
  taskCount,
  otherPhases,
  onClose,
  onConfirm,
}: {
  phase: Phase;
  taskCount: number;
  otherPhases: Phase[];
  onClose: () => void;
  onConfirm: (moveTo: string | null) => void;
}) {
  const { t, rich, tp } = useI18n();
  const canMove = taskCount > 0 && otherPhases.length > 0;
  const [mode, setMode] = useState<"move" | "delete">(
    canMove ? "move" : "delete",
  );
  const [target, setTarget] = useState(otherPhases[0]?.id ?? "");
  const radio = (on: boolean) =>
    `flex cursor-pointer gap-3 rounded-xl border p-3 transition ${
      on ? "border-ink/40 bg-[#faf9f6]" : "border-line hover:border-[#c9c6bb]"
    }`;
  const dot = (on: boolean) =>
    `mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full border-2 ${on ? "border-ink" : "border-[#c9c6bb]"}`;

  return (
    <Modal open onClose={onClose} title={t("Удалить фазу?")} width={480}>
      {taskCount === 0 ? (
        <p className="text-[15px] leading-relaxed text-[#45443e]">
          {rich("Фаза «{name}» пустая и будет удалена.", {
            name: <b>{phase.name}</b>,
          })}
        </p>
      ) : (
        <>
          <p className="text-[15px] leading-relaxed text-[#45443e]">
            {rich("В фазе «{name}» {count}. Что с ними сделать?", {
              name: <b>{phase.name}</b>,
              count: tp(taskCount, "{n} задача", "{n} задачи", "{n} задач", {
                n: taskCount,
              }),
            })}
          </p>
          <div className="mt-4 flex flex-col gap-2">
            {canMove && (
              <div
                className={radio(mode === "move")}
                onClick={() => setMode("move")}
              >
                <span className={dot(mode === "move")}>
                  {mode === "move" && (
                    <span className="h-1.5 w-1.5 rounded-full bg-ink" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-bold">
                    {t("Перенести задачи в другую фазу")}
                  </div>
                  <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                    <Select
                      value={target}
                      onChange={(v) => {
                        setTarget(v);
                        setMode("move");
                      }}
                      options={otherPhases.map((p) => ({
                        value: p.id,
                        label: p.name,
                      }))}
                    />
                  </div>
                </div>
              </div>
            )}
            <div
              className={radio(mode === "delete")}
              onClick={() => setMode("delete")}
            >
              <span className={dot(mode === "delete")}>
                {mode === "delete" && (
                  <span className="h-1.5 w-1.5 rounded-full bg-ink" />
                )}
              </span>
              <div>
                <div className="font-bold text-bad">
                  {t("Удалить вместе с задачами")}
                </div>
                <div className="text-sm text-muted">
                  {t("Задачи и их комментарии удалятся безвозвратно")}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      <div className="mt-6 flex justify-end gap-2">
        <Btn onClick={onClose}>{t("Отмена")}</Btn>
        <Btn
          variant="destructive"
          onClick={() => {
            onConfirm(mode === "move" && canMove ? target : null);
            onClose();
          }}
        >
          <TrashIcon size={14} />
          {mode === "move" && canMove
            ? t("Перенести и удалить фазу")
            : t("Удалить фазу")}
        </Btn>
      </div>
    </Modal>
  );
}
