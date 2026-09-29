"use client";

import { useT } from "@/i18n/client";
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
  const t = useT();
  const options = ctx.byKind("metric").map((m) => ({
    value: m.id,
    label:
      (m.data.level === "north" ? "★ " : "") +
      (m.title || t("Метрика без названия")),
  }));
  return (
    <div>
      <Label>{t("Двигает метрику")}</Label>
      <Pick
        value={value ?? ""}
        options={options}
        onChange={(v) => onChange(v || null)}
        placeholder={options.length ? "—" : t("Метрик пока нет")}
      />
    </div>
  );
}
