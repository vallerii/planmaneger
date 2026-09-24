"use client";

import { useState } from "react";
import { STATUS, freshness, type Gtm, type ProfileItem } from "@/lib/profile";
import { CURRENCIES, n } from "@/lib/economics";
import type { ProfileCtx } from "./ProfileApp";
import {
  AddBtn,
  AutoText,
  Empty,
  Label,
  NumField,
  Pick,
  RemoveBtn,
  Section,
  StatusPick,
} from "./fields";

const TYPICAL_STAGES = [
  "Узнаёт о проблеме",
  "Ищет решение",
  "Выбирает и покупает",
  "Начинает пользоваться",
  "Остаётся и рекомендует",
];

const LAUNCH_TYPES = [
  { value: "beta", label: "Закрытая бета" },
  { value: "soft", label: "Мягкий запуск" },
  { value: "public", label: "Публичный запуск" },
];

export default function GtmTab({ ctx }: { ctx: ProfileCtx }) {
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
      <Journey ctx={ctx} />
      <Channels ctx={ctx} />
      <First100 ctx={ctx} />
    </div>
  );
}

/* ---------------- путь клиента ---------------- */

function Journey({ ctx }: { ctx: ProfileCtx }) {
  const { profile, items } = ctx;
  const stages = ctx.byKind("journey");
  const [adding, setAdding] = useState(false);
  const metricOptions = ctx
    .byKind("metric")
    .map((m) => ({ value: m.id, label: m.title || "Метрика без названия" }));

  async function addTypical() {
    setAdding(true);
    for (const [i, t] of TYPICAL_STAGES.entries()) {
      await ctx.addItem("journey", {}, t, {
        focus: i === TYPICAL_STAGES.length - 1,
      });
    }
    setAdding(false);
  }

  function move(i: number, dir: -1 | 1) {
    const a = stages[i];
    const b = stages[i + dir];
    if (!a || !b) return;
    ctx.updateItem(a.id, { position: b.position });
    ctx.updateItem(b.id, {
      position: a.position === b.position ? a.position + dir : a.position,
    });
  }

  return (
    <Section
      id="journey"
      title="Путь клиента"
      desc="Этапы, которые проходит клиент: от первого касания до повторной покупки. На каждом — что он делает, где мы с ним встречаемся и что мешает."
      fresh={freshness("journey", profile, items)}
      onReviewed={() => ctx.markReviewed("journey")}
    >
      {stages.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-[12px] bg-[#faf9f6] px-4 py-6 text-center text-sm text-muted">
          Этапов пока нет. Добавьте свои или начните с типовых — их можно
          переименовать и удалить.
          <button
            onClick={addTypical}
            disabled={adding}
            className="rounded-[10px] border border-line bg-white px-3 py-1.5 text-sm font-bold text-ink hover:bg-[#f5f4ef] disabled:opacity-50"
          >
            {adding ? "Добавляю…" : "Добавить 5 типовых этапов"}
          </button>
        </div>
      ) : (
        <div className="-mx-1 overflow-x-auto px-1 pb-2">
          <div className="flex gap-3">
            {stages.map((s, i) => (
              <StageCard
                key={s.id}
                s={s}
                n={i + 1}
                ctx={ctx}
                metricOptions={metricOptions}
                onLeft={i > 0 ? () => move(i, -1) : undefined}
                onRight={i < stages.length - 1 ? () => move(i, 1) : undefined}
              />
            ))}
          </div>
        </div>
      )}
      <AddBtn onClick={() => ctx.addItem("journey")}>+ Добавить этап</AddBtn>
    </Section>
  );
}

