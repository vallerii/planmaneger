"use client";

import { freshness, type MarketSize as MS } from "@/lib/profile";
import {
  CURRENCIES,
  forecast,
  money,
  n,
  type ProductData,
} from "@/lib/economics";
import type { ProfileCtx } from "./ProfileApp";
import { AutoText, NumField, Section } from "./fields";

const LEVELS = [
  {
    key: "tam" as const,
    name: "TAM",
    label: "Весь рынок",
    hint: "Сколько денег в год тратят все, у кого есть эта проблема",
    ph: "Например: 250 000 салонов в РФ × 24 000 ₽ в год на продвижение",
  },
  {
    key: "sam" as const,
    name: "SAM",
    label: "Доступный нам",
    hint: "Часть TAM, до которой мы можем дотянуться нашим продуктом и каналами",
    ph: "Например: салоны 1–3 точки в городах-миллионниках, ~40%",
  },
  {
    key: "som" as const,
    name: "SOM",
    label: "Реально занять",
    hint: "Какую долю SAM реально получить за 2–3 года",
    ph: "Например: 2% SAM — с учётом конкурентов и наших каналов",
  },
];

export default function MarketSize({ ctx }: { ctx: ProfileCtx }) {
  const { profile, items } = ctx;
  const ms: MS = profile.market_size ?? {};
  const cur = profile.economics?.currency ?? "EUR";
  const sym = CURRENCIES.find((c) => c.value === cur)!.label.split(" ")[0];
  const v = (k: "tam" | "sam" | "som") => n(ms[k]?.value);
  const set = (
    k: "tam" | "sam" | "som",
    patch: { value?: number; calc?: string },
  ) =>
    ctx.saveProfile(
      { market_size: { ...ms, [k]: { ...ms[k], ...patch } } },
      "market_size",
    );
  const max = Math.max(v("tam"), v("sam"), v("som"), 1);

  // сравнение с прогнозом из «Экономики»: выручка первых 12 месяцев
  const products = items.filter(
    (i) => i.kind === "product" && i.status !== "dropped",
  );
  const fc = products.length
    ? forecast(
        { ...profile.economics, horizon: 12 },
        products.map((p) => p.data as ProductData),
      )
    : null;
  const year1 = fc?.revenue ?? 0;

  return (
    <Section
      id="market_size"
      title="Размер рынка"
      desc="TAM → SAM → SOM: от всего рынка к той части, которую реально занять. Главное — не цифра, а расчёт: откуда она взялась."
      fresh={freshness("market_size", profile, items)}
      onReviewed={() => ctx.markReviewed("market_size")}
    >
      <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
        <div className="flex flex-col gap-4">
          {LEVELS.map((l, i) => {
            const parent = i > 0 ? v(LEVELS[i - 1].key) : 0;
            const bad =
              i > 0 && v(l.key) > 0 && parent > 0 && v(l.key) > parent;
            return (
              <div key={l.key} className="grid gap-2 md:grid-cols-[200px_1fr]">
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-sm font-extrabold">{l.name}</span>
                    <span className="text-xs font-bold text-muted">
                      {l.label}
                    </span>
                  </div>
                  <div className="mt-1">
                    <NumField
                      value={ms[l.key]?.value}
                      onSave={(x) => set(l.key, { value: x })}
                      suffix={`${sym}/год`}
                    />
                  </div>
                  {bad && (
                    <p className="mt-1 text-[11px] font-bold text-bad">
                      Больше, чем {LEVELS[i - 1].name}
                    </p>
                  )}
                  {i > 0 && parent > 0 && v(l.key) > 0 && !bad && (
                    <p className="mt-1 text-[11px] text-muted">
                      {((v(l.key) / parent) * 100).toFixed(
                        v(l.key) / parent < 0.1 ? 1 : 0,
                      )}
                      % от {LEVELS[i - 1].name}
                    </p>
                  )}
                </div>
                <div>
                  <div className="mb-1 text-[11px] text-muted">{l.hint}</div>
                  <AutoText
                    value={ms[l.key]?.calc ?? ""}
                    onSave={(x) => set(l.key, { calc: x })}
                    placeholder={l.ph}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col justify-center gap-2 rounded-[13px] bg-[#faf9f6] p-4">
          {LEVELS.map((l, i) => (
            <div key={l.key}>
              <div className="flex items-baseline justify-between text-xs">
                <span className="font-extrabold">{l.name}</span>
                <span className="font-bold tabular-nums">
                  {v(l.key) ? money(v(l.key), cur) : "—"}
                </span>
              </div>
              <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-[#eceae3]">
                <span
                  className="block h-full rounded-full"
                  style={{
                    width: `${Math.max(v(l.key) ? 2 : 0, (v(l.key) / max) * 100)}%`,
                    background: ["#9db8e6", "#5b8ddc", "#2f6fd6"][i],
                  }}
                />
              </div>
            </div>
          ))}
          {v("som") > 0 && year1 > 0 && (
            <p className="mt-2 text-[11px] leading-snug text-muted">
              Прогноз выручки за первые 12 мес. из «Экономики» —{" "}
              {money(year1, cur)}, это{" "}
              <b className="text-ink">
                {((year1 / v("som")) * 100).toFixed(1)}% SOM
              </b>
              .
              {year1 > v("som") && (
                <span className="text-bad">
                  {" "}
                  Прогноз больше SOM — проверьте цифры.
                </span>
              )}
            </p>
          )}
        </div>
      </div>
    </Section>
  );
}
