"use client";

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
  const { profile, items } = ctx;
  const [thesisTab, setThesisTab] =
    useState<(typeof THESIS_TABS)[number]["key"]>("main");
  const icps = ctx.byKind("icp");
  const problems = ctx.byKind("problem");
  const icpOptions = icps.map((i) => ({
    value: i.id,
    label: i.title || "ICP без названия",
  }));
  const thesis = THESIS_TABS.find((t) => t.key === thesisTab)!;

  // переход из позиционирования: «thesis:advantage», «thesis:category», …
  const { focus, setFocus } = ctx;
  useEffect(() => {
    if (!focus?.startsWith("thesis:")) return;
    const key = focus.slice(7);
    const t = setTimeout(() => {
      if (key === "advantage") setThesisTab("advantage");
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
      {/* МИССИЯ */}
      <Section
        id="mission"
        title="Миссия"
        desc="Зачем существует продукт и что он меняет для клиентов в долгую. Одна-две фразы, меняется редко."
        fresh={freshness("mission", profile, items)}
        onReviewed={() => ctx.markReviewed("mission")}
      >
        <AutoText
          value={profile.mission}
          onSave={(v) => ctx.saveProfile({ mission: v }, "mission")}
          placeholder="Например: помогаем локальному бизнесу видеть и управлять тем, как их находят и оценивают в интернете."
          className="text-lg font-bold"
        />
        <p className="mt-2 text-xs text-muted">
          Миссия показывается вверху доски задач — чтобы команда не теряла
          фокус.
        </p>
      </Section>

      {/* ТЕЗИС */}
      <Section
        id="thesis"
        title="Тезис продукта"
        desc="Текущая версия продуктовой идеи. Главные неизвестные ведём в «Гипотезах» и «Рисках»."
        fresh={freshness("thesis", profile, items)}
        onReviewed={() => ctx.markReviewed("thesis")}
      >
        <div className="mb-4 grid gap-3 md:grid-cols-2">
          <div data-focus="category">
            <Label hint="для позиционирования">Мы — это…</Label>
            <AutoText
              value={profile.thesis.category ?? ""}
              onSave={(v) => ctx.patchThesis({ category: v })}
              placeholder="сервис проверки репутации компании"
              single
            />
          </div>
          <div data-focus="value">
            <Label hint="для позиционирования">
              Главный результат для клиента
            </Label>
            <AutoText
              value={profile.thesis.value ?? ""}
              onSave={(v) => ctx.patchThesis({ value: v })}
              placeholder="за 1 день показывает, что мешает клиентам выбрать вас"
              single
            />
          </div>
        </div>
        <div className="mb-3 flex flex-wrap gap-1">
          {THESIS_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setThesisTab(t.key)}
              className={`rounded-[9px] px-3 py-1.5 text-sm font-bold ${thesisTab === t.key ? "bg-[#e7e5dd] text-ink" : "text-muted hover:text-ink"}`}
            >
              {t.label}
              {profile.thesis[t.key]?.trim() ? "" : " ·"}
            </button>
          ))}
        </div>
        <div data-focus={thesis.key}>
          <AutoText
            key={thesis.key}
            value={profile.thesis[thesis.key] ?? ""}
            onSave={(v) => ctx.patchThesis({ [thesis.key]: v })}
            placeholder={thesis.ph}
            rows={4}
          />
        </div>
        {thesis.key === "advantage" && (
          <p className="mt-2 text-xs text-muted">
            Первое предложение попадает в позиционирование как «главное отличие»
            — начните с самого важного.
          </p>
        )}
      </Section>

      {/* ПРОБЛЕМЫ */}
      <Section
        id="problem"
        title="Проблемы клиентов"
        desc="Боли, которые мы решаем, и насколько мы в них уверены."
        fresh={freshness("problem", profile, items)}
        onReviewed={() => ctx.markReviewed("problem")}
      >
        {problems.length === 0 && (
          <Empty>
            Пока нет проблем. Добавьте первую — с неё начинается
            позиционирование и гипотезы.
          </Empty>
        )}
        <div className="flex flex-col gap-3">
          {problems.map((p) => (
            <ProblemCard key={p.id} p={p} ctx={ctx} icpOptions={icpOptions} />
          ))}
        </div>
        <AddBtn onClick={() => ctx.addItem("problem")}>
          ＋ Добавить проблему
        </AddBtn>
      </Section>

      {/* ICP */}
      <Section
        id="icp"
        title="ICP / целевые аудитории"
        desc="Сегменты клиентов, почему мы в них верим и по каким критериям считаем сегмент подтверждённым."
        fresh={freshness("icp", profile, items)}
        onReviewed={() => ctx.markReviewed("icp")}
      >
        {icps.length === 0 && (
          <Empty>Пока нет ICP. Опишите, кому продукт нужен больше всего.</Empty>
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
          ＋ Добавить ICP
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
            placeholder="Сформулируйте проблему клиента"
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
      <div className="mt-3 grid gap-3 md:grid-cols-3">
        <div>
          <Label>У кого (ICP)</Label>
          <Pick
            value={p.data.icp_id ?? ""}
            placeholder="Все ICP"
            options={icpOptions}
            onChange={(v) =>
              ctx.updateItem(p.id, { data: { icp_id: v || null } })
            }
          />
        </div>
        <div>
          <Label>Почему это важно</Label>
          <AutoText
            value={p.data.why ?? ""}
            onSave={(v) => ctx.updateItem(p.id, { data: { why: v } })}
            placeholder="Как часто, сколько стоит денег или времени"
          />
        </div>
        <div>
          <Label>Доказательства</Label>
          <AutoText
            value={p.data.evidence ?? ""}
            onSave={(v) => ctx.updateItem(p.id, { data: { evidence: v } })}
            placeholder="Интервью, отзывы, цифры, примеры"
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
          placeholder="Название сегмента, например «Салоны красоты 1–3 точки»"
          className="font-bold"
          rows={1}
        />
      </div>
      <IcpProblems icp={icp} ctx={ctx} />
      <div className="mt-3">
        <Label>Описание</Label>
        <AutoText
          value={icp.data.description ?? ""}
          onSave={(v) => ctx.updateItem(icp.id, { data: { description: v } })}
          placeholder="Размер, география, кто принимает решение"
        />
      </div>
      <div className="mt-3">
        <Label>Почему думаем, что подходит</Label>
        <AutoText
          value={icp.data.why ?? ""}
          onSave={(v) => ctx.updateItem(icp.id, { data: { why: v } })}
          placeholder="Видимый спрос, бюджет, частота проблемы"
        />
      </div>
      <div className="mt-3">
        <Label
          hint={criteria.length ? `${done} из ${criteria.length}` : undefined}
        >
          Критерии подтверждения
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
                title="Убрать критерий"
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
            + критерий
          </button>
        </div>
        {criteria.length > 0 &&
          done === criteria.length &&
          icp.status !== "validated" && (
            <button
              onClick={() => ctx.updateItem(icp.id, { status: "validated" })}
              className="mt-2 rounded-[8px] bg-[#e8f5ef] px-2.5 py-1 text-xs font-bold text-[#0b6b4c]"
            >
              Все критерии выполнены — отметить «Подтверждён»
            </button>
          )}
      </div>
    </div>
  );
}

/** Проблемы, привязанные к ICP (и общие — без привязки). */
function IcpProblems({ icp, ctx }: { icp: ProfileItem; ctx: ProfileCtx }) {
  const all = ctx.byKind("problem").filter((p) => p.status !== "refuted");
  const own = all.filter((p) => p.data.icp_id === icp.id);
  const common = all.filter((p) => !p.data.icp_id);
  const list = [...own, ...common];
  return (
    <div className="mt-3">
      <Label hint={common.length ? "включая общие для всех ICP" : undefined}>
        Проблемы этого ICP
      </Label>
      {list.length === 0 ? (
        <button
          onClick={() => ctx.goTo("foundation", "problem")}
          className="text-sm text-muted underline decoration-dotted underline-offset-2 hover:text-ink"
        >
          Нет проблем — привяжите их в разделе «Проблемы»
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
                title={`${p.title || "Без названия"} · ${st.label}${p.data.icp_id ? "" : " · общая"}`}
              >
                {p.title || "Без названия"}
                {!p.data.icp_id && <span className="opacity-60"> · общая</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
