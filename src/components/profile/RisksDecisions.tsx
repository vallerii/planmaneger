"use client";

import { useState } from "react";
import {
  IMPACTS,
  KIND_LABEL,
  STATUS,
  freshness,
  statusOf,
  type HistoryEntry,
  type ProfileItem,
} from "@/lib/profile";
import { todayISO } from "@/lib/schedule";
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

const RISK_TYPES = [
  { value: "risk", label: "Риск" },
  { value: "question", label: "Вопрос" },
];

export default function RisksDecisions({ ctx }: { ctx: ProfileCtx }) {
  const { profile, items } = ctx;
  const risks = ctx.byKind("risk");
  const decisions = ctx.byKind("decision");
  const hypOptions = ctx.byKind("hypothesis").map((h) => ({
    value: h.id,
    label: h.title || "Гипотеза без формулировки",
  }));

  return (
    <div className="flex flex-col gap-5">
      <Section
        id="risk"
        title="Риски и открытые вопросы"
        desc="Что может помешать продукту и на что у нас пока нет ответа."
        fresh={freshness("risk", profile, items)}
        onReviewed={() => ctx.markReviewed("risk")}
      >
        {risks.length === 0 ? (
          <Empty>
            Пока пусто. Запишите, что может помешать: юридические ограничения,
            доступ к данным, конкуренты…
          </Empty>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {risks.map((r) => (
              <RiskCard key={r.id} r={r} ctx={ctx} />
            ))}
          </div>
        )}
        <AddBtn
          onClick={() =>
            ctx.addItem("risk", { type: "risk", impact: "medium" })
          }
        >
          + Добавить риск или вопрос
        </AddBtn>
      </Section>

      <Section
        id="decision"
        title="Принятые решения"
        desc="Что решили, почему и что заставит пересмотреть. Чтобы через месяц не спорить заново."
        fresh={freshness("decision", profile, items)}
        onReviewed={() => ctx.markReviewed("decision")}
      >
        {decisions.length === 0 ? (
          <Empty>
            Решений пока нет. Например: «Начинаем с салонов красоты, а не с
            ресторанов».
          </Empty>
        ) : (
          <div className="flex flex-col gap-3">
            {decisions.map((d) => (
              <DecisionCard
                key={d.id}
                d={d}
                ctx={ctx}
                hypOptions={hypOptions}
              />
            ))}
          </div>
        )}
        <AddBtn onClick={() => ctx.addItem("decision", { date: todayISO() })}>
          + Записать решение
        </AddBtn>
      </Section>

      <History ctx={ctx} />
    </div>
  );
}

function RiskCard({ r, ctx }: { r: ProfileItem; ctx: ProfileCtx }) {
  const closed = r.status === "closed";
  const set = (data: Record<string, unknown>) => ctx.updateItem(r.id, { data });
  return (
    <div
      data-item={r.id}
      id={`sec-item-${r.id}`}
      className={`scroll-mt-24 flex flex-col rounded-[13px] border border-line p-4 ${closed ? "opacity-70" : ""}`}
    >
      <div className="flex items-center gap-2">
        <div className="w-[150px]">
          <Pick
            value={r.data.type ?? ""}
            options={RISK_TYPES}
            onChange={(v) => set({ type: v || null })}
            placeholder="Тип"
          />
        </div>
        <div className="flex-1" />
        <StatusPick
          value={r.status}
          options={STATUS.risk}
          onChange={(v) => ctx.updateItem(r.id, { status: v })}
          size="sm"
        />
        <RemoveBtn onClick={() => ctx.askRemove(r.id)} />
      </div>
      <div className="mt-2">
        <AutoText
          value={r.title}
          onSave={(v) => ctx.updateItem(r.id, { title: v })}
          placeholder={
            r.data.type === "question"
              ? "Какой вопрос пока без ответа?"
              : "Что может пойти не так?"
          }
          className="font-bold"
          rows={1}
        />
      </div>
      <div className="mt-3">
        <Label>Влияние</Label>
        <Pick
          value={r.data.impact ?? ""}
          options={IMPACTS}
          onChange={(v) => set({ impact: v || null })}
        />
      </div>
      <div className="mt-3">
        <Label>Как проверить / снизить</Label>
        <AutoText
          value={r.data.mitigation ?? ""}
          onSave={(v) => set({ mitigation: v })}
          placeholder="Что сделаем, чтобы получить ответ или уменьшить риск"
        />
      </div>
    </div>
  );
}

