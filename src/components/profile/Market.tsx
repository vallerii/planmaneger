"use client";

import {
  COMPETITOR_TYPES,
  PROSPECT_RESEARCHED,
  PROSPECT_TARGET,
  STATUS,
  TONE,
  freshness,
  type ProfileItem,
} from "@/lib/profile";
import type { ProfileCtx } from "./ProfileApp";
import {
  AddBtn,
  AutoText,
  Empty,
  Label,
  Pick,
  RemoveBtn,
  Section,
  StatusPick,
} from "./fields";

export default function Market({ ctx }: { ctx: ProfileCtx }) {
  const { profile, items } = ctx;
  const competitors = ctx.byKind("competitor");
  const prospects = ctx.byKind("prospect");
  const icpOptions = ctx
    .byKind("icp")
    .map((i) => ({ value: i.id, label: i.title || "ICP без названия" }));

  const researched = prospects.filter((p) =>
    PROSPECT_RESEARCHED.includes(p.status),
  ).length;
  const talked = prospects.filter(
    (p) => p.status === "talked" || p.status === "pilot",
  ).length;
  const pilots = prospects.filter((p) => p.status === "pilot").length;
  const deep = competitors.filter((c) => c.status === "deep").length;
  const pct = Math.min(100, Math.round((researched / PROSPECT_TARGET) * 100));

  if (!ctx.canLinkTasks) {
    return (
      <Empty>
        Вкладка «Рынок» заработает после запуска миграции 0004 (см. подсказку
        выше).
      </Empty>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        <Metric
          label="Клиентов исследовано"
          value={`${researched} / ${PROSPECT_TARGET}`}
        >
          <div className="mt-2 h-[5px] overflow-hidden rounded-full bg-[#eceae3]">
            <span
              className="block h-full rounded-full bg-ok"
              style={{ width: `${pct}%` }}
            />
          </div>
        </Metric>
        <Metric
          label="Разговоров"
          value={String(talked)}
          hint="статус «Разговор» или «Пилот»"
        />
        <Metric
          label="Пилоты"
          value={String(pilots)}
          hint="готовы попробовать / платить"
        />
        <Metric
          label="Конкуренты"
          value={String(competitors.length)}
          hint={`глубоко изучено: ${deep}`}
        />
      </div>

      {/* 10 ПОТЕНЦИАЛЬНЫХ КЛИЕНТОВ */}
      <Section
        id="prospect"
        title="10 потенциальных клиентов"
        desc="Реальные компании, места и люди, а не абстрактный сегмент. Двигайте статус по мере работы."
        fresh={freshness("prospect", profile, items)}
        onReviewed={() => ctx.markReviewed("prospect")}
      >
        {prospects.length > 0 && <Funnel prospects={prospects} />}
        {prospects.length === 0 ? (
          <Empty>
            Добавьте первого клиента, который, по-вашему, точно попадает в ICP.
          </Empty>
        ) : (
          <div className="flex flex-col gap-3">
            {prospects.map((p, i) => (
              <ProspectCard
                key={p.id}
                p={p}
                n={i + 1}
                ctx={ctx}
                icpOptions={icpOptions}
              />
            ))}
          </div>
        )}
        <AddBtn onClick={() => ctx.addItem("prospect")}>
          + Добавить клиента
          {prospects.length < PROSPECT_TARGET
            ? ` (${prospects.length} из ${PROSPECT_TARGET})`
            : ""}
        </AddBtn>
      </Section>

      {/* КОНКУРЕНТЫ */}
      <Section
        id="competitor"
        title="Конкуренты"
        desc="Прямые, косвенные и альтернативы (Excel, агентство, «делаем руками»). Глубина — насколько хорошо мы их изучили."
        fresh={freshness("competitor", profile, items)}
        onReviewed={() => ctx.markReviewed("competitor")}
      >
        {competitors.length === 0 ? (
          <Empty>
            Конкурентов пока нет. Начните с того, чем клиент решает проблему
            сегодня.
          </Empty>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {competitors.map((c) => (
              <CompetitorCard
                key={c.id}
                c={c}
                ctx={ctx}
                icpOptions={icpOptions}
              />
            ))}
          </div>
        )}
        <AddBtn onClick={() => ctx.addItem("competitor", { type: "direct" })}>
          + Добавить конкурента
        </AddBtn>
      </Section>

      {/* ВЫВОДЫ */}
      <Section
        id="market"
        title="Что мы узнали из анализа рынка"
        desc="Главные выводы: где пустая ниша, за что платят, чего не хватает у конкурентов."
        fresh={freshness("market", profile, items)}
        onReviewed={() => ctx.markReviewed("market")}
      >
        <AutoText
          value={profile.market_notes ?? ""}
          onSave={(v) => ctx.saveProfile({ market_notes: v }, "market")}
          placeholder="Например: у всех конкурентов долгий онбординг — никто не даёт результат в первый день."
          rows={4}
        />
      </Section>
    </div>
  );
}

function Funnel({ prospects }: { prospects: ProfileItem[] }) {
  return (
    <div className="mb-4 flex flex-wrap gap-1.5">
      {STATUS.prospect.map((s) => {
        const n = prospects.filter((p) => p.status === s.value).length;
        return (
          <span
            key={s.value}
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${
              n ? TONE[s.tone].badge : "bg-[#f5f4ef] text-[#aaa]"
            }`}
          >
            {s.label} <span className="opacity-70">{n}</span>
          </span>
        );
      })}
    </div>
  );
}

function LinkOut({ url }: { url?: string }) {
  if (!url?.trim()) return null;
  const href = /^https?:\/\//i.test(url.trim())
    ? url.trim()
    : `https://${url.trim()}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="shrink-0 rounded-[8px] px-2 py-1 text-sm font-bold text-muted hover:bg-[#f5f4ef] hover:text-ink"
      title="Открыть ссылку"
    >
      ↗
    </a>
  );
}

function ProspectCard({
  p,
  n,
  ctx,
  icpOptions,
}: {
  p: ProfileItem;
  n: number;
  ctx: ProfileCtx;
  icpOptions: { value: string; label: string }[];
}) {
  const set = (data: Record<string, unknown>) => ctx.updateItem(p.id, { data });
  return (
    <div
      data-item={p.id}
      id={`sec-item-${p.id}`}
      className={`scroll-mt-24 rounded-[13px] border border-line p-4 ${p.status === "not_fit" ? "opacity-60" : ""}`}
    >
      <div className="flex flex-wrap items-start gap-2 sm:flex-nowrap">
        <span className="mt-2 w-6 shrink-0 text-sm font-extrabold text-muted">
          {n}
        </span>
        <div className="order-last w-full sm:order-none sm:w-auto sm:min-w-0 sm:flex-1">
          <AutoText
            value={p.title}
            onSave={(v) => ctx.updateItem(p.id, { title: v })}
            placeholder="Компания или человек"
            className="font-bold"
            single
          />
        </div>
        <StatusPick
          value={p.status}
          options={STATUS.prospect}
          onChange={(v) => ctx.updateItem(p.id, { status: v })}
        />
        <RemoveBtn onClick={() => ctx.askRemove(p.id)} />
      </div>
      <div className="mt-3 grid gap-3 md:grid-cols-3">
        <div>
          <Label>Сайт / карты / адрес</Label>
          <div className="flex items-center gap-1">
            <AutoText
              value={p.data.url ?? ""}
              onSave={(v) => set({ url: v })}
              placeholder="ссылка или адрес"
              single
            />
            <LinkOut url={p.data.url} />
          </div>
        </div>
        <div>
          <Label>ICP</Label>
          <Pick
            value={p.data.icp_id ?? ""}
            options={icpOptions}
            onChange={(v) => set({ icp_id: v || null })}
          />
        </div>
        <div>
          <Label>Контакт</Label>
          <AutoText
            value={p.data.contact ?? ""}
            onSave={(v) => set({ contact: v })}
            placeholder="Имя, LinkedIn, email"
            single
          />
        </div>
        <div className="md:col-span-3 grid gap-3 md:grid-cols-2">
          <div>
            <Label>Почему подходит</Label>
            <AutoText
              value={p.data.why ?? ""}
              onSave={(v) => set({ why: v })}
              placeholder="Видна проблема X, попадает в ICP #1"
            />
          </div>
          <div>
            <Label>Доказательства / что узнали</Label>
            <AutoText
              value={p.data.evidence ?? ""}
              onSave={(v) => set({ evidence: v })}
              placeholder="Отзывы, сайт, итоги разговора"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function CompetitorCard({
  c,
  ctx,
  icpOptions,
}: {
  c: ProfileItem;
  ctx: ProfileCtx;
  icpOptions: { value: string; label: string }[];
}) {
  const set = (data: Record<string, unknown>) => ctx.updateItem(c.id, { data });
  return (
    <div
      data-item={c.id}
      id={`sec-item-${c.id}`}
      className="scroll-mt-24 flex flex-col rounded-[13px] border border-line p-4"
    >
      <div className="flex items-center gap-2">
        <div className="w-[150px]">
          <Pick
            value={c.data.type ?? ""}
            options={COMPETITOR_TYPES}
            onChange={(v) => set({ type: v || null })}
            placeholder="Тип"
          />
        </div>
        <div className="flex-1" />
        <StatusPick
          value={c.status}
          options={STATUS.competitor}
          onChange={(v) => ctx.updateItem(c.id, { status: v })}
          size="sm"
        />
        <RemoveBtn onClick={() => ctx.askRemove(c.id)} />
      </div>
      <div className="mt-2">
        <AutoText
          value={c.title}
          onSave={(v) => ctx.updateItem(c.id, { title: v })}
          placeholder="Название конкурента"
          className="font-bold"
          single
        />
      </div>
      <div className="mt-2 flex items-center gap-1">
        <AutoText
          value={c.data.url ?? ""}
          onSave={(v) => set({ url: v })}
          placeholder="сайт"
          single
          className="text-sm"
        />
        <LinkOut url={c.data.url} />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <Label>Для кого (ICP)</Label>
          <Pick
            value={c.data.icp_id ?? ""}
            placeholder="Все ICP"
            options={icpOptions}
            onChange={(v) => set({ icp_id: v || null })}
          />
        </div>
        <div>
          <Label>Цена</Label>
          <AutoText
            value={c.data.price ?? ""}
            onSave={(v) => set({ price: v })}
            placeholder="€199/мес"
            single
          />
        </div>
      </div>
      <div className="mt-3">
        <Label>Обещание</Label>
        <AutoText
          value={c.data.promise ?? ""}
          onSave={(v) => set({ promise: v })}
          placeholder="«Сделаем X быстро»"
          single
        />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <Label>Сильные стороны</Label>
          <AutoText
            value={c.data.strengths ?? ""}
            onSave={(v) => set({ strengths: v })}
            placeholder="UX, бренд, кейсы"
          />
        </div>
        <div>
          <Label>Слабые стороны</Label>
          <AutoText
            value={c.data.weaknesses ?? ""}
            onSave={(v) => set({ weaknesses: v })}
            placeholder="Долго начать, дорого"
          />
        </div>
      </div>
      <div className="mt-3">
        <Label>Ключевые люди</Label>
        <AutoText
          value={c.data.people ?? ""}
          onSave={(v) => set({ people: v })}
          placeholder="CEO, Head of Growth + LinkedIn"
          single
        />
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  hint,
  children,
}: {
  label: string;
  value: string;
  hint?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-[13px] border border-line bg-white px-4 py-3">
      <small className="block font-semibold text-muted">{label}</small>
      <strong className="mt-0.5 block text-2xl tracking-tight">{value}</strong>
      {hint && <small className="block text-[11px] text-muted">{hint}</small>}
      {children}
    </div>
  );
}
