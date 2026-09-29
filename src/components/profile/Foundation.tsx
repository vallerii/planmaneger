"use client";

import { useT } from "@/i18n/client";
import { useEffect, useState } from "react";
import {
  STATUS,
  TONE,
  freshness,
  statusOf,
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

const THESIS_TABS = [
  {
    key: "main" as const,
    label: "Основной тезис",
    ph: "Мы помогаем [кому] решить [какую проблему] через [какой механизм], чтобы получить [измеримый результат].",
  },
  {
    key: "why_now" as const,
    label: "Почему сейчас",
    ph: "Что изменилось в рынке, технологиях, регулировании или поведении людей, из-за чего именно сейчас хорошее окно для продукта?",
  },
  {
    key: "advantage" as const,
    label: "Уникальное преимущество",
    ph: "Почему клиент выберет нас, а не прямого конкурента, косвенную альтернативу или ручное решение?",
  },
];

export default function Foundation({ ctx }: { ctx: ProfileCtx }) {
  const t = useT();
  const { profile, items } = ctx;
  const [thesisTab, setThesisTab] =
    useState<(typeof THESIS_TABS)[number]["key"]>("main");
  const icps = ctx.byKind("icp");
  const problems = ctx.byKind("problem");
  const icpOptions = icps.map((i) => ({
    value: i.id,
    label: i.title || t("ICP без названия"),
  }));
  const thesis = THESIS_TABS.find((t) => t.key === thesisTab)!;

  // переход из позиционирования: «thesis:advantage», «thesis:category», …
  const { focus, setFocus } = ctx;
  useEffect(() => {
    if (!focus?.includes(":")) return;
    const key = focus.split(":")[1];
    const t = setTimeout(() => {
      const tabKey = THESIS_TABS.find((x) => x.key === key)?.key;
      if (tabKey) setThesisTab(tabKey);
      setTimeout(() => {
        document
          .querySelector<HTMLTextAreaElement>(`[data-focus="${key}"] textarea`)
          ?.focus();
      }, 80);
      setFocus(null);
    }, 0);
    return () => clearTimeout(t);
  }, [focus, setFocus]);

  return (
    <div className="flex flex-col gap-5">
      {/* МИССИЯ И ВИДЕНИЕ */}
      <Section
        id="mission"
        title={ctx.canCycle ? t("Миссия и видение") : t("Миссия")}
        desc={t("Миссия — зачем существует продукт. Видение — каким станет мир (или рынок), когда у нас получится. Меняются редко.")}
        fresh={freshness("mission", profile, items)}
        onReviewed={() => ctx.markReviewed("mission")}
      >
        <AutoText
          value={profile.mission}
          onSave={(v) => ctx.saveProfile({ mission: v }, "mission")}
          placeholder={t("Например: помогаем локальному бизнесу видеть и управлять тем, как их находят и оценивают в интернете.")}
          className="text-lg font-bold"
        />
        {ctx.canCycle && (
          <div className="mt-4" data-focus="vision">
            <Label hint={t("через 3–5 лет")}>{t("Видение")}</Label>
            <AutoText
              value={profile.vision ?? ""}
              onSave={(v) => ctx.saveProfile({ vision: v }, "mission")}
              placeholder={t("Например: любой локальный бизнес знает, почему клиенты выбирают или не выбирают его, и может это исправить за день.")}
            />
          </div>
        )}
      </Section>

      {/* ТЕЗИС */}
      <Section
        id="thesis"
        title={t("Тезис продукта")}
        desc={t("Текущая версия продуктовой идеи. Главные неизвестные ведём в «Гипотезах» и «Рисках».")}
        fresh={freshness("thesis", profile, items)}
        onReviewed={() => ctx.markReviewed("thesis")}
      >
        <div className="mb-4 grid gap-3 md:grid-cols-2">
          <div data-focus="category">
            <Label hint={t("для позиционирования")}>{t("Мы — это…")}</Label>
            <AutoText
              value={profile.thesis.category ?? ""}
              onSave={(v) => ctx.patchThesis({ category: v })}
              placeholder={t("сервис проверки репутации компании")}
              single
            />
          </div>
          <div data-focus="value">
            <Label hint={t("для позиционирования")}>
              {t("Главный результат для клиента")}
            </Label>
            <AutoText
              value={profile.thesis.value ?? ""}
              onSave={(v) => ctx.patchThesis({ value: v })}
              placeholder={t("за 1 день показывает, что мешает клиентам выбрать вас")}
              single
            />
          </div>
        </div>
        <div className="mb-3 flex flex-wrap gap-1">
          {THESIS_TABS.map((x) => (
            <button
              key={x.key}
              onClick={() => setThesisTab(x.key)}
              className={`rounded-[9px] px-3 py-1.5 text-sm font-bold ${thesisTab === x.key ? "bg-[#e7e5dd] text-ink" : "text-muted hover:text-ink"}`}
            >
              {t(x.label)}
              {profile.thesis[x.key]?.trim() ? "" : " ·"}
            </button>
          ))}
        </div>
        <div data-focus={thesis.key}>
          <AutoText
            key={thesis.key}
            value={profile.thesis[thesis.key] ?? ""}
            onSave={(v) => ctx.patchThesis({ [thesis.key]: v })}
            placeholder={t(thesis.ph)}
            rows={4}
          />
        </div>
        {thesis.key === "advantage" && (
          <p className="mt-2 text-xs text-muted">
            {t("Первое предложение попадает в позиционирование как «главное отличие» — начните с самого важного.")}
          </p>
        )}
      </Section>

      {/* ПРОБЛЕМЫ */}
      <Section
        id="problem"
        title={t("Проблемы клиентов")}
        desc={t("Боли, которые мы решаем, и насколько мы в них уверены.")}
        fresh={freshness("problem", profile, items)}
        onReviewed={() => ctx.markReviewed("problem")}
      >
        {problems.length === 0 && (
          <Empty>
            {t("Пока нет проблем. Добавьте первую — с неё начинается позиционирование и гипотезы.")}
          </Empty>
        )}
        <div className="flex flex-col gap-3">
          {problems.map((p) => (
            <ProblemCard key={p.id} p={p} ctx={ctx} icpOptions={icpOptions} />
          ))}
        </div>
        <AddBtn onClick={() => ctx.addItem("problem")}>
          {t("＋ Добавить проблему")}
        </AddBtn>
      </Section>

      {/* ICP */}
      <Section
        id="icp"
        title={t("ICP / целевые аудитории")}
        desc={t("Сегменты клиентов, почему мы в них верим и по каким критериям считаем сегмент подтверждённым.")}
        fresh={freshness("icp", profile, items)}
        onReviewed={() => ctx.markReviewed("icp")}
      >
        {icps.length === 0 && (
          <Empty>{t("Пока нет ICP. Опишите, кому продукт нужен больше всего.")}</Empty>
        )}
        <div className="grid gap-3 md:grid-cols-2">
          {icps.map((i, n) => (
            <IcpCard key={i.id} icp={i} n={n + 1} ctx={ctx} />
          ))}
        </div>
        <AddBtn
          onClick={() =>
            ctx.addItem("icp", {
              criteria: [
                {
                  id: rid(),
                  text: "5+ интервью с этим сегментом",
                  done: false,
                },
                { id: rid(), text: "3+ подтверждения боли", done: false },
                {
                  id: rid(),
                  text: "1+ готовность платить / пилот",
                  done: false,
                },
              ],
            })
          }
        >
          {t("＋ Добавить ICP")}
        </AddBtn>
      </Section>
    </div>
  );
}

const rid = () => Math.random().toString(36).slice(2, 10);

function ProblemCard({
  p,
  ctx,
  icpOptions,
}: {
  p: ProfileItem;
  ctx: ProfileCtx;
  icpOptions: { value: string; label: string }[];
}) {
  const t = useT();
  const st = statusOf("problem", p.status);
  return (
    <div
      data-item={p.id}
      id={`sec-item-${p.id}`}
      className={`rounded-[13px] border p-4 ${st.value === "refuted" ? "border-line opacity-70" : "border-line"}`}
    >
      <div className="flex flex-wrap items-start gap-2 sm:flex-nowrap">
        <div className="order-last w-full sm:order-none sm:w-auto sm:min-w-0 sm:flex-1">
          <AutoText
            value={p.title}
            onSave={(v) => ctx.updateItem(p.id, { title: v })}
            placeholder={t("Сформулируйте проблему клиента")}
            className="font-bold"
            rows={1}
          />
        </div>
        <StatusPick
          value={p.status}
          options={STATUS.problem}
          onChange={(v) => ctx.updateItem(p.id, { status: v })}
        />
        <RemoveBtn onClick={() => ctx.askRemove(p.id)} />
      </div>
      <div className="mt-3">
        <Label hint="Jobs to be Done">{t("Работа клиента")}</Label>
        <div className="grid gap-2 md:grid-cols-3">
          {(
            [
              ["jtbd_when", "Когда…", "открываю карты и вижу 3 новых отзыва"],
              ["jtbd_want", "я хочу…", "быстро ответить каждому"],
              [
                "jtbd_so",
                "чтобы…",
                "новые клиенты видели, что нам не всё равно",
              ],
            ] as const
          ).map(([k, lbl, ph]) => (
            <div key={k} className="flex items-start gap-1.5">
              <span className="mt-2 w-14 shrink-0 text-xs font-bold text-muted">
                {t(lbl)}
              </span>
              <AutoText
                value={p.data[k] ?? ""}
                onSave={(v) => ctx.updateItem(p.id, { data: { [k]: v } })}
                placeholder={t(ph)}
                rows={1}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3 grid gap-3 md:grid-cols-3">
        <div>
          <Label>{t("У кого (ICP)")}</Label>
          <Pick
            value={p.data.icp_id ?? ""}
            placeholder={t("Все ICP")}
            options={icpOptions}
            onChange={(v) =>
              ctx.updateItem(p.id, { data: { icp_id: v || null } })
            }
          />
        </div>
        <div>
          <Label>{t("Почему это важно")}</Label>
          <AutoText
            value={p.data.why ?? ""}
            onSave={(v) => ctx.updateItem(p.id, { data: { why: v } })}
            placeholder={t("Как часто, сколько стоит денег или времени")}
          />
        </div>
        <div>
          <Label>{t("Доказательства")}</Label>
          <AutoText
            value={p.data.evidence ?? ""}
            onSave={(v) => ctx.updateItem(p.id, { data: { evidence: v } })}
            placeholder={t("Интервью, отзывы, цифры, примеры")}
          />
        </div>
      </div>
    </div>
  );
}

type Criterion = { id: string; text: string; done: boolean };

function IcpCard({
  icp,
  n,
  ctx,
}: {
  icp: ProfileItem;
  n: number;
  ctx: ProfileCtx;
}) {
  const t = useT();
  const criteria: Criterion[] = icp.data.criteria ?? [];
  const done = criteria.filter((c) => c.done).length;
  const setCriteria = (next: Criterion[]) =>
    ctx.updateItem(icp.id, { data: { criteria: next } });

  return (
    <div
      data-item={icp.id}
      id={`sec-item-${icp.id}`}
      className="flex flex-col rounded-[13px] border border-line p-4"
    >
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-extrabold tracking-[.08em] text-muted uppercase">
          ICP #{n}
        </span>
        <div className="flex-1" />
        <StatusPick
          value={icp.status}
          options={STATUS.icp}
          onChange={(v) => ctx.updateItem(icp.id, { status: v })}
          size="sm"
        />
        <RemoveBtn onClick={() => ctx.askRemove(icp.id)} />
      </div>
      <div className="mt-2">
        <AutoText
          value={icp.title}
          onSave={(v) => ctx.updateItem(icp.id, { title: v })}
          placeholder={t("Название сегмента, например «Салоны красоты 1–3 точки»")}
          className="font-bold"
          rows={1}
        />
      </div>
      <IcpProblems icp={icp} ctx={ctx} />
      <div className="mt-3">
        <Label>{t("Описание")}</Label>
        <AutoText
          value={icp.data.description ?? ""}
          onSave={(v) => ctx.updateItem(icp.id, { data: { description: v } })}
          placeholder={t("Размер, география, кто принимает решение")}
        />
      </div>
      <div className="mt-3">
        <Label hint={t("конкретный человек и его сценарий")}>{t("Персона")}</Label>
        <AutoText
          value={icp.data.persona ?? ""}
          onSave={(v) => ctx.updateItem(icp.id, { data: { persona: v } })}
          placeholder={t("Например: Анна, 34, владелица салона на 2 точки. Утром смотрит отзывы в Google Maps, вечером сама отвечает клиентам в Instagram. Хочет…, мешает…, решает сейчас так…")}
          rows={4}
        />
      </div>
      <div className="mt-3">
        <Label>{t("Почему думаем, что подходит")}</Label>
        <AutoText
          value={icp.data.why ?? ""}
          onSave={(v) => ctx.updateItem(icp.id, { data: { why: v } })}
          placeholder={t("Видимый спрос, бюджет, частота проблемы")}
        />
      </div>
      <div className="mt-3">
        <Label
          hint={
            criteria.length
              ? t("{k} из {of}", { k: done, of: criteria.length })
              : undefined
          }
        >
          {t("Критерии подтверждения")}
        </Label>
        <div className="flex flex-col gap-1">
          {criteria.map((c) => (
            <div key={c.id} className="group flex items-center gap-2">
              <input
                type="checkbox"
                checked={c.done}
                onChange={(e) =>
                  setCriteria(
                    criteria.map((x) =>
                      x.id === c.id ? { ...x, done: e.target.checked } : x,
                    ),
                  )
                }
                className="h-4 w-4 accent-ok"
              />
              <input
                defaultValue={c.text}
                onBlur={(e) =>
                  e.target.value !== c.text &&
                  setCriteria(
                    criteria.map((x) =>
                      x.id === c.id ? { ...x, text: e.target.value } : x,
                    ),
                  )
                }
                className={`min-w-0 flex-1 rounded-md bg-transparent px-1 py-0.5 text-sm outline-none focus:bg-[#f5f4ef] ${c.done ? "text-muted line-through" : ""}`}
              />
              <button
                onClick={() =>
                  setCriteria(criteria.filter((x) => x.id !== c.id))
                }
                className="px-1 text-[#bbb] opacity-0 group-hover:opacity-100 hover:text-bad"
                title={t("Убрать критерий")}
              >
                ×
              </button>
            </div>
          ))}
          <button
            onClick={() =>
              setCriteria([
                ...criteria,
                { id: rid(), text: "Новый критерий", done: false },
              ])
            }
            className="self-start px-1 text-xs font-bold text-muted hover:text-ink"
          >
            {t("+ критерий")}
          </button>
        </div>
        {criteria.length > 0 &&
          done === criteria.length &&
          icp.status !== "validated" && (
            <button
              onClick={() => ctx.updateItem(icp.id, { status: "validated" })}
              className="mt-2 rounded-[8px] bg-[#e8f5ef] px-2.5 py-1 text-xs font-bold text-[#0b6b4c]"
            >
              {t("Все критерии выполнены — отметить «Подтверждён»")}
            </button>
          )}
      </div>
    </div>
  );
}

/** Проблемы, привязанные к ICP (и общие — без привязки). */
function IcpProblems({ icp, ctx }: { icp: ProfileItem; ctx: ProfileCtx }) {
  const t = useT();
  const all = ctx.byKind("problem").filter((p) => p.status !== "refuted");
  const own = all.filter((p) => p.data.icp_id === icp.id);
  const common = all.filter((p) => !p.data.icp_id);
  const list = [...own, ...common];
  return (
    <div className="mt-3">
      <Label hint={common.length ? t("включая общие для всех ICP") : undefined}>
        {t("Проблемы этого ICP")}
      </Label>
      {list.length === 0 ? (
        <button
          onClick={() => ctx.goTo("foundation", "problem")}
          className="text-sm text-muted underline decoration-dotted underline-offset-2 hover:text-ink"
        >
          {t("Нет проблем — привяжите их в разделе «Проблемы»")}
        </button>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {list.map((p) => {
            const st = statusOf("problem", p.status);
            return (
              <button
                key={p.id}
                onClick={() => ctx.goTo("foundation", `item-${p.id}`)}
                className={`max-w-full truncate rounded-full px-2.5 py-1 text-xs font-bold ${TONE[st.tone].badge}`}
                title={`${p.title || t("Без названия")} · ${t(st.label)}${p.data.icp_id ? "" : ` · ${t("общая")}`}`}
              >
                {p.title || t("Без названия")}
                {!p.data.icp_id && <span className="opacity-60"> · {t("общая")}</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
