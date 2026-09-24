"use client";

import { useState } from "react";
import {
  KIND_LABEL,
  STATUS,
  freshness,
  metricProgress,
  type ProfileItem,
  type Tab,
} from "@/lib/profile";
import { dateRu, parseDate, todayISO } from "@/lib/schedule";
import { n } from "@/lib/economics";
import type { ProfileCtx } from "./ProfileApp";
import {
  AddBtn,
  AutoText,
  Empty,
  Label,
  NumField,
  RemoveBtn,
  Section,
  StatusPick,
} from "./fields";

const STALE_MEASURE_DAYS = 14;

export default function MetricsTab({ ctx }: { ctx: ProfileCtx }) {
  const { profile, items } = ctx;
  if (!ctx.canCycle) {
    return (
      <Empty>
        Вкладка заработает после запуска{" "}
        <b>supabase/migrations/0007_product_cycle.sql</b> в Supabase → SQL
        Editor.
      </Empty>
    );
  }
  const metrics = ctx.byKind("metric");
  const north = metrics.filter((m) => m.data.level === "north");
  const inputs = metrics.filter((m) => m.data.level !== "north");

  /** Главная метрика — только одна: остальные становятся обычными. */
  function makeNorth(id: string) {
    metrics.forEach((m) => {
      if (m.id === id) ctx.updateItem(m.id, { data: { level: "north" } });
      else if (m.data.level === "north")
        ctx.updateItem(m.id, { data: { level: "input" } });
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <Section
        id="metric"
        title="Метрики успеха"
        desc="По ним видно, работает ли продукт. Одна главная метрика (North Star) — ценность, которую клиент получает, и 3–5 метрик под ней, которые на неё влияют. Гипотезы и решения ссылаются на метрику, которую должны сдвинуть."
        fresh={freshness("metric", profile, items)}
        onReviewed={() => ctx.markReviewed("metric")}
      >
        <div className="mb-2 text-[11px] font-extrabold tracking-[.08em] text-muted uppercase">
          ★ Главная метрика
        </div>
        {north.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-[12px] border border-dashed border-[#bdbbb2] px-4 py-5 text-center text-sm text-muted">
            Какое одно число лучше всего показывает, что клиенты получают
            ценность? Например: «салоны, ответившие на 80% отзывов за неделю».
            <button
              onClick={() => ctx.addItem("metric", { level: "north" })}
              className="rounded-[10px] bg-ink px-3 py-1.5 text-sm font-bold text-white"
            >
              + Задать главную метрику
            </button>
          </div>
        ) : (
          north.map((m) => (
            <MetricCard
              key={m.id}
              m={m}
              ctx={ctx}
              onNorth={() => makeNorth(m.id)}
              big
            />
          ))
        )}

        <div className="mt-6 mb-2 text-[11px] font-extrabold tracking-[.08em] text-muted uppercase">
          Метрики под главной
        </div>
        {inputs.length === 0 ? (
          <Empty>
            Что влияет на главную метрику? Например: активация, удержание через
            30 дней, конверсия из пробного периода.
          </Empty>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {inputs.map((m) => (
              <MetricCard
                key={m.id}
                m={m}
                ctx={ctx}
                onNorth={() => makeNorth(m.id)}
              />
            ))}
          </div>
        )}
        <AddBtn onClick={() => ctx.addItem("metric", { level: "input" })}>
          + Добавить метрику
        </AddBtn>
      </Section>
    </div>
  );
}

function MetricCard({
  m,
  ctx,
  onNorth,
  big,
}: {
  m: ProfileItem;
  ctx: ProfileCtx;
  onNorth: () => void;
  big?: boolean;
}) {
  const d = m.data;
  const set = (data: Record<string, unknown>) => ctx.updateItem(m.id, { data });
  const [val, setVal] = useState<number | undefined>(undefined);
  const [date, setDate] = useState(todayISO());
  const [open, setOpen] = useState(false);
  const pct = metricProgress(d);
  const unit = String(d.unit ?? "").trim();
  const fmt = (v: unknown) =>
    v === undefined || v === null || v === ""
      ? "—"
      : `${+Number(v).toFixed(2)}${unit ? " " + unit : ""}`;
  const history: { date: string; value: number }[] = Array.isArray(d.history)
    ? d.history
    : [];
  const daysAgo = d.measured_at
    ? Math.round(
        (parseDate(todayISO()).getTime() - parseDate(d.measured_at).getTime()) /
          86_400_000,
      )
    : null;
  const stale = daysAgo !== null && daysAgo > STALE_MEASURE_DAYS;

  // что ссылается на метрику
  const linked = ctx.items.filter(
    (i) =>
      (i.kind === "hypothesis" ||
        i.kind === "decision" ||
        i.kind === "journey") &&
      i.data.metric_id === m.id,
  );
  const tabOf: Record<string, Tab> = {
    hypothesis: "hypotheses",
    decision: "risks",
    journey: "gtm",
  };

  function record() {
    if (val === undefined) return;
    const next = [
      ...history.filter((h) => h.date !== date),
      { date, value: val },
    ].sort((a, b) => a.date.localeCompare(b.date));
    const last = next[next.length - 1];
    set({ history: next, current: last.value, measured_at: last.date });
    setOpen(false);
    setVal(undefined);
  }

  return (
    <div
      data-item={m.id}
      id={`sec-item-${m.id}`}
      className={`scroll-mt-24 rounded-[13px] border p-4 ${big ? "border-[#e8d9a8] bg-[#fffbef]" : "border-line"} ${m.status === "paused" ? "opacity-60" : ""}`}
    >
      <div className="flex flex-wrap items-start gap-2 sm:flex-nowrap">
        <div className="order-last w-full sm:order-none sm:w-auto sm:min-w-0 sm:flex-1">
          <AutoText
            value={m.title}
            onSave={(v) => ctx.updateItem(m.id, { title: v })}
            placeholder={big ? "Главная метрика" : "Название метрики"}
            className={big ? "text-lg font-extrabold" : "font-bold"}
            single
          />
        </div>
        {!big && (
          <button
            onClick={onNorth}
            title="Сделать главной (North Star)"
            className="h-[30px] shrink-0 rounded-lg px-2 text-sm font-bold text-muted hover:bg-[#f5f4ef] hover:text-[#b58800]"
          >
            ☆
          </button>
        )}
        <StatusPick
          value={m.status}
          options={STATUS.metric}
          onChange={(v) => ctx.updateItem(m.id, { status: v })}
          size="sm"
        />
        <RemoveBtn onClick={() => ctx.askRemove(m.id)} />
      </div>

      <div
        className={`mt-3 grid gap-3 ${big ? "grid-cols-2 md:grid-cols-4" : "grid-cols-3"}`}
      >
        <div>
          <Label>Единица</Label>
          <AutoText
            value={d.unit ?? ""}
            onSave={(v) => set({ unit: v })}
            placeholder="%, ₽, шт."
            single
          />
        </div>
        <div>
          <Label>Старт</Label>
          <NumField value={d.baseline} onSave={(v) => set({ baseline: v })} />
        </div>
        <div>
          <Label>Цель</Label>
          <NumField value={d.target} onSave={(v) => set({ target: v })} />
        </div>
        {big && (
          <div>
            <Label>Цель к дате</Label>
            <input
              type="date"
              value={d.target_date ?? ""}
              onChange={(e) => set({ target_date: e.target.value || null })}
              className="h-[36px] w-full rounded-lg border-0 bg-[#f5f4ef] px-2.5 text-sm outline-none focus:bg-white focus:ring-1 focus:ring-ink/30"
            />
          </div>
        )}
      </div>

      {/* текущее значение */}
      <div className="mt-3 rounded-[11px] bg-white/70 p-3 ring-1 ring-[#efede6]">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-[11px] font-bold text-muted">Сейчас</span>
          <span
            className={`font-extrabold tabular-nums ${big ? "text-2xl" : "text-lg"}`}
          >
            {fmt(d.current)}
          </span>
          {d.target !== undefined && d.target !== null && d.target !== "" && (
            <span className="text-sm text-muted">цель {fmt(d.target)}</span>
          )}
          <span
            className={`ml-auto text-xs ${stale ? "font-bold text-bad" : "text-muted"}`}
          >
            {d.measured_at
              ? `замер ${dateRu(parseDate(d.measured_at))}${stale ? " — давно" : ""}`
              : "замеров нет"}
          </span>
        </div>
        {pct !== null && (
          <div className="mt-2 h-[6px] overflow-hidden rounded-full bg-[#eceae3]">
            <span
              className="block h-full rounded-full bg-ok"
              style={{ width: `${pct}%` }}
            />
          </div>
        )}
        {history.length > 1 && (
          <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] text-muted">
            {history.slice(-6).map((h) => (
              <span
                key={h.date}
                className="rounded bg-[#f3f2ed] px-1.5 py-0.5 tabular-nums"
              >
                {dateRu(parseDate(h.date)).replace(/ \d{4}$/, "")}:{" "}
                <b className="text-ink">{+n(h.value).toFixed(2)}</b>
              </span>
            ))}
          </div>
        )}
        {open ? (
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <div className="w-[120px]">
              <NumField
                value={val}
                onSave={(v) => setVal(v)}
                suffix={unit || undefined}
                placeholder="значение"
              />
            </div>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value || todayISO())}
              className="h-[36px] rounded-lg border-0 bg-[#f5f4ef] px-2.5 text-sm outline-none"
            />
            <button
              onClick={record}
              disabled={val === undefined}
              className="h-[36px] rounded-lg bg-ink px-3 text-sm font-bold text-white disabled:opacity-40"
            >
              Записать
            </button>
            <button
              onClick={() => setOpen(false)}
              className="h-[36px] px-2 text-sm font-bold text-muted hover:text-ink"
            >
              Отмена
            </button>
          </div>
        ) : (
          <button
            onClick={() => setOpen(true)}
            className="mt-2 text-xs font-bold text-muted hover:text-ink"
          >
            + Записать замер
          </button>
        )}
      </div>

      <div className="mt-3">
        <Label>Как считаем</Label>
        <AutoText
          value={d.formula ?? ""}
          onSave={(v) => set({ formula: v })}
          placeholder="Откуда берём данные и по какой формуле"
          rows={1}
        />
      </div>

      {linked.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-bold text-muted">
            Двигают метрику:
          </span>
          {linked.map((i) => (
            <button
              key={i.id}
              onClick={() => ctx.goTo(tabOf[i.kind], `item-${i.id}`)}
              className="max-w-[260px] truncate rounded-full bg-[#f3f2ed] px-2.5 py-0.5 text-xs font-bold hover:bg-[#e7e5dd]"
              title={KIND_LABEL[i.kind]}
            >
              {KIND_LABEL[i.kind]}: {i.title || "без названия"}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