function DecisionCard({
  d,
  ctx,
  hypOptions,
}: {
  d: ProfileItem;
  ctx: ProfileCtx;
  hypOptions: { value: string; label: string }[];
}) {
  const set = (data: Record<string, unknown>) => ctx.updateItem(d.id, { data });
  return (
    <div
      data-item={d.id}
      id={`sec-item-${d.id}`}
      className={`scroll-mt-24 rounded-[13px] border p-4 ${
        d.status === "revisit" ? "border-[#edd48e]" : "border-line"
      } ${d.status === "cancelled" ? "opacity-60" : ""}`}
    >
      <div className="flex flex-wrap items-start gap-2 sm:flex-nowrap">
        <input
          type="date"
          value={d.data.date ?? ""}
          onChange={(e) => set({ date: e.target.value || null })}
          className="h-[36px] w-[140px] shrink-0 rounded-lg border-0 bg-[#f5f4ef] px-2.5 text-sm outline-none focus:bg-white focus:ring-1 focus:ring-ink/30"
        />
        <div className="order-last w-full sm:order-none sm:w-auto sm:min-w-0 sm:flex-1">
          <AutoText
            value={d.title}
            onSave={(v) => ctx.updateItem(d.id, { title: v })}
            placeholder="Что решили"
            className="font-bold"
            rows={1}
          />
        </div>
        <StatusPick
          value={d.status}
          options={STATUS.decision}
          onChange={(v) => ctx.updateItem(d.id, { status: v })}
        />
        <RemoveBtn onClick={() => ctx.askRemove(d.id)} />
      </div>
      <div className="mt-3 grid gap-3 md:grid-cols-3">
        <div>
          <Label>Почему</Label>
          <AutoText
            value={d.data.why ?? ""}
            onSave={(v) => set({ why: v })}
            placeholder="Какие данные или аргументы"
          />
        </div>
        <div>
          <Label>Что заставит пересмотреть</Label>
          <AutoText
            value={d.data.revisit ?? ""}
            onSave={(v) => set({ revisit: v })}
            placeholder="Например: меньше 3 оплат за месяц"
          />
        </div>
        <div>
          <Label>На основе гипотезы</Label>
          <Pick
            value={d.data.hypothesis_id ?? ""}
            options={hypOptions}
            onChange={(v) => set({ hypothesis_id: v || null })}
          />
        </div>
      </div>
    </div>
  );
}

function History({ ctx }: { ctx: ProfileCtx }) {
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const list = showAll ? ctx.history : ctx.history.slice(0, 20);

  async function submit() {
    const t = note.trim();
    if (!t) return;
    setSaving(true);
    await ctx.addNote(t);
    setSaving(false);
    setNote("");
  }

  return (
    <Section
      id="history"
      title="История"
      desc="Что добавляли, какие статусы меняли, и заметки команды. Пишется автоматически."
    >
      <div className="flex flex-col gap-2 sm:flex-row">
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit();
          }}
          rows={2}
          placeholder="Заметка: что узнали на созвоне, почему поменяли приоритет…"
          className="min-w-0 flex-1 resize-none rounded-[10px] border border-line bg-[#fafafa] px-3 py-2 text-sm outline-none focus:border-ink/30 focus:bg-white"
        />
        <button
          onClick={submit}
          disabled={!note.trim() || saving}
          className="shrink-0 self-start rounded-[10px] bg-ink px-4 py-2 text-sm font-bold text-white disabled:opacity-40"
        >
          {saving ? "Сохраняю…" : "Добавить в историю"}
        </button>
      </div>

      {ctx.history.length === 0 ? (
        <p className="mt-4 text-center text-sm text-muted">Событий пока нет.</p>
      ) : (
        <ul className="mt-4 flex flex-col">
          {list.map((e) => (
            <li
              key={e.id}
              className="flex gap-3 border-t border-[#f1efe9] py-2.5 first:border-t-0"
            >
              <span
                className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${dot(e)}`}
              />
              <div className="min-w-0 flex-1">
                <div
                  className={`text-sm ${e.event === "note" ? "whitespace-pre-wrap" : ""}`}
                >
                  {describe(e)}
                </div>
                <div className="mt-0.5 text-xs text-muted">
                  {e.actor?.full_name || e.actor?.email || "—"} ·{" "}
                  {fmtDate(e.created_at)}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      {!showAll && ctx.history.length > 20 && (
        <button
          onClick={() => setShowAll(true)}
          className="mt-2 text-sm font-bold text-muted hover:text-ink"
        >
          Показать все ({ctx.history.length})
        </button>
      )}
    </Section>
  );
}

function describe(e: HistoryEntry) {
  const kind = e.kind ? KIND_LABEL[e.kind] : "";
  const title = e.title?.trim() ? `«${e.title}»` : "без названия";
  if (e.event === "note") return e.note;
  if (e.event === "added") return `Добавлено: ${kind.toLowerCase()} ${title}`;
  if (e.event === "removed") return `Удалено: ${kind.toLowerCase()} ${title}`;
  if (e.event === "status" && e.kind)
    return (
      <>
        {kind} {title}: {statusOf(e.kind, e.from_status ?? "").label} →{" "}
        <b>{statusOf(e.kind, e.to_status ?? "").label}</b>
      </>
    );
  return title;
}

function dot(e: HistoryEntry) {
  if (e.event === "note") return "bg-ink";
  if (e.event === "removed") return "bg-bad";
  if (e.event === "added") return "bg-[#b5b3aa]";
  return "bg-[#3b7be0]";
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("ru-RU", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