function StageCard({
  s,
  n,
  ctx,
  metricOptions,
  onLeft,
  onRight,
}: {
  s: ProfileItem;
  n: number;
  ctx: ProfileCtx;
  metricOptions: { value: string; label: string }[];
  onLeft?: () => void;
  onRight?: () => void;
}) {
  const set = (data: Record<string, unknown>) => ctx.updateItem(s.id, { data });
  const arrow =
    "grid h-7 w-7 place-items-center rounded-lg text-muted hover:bg-[#f5f4ef] hover:text-ink disabled:opacity-30";
  return (
    <div
      data-item={s.id}
      id={`sec-item-${s.id}`}
      className="flex w-[260px] shrink-0 scroll-mt-24 flex-col rounded-[13px] border border-line p-3"
    >
      <div className="flex items-center gap-1">
        <span className="text-[11px] font-extrabold tracking-[.08em] text-muted uppercase">
          Этап {n}
        </span>
        <div className="flex-1" />
        <button
          className={arrow}
          onClick={onLeft}
          disabled={!onLeft}
          title="Левее"
        >
          ←
        </button>
        <button
          className={arrow}
          onClick={onRight}
          disabled={!onRight}
          title="Правее"
        >
          →
        </button>
        <RemoveBtn onClick={() => ctx.askRemove(s.id)} />
      </div>
      <div className="mt-1.5">
        <AutoText
          value={s.title}
          onSave={(v) => ctx.updateItem(s.id, { title: v })}
          placeholder="Название этапа"
          className="font-bold"
          single
        />
      </div>
      <div className="mt-2.5">
        <Label>Что делает клиент</Label>
        <AutoText
          value={s.data.action ?? ""}
          onSave={(v) => set({ action: v })}
          placeholder="Гуглит, спрашивает коллег…"
          rows={2}
        />
      </div>
      <div className="mt-2.5">
        <Label>Где встречаемся</Label>
        <AutoText
          value={s.data.touchpoint ?? ""}
          onSave={(v) => set({ touchpoint: v })}
          placeholder="Сайт, реклама, звонок, письмо…"
          rows={2}
        />
      </div>
      <div className="mt-2.5">
        <Label>Боль / барьер</Label>
        <AutoText
          value={s.data.pain ?? ""}
          onSave={(v) => set({ pain: v })}
          placeholder="Что мешает перейти на следующий этап"
          rows={2}
        />
      </div>
      <div className="mt-2.5">
        <Label>Метрика этапа</Label>
        <Pick
          value={s.data.metric_id ?? ""}
          options={metricOptions}
          onChange={(v) => set({ metric_id: v || null })}
          placeholder={metricOptions.length ? "—" : "Сначала добавьте метрики"}
        />
      </div>
    </div>
  );
}

/* ---------------- каналы ---------------- */

