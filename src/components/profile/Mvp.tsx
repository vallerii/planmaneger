"use client";

import { freshness, type Mvp } from "@/lib/profile";
import type { ProfileCtx } from "./ProfileApp";
import { AutoText, Empty, Label, Section } from "./fields";
import { Journey } from "./Gtm";

export default function MvpTab({ ctx }: { ctx: ProfileCtx }) {
  if (!ctx.canCycle) {
    return (
      <Empty>
        Вкладка заработает после запуска{" "}
        <b>supabase/migrations/0007_product_cycle.sql</b> в Supabase → SQL
        Editor.
      </Empty>
    );
  }
  return (
    <div className="flex flex-col gap-5">
      {ctx.canMvp && <Scope ctx={ctx} />}
      <Journey ctx={ctx} />
    </div>
  );
}

function Scope({ ctx }: { ctx: ProfileCtx }) {
  const { profile, items } = ctx;
  const m: Mvp = profile.mvp ?? {};
  const set = (patch: Partial<Mvp>) =>
    ctx.saveProfile({ mvp: { ...m, ...patch } }, "mvp");

  return (
    <Section
      id="mvp"
      title="Цель и объём MVP"
      desc="Что должен доказать MVP и что в него входит. Критерии успеха — метрики с целями на вкладке «Метрики»."
      fresh={freshness("mvp", profile, items)}
      onReviewed={() => ctx.markReviewed("mvp")}
    >
      <div>
        <Label>Цель MVP — что он должен доказать</Label>
        <AutoText
          value={m.goal ?? ""}
          onSave={(v) => set({ goal: v })}
          placeholder="Например: компании готовы платить за shortlist из 2–3 проверенных кандидатов за 72 часа"
        />
        <button
          onClick={() => ctx.goTo("metrics", "metric")}
          className="mt-1.5 text-xs font-bold text-muted underline decoration-dotted underline-offset-2 hover:text-ink"
        >
          Критерии успеха → метрики с целями
        </button>
      </div>
      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <div>
          <Label>Входит в MVP</Label>
          <AutoText
            value={m.in_scope ?? ""}
            onSave={(v) => set({ in_scope: v })}
            placeholder="Минимум, без которого цель MVP не проверить"
            rows={5}
          />
        </div>
        <div>
          <Label>Сознательно не входит</Label>
          <AutoText
            value={m.out_scope ?? ""}
            onSave={(v) => set({ out_scope: v })}
            placeholder="Что откладываем на потом — и почему"
            rows={5}
          />
        </div>
      </div>
    </Section>
  );
}
