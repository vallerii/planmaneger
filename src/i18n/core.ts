// Локализация интерфейса. Основной язык — русский: ключ словаря = русский текст.
// Нет перевода → показываем русский оригинал. Подстановки: t("Задач: {n}", { n: 3 }).
// Словари en/de статичные (без API). Текст пользователей (задачи, профиль)
// сюда не входит — кроме неизменённых названий из шаблона цикла.
import { createElement, Fragment, type ReactNode } from "react";
import { de } from "./de";
import { en } from "./en";

export const LANGS = ["ru", "en", "de"] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = "ru";
export const LANG_COOKIE = "lang";
export const LANG_LABEL: Record<Lang, string> = { ru: "RU", en: "EN", de: "DE" };
export const LANG_NAME: Record<Lang, string> = {
  ru: "Русский",
  en: "English",
  de: "Deutsch",
};
const LOCALE: Record<Lang, string> = { ru: "ru-RU", en: "en-GB", de: "de-DE" };

export const isLang = (v: unknown): v is Lang =>
  typeof v === "string" && (LANGS as readonly string[]).includes(v);

const DICTS: Record<Lang, Record<string, string>> = { ru: {}, en, de };

export type Vars = Record<string, string | number>;
export type TFn = (key: string, vars?: Vars) => string;

function fill(s: string, vars?: Vars) {
  if (!vars) return s;
  return s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
}

function ruPlural(n: number, one: string, few: string, many: string) {
  const a = Math.abs(n) % 100,
    b = a % 10;
  if (!Number.isInteger(n)) return few;
  if (b === 1 && a !== 11) return one;
  if (b >= 2 && b <= 4 && (a < 12 || a > 14)) return few;
  return many;
}

export function makeI18n(lang: Lang) {
  const dict = DICTS[lang] ?? {};
  const locale = LOCALE[lang];
  const t: TFn = (key, vars) => fill(dict[key] ?? key, vars);
  /** Склонение по числу: формы задаются по-русски (1 / 2 / 5), в en/de — единственное / множественное. */
  const tp = (n: number, one: string, few: string, many: string, vars?: Vars) =>
    lang === "ru"
      ? fill(ruPlural(n, one, few, many), vars)
      : t(n === 1 ? one : many, vars);
  const shortDate = new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const fmtDays = (n: number) => {
    const v = Math.round(Math.max(0, n) * 10) / 10;
    return Number.isInteger(v) ? String(v) : v.toFixed(1);
  };
  /** Как t(), но подстановки — элементы: rich("Проект {name} удалён", { name: <b>…</b> }). */
  const rich = (key: string, vars: Record<string, ReactNode>): ReactNode =>
    (dict[key] ?? key)
      .split(/(\{\w+\})/)
      .map((part, i) => {
        const m = /^\{(\w+)\}$/.exec(part);
        return createElement(Fragment, { key: i }, m && m[1] in vars ? vars[m[1]] : part);
      });
  /**
   * HTML из базы (описание задачи): переводит абзацы, которые целиком есть в словаре, —
   * например, описания задач из шаблона цикла. Остальной текст не трогает.
   * Только для показа: в редактор такой HTML не отдавать, иначе перевод сохранится в базу.
   */
  const html = (s: string) =>
    lang === "ru" || !s
      ? s
      : s.replace(/>([^<>]+)</g, (m, text: string) => {
          const k = text.trim();
          const v = dict[k];
          if (!v) return m;
          const esc = v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
          return `>${text.replace(k, esc)}<`;
        });
  return {
    lang,
    locale,
    t,
    tp,
    rich,
    html,
    /** 05 мая 2026 / 05 May 2026 / 05. Mai 2026 */
    date: (d: Date) => shortDate.format(d).replace(" г.", ""),
    /** «3 раб. дня» / «3 workdays» */
    workdays: (n: number) =>
      `${fmtDays(n)} ${tp(n, "раб. день", "раб. дня", "раб. дней")}`,
  };
}

export type I18n = ReturnType<typeof makeI18n>;

/** Переведён ли текст (для названий из шаблона: иначе показываем как есть). */
export const hasTranslation = (lang: Lang, key: string) =>
  lang === "ru" || key in (DICTS[lang] ?? {});
