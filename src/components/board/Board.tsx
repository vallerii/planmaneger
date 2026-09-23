"use client";

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
import { buildSchedule, dateRu, fmtDays, parseDate } from "@/lib/schedule";
import { Brand, Btn, Field, Modal, Select, Toast, inputCls } from "../ui";
import PhaseColumn from "./PhaseColumn";
import { TaskCardView } from "./TaskCard";
import TaskDrawer from "./TaskDrawer";
import MembersModal from "./MembersModal";

type Props = {
  initialProject: Project;
  initialPhases: Phase[];
  initialTasks: Task[];
  initialMembers: Member[];
  me: Profile;
};

const byPos = <T extends { position: number }>(a: T, b: T) =>
  a.position - b.position;

export default function Board({
  initialProject,
  initialPhases,
  initialTasks,
  initialMembers,
  me,
}: Props) {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const [project, setProject] = useState(initialProject);
  const [phases, setPhases] = useState(() => [...initialPhases].sort(byPos));
  const [tasks, setTasks] = useState(initialTasks);
  const [members, setMembers] = useState(initialMembers);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [toastText, setToastText] = useState<string | null>(null);
  const [modal, setModal] = useState<
    null | "phase" | "task" | "date" | "settings" | "members"
  >(null);
  const [targetPhase, setTargetPhase] = useState<string | null>(null);
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

  const sd = project.size_days;
  const isOwner = project.owner_id === me.id;

  const toast = useCallback((t: string) => {
    setToastText(t);
    setTimeout(() => setToastText(null), 1800);
  }, []);

  const fail = useCallback(
    (error: { message: string } | null) => {
      if (error) toast("Ошибка: " + error.message);
    },
    [toast],
  );

  // ---------- derived ----------
  const columns = useMemo(() => {
    const map: Record<string, Task[]> = {};
    for (const p of phases) map[p.id] = [];
    for (const t of tasks) (map[t.phase_id] ??= []).push(t);
    for (const k in map) map[k].sort(byPos);
    return map;
  }, [phases, tasks]);

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
          const row = payload.new as { task_id: string; author_id: string };
          if (row.author_id === me.id) return; // свои учитываем сразу
          setTasks((ts) =>
            ts.map((t) =>
              t.id === row.task_id
                ? { ...t, comment_count: (t.comment_count ?? 0) + 1 }
                : t,
            ),
          );
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [supabase, project.id, me.id]);

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
    if (
      !confirm(
        `Удалить проект «${project.name}» со всеми фазами и задачами? Это необратимо.`,
      )
    )
      return;
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

  async function removePhase(id: string) {
    const count = columns[id]?.length ?? 0;
    if (count && !confirm("Удалить фазу вместе с задачами?")) return;
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
  async function addTask(phaseId: string, name: string, size: Size) {
    const col = columns[phaseId] ?? [];
    const position = col.length
      ? Math.max(...col.map((t) => t.position)) + 1
      : 0;
    const { data, error } = await supabase
      .from("tasks")
      .insert({
        project_id: project.id,
        phase_id: phaseId,
        name,
        size,
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
      const { comment_count: _c, ...dbPatch } = patch;
      void _c;
      if (Object.keys(dbPatch).length)
        fail((await supabase.from("tasks").update(dbPatch).eq("id", id)).error);
    },
    [supabase, fail],
  );

  async function deleteTask(id: string) {
    if (!confirm("Удалить задачу?")) return;
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
  const activeTask = activeTaskId
    ? (tasks.find((t) => t.id === activeTaskId) ?? null)
    : null;
  const activePhase = activeTask
    ? phases.find((p) => p.id === activeTask.phase_id)
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
    toast("Roadmap экспортирован");
  }

  return (
    <div className="min-h-screen">
      <header className="z-10 md:sticky md:top-0 border-b border-line bg-bg/90 px-3.5 py-4 backdrop-blur md:px-6">
        <div className="flex flex-wrap items-center gap-3 md:flex-nowrap md:gap-4">
          <Link href="/" className="shrink-0" title="Все проекты">
            <Brand />
          </Link>
          <input
            key={project.name}
            defaultValue={project.name}
            onBlur={(e) => {
              const v = e.target.value.trim();
              if (v && v !== project.name) updateProject({ name: v });
              else e.target.value = project.name;
            }}
            onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
            className="min-w-[180px] flex-1 rounded-[9px] bg-transparent px-2 py-1.5 font-bold outline-none hover:bg-white hover:outline hover:outline-line focus:bg-white focus:outline focus:outline-line"
          />
          <div className="flex w-full gap-2 overflow-x-auto md:w-auto">
            <Btn onClick={() => setModal("date")}>
              Старт: {dateRu(parseDate(project.start_date))}
            </Btn>
            <Btn onClick={() => setModal("settings")}>⚙ Настройки</Btn>
            <Btn onClick={() => setModal("members")}>👥 {members.length}</Btn>
            <Btn onClick={exportJson}>Экспорт JSON</Btn>
            <Btn variant="primary" onClick={() => setModal("phase")}>
              ＋ Фаза
            </Btn>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
          <Metric
            label="Осталось"
            value={`${fmtDays(schedule.remaining)} раб. дн.`}
          />
          <Metric
            label="Общий прогресс"
            value={`${schedule.progress}%`}
            bar={schedule.progress}
          />
          <Metric
            label="Плановая дата запуска"
            value={schedule.finish ? dateRu(schedule.finish) : "Готово"}
          />
          <Metric label="Задач" value={String(schedule.count)} />
          <Metric label="Фаз" value={String(phases.length)} />
        </div>
      </header>

      <main className="px-4 pt-5 pb-10 md:px-6">
        <div className="mb-4 flex flex-wrap items-center gap-3 text-muted">
          <span>Размер задачи:</span>
          {SIZES.map((k) => (
            <span
              key={k}
              className="rounded-full bg-[#e7e5dd] px-2 py-1 font-extrabold text-ink"
            >
              {k} · {sd[k]} {sd[k] === 1 ? "день" : "дн."}
            </span>
          ))}
          <span>
            <b>P1</b> — приоритет. Клик по карточке открывает детали. 💬 — нужно
            обсудить.
          </span>
        </div>

        <DndContext
          id="board-dnd"
          sensors={sensors}
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
              {phases.map((p, idx) => (
                <PhaseColumn
                  key={p.id}
                  phase={p}
                  index={idx}
                  tasks={columns[p.id] ?? []}
                  sizeDays={sd}
                  dates={schedule.perPhase[p.id]}
                  onRename={renamePhase}
                  onRemove={removePhase}
                  onMove={movePhase}
                  onAddTask={() => {
                    setTargetPhase(p.id);
                    setModal("task");
                  }}
                  onOpenTask={(id) =>
                    Date.now() - lastDragEnd.current > 300 &&
                    setActiveTaskId(id)
                  }
                  onUpdateTask={updateTask}
                  onDeleteTask={deleteTask}
                  isFirst={idx === 0}
                  isLast={idx === phases.length - 1}
                />
              ))}
              <button
                onClick={() => setModal("phase")}
                className="min-h-[120px] rounded-[17px] border border-dashed border-[#bdbbb2] font-bold text-muted hover:bg-white"
              >
                ＋ Добавить фазу
              </button>
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
          key={activeTask.id}
          task={activeTask}
          phaseName={activePhase?.name ?? ""}
          sizeDays={sd}
          me={me}
          members={members}
          onClose={() => setActiveTaskId(null)}
          onUpdate={(patch) => updateTask(activeTask.id, patch)}
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
        title="Новая фаза"
        placeholder="Например: Partnerships"
        cta="Добавить фазу"
        onClose={() => setModal(null)}
        onSubmit={(name) => addPhase(name)}
      />
      <NameModal
        open={modal === "task"}
        title="Новая задача"
        placeholder="Например: Email-уведомления"
        cta="Добавить"
        withSize
        sizeDays={sd}
        onClose={() => setModal(null)}
        onSubmit={(name, size) =>
          targetPhase && addTask(targetPhase, name, size)
        }
      />
      {modal === "date" && (
        <DateModal
          open
          value={project.start_date}
          onClose={() => setModal(null)}
          onSave={(v) => updateProject({ start_date: v })}
        />
      )}
      {modal === "settings" && (
        <SettingsModal
          open
          sizeDays={sd}
          isOwner={isOwner}
          onClose={() => setModal(null)}
          onSave={(v) => {
            updateProject({ size_days: v });
            toast("Настройки сохранены");
          }}
          onDelete={deleteProject}
        />
      )}
      <MembersModal
        open={modal === "members"}
        onClose={() => setModal(null)}
        projectId={project.id}
        isOwner={isOwner}
        me={me}
        members={members}
        setMembers={setMembers}
        toast={toast}
      />
      <Toast text={toastText} />
    </div>
  );
}

function Metric({
  label,
  value,
  bar,
}: {
  label: string;
  value: string;
  bar?: number;
}) {
  return (
    <div className="rounded-[13px] border border-line bg-white px-3.5 py-3">
      <small className="block font-semibold text-muted">{label}</small>
      <strong className="mt-0.5 block text-xl tracking-tight">{value}</strong>
      {bar !== undefined && (
        <div className="mt-2 h-[5px] overflow-hidden rounded-full bg-[#eceae3]">
          <span
            className="block h-full rounded-full bg-ok transition-all"
            style={{ width: `${bar}%` }}
          />
        </div>
      )}
    </div>
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
      <Field label="Название">
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
        <Field label="Размер">
          <Select
            value={size}
            onChange={setSize}
            options={SIZES.map((s) => ({
              value: s,
              label: s,
              hint: sizeDays
                ? `${sizeDays[s]} ${sizeDays[s] === 1 ? "день" : "дн."}`
                : undefined,
            }))}
          />
        </Field>
      )}
      <div className="mt-5 flex justify-end gap-2">
        <Btn onClick={onClose}>Отмена</Btn>
        <Btn variant="primary" onClick={submit} disabled={!name.trim()}>
          {cta}
        </Btn>
      </div>
    </Modal>
  );
}

