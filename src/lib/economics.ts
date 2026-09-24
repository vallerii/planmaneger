// Экономика продукта: юнит-экономика и помесячный прогноз.

export type Currency = "EUR" | "RUB" | "USD";
export type Horizon = 12 | 24 | 36;

export type Economics = {
  currency?: Currency;
  horizon?: Horizon;
  /** новых продаж в месяц в Q1 (всего по всем продуктам) */
  base_sales?: number;
  /** постоянные расходы в месяц в Q1 */
  base_fixed?: number;
  /** рост к предыдущему кварталу, %; индекс 0 — это Q2 */
  quarters?: { sales: number; cost: number }[];
};

export type ProductModel = "subscription" | "one_time";

/** Поля продукта в profile_items.data */
export type ProductData = {
  model?: ProductModel;
  price?: number;
  hours?: number;
  hour_cost?: number;
  variable?: number;
  cac?: number;
  churn?: number; // % в месяц
  start_active?: number;
  mix?: number; // доля новых продаж, %
};

export const CURRENCIES: { value: Currency; label: string }[] = [
  { value: "EUR", label: "€ евро" },
  { value: "RUB", label: "₽ рубли" },
  { value: "USD", label: "$ доллары" },
];

export const DEFAULT_QUARTER = { sales: 15, cost: 5 };

export const n = (v: unknown) => {
  const x =
    typeof v === "number" ? v : parseFloat(String(v ?? "").replace(",", "."));
  return Number.isFinite(x) ? x : 0;
};

export function money(v: number, currency: Currency = "EUR") {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Math.round(v));
}

export function unitEconomics(d: ProductData) {
  const price = n(d.price);
  const delivery = n(d.hours) * n(d.hour_cost) + n(d.variable);
  const contribution = price - delivery;
  const margin = price ? (contribution / price) * 100 : 0;
  const cac = n(d.cac);
  const churn = Math.min(100, n(d.churn)) / 100;
  const subscription = (d.model ?? "subscription") === "subscription";
  return {
    price,
    delivery,
    contribution,
    margin,
    cac,
    subscription,
    /** подписка: за сколько месяцев окупается CAC */
    paybackMonths: subscription && contribution > 0 ? cac / contribution : null,
    /** подписка: вклад клиента за всё время жизни (до CAC) */
    ltv:
      subscription && churn > 0 && contribution > 0
        ? contribution / churn
        : null,
    /** подписка: LTV / CAC */
    ltvCac:
      subscription && churn > 0 && contribution > 0 && cac > 0
        ? contribution / churn / cac
        : null,
    /** разовая продажа: прибыль с одной продажи после CAC */
    profitAfterCac: subscription ? null : contribution - cac,
  };
}

export type ForecastRow = {
  m: number;
  newSales: number;
  revenue: number;
  acq: number;
  delivery: number;
  fixed: number;
  total: number;
  profit: number;
  margin: number;
  cumulative: number;
};

export function quarterCount(h: Horizon) {
  return Math.ceil(h / 3);
}

/** Рост к предыдущему кварталу для Q2..Qn (заполняет пропуски значением по умолчанию). */
export function quartersFor(e: Economics) {
  const qn = quarterCount(e.horizon ?? 12);
  return Array.from(
    { length: qn - 1 },
    (_, i) => e.quarters?.[i] ?? DEFAULT_QUARTER,
  );
}

export function forecast(e: Economics, products: ProductData[]) {
  const horizon = e.horizon ?? 12;
  const baseSales = n(e.base_sales);
  const baseFixed = n(e.base_fixed);
  const qs = quartersFor(e);
  const totalMix = products.reduce((a, p) => a + n(p.mix), 0);
  // если доли не заданы — делим поровну
  const weight = (p: ProductData) =>
    totalMix > 0
      ? n(p.mix) / totalMix
      : products.length
        ? 1 / products.length
        : 0;

  // множители по кварталам
  const factors: { sales: number; cost: number }[] = [];
  let sf = 1;
  let cf = 1;
  for (let q = 0; q < quarterCount(horizon); q++) {
    if (q > 0) {
      sf *= 1 + n(qs[q - 1].sales) / 100;
      cf *= 1 + n(qs[q - 1].cost) / 100;
    }
    factors.push({ sales: sf, cost: cf });
  }

  const active = products.map((p) =>
    (p.model ?? "subscription") === "subscription" ? n(p.start_active) : 0,
  );
  const rows: ForecastRow[] = [];
  let cumulative = 0;
  for (let m = 1; m <= horizon; m++) {
    const f = factors[Math.floor((m - 1) / 3)];
    const newSales = baseSales * f.sales;
    let revenue = 0;
    let acq = 0;
    let delivery = 0;
    products.forEach((p, i) => {
      const u = unitEconomics(p);
      const units = newSales * weight(p);
      acq += units * u.cac;
      if (u.subscription) {
        active[i] = active[i] * (1 - Math.min(100, n(p.churn)) / 100) + units;
        revenue += active[i] * u.price;
        delivery += active[i] * u.delivery;
      } else {
        revenue += units * u.price;
        delivery += units * u.delivery;
      }
    });
    const fixed = baseFixed * f.cost;
    const total = acq + delivery + fixed;
    const profit = revenue - total;
    cumulative += profit;
    rows.push({
      m,
      newSales,
      revenue,
      acq,
      delivery,
      fixed,
      total,
      profit,
      margin: revenue ? (profit / revenue) * 100 : 0,
      cumulative,
    });
  }

  const sum = (k: keyof ForecastRow) => rows.reduce((a, r) => a + r[k], 0);
  const revenue = sum("revenue");
  const profit = sum("profit");
  const minCumulative = Math.min(0, ...rows.map((r) => r.cumulative));
  const minIdx = rows.findIndex((r) => r.cumulative === minCumulative);
  return {
    rows,
    revenue,
    acq: sum("acq"),
    delivery: sum("delivery"),
    fixed: sum("fixed"),
    profit,
    margin: revenue ? (profit / revenue) * 100 : 0,
    /** первый месяц с прибылью ≥ 0 */
    breakEven: rows.find((r) => r.profit >= 0 && r.revenue > 0)?.m ?? null,
    /** сколько денег нужно, чтобы дожить до окупаемости (глубина накопленного минуса) */
    cashNeed: -minCumulative,
    /** месяц, когда накопленный результат снова ≥ 0 */
    payback:
      minCumulative < 0
        ? (rows.slice(minIdx).find((r) => r.cumulative >= 0)?.m ?? null)
        : null,
    mixTotal: totalMix,
  };
}
