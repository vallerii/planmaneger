"use client";

import { useState } from "react";
import {
  HYP_TYPES,
  PRIORITIES,
  STATUS,
  freshness,
  statusOf,
  type ProfileItem,
} from "@/lib/profile";
import { todayISO } from "@/lib/schedule";
import { STATUS_META, type Status } from "@/lib/types";
import Link from "next/link";
import { Select } from "../ui";
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

type Filter = "all" | "open" | "closed";
const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "Все" },
  { id: "open", label: "Открытые" },
  { id: "closed", label: "Закрытые" },
];

const isOpen = (h: ProfileItem) =>
  h.status === "todo" || h.status === "testing";

export default function Hypotheses({ ctx }: { ctx: ProfileCtx }) {
  const { profile, items } = ctx;
  const [filter, setFilter] = useState<Filter>("all");
  const all = ctx.byKind("hypothesis");
  const list = all.filter((h) =>
    filter === "all" ? true : filter === "open" ? isOpen(h) : !isOpen(h),
  );
  const icpOptions = ctx
    .byKind("icp")
    .map((i) => ({ value: i.id, label: i.title || "ICP без названия" }));
  const problemOptions = ctx
    .byKind("problem")
    .map((p) => ({ value: p.id, label: p.title || "Проблема без названия" }));
  const openCount = all.filter(isOpen).length;

  return (
    <div className="flex flex-col gap-5">
      <Section
        id="hypothesis"
        title="Гипотезы"
        desc="Что мы считаем правдой, но ещё не проверили. У каждой гипотезы — способ проверки, критерий успеха и срок."
        fresh={freshness("hypothesis", profile, items)}
        onReviewed={() => ctx.markReviewed("hypothesis")}
      >
        {all.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-1.5">
            {FILTERS.map((f) => {
              const n =
                f.id === "all"
                  ? all.length
                  : f.id === "open"
                    ? openCount
                    : all.length - openCount;
              return (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={`rounded-full px-3 py-1 text-sm font-bold transition ${
                    filter === f.id
                      ? "bg-ink text-white"
                      : "bg-[#f5f4ef] text-muted hover:text-ink"
                  }`}
                >
                  {f.label} <span className="opacity-60">{n}</span>
                </button>
              );
            })}
          </div>
        )}

        {all.length === 0 ? (
          <Empty>
            Гипотез пока нет. Начните с самой рискованной: «Если это окажется
            неправдой — продукт не взлетит».
          </Empty>
        ) : list.length === 0 ? (
          <Empty>В этом фильтре ничего нет.</Empty>
        ) : (
          <div className="flex flex-col gap-3">
            {list.map((h) => (
              <HypothesisCard
                key={h.id}
                h={h}
                ctx={ctx}
                icpOptions={icpOptions}
                problemOptions={problemOptions}
              />
            ))}
          </div>
        )}
        <AddBtn
          onClick={() =>
            ctx.addItem("hypothesis", { type: "problem", priority: "medium" })
          }
        >
          + Добавить гипотезу
        </AddBtn>
      </Section>
    </div>
  );
}

function HypothesisCard({
  h,
  ctx,
  icpOptions,
  problemOptions,
}: {
  h: ProfileItem;
  ctx: ProfileCtx;
  icpOptions: { value: string; label: string }[];
  problemOptions: { value: string; label: string }[];
}) {
  const st = statusOf("hypothesis", h.status);
  const closed = !isOpen(h);
  const overdue = !closed && h.data.deadline && h.data.deadline < todayISO();
  const set = (data: Record<string, unknown>) => ctx.updateItem(h.id, { data });

  return (
    <div
      data-item={h.id}
      id={`sec-item-${h.id}`}
      className={`scroll-mt-24 rounded-[13px] border p-4 ${
        st.value === "confirmed"
          ? "border-[#bfe3d1]"
          : st.value === "refuted"
            ? "border-[#f3c9c0]"
            : "border-line"
      }`}
    >
      <div className="flex flex-wrap items-start gap-2 sm:flex-nowrap">
        <div className="order-last w-full sm:order-none sm:w-auto sm:min-w-0 sm:flex-1">
          <AutoText
            value={h.title}
            onSave={(v) => ctx.updateItem(h.id, { title: v })}
            placeholder="Мы считаем, что [кто] [сделает что / испытывает что], потому что [почему]"
            className="font-bold"
            rows={1}
          />
        </div>
        <StatusPick
          value={h.status}
          options={STATUS.hypothesis}
          onChange={(v) => ctx.updateItem(h.id, { status: v })}
        />
        <RemoveBtn onClick={() => ctx.askRemove(h.id)} />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-5">
        <div>
          <Label>Тип</Label>
          <Pick
            value={h.data.type ?? ""}
            options={HYP_TYPES}
            onChange={(v) => set({ type: v || null })}
          />
        </div>
        <div>
          <Label>Приоритет</Label>
          <Pick
            value={h.data.priority ?? ""}
            options={PRIORITIES}
            onChange={(v) => set({ priority: v || null })}
          />
        </div>
        <div>
          <Label>ICP</Label>
          <Pick
            value={h.data.icp_id ?? ""}
            options={icpOptions}
            onChange={(v) => set({ icp_id: v || null })}
          />
        </div>
        <div>
          <Label>Проблема</Label>
          <Pick
            value={h.data.problem_id ?? ""}
            options={problemOptions}
            onChange={(v) => set({ problem_id: v || null })}
          />
        </div>
        <div>
          <Label hint={overdue ? "просрочено" : undefined}>Дедлайн</Label>
          <input
            type="date"
            value={h.data.deadline ?? ""}
            onChange={(e) => set({ deadline: e.target.value || null })}
            className={`h-[36px] w-full rounded-lg border-0 bg-[#f5f4ef] px-2.5 text-sm outline-none focus:bg-white focus:ring-1 focus:ring-ink/30 ${
              overdue ? "font-bold text-bad" : ""
            }`}
          />
        </div>
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <div>
          <Label>Как проверяем</Label>
          <AutoText
            value={h.data.method ?? ""}
            onSave={(v) => set({ method: v })}
            placeholder="10 интервью, лендинг с оплатой, ручной пилот…"
          />
        </div>
        <div>
          <Label>Критерий успеха</Label>
          <AutoText
            value={h.data.criterion ?? ""}
            onSave={(v) => set({ criterion: v })}
            placeholder="Например: 6 из 10 назвали проблему сами, 3 готовы платить"
          />
        </div>
      </div>

      <div className="mt-3">
        <Label hint={closed ? undefined : "заполните, когда закроете гипотезу"}>
          Результат и вывод
        </Label>
        <AutoText
          value={h.data.result ?? ""}
          onSave={(v) => set({ result: v })}
          placeholder="Что узнали и что меняем в продукте"
          className={closed ? "!bg-[#fff9e8]" : ""}
        />
      </div>

      {ctx.canLinkTasks && <LinkedTasks h={h} ctx={ctx} />}
    </div>
  );
}

