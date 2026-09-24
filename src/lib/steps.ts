// Фаза 0: задачи «заполнить профиль продукта» и их прогресс.
// Прогресс = заполнено / всего пунктов, максимум 99%. 100% — только когда человек закрыл задачу.

import { n } from "./economics";
import type { ProductProfile, ProfileItem, Tab } from "./profile";
import type { Size } from "./types";

export type ProfileStep =
  "foundation" | "hypotheses" | "market" | "economics" | "risks";

export type CheckItem = { label: string; done: boolean; tab: Tab; sec: string };

export const PHASE0_NAME = "Профиль продукта";

export const STEPS: {
  step: ProfileStep;
  tab: Tab;
  name: string;
  size: Size;
  about: string;
}[] = [
  {
    step: "foundation",
    tab: "foundation",
    name: "Заполнить основу: миссия, тезис, ЦА и проблемы",
    size: "M",
    about:
      "Зачем существует продукт, в чём текущая ставка и для кого мы его делаем. Опишите хотя бы один сегмент (ICP) и одну его проблему.",
  },
  {
    step: "hypotheses",
    tab: "hypotheses",
    name: "Сформулировать гипотезы",
    size: "M",
    about:
      "Что мы считаем правдой, но ещё не проверили. Начните с самой рискованной: у гипотезы должны быть способ проверки, критерий успеха и дедлайн.",
  },
  {
    step: "market",
    tab: "market",
    name: "Разобрать рынок: конкуренты и потенциальные клиенты",
    size: "L",
    about:
      "Чем клиенты решают проблему сегодня и кто конкретно может стать первым клиентом. Запишите главные выводы.",
  },
  {
    step: "economics",
    tab: "economics",
    name: "Посчитать экономику",
    size: "M",
    about:
      "Что продаём, по какой цене и сходится ли модель: продажи в месяц и постоянные расходы.",
  },
  {
    step: "risks",
    tab: "risks",
    name: "Зафиксировать риски и первые решения",
    size: "S",
    about:
      "Что может помешать продукту и какие решения уже приняты — с причинами.",
  },
];

const has = (v?: string | null) => !!v && !!v.trim();

export function stepChecklist(
  step: ProfileStep,
  profile: ProductProfile,
  items: ProfileItem[],
): CheckItem[] {
  const any = (kind: ProfileItem["kind"]) =>
    items.filter((i) => i.kind === kind && has(i.title));
  const t = profile.thesis ?? {};
  switch (step) {
    case "foundation":
      return [
        {
          label: "Миссия",
          done: has(profile.mission),
          tab: "foundation",
          sec: "mission",
        },
        {
          label: "Тезис: основной",
          done: has(t.main),
          tab: "foundation",
          sec: "thesis:main",
        },
        {
          label: "Тезис: почему сейчас",
          done: has(t.why_now),
          tab: "foundation",
          sec: "thesis:why_now",
        },
        {
          label: "Тезис: уникальное преимущество",
          done: has(t.advantage),
          tab: "foundation",
          sec: "thesis:advantage",
        },
        {
          label: "Тезис: мы — это…",
          done: has(t.category),
          tab: "foundation",
          sec: "thesis:category",
        },
        {
          label: "Тезис: главный результат для клиента",
          done: has(t.value),
          tab: "foundation",
          sec: "thesis:value",
        },
        {
          label: "Хотя бы одна проблема клиентов",
          done: any("problem").length > 0,
          tab: "foundation",
          sec: "problem",
        },
        {
          label: "Хотя бы одна ЦА (ICP)",
          done: any("icp").length > 0,
          tab: "foundation",
          sec: "icp",
        },
      ];
    case "hypotheses": {
      const hs = any("hypothesis");
      const some = (k: string) => hs.some((h) => has(String(h.data[k] ?? "")));
      return [
        {
          label: "Хотя бы одна гипотеза",
          done: hs.length > 0,
          tab: "hypotheses",
          sec: "hypothesis",
        },
        {
          label: "Способ проверки",
          done: some("method"),
          tab: "hypotheses",
          sec: "hypothesis",
        },
        {
          label: "Критерий успеха",
          done: some("criterion"),
          tab: "hypotheses",
          sec: "hypothesis",
        },
        {
          label: "Дедлайн проверки",
          done: some("deadline"),
          tab: "hypotheses",
          sec: "hypothesis",
        },
      ];
    }
    case "market":
      return [
        {
          label: "Хотя бы один конкурент",
          done: any("competitor").length > 0,
          tab: "market",
          sec: "competitor",
        },
        {
          label: "Хотя бы один потенциальный клиент",
          done: any("prospect").length > 0,
          tab: "market",
          sec: "prospect",
        },
        {
          label: "Выводы из анализа рынка",
          done: has(profile.market_notes),
          tab: "market",
          sec: "market",
        },
      ];
    case "economics": {
      const e = profile.economics ?? {};
      return [
        {
          label: "Продукт с ценой",
          done: items.some((i) => i.kind === "product" && n(i.data.price) > 0),
          tab: "economics",
          sec: "product",
        },
        {
          label: "Продажи в месяц",
          done: n(e.base_sales) > 0,
          tab: "economics",
          sec: "plan",
        },
        {
          label: "Постоянные расходы",
          done: n(e.base_fixed) > 0,
          tab: "economics",
          sec: "plan",
        },
      ];
    }
    case "risks":
      return [
        {
          label: "Хотя бы один риск или вопрос",
          done: any("risk").length > 0,
          tab: "risks",
          sec: "risk",
        },
        {
          label: "Хотя бы одно решение",
          done: any("decision").length > 0,
          tab: "risks",
          sec: "decision",
        },
      ];
  }
}

/** 0–99: доля заполненных пунктов. 100 ставится только при закрытии задачи. */
export function stepProgress(list: CheckItem[]) {
  if (!list.length) return 0;
  const done = list.filter((c) => c.done).length;
  return Math.min(99, Math.round((done / list.length) * 100));
}

export function stepDescription(step: ProfileStep, projectId: string) {
  const s = STEPS.find((x) => x.step === step)!;
  const href = `/projects/${projectId}/profile?tab=${s.tab}`;
  return `<p>${s.about}</p><p>Прогресс считается сам по заполненности профиля. Когда решите, что достаточно, — закройте задачу статусом «Готово».</p><p><a href="${href}">Открыть профиль →</a></p>`;
}

export const stepHref = (projectId: string, c: { tab: Tab; sec: string }) =>
  `/projects/${projectId}/profile?tab=${c.tab}&sec=${encodeURIComponent(c.sec)}`;
