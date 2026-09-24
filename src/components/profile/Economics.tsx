"use client";

import { useState } from "react";
import { STATUS, freshness, type ProfileItem } from "@/lib/profile";
import {
  CURRENCIES,
  DEFAULT_QUARTER,
  forecast,
  money,
  n,
  quartersFor,
  unitEconomics,
  type Currency,
  type Horizon,
  type ProductData,
} from "@/lib/economics";
import { Select } from "../ui";
import type { ProfileCtx } from "./ProfileApp";
import {
  AddBtn,
  AutoText,
  Empty,
  Label,
  NumField,
  RemoveBtn,
  Section,
  Segmented,
  StatusPick,
} from "./fields";
import ForecastChart from "./ForecastChart";

export default function EconomicsTab({ ctx }: { ctx: ProfileCtx }) {
  const { profile, items } = ctx;
  const [showTable, setShowTable] = useState(false);

  if (!ctx.canEconomics) {
    return (
      <Empty>
        Вкладка «Экономика» заработает после запуска{" "}
        <b>supabase/migrations/0005_economics.sql</b> в Supabase → SQL Editor.
      </Empty>
    );
  }

  const e = profile.economics ?? {};
  const cur: Currency = e.currency ?? "EUR";
  const horizon: Horizon = e.horizon ?? 12;
  const products = ctx.byKind("product");
  const inPlan = products.filter((p) => p.status !== "dropped");
  const fc = forecast(
    e,
    inPlan.map((p) => p.data as ProductData),
  );
  const quarters = quartersFor(e);
  const m = (v: number) => money(v, cur);
  const ready = inPlan.length > 0 && n(e.base_sales) > 0;
  const sym = CURRENCIES.find((c) => c.value === cur)!.label.split(" ")[0];

  const setQuarter = (
    i: number,
    patch: Partial<{ sales: number; cost: number }>,
  ) => {
    // храним все 11 кварталов (до 36 мес.), чтобы при смене горизонта значения не терялись
    const next = Array.from({ length: 11 }, (_, k) => ({
      ...(e.quarters?.[k] ?? DEFAULT_QUARTER),
    }));
    next[i] = { ...next[i], ...patch };
    ctx.patchEconomics({ quarters: next });
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-2xl text-sm text-muted">
          Грубая модель, чтобы понять: сходится ли экономика и сколько денег
          нужно до выхода в плюс. Все цифры — до налогов.
        </p>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-muted">Валюта</span>
          <div className="w-[140px]">
            <Select
              value={cur}
              onChange={(v: Currency) => ctx.patchEconomics({ currency: v })}
              className="!h-[36px] !rounded-lg !border-0 !bg-white text-sm"
              options={CURRENCIES}
            />
          </div>
        </div>
      </div>

      {/* ПРОДУКТЫ */}
      <Section
        id="product"
        title="Продукты и юнит-экономика"
        desc="Что продаём, сколько стоит одна продажа и сколько на ней зарабатываем."
        fresh={freshness("product", profile, items)}
        onReviewed={() => ctx.markReviewed("product")}
      >
        {products.length === 0 ? (
          <Empty>
            Добавьте продукт или тариф: подписку или разовую продажу.
          </Empty>
        ) : (
          <div className="flex flex-col gap-3">
            {products.map((p) => (
              <ProductCard
                key={p.id}
                p={p}
                ctx={ctx}
                cur={cur}
                sym={sym}
                mixTotal={fc.mixTotal}
              />
            ))}
          </div>
        )}
        {inPlan.length > 1 && Math.round(fc.mixTotal) !== 100 && (
          <p className="mt-3 text-xs text-muted">
            Сумма долей продаж — {Math.round(fc.mixTotal)}%. В расчёте доли
            автоматически приводятся к 100%.
          </p>
        )}
        <AddBtn
          onClick={() =>
            ctx.addItem("product", {
              model: "subscription",
              mix: products.length ? 0 : 100,
            })
          }
        >
          + Добавить продукт
        </AddBtn>
      </Section>

      {/* ПЛАН */}
      <Section
        id="plan"
        title="Финансовый план"
        desc="Сколько новых продаж в месяц и постоянных расходов на старте, и как они растут от квартала к кварталу."
        fresh={freshness("plan", profile, items)}
        onReviewed={() => ctx.markReviewed("plan")}
      >
        <div className="grid gap-3 md:grid-cols-[auto_1fr_1fr]">
          <div>
            <Label>Горизонт</Label>
            <Segmented<Horizon>
              value={horizon}
              onChange={(v) => ctx.patchEconomics({ horizon: v })}
              options={[
                { value: 12, label: "12 мес." },
                { value: 24, label: "24 мес." },
                { value: 36, label: "36 мес." },
              ]}
            />
          </div>
          <div>
            <Label>Новых продаж в месяц</Label>
            <NumField
              value={e.base_sales}
              onSave={(v) => ctx.patchEconomics({ base_sales: v })}
              suffix="шт."
            />
          </div>
          <div>
            <Label>Постоянные расходы в месяц</Label>
            <NumField
              value={e.base_fixed}
              onSave={(v) => ctx.patchEconomics({ base_fixed: v })}
              suffix={sym}
            />
          </div>
        </div>

        <div className="mt-5">
          <div className="mb-2 flex flex-wrap items-baseline gap-2">
            <span className="text-sm font-extrabold">
              Рост к предыдущему кварталу
            </span>
            <span className="text-xs text-muted">Q1 — база из полей выше</span>
            {quarters.length > 1 && (
              <button
                onClick={() => {
                  const q0 = quarters[0] ?? DEFAULT_QUARTER;
                  ctx.patchEconomics({
                    quarters: Array.from({ length: 11 }, () => ({ ...q0 })),
                  });
                }}
                className="ml-auto text-xs font-bold text-muted hover:text-ink"
              >
                Как в Q2 для всех
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
            {quarters.map((q, i) => (
              <div key={i} className="rounded-[11px] border border-line p-2.5">
                <div className="mb-1.5 text-xs font-extrabold">Q{i + 2}</div>
                <div className="text-[11px] text-muted">продажи</div>
                <NumField
                  value={q.sales}
                  onSave={(v) => setQuarter(i, { sales: v })}
                  suffix="%"
                />
                <div className="mt-1.5 text-[11px] text-muted">расходы</div>
                <NumField
                  value={q.cost}
                  onSave={(v) => setQuarter(i, { cost: v })}
                  suffix="%"
                />
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* РЕЗУЛЬТАТ */}
      <div className="rounded-[17px] border border-line bg-white">
        <div className="border-b border-[#efede6] px-5 py-4">
          <h2 className="text-lg font-extrabold tracking-tight">
            Прогноз на {horizon} мес.
          </h2>
          <p className="text-sm text-muted">
            {!ready
              ? "Добавьте продукт с ценой и укажите продажи в месяц — здесь появится расчёт."
              : "Операционная модель: подписки учитывают отток, CAC начисляется только на новых клиентов."}
          </p>
        </div>
        {ready && (
          <div className="p-5">
            <div className="grid grid-cols-2 gap-2.5 md:grid-cols-5">
              <Tile
                label="Выручка"
                value={m(fc.revenue)}
                hint="за весь период"
              />
              <Tile
                label="Привлечение"
                value={m(fc.acq)}
                hint="CAC × новые продажи"
              />
              <Tile
                label="Себестоимость"
                value={m(fc.delivery)}
                hint="часы + переменные"
              />
              <Tile
                label="Постоянные"
                value={m(fc.fixed)}
                hint="с учётом роста"
              />
              <Tile
                label="Операционная прибыль"
                value={m(fc.profit)}
                hint={`маржа ${fc.margin.toFixed(1)}%`}
                tone={fc.profit < 0 ? "bad" : fc.profit > 0 ? "ok" : undefined}
              />
            </div>
            <div className="mt-2.5 grid gap-2.5 md:grid-cols-3">
              <Insight
                label="Выход в плюс"
                value={
                  fc.breakEven ? `месяц ${fc.breakEven}` : "не в этом горизонте"
                }
                hint="первый месяц без убытка"
              />
              <Insight
                label="Нужно денег до окупаемости"
                value={fc.cashNeed > 0 ? m(fc.cashNeed) : "—"}
                hint="самая глубокая точка накопленного минуса"
              />
              <Insight
                label="Вложения окупаются"
                value={
                  fc.cashNeed > 0
                    ? fc.payback
                      ? `месяц ${fc.payback}`
                      : "не в этом горизонте"
                    : "сразу"
                }
                hint="накопленный результат снова ≥ 0"
              />
            </div>

            <div className="mt-5">
              <ForecastChart rows={fc.rows} currency={cur} />
            </div>

            <button
              onClick={() => setShowTable((v) => !v)}
              className="mt-4 text-sm font-bold text-muted hover:text-ink"
            >
              {showTable
                ? "Скрыть таблицу по месяцам ↑"
                : "Показать таблицу по месяцам ↓"}
            </button>
            {showTable && (
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[760px] text-right text-sm tabular-nums">
                  <thead>
                    <tr className="border-b border-line text-[11px] text-muted">
                      <th className="py-2 pr-2 text-left font-bold">Месяц</th>
                      <th className="px-2 font-bold">Новые продажи</th>
                      <th className="px-2 font-bold">Выручка</th>
                      <th className="px-2 font-bold">CAC</th>
                      <th className="px-2 font-bold">Себестоимость</th>
                      <th className="px-2 font-bold">Постоянные</th>
                      <th className="px-2 font-bold">Расходы всего</th>
                      <th className="px-2 font-bold">Прибыль</th>
                      <th className="px-2 font-bold">Маржа</th>
                      <th className="pl-2 font-bold">Накоплено</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fc.rows.map((r) => (
                      <tr
                        key={r.m}
                        className={`border-b border-[#f1efe9] ${r.m % 3 === 0 ? "border-b-line" : ""}`}
                      >
                        <td className="py-1.5 pr-2 text-left font-bold">
                          M{r.m}
                        </td>
                        <td className="px-2">{r.newSales.toFixed(1)}</td>
                        <td className="px-2">{m(r.revenue)}</td>
                        <td className="px-2">{m(r.acq)}</td>
                        <td className="px-2">{m(r.delivery)}</td>
                        <td className="px-2">{m(r.fixed)}</td>
                        <td className="px-2">{m(r.total)}</td>
                        <td
                          className={`px-2 font-bold ${r.profit < 0 ? "text-bad" : ""}`}
                        >
                          {m(r.profit)}
                        </td>
                        <td className="px-2">{r.margin.toFixed(1)}%</td>
                        <td
                          className={`pl-2 ${r.cumulative < 0 ? "text-bad" : ""}`}
                        >
                          {m(r.cumulative)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ProductCard({
  p,
  ctx,
  cur,
  sym,
  mixTotal,
}: {
  p: ProfileItem;
  ctx: ProfileCtx;
  cur: Currency;
  sym: string;
  mixTotal: number;
}) {
  const d = p.data as ProductData;
  const u = unitEconomics(d);
  const set = (data: Partial<ProductData>) => ctx.updateItem(p.id, { data });
  const m = (v: number) => money(v, cur);
  const dropped = p.status === "dropped";
  const share = mixTotal > 0 ? Math.round((n(d.mix) / mixTotal) * 100) : 0;

  return (
    <div
      data-item={p.id}
      id={`sec-item-${p.id}`}
      className={`scroll-mt-24 rounded-[13px] border border-line p-4 ${dropped ? "opacity-60" : ""}`}
    >
      <div className="flex flex-wrap items-start gap-2 sm:flex-nowrap">
        <div className="order-last w-full sm:order-none sm:w-auto sm:min-w-0 sm:flex-1">
          <AutoText
            value={p.title}
            onSave={(v) => ctx.updateItem(p.id, { title: v })}
            placeholder="Название продукта или тарифа"
            className="font-bold"
            single
          />
        </div>
        <Segmented
          value={d.model ?? "subscription"}
          onChange={(v) => set({ model: v })}
          options={[
            { value: "subscription", label: "Подписка / мес." },
            { value: "one_time", label: "Разовая продажа" },
          ]}
        />
        <StatusPick
          value={p.status}
          options={STATUS.product}
          onChange={(v) => ctx.updateItem(p.id, { status: v })}
        />
        <RemoveBtn onClick={() => ctx.askRemove(p.id)} />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
        <div>
          <Label>{u.subscription ? "Цена в месяц" : "Цена"}</Label>
          <NumField
            value={d.price}
            onSave={(v) => set({ price: v })}
            suffix={sym}
          />
        </div>
        <div>
          <Label>
            {u.subscription ? "Часов на клиента / мес." : "Часов на клиента"}
          </Label>
          <NumField
            value={d.hours}
            onSave={(v) => set({ hours: v })}
            suffix="ч"
          />
        </div>
        <div>
          <Label>Стоимость часа команды</Label>
          <NumField
            value={d.hour_cost}
            onSave={(v) => set({ hour_cost: v })}
            suffix={`${sym}/ч`}
          />
        </div>
        <div>
          <Label>Прочие затраты на продажу</Label>
          <NumField
            value={d.variable}
            onSave={(v) => set({ variable: v })}
            suffix={sym}
          />
        </div>
        <div>
          <Label>CAC (привлечение)</Label>
          <NumField
            value={d.cac}
            onSave={(v) => set({ cac: v })}
            suffix={sym}
          />
        </div>
        <div>
          <Label>Отток в месяц</Label>
          <NumField
            value={d.churn}
            onSave={(v) => set({ churn: v })}
            suffix="%"
            disabled={!u.subscription}
          />
        </div>
        <div>
          <Label>Активных клиентов на старте</Label>
          <NumField
            value={d.start_active}
            onSave={(v) => set({ start_active: v })}
            suffix="шт."
            disabled={!u.subscription}
          />
        </div>
        <div>
          <Label hint={mixTotal > 0 && !dropped ? `≈ ${share}%` : undefined}>
            Доля продаж
          </Label>
          <NumField value={d.mix} onSave={(v) => set({ mix: v })} suffix="%" />
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 rounded-[11px] bg-[#faf9f6] p-3 md:grid-cols-5">
        <Derived label="Себестоимость продажи" value={m(u.delivery)} />
        <Derived
          label="Вклад до CAC"
          value={m(u.contribution)}
          bad={u.contribution < 0}
        />
        <Derived
          label="Маржа до CAC"
          value={`${u.margin.toFixed(0)}%`}
          bad={u.margin < 0}
        />
        {u.subscription ? (
          <>
            <Derived
              label="CAC окупается за"
              value={
                u.paybackMonths !== null
                  ? `${u.paybackMonths.toFixed(1)} мес.`
                  : "—"
              }
              bad={u.paybackMonths !== null && u.paybackMonths > 12}
            />
            <Derived
              label="LTV (вклад за жизнь)"
              value={u.ltv !== null ? m(u.ltv) : "—"}
              sub={
                u.ltvCac !== null
                  ? `LTV / CAC = ${u.ltvCac.toFixed(1)}`
                  : undefined
              }
              bad={u.ltvCac !== null && u.ltvCac < 3}
            />
          </>
        ) : (
          <Derived
            label="Прибыль с продажи после CAC"
            value={m(u.profitAfterCac ?? 0)}
            bad={(u.profitAfterCac ?? 0) < 0}
          />
        )}
      </div>
      {dropped && (
        <p className="mt-2 text-xs text-muted">
          Статус «Отказались» — продукт не учитывается в прогнозе.
        </p>
      )}
    </div>
  );
}

function Derived({
  label,
  value,
  sub,
  bad,
}: {
  label: string;
  value: string;
  sub?: string;
  bad?: boolean;
}) {
  return (
    <div>
      <div className="text-[11px] font-bold text-muted">{label}</div>
      <div
        className={`text-base font-extrabold tabular-nums ${bad ? "text-bad" : ""}`}
      >
        {value}
      </div>
      {sub && (
        <div className={`text-[11px] ${bad ? "text-bad" : "text-muted"}`}>
          {sub}
        </div>
      )}
    </div>
  );
}

function Tile({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "ok" | "bad";
}) {
  return (
    <div className="rounded-[13px] border border-line px-4 py-3">
      <small className="block font-semibold text-muted">{label}</small>
      <strong
        className={`mt-0.5 block text-xl tracking-tight tabular-nums ${tone === "bad" ? "text-bad" : tone === "ok" ? "text-ok" : ""}`}
      >
        {value}
      </strong>
      {hint && <small className="block text-[11px] text-muted">{hint}</small>}
    </div>
  );
}

function Insight({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-[13px] bg-[#faf9f6] px-4 py-3">
      <small className="block font-semibold text-muted">{label}</small>
      <strong className="mt-0.5 block text-lg tracking-tight">{value}</strong>
      <small className="block text-[11px] text-muted">{hint}</small>
    </div>
  );
}