function LinkedTasks({ h, ctx }: { h: ProfileItem; ctx: ProfileCtx }) {
  const linked = ctx.tasks.filter((t) => t.hypothesis_id === h.id);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phaseId, setPhaseId] = useState(ctx.phases.at(-1)?.id ?? "");
  const [busy, setBusy] = useState(false);
  const phaseName = (id: string) =>
    ctx.phases.find((p) => p.id === id)?.name ?? "";

  function start() {
    setName(h.title.trim() ? `Проверить: ${h.title.trim()}` : "");
    setPhaseId((cur) => cur || ctx.phases.at(-1)?.id || "");
    setOpen(true);
  }

  async function create() {
    if (!name.trim() || !phaseId) return;
    setBusy(true);
    const ok = await ctx.createTask(
      h.id,
      name.trim(),
      phaseId,
      h.data.deadline,
    );
    setBusy(false);
    if (ok) setOpen(false);
  }

  return (
    <div className="mt-3 rounded-[11px] bg-[#faf9f6] px-3 py-2.5">
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-bold text-muted">
          Задачи на доске для проверки
        </span>
        <span className="text-[11px] text-[#aaa]">{linked.length || ""}</span>
        <div className="flex-1" />
        {!open && (
          <button
            onClick={start}
            className="text-xs font-bold text-muted hover:text-ink"
          >
            + Создать задачу
          </button>
        )}
      </div>

      {linked.length > 0 && (
        <ul className="mt-1.5 flex flex-col gap-1">
          {linked.map((t) => {
            const meta = STATUS_META[t.status as Status] ?? STATUS_META.todo;
            return (
              <li key={t.id}>
                <Link
                  href={`/projects/${ctx.projectId}?task=${t.id}`}
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-white"
                >
                  <span
                    className={`h-2 w-2 shrink-0 rounded-full ${meta.dot}`}
                  />
                  <span className="min-w-0 flex-1 truncate text-sm">
                    {t.name}
                  </span>
                  <span className="hidden shrink-0 text-xs text-muted sm:inline">
                    {phaseName(t.phase_id)}
                  </span>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-extrabold ${meta.badge}`}
                  >
                    {meta.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      {open &&
        (ctx.phases.length === 0 ? (
          <p className="mt-2 text-sm text-muted">
            Сначала создайте хотя бы одну фазу на{" "}
            <Link
              href={`/projects/${ctx.projectId}`}
              className="font-bold underline"
            >
              доске
            </Link>
            .
          </p>
        ) : (
          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") create();
                if (e.key === "Escape") setOpen(false);
              }}
              placeholder="Название задачи"
              className="h-[36px] min-w-0 flex-1 rounded-lg border border-line bg-white px-3 text-sm outline-none focus:border-ink/30"
            />
            <div className="sm:w-[190px]">
              <Select
                value={phaseId}
                onChange={setPhaseId}
                menuWidth={220}
                className="!h-[36px] !rounded-lg text-sm"
                options={ctx.phases.map((p) => ({
                  value: p.id,
                  label: p.name,
                }))}
              />
            </div>
            <div className="flex gap-1.5">
              <button
                onClick={create}
                disabled={busy || !name.trim()}
                className="h-[36px] rounded-lg bg-ink px-3 text-sm font-bold text-white disabled:opacity-40"
              >
                {busy ? "…" : "Создать"}
              </button>
              <button
                onClick={() => setOpen(false)}
                className="h-[36px] rounded-lg px-2.5 text-sm font-bold text-muted hover:text-ink"
              >
                Отмена
              </button>
            </div>
          </div>
        ))}
      {open && ctx.phases.length > 0 && (
        <p className="mt-1.5 text-[11px] text-[#aaa]">
          Задача появится в конце выбранной фазы, размер S
          {h.data.deadline ? ", дедлайн — как у гипотезы" : ""}.
        </p>
      )}
    </div>
  );
}