function Channels({ ctx }: { ctx: ProfileCtx }) {
  const { profile, items } = ctx;
  const channels = ctx.byKind("channel");
  const sym = CURRENCIES.find(
    (c) => c.value === (profile.economics?.currency ?? "EUR"),
  )!.label.split(" ")[0];
  const icpOptions = ctx
    .byKind("icp")
    .map((i) => ({ value: i.id, label: i.title || "ICP без названия" }));
  const hyps = ctx.byKind("hypothesis");
  // сначала гипотезы типа «Канал»
  const hypOptions = [
    ...hyps.filter((h) => h.data.type === "channel"),
    ...hyps.filter((h) => h.data.type !== "channel"),
  ].map((h) => ({
    value: h.id,
    label:
      (h.data.type === "channel" ? "📣 " : "") +
      (h.title || "Гипотеза без формулировки"),
  }));

  return (
    <Section
      id="channel"
      title="Каналы привлечения"
      desc="Где и как клиенты будут узнавать о продукте. Каждый канал — гипотеза, пока не доказано, что он приводит клиентов по нормальной цене."
      fresh={freshness("channel", profile, items)}
      onReviewed={() => ctx.markReviewed("channel")}
    >
      {channels.length === 0 ? (
        <Empty>
          Каналов пока нет. Например: холодные письма, партнёры-агентства, SEO,
          реклама в картах.
        </Empty>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {channels.map((c) => {
            const set = (data: Record<string, unknown>) =>
              ctx.updateItem(c.id, { data });
            return (
              <div
                key={c.id}
                data-item={c.id}
                id={`sec-item-${c.id}`}
                className={`flex scroll-mt-24 flex-col rounded-[13px] border border-line p-4 ${c.status === "failed" ? "opacity-60" : ""}`}
              >
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <AutoText
                      value={c.title}
                      onSave={(v) => ctx.updateItem(c.id, { title: v })}
                      placeholder="Название канала"
                      className="font-bold"
                      single
                    />
                  </div>
                  <StatusPick
                    value={c.status}
                    options={STATUS.channel}
                    onChange={(v) => ctx.updateItem(c.id, { status: v })}
                    size="sm"
                  />
                  <RemoveBtn onClick={() => ctx.askRemove(c.id)} />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div>
                    <Label>Для кого (ICP)</Label>
                    <Pick
                      value={c.data.icp_id ?? ""}
                      options={icpOptions}
                      onChange={(v) => set({ icp_id: v || null })}
                      placeholder="Все ICP"
                    />
                  </div>
                  <div>
                    <Label hint="оценка">Цена клиента (CAC)</Label>
                    <NumField
                      value={c.data.cac}
                      onSave={(v) => set({ cac: v })}
                      suffix={sym}
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <Label>Как используем</Label>
                  <AutoText
                    value={c.data.how ?? ""}
                    onSave={(v) => set({ how: v })}
                    placeholder="Что делаем, сколько тратим, какой бюджет на тест"
                  />
                </div>
                <div className="mt-3">
                  <Label>Проверяем гипотезой</Label>
                  <Pick
                    value={c.data.hypothesis_id ?? ""}
                    options={hypOptions}
                    onChange={(v) => set({ hypothesis_id: v || null })}
                    placeholder={hypOptions.length ? "—" : "Гипотез пока нет"}
                  />
                </div>
                <div className="mt-3">
                  <Label>Результат</Label>
                  <AutoText
                    value={c.data.result ?? ""}
                    onSave={(v) => set({ result: v })}
                    placeholder="Сколько лидов / клиентов и по какой цене"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
      <AddBtn onClick={() => ctx.addItem("channel")}>+ Добавить канал</AddBtn>
    </Section>
  );
}

/* ---------------- первые 100 клиентов и запуск ---------------- */

function First100({ ctx }: { ctx: ProfileCtx }) {
  const { profile, items } = ctx;
  const g: Gtm = profile.gtm ?? {};
  const set = (patch: Partial<Gtm>) =>
    ctx.saveProfile({ gtm: { ...g, ...patch } }, "gtm");
  const now = n(g.clients_now);
  const prospects = ctx.byKind("prospect");
  const pilots = prospects.filter((p) => p.status === "pilot").length;

  return (
    <Section
      id="gtm"
      title="Первые 100 клиентов и запуск"
      desc="Откуда конкретно возьмутся первые клиенты и как мы выходим на рынок."
      fresh={freshness("gtm", profile, items)}
      onReviewed={() => ctx.markReviewed("gtm")}
    >
      <div className="grid gap-5 lg:grid-cols-2">
        <div>
          <div className="flex items-end gap-3">
            <div className="w-[140px]">
              <Label>Клиентов сейчас</Label>
              <NumField
                value={g.clients_now}
                onSave={(v) => set({ clients_now: v })}
                suffix="из 100"
              />
            </div>
            <div className="mb-2.5 flex-1">
              <div className="h-2.5 overflow-hidden rounded-full bg-[#eceae3]">
                <span
                  className="block h-full rounded-full bg-ok"
                  style={{ width: `${Math.min(100, now)}%` }}
                />
              </div>
            </div>
          </div>
          <p className="mt-1.5 text-xs text-muted">
            На вкладке{" "}
            <button
              onClick={() => ctx.goTo("market", "prospect")}
              className="font-bold underline decoration-dotted underline-offset-2 hover:text-ink"
            >
              «Рынок»
            </button>
            : {prospects.length} потенциальных клиентов, {pilots} на пилоте.
          </p>
          <div className="mt-4">
            <Label>Откуда возьмём первых 100</Label>
            <AutoText
              value={g.first100 ?? ""}
              onSave={(v) => set({ first100: v })}
              placeholder="Например: 10 — личные связи, 30 — холодные письма по списку из карт, 60 — через 3 агентства-партнёра"
              rows={4}
            />
          </div>
        </div>
        <div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Дата запуска</Label>
              <input
                type="date"
                value={g.launch_date ?? ""}
                onChange={(e) =>
                  set({ launch_date: e.target.value || undefined })
                }
                className="h-[36px] w-full rounded-lg border-0 bg-[#f5f4ef] px-2.5 text-sm outline-none focus:bg-white focus:ring-1 focus:ring-ink/30"
              />
            </div>
            <div>
              <Label>Тип запуска</Label>
              <Pick
                value={g.launch_type ?? ""}
                options={LAUNCH_TYPES}
                onChange={(v) => set({ launch_type: v || undefined })}
              />
            </div>
          </div>
          <div className="mt-4">
            <Label>План запуска</Label>
            <AutoText
              value={g.launch_plan ?? ""}
              onSave={(v) => set({ launch_plan: v })}
              placeholder="Что должно быть готово, кому и как сообщаем, какую цену ставим на старте, что считаем успешным запуском"
              rows={4}
            />
          </div>
        </div>
      </div>
    </Section>
  );
}
