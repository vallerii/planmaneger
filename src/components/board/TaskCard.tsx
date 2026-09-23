"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Size, SizeDays, Task } from "@/lib/types";
import { SIZES } from "@/lib/types";
import { Select, TrashIcon, trashBtnCls } from "../ui";
import {
  deadlineStatus,
  fmtDays,
  plainFromHtml,
  remainingTaskDays,
  sizeDays as sizeOf,
  todayISO,
} from "@/lib/schedule";

const MIN_H: Record<Size, number> = { S: 82, M: 96, L: 112, XL: 128, XXL: 146 };

type ViewProps = {
  task: Task;
  index: number;
  sizeDays: SizeDays;
  overlay?: boolean;
  onUpdate?: (patch: Partial<Task>) => void;
  onDelete?: () => void;
};

export function TaskCardView({
  task: t,
  index,
  sizeDays,
  overlay,
  onUpdate,
  onDelete,
}: ViewProps) {
  const overdue = !!t.deadline && t.deadline < todayISO() && t.progress < 100;
  const desc = plainFromHtml(t.description);
  const dl = deadlineStatus(t, sizeDays);
  const stop = (e: React.SyntheticEvent) => e.stopPropagation();

  return (
    <div
      className={`group relative rounded-[13px] border border-[#dedcd4] bg-white p-3 transition hover:border-[#cbc8be] hover:shadow-[0_7px_18px_rgba(20,20,10,.07)] ${
        overlay ? "cursor-grabbing shadow-soft" : "cursor-grab"
      }`}
      style={{ minHeight: MIN_H[t.size] }}
    >
      <div className="flex items-start gap-[7px]">
        <span className="shrink-0 rounded-[7px] bg-ink px-1.5 py-1 text-[10px] font-black tracking-wide text-white">
          P{index + 1}
        </span>
        <div className="min-h-9 flex-1 leading-tight font-bold break-words">
          {t.name}
        </div>
        {onDelete && (
          <button
            onPointerDown={stop}
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            title="Удалить задачу"
            aria-label="Удалить задачу"
            className={`${trashBtnCls} -mt-1 -mr-1.5`}
          >
            <TrashIcon />
          </button>
        )}
      </div>

      <div className="mt-[7px] flex flex-wrap items-center gap-1.5">
        <Badge className="bg-[#e8f5ef] text-[#0b6b4c]">{t.progress}%</Badge>
        {t.needs_discussion && (
          <Badge className="bg-[#fff5d8] text-[#6b4c00]">💬 обсудить</Badge>
        )}
        {!!t.comment_count && <Badge>{t.comment_count} комм.</Badge>}
        {dl?.kind === "tight" && (
          <Badge className="bg-[#fff5d8] text-[#6b4c00]">⚠ впритык</Badge>
        )}
        {dl?.kind === "late" && (
          <Badge className="bg-[#fff0ed] text-bad">⚠ не успеваем</Badge>
        )}
      </div>

      {desc && (
        <div className="mt-[7px] mb-0.5 line-clamp-2 text-[11px] leading-snug text-muted">
          {desc}
        </div>
      )}

      <div className="mt-2 h-[5px] overflow-hidden rounded-full bg-[#eceae4]">
        <span
          className="block h-full rounded-full bg-ok"
          style={{ width: `${t.progress}%` }}
        />
      </div>

      <div className="mt-2 flex items-center justify-between">
        <span className="text-[11px] text-muted">
          осталось {fmtDays(remainingTaskDays(t, sizeDays))} из{" "}
          {fmtDays(sizeOf(t, sizeDays))} дн.
        </span>
        <Select
          size="sm"
          value={t.size}
          ariaLabel="Размер задачи"
          menuWidth={150}
          onChange={(v) => onUpdate?.({ size: v })}
          options={SIZES.map((s) => ({
            value: s,
            label: s,
            hint: `${sizeDays[s]} ${sizeDays[s] === 1 ? "день" : "дн."}`,
          }))}
        />
      </div>

      <label
        onPointerDown={stop}
        onClick={stop}
        className={`mt-2 flex items-center gap-1.5 border-t border-[#eeece6] pt-2 text-[11px] ${overdue ? "font-extrabold text-bad" : "text-muted"}`}
      >
        <span>{overdue ? "Просрочено" : "Дедлайн"}</span>
        <input
          type="date"
          value={t.deadline ?? ""}
          onChange={(e) => onUpdate?.({ deadline: e.target.value || null })}
          title="Дедлайн задачи — не влияет на планирование"
          className={`min-w-0 flex-1 rounded-[7px] border-0 px-1.5 py-1 text-[11px] outline-none focus:bg-white focus:outline focus:outline-line ${
            overdue ? "bg-[#fff0ed] text-bad" : "bg-[#f5f4ef] text-ink"
          }`}
        />
      </label>
    </div>
  );
}

function Badge({
  children,
  className = "bg-[#efeee8] text-[#5d5b54]",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-[7px] py-[3px] text-[10px] font-extrabold ${className}`}
    >
      {children}
    </span>
  );
}

export default function TaskCard({
  task,
  index,
  sizeDays,
  onOpen,
  onUpdate,
  onDelete,
}: {
  task: Task;
  index: number;
  sizeDays: SizeDays;
  onOpen: () => void;
  onUpdate: (patch: Partial<Task>) => void;
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { type: "task", phaseId: task.phase_id },
  });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={`touch-manipulation ${isDragging ? "opacity-35" : ""}`}
      onClick={onOpen}
      {...attributes}
      {...listeners}
    >
      <TaskCardView
        task={task}
        index={index}
        sizeDays={sizeDays}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />
    </div>
  );
}
