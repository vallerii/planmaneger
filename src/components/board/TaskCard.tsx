"use client";

import { useI18n } from "@/i18n/client";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Size, SizeDays, Task } from "@/lib/types";
import { SIZES, STATUS_META } from "@/lib/types";
import { Select, TrashIcon, trashBtnCls } from "../ui";
import {
  deadlineStatus,
  effectiveProgress,
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
  const { t: tr, tp, html } = useI18n();
  const overdue =
    !!t.deadline &&
    t.deadline < todayISO() &&
    t.progress < 100 &&
    t.status !== "revisit";
  const desc = plainFromHtml(html(t.description));
  const dl = deadlineStatus(t, sizeDays);
  const stop = (e: React.SyntheticEvent) => e.stopPropagation();

  return (
    <div
      className={`group relative rounded-[13px] border border-[#dedcd4] bg-white p-3 transition hover:border-[#cbc8be] hover:shadow-[0_7px_18px_rgba(20,20,10,.07)] ${
        overlay ? "cursor-grabbing shadow-soft" : "cursor-grab"
      } ${t.status === "cancelled" ? "opacity-60" : ""}`}
      style={{ minHeight: MIN_H[t.size] }}
    >
      <div className="flex items-start gap-[7px]">
        <span className="shrink-0 rounded-[7px] bg-ink px-1.5 py-1 text-[10px] font-black tracking-wide text-white">
          P{index + 1}
        </span>
        <div
          className={`min-h-9 flex-1 leading-tight font-bold break-words ${t.status === "cancelled" ? "text-muted line-through" : ""}`}
        >
          {tr(t.name)}
        </div>
        {onDelete && (
          <button
            onPointerDown={stop}
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            title={tr("Удалить задачу")}
            aria-label={tr("Удалить задачу")}
            className={`${trashBtnCls} -mt-1 -mr-1.5`}
          >
            <TrashIcon />
          </button>
        )}
      </div>

      <div className="mt-[7px] flex flex-wrap items-center gap-1.5">
        {t.status !== "todo" && (
          <Badge className={STATUS_META[t.status].badge}>
            {tr(STATUS_META[t.status].label)}
          </Badge>
        )}
        {t.status !== "done" && t.status !== "cancelled" && (
          <Badge className="bg-[#e8f5ef] text-[#0b6b4c]">{t.progress}%</Badge>
        )}
        {!!t.unread && (
          <Badge className="bg-bad text-white">
            {t.unread} {tp(t.unread, "новый", "новых", "новых")}
          </Badge>
        )}
        {!!t.comment_count && !t.unread && (
          <Badge>{t.comment_count} {tr("комм.")}</Badge>
        )}
        {t.hypothesis_id && (
          <Badge className="bg-[#f1ecfb] text-[#5b3fa0]">{tr("🧪 гипотеза")}</Badge>
        )}
        {dl?.kind === "tight" && (
          <Badge className="bg-[#fff5d8] text-[#6b4c00]">{tr("⚠ впритык")}</Badge>
        )}
        {dl?.kind === "late" && (
          <Badge className="bg-[#fff0ed] text-bad">{tr("⚠ не успеваем")}</Badge>
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
          style={{ width: `${effectiveProgress(t)}%` }}
        />
      </div>

      <div className="mt-2 flex items-center justify-between">
        <span className="text-[11px] text-muted">
          {tr("осталось {left} из {total} дн.", {
            left: fmtDays(remainingTaskDays(t, sizeDays)),
            total: fmtDays(sizeOf(t, sizeDays)),
          })}
        </span>
        {!onUpdate ? (
          <span className="rounded-[7px] bg-[#f0efe9] px-2 py-0.5 text-xs font-extrabold">
            {t.size}
          </span>
        ) : (
        <Select
          size="sm"
          value={t.size}
          ariaLabel={tr("Размер задачи")}
          menuWidth={150}
          onChange={(v) => onUpdate?.({ size: v })}
          options={SIZES.map((s) => ({
            value: s,
            label: s,
            hint: `${sizeDays[s]} ${sizeDays[s] === 1 ? tr("день") : tr("дн.")}`,
          }))}
        />
        )}
      </div>

      <label
        onPointerDown={stop}
        onClick={stop}
        className={`mt-2 flex items-center gap-1.5 border-t border-[#eeece6] pt-2 text-[11px] ${overdue ? "font-extrabold text-bad" : "text-muted"}`}
      >
        <span>{overdue ? tr("Просрочено") : tr("Дедлайн")}</span>
        <input
          type="date"
          value={t.deadline ?? ""}
          readOnly={!onUpdate}
          disabled={!onUpdate && !t.deadline}
          onChange={(e) => onUpdate?.({ deadline: e.target.value || null })}
          title={tr("Дедлайн задачи — не влияет на планирование")}
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
  onUpdate?: (patch: Partial<Task>) => void;
  onDelete?: () => void;
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
