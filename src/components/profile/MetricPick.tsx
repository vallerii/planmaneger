"use client";

import type { ProfileCtx } from "./ProfileApp";
import { Label, Pick } from "./fields";

/** «Двигает метрику» — связь гипотезы или решения с метрикой успеха. */
export function MetricPick({
  ctx,
  value,
  onChange,
}: {
  ctx: ProfileCtx;
  value?: string | null;
  onChange: (v: string | null) => void;
}) {
  const options = ctx.byKind("metric").map((m) => ({
    value: m.id,
    label:
      (m.data.level === "north" ? "★ " : "") +
      (m.title || "Метрика без названия"),
  }));
  return (
    <div>
      <Label>Двигает метрику</Label>
      <Pick
        value={value ?? ""}
        options={options}
        onChange={(v) => onChange(v || null)}
        placeholder={options.length ? "—" : "Метрик пока нет"}
      />
    </div>
  );
}
