"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Phase, SizeDays, Task } from "@/lib/types";
import { dateRu, fmtDays, phaseStats } from "@/lib/schedule";
import TaskCard from "./TaskCard";
import { TrashIcon, trashBtnCls } from "../ui";

type Props = {
  phase: Phase;
  index: number;
  tasks: Task[];
  sizeDays: SizeDays;
  dates?: { begin: Date; end: Date };
  isFirst: boolean;
  isLast: boolean;
  onRename: (id: string, name: string) => void;
  onRemove: (id: string) => void;
  onMove: (id: string, dir: -1 | 1) => void;
  onAddTask: () => void;
  onOpenTask: (id: string) => void;
  onUpdateTask: (id: string, patch: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
};

export default function PhaseColumn(props: Props) {
  const { phase, index, tasks, sizeDays, dates } = props;
  const st = phaseStats(tasks, sizeDays);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: phase.id, data: { type: "phase" } });
  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `col-${phase.id}`,
    data: { type: "column", phaseId: phase.id },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition: transition,
  };

  const iconBtn =
    "rounded-[7px] px-1.5 py-0.5 text-[17px] leading-none text-muted hover:bg-white hover:text-ink disabled:opacity-30";

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`relative min-h-[420px] overflow-hidden rounded-[17px] border border-line bg-column transition-opacity ${
        isDragging ? "opacity-40" : ""
      } ${isOver ? "outline-[3px] outline-offset-2 outline-accent/30 outline" : ""}`}
    >
      <div className="border-b border-line bg-white/50 px-[15px] pt-[15px] pb-3">
        <div className="-mt-1 -mr-1.5 flex items-center justify-between">
          <span className="text-[11px] font-extrabold tracking-[.1em] text-muted uppercase">
            Phase {index}
          </span>
          <button
            className={trashBtnCls}
            title="Удалить фазу"
            aria-label="Удалить фазу"
            onClick={() => props.onRemove(phase.id)}
          >
            <TrashIcon />
          </button>
        </div>
        <div className="mt-0.5 flex items-center gap-2">
          <input
            key={phase.name}
            defaultValue={phase.name}
            onBlur={(e) => {
              const v = e.target.value.trim();
              if (v && v !== phase.name) props.onRename(phase.id, v);
              else e.target.value = phase.name;
            }}
            onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
            className="w-full min-w-0 rounded-[5px] bg-transparent p-0.5 text-lg font-extrabold tracking-tight outline-none focus:bg-white focus:outline focus:outline-line"
          />
          <div className="flex items-center gap-1">
            <button
              className={`${iconBtn} cursor-grab touch-none active:cursor-grabbing`}
              title="Перетащить фазу"
              {...attributes}
              {...listeners}
            >
              ⠿
            </button>
            <button
              className={iconBtn}
              title="Влево"
              disabled={props.isFirst}
              onClick={() => props.onMove(phase.id, -1)}
            >
              ←
            </button>
            <button
              className={iconBtn}
              title="Вправо"
              disabled={props.isLast}
              onClick={() => props.onMove(phase.id, 1)}
            >
              →
            </button>
          </div>
        </div>
        <div className="mt-2 flex flex-col gap-0.5 text-xs text-muted">
          <span>
            <b className="text-ink">{st.progress}%</b> готово · осталось{" "}
            <b className="text-ink">{fmtDays(st.remaining)}</b> дн.
          </span>
          {dates && (
            <span>
              {dateRu(dates.begin)} → {dateRu(dates.end)}
            </span>
          )}
        </div>
        <div className="mt-2.5 h-[7px] overflow-hidden rounded-full bg-[#d4d2ca]">
          <span
            className="block h-full rounded-full bg-ok transition-all"
            style={{ width: `${st.progress}%` }}
          />
        </div>
        {st.discuss > 0 && (
          <div className="mt-2 text-[11px]">
            <span className="rounded-full border border-[#edd48e] bg-[#fff5d8] px-2 py-0.5 font-extrabold text-[#6b4c00]">
              💬 {st.discuss} обсудить
            </span>
          </div>
        )}
      </div>

      <div
        ref={setDropRef}
        className="flex min-h-[310px] flex-col gap-[9px] p-[11px]"
      >
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.length ? (
            tasks.map((t, i) => (
              <TaskCard
                key={t.id}
                task={t}
                index={i}
                sizeDays={sizeDays}
                onOpen={() => props.onOpenTask(t.id)}
                onUpdate={(patch) => props.onUpdateTask(t.id, patch)}
                onDelete={() => props.onDeleteTask(t.id)}
              />
            ))
          ) : (
            <div className="px-2.5 py-10 text-center text-xs text-[#999]">
              Перетащите задачу сюда
            </div>
          )}
        </SortableContext>
      </div>
      <button
        onClick={props.onAddTask}
        className="mx-[11px] mt-0.5 mb-[13px] w-[calc(100%-22px)] rounded-[11px] border border-dashed border-[#bdbbb2] p-2.5 font-bold text-[#666] hover:bg-white"
      >
        ＋ Добавить задачу
      </button>
    </article>
  );
}