function DateModal({
  open,
  value,
  onClose,
  onSave,
}: {
  open: boolean;
  value: string;
  onClose: () => void;
  onSave: (v: string) => void;
}) {
  const [v, setV] = useState(value);
  return (
    <Modal open={open} onClose={onClose} title="Дата старта">
      <Field label="Первый рабочий день">
        <input
          type="date"
          className={inputCls}
          value={v}
          onChange={(e) => setV(e.target.value)}
        />
      </Field>
      <div className="mt-5 flex justify-end gap-2">
        <Btn onClick={onClose}>Отмена</Btn>
        <Btn
          variant="primary"
          onClick={() => {
            if (v) onSave(v);
            onClose();
          }}
        >
          Пересчитать
        </Btn>
      </div>
    </Modal>
  );
}

function SettingsModal({
  open,
  sizeDays,
  isOwner,
  onClose,
  onSave,
  onDelete,
}: {
  open: boolean;
  sizeDays: SizeDays;
  isOwner: boolean;
  onClose: () => void;
  onSave: (v: SizeDays) => void;
  onDelete: () => void;
}) {
  const [v, setV] = useState<Record<string, string>>(() =>
    Object.fromEntries(SIZES.map((k) => [k, String(sizeDays[k])])),
  );
  return (
    <Modal open={open} onClose={onClose} title="Настройки планировщика">
      <Field label="Размер задачи → рабочих дней">
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
        Изменение длительности сразу пересчитает оставшиеся дни, прогресс фаз и
        дату запуска.
      </p>
      <div className="mt-5 flex flex-wrap justify-between gap-2">
        {isOwner ? (
          <Btn variant="danger" onClick={onDelete}>
            Удалить проект
          </Btn>
        ) : (
          <span />
        )}
        <div className="flex gap-2">
          <Btn onClick={onClose}>Отмена</Btn>
          <Btn
            variant="primary"
            onClick={() => {
              const next = Object.fromEntries(
                SIZES.map((k) => [k, Math.max(0.25, Number(v[k]) || 1)]),
              ) as SizeDays;
              onSave(next);
              onClose();
            }}
          >
            Сохранить
          </Btn>
        </div>
      </div>
    </Modal>
  );
}
