"use client";

import {
  SECTIONS,
  freshness,
  positioningStatement,
  PROSPECT_RESEARCHED,
  PROSPECT_TARGET,
  readiness,
  statusOf,
  type ProfileItem,
} from "@/lib/profile";
import { dateRu, parseDate, todayISO } from "@/lib/schedule";
import type { ProfileCtx } from "./ProfileApp";
import { Badge, FreshBadge } from "./fields";

export default function Overview({ ctx }: { ctx: ProfileCtx }) {
  const { profile, items } = ctx;
  const score = readiness(profile, items);
  const icps = ctx.byKind("icp");
  const icpOk = icps.filter((i) => i.status === "validated").length;
  const hyps = ctx.byKind("hypothesis");
  const hypOpen = hyps.filter(
    (h) => h.status === "todo" || h.status === "testing",
  );
  const hypClosed = hyps.length - hypOpen.length;
  const prospects = ctx.byKind("prospect");
  const researched = prospects.filter((p) =>
    PROSPECT_RESEARCHED.includes(p.status),
  ).length;

  const sections = SECTIONS.map((s) => ({
    ...s,
    f: freshness(s.id, profile, items),
  }));
  const attention = sections
    .filter((s) => s.f.kind !== "fresh")
    .sort((a, b) => rank(b.f.kind) - rank(a.f.kind) || b.f.days - a.f.days);

  const today = todayISO();
  const deadlines = hypOpen
    .filter((h) => h.data.deadline)
    .sort((a, b) =>
      String(a.data.deadline).localeCompare(String(b.data.deadline)),
    )
    .slice(0, 6);

  const review = profile.next_review;
  const reviewDue = review && review <= today;

  return (
    <div className="flex flex-col gap-5">
      {/* метрики */}
      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-5">
        <Metric
          label="Готовность Discovery"
          value={`${score}%`}
          hint="Насколько уменьшилась неопределённость"
        >
          <div className="mt-2 h-[5px] overflow-hidden rounded-full bg-[#eceae3]">
            <span
              className="block h-full rounded-full bg-ok"
              style={{ width: `${score}%` }}
            />
          </div>
        </Metric>
        <Metric
          label="ICP подтверждено"
          value={`${icpOk} / ${icps.length}`}
          hint="целевых сегментов"
        />
        <Metric
          label="Гипотезы"
          value={`${hypClosed} / ${hyps.length}`}
          hint={`проверено · ${hypOpen.length} в работе`}
        />
        <Metric
          label="Клиентов исследовано"
          value={`${researched} / ${PROSPECT_TARGET}`}
          hint="на вкладке «Рынок»"
        />
        <Metric
          label="Требуют внимания"
          value={String(
            attention.filter(
              (a) => a.f.kind === "stale" || a.f.kind === "empty",
            ).length,
          )}
          hint="пустые или старше 14 дней"
        />
      </div>

      {/* миссия + позиционирование */}
      <div className="rounded-[17px] border border-line bg-white p-5">
        <div className="text-[11px] font-extrabold tracking-[.08em] text-muted uppercase">
          Миссия
        </div>
        {profile.mission.trim() ? (
          <p className="mt-1 text-lg leading-snug font-bold">
            {profile.mission}
          </p>
        ) : (
          <button
            onClick={() => ctx.goTo("foundation", "mission")}
            className="mt-1 text-sm font-bold text-accent hover:underline"
          >
            + Сформулировать миссию
          </button>
        )}
        <div className="mt-4 text-[11px] font-extrabold tracking-[.08em] text-muted uppercase">
          Позиционирование
        </div>
        <p className="mt-1 leading-relaxed text-[#45443e]">
          <Statement
            text={positioningStatement(
              profile.positioning,
              items,
              ctx.projectName,
            )}
          />
        </p>
        <button
          onClick={() => ctx.goTo("foundation", "positioning")}
          className="mt-2 text-xs font-bold text-muted hover:text-ink"
        >
          Изменить →
        </button>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* что требует внимания */}
        <div className="rounded-[17px] border border-line bg-white">
          <div className="border-b border-[#efede6] px-5 py-4">
            <h2 className="text-lg font-extrabold tracking-tight">
              Что требует внимания
            </h2>
            <p className="text-sm text-muted">
              Пустые разделы и то, что давно не обновлялось.
            </p>
          </div>
          <div className="p-2">
            {attention.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-muted">
                Все разделы заполнены и свежие 👌
              </p>
            ) : (
              attention.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-[#faf9f6]"
                >
                  <button
                    onClick={() => ctx.goTo(s.tab, s.id)}
                    className="min-w-0 flex-1 truncate text-left text-sm font-bold hover:underline"
                  >
                    {s.label}
                  </button>
                  <FreshBadge f={s.f} />
                  {(s.f.kind === "review" || s.f.kind === "stale") && (
                    <button
                      onClick={() => ctx.markReviewed(s.id)}
                      className="rounded-[7px] px-1.5 py-0.5 text-xs font-bold text-muted hover:bg-white hover:text-ok"
                      title="Проверили — актуально"
                    >
                      ✓
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex flex-col gap-5">
          {/* review */}
          <div
            className={`rounded-[17px] border bg-white p-5 ${reviewDue ? "border-[#edd48e]" : "border-line"}`}
          >
            <h2 className="text-lg font-extrabold tracking-tight">
              Следующий review
            </h2>
            <p className="text-sm text-muted">
              Раз в 2 недели проходим по разделам: обновляем или отмечаем
              «актуально».
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <input
                type="date"
                value={review ?? ""}
                onChange={(e) =>
                  ctx.saveProfile({ next_review: e.target.value || null })
                }
                className="rounded-[10px] border border-line bg-[#fafafa] px-2.5 py-2 text-sm outline-none focus:border-ink/40"
              />
              <button
                onClick={() => ctx.saveProfile({ next_review: plusDays(14) })}
                className="rounded-[10px] border border-line px-3 py-2 text-sm font-bold hover:bg-[#f5f4ef]"
              >
                +14 дней от сегодня
              </button>
              {reviewDue && <Badge tone="yellow">пора провести review</Badge>}
            </div>
          </div>

          {/* дедлайны гипотез */}
          <div className="rounded-[17px] border border-line bg-white">
            <div className="border-b border-[#efede6] px-5 py-4">
              <h2 className="text-lg font-extrabold tracking-tight">
                Ближайшие дедлайны гипотез
              </h2>
            </div>
            <div className="p-2">
              {deadlines.length === 0 ? (
                <p className="px-3 py-6 text-center text-sm text-muted">
                  Нет открытых гипотез с дедлайном.
                </p>
              ) : (
                deadlines.map((h: ProfileItem) => {
                  const overdue = h.data.deadline < today;
                  const st = statusOf("hypothesis", h.status);
                  return (
                    <button
                      key={h.id}
                      onClick={() => ctx.goTo("hypotheses", `item-${h.id}`)}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left hover:bg-[#faf9f6]"
                    >
                      <span className="min-w-0 flex-1 truncate text-sm">
                        {h.title || "Без формулировки"}
                      </span>
                      <Badge tone={st.tone}>{st.label}</Badge>
                      <span
                        className={`w-16 shrink-0 text-right text-xs font-bold ${overdue ? "text-bad" : "text-muted"}`}
                      >
                        {dateRu(parseDate(h.data.deadline)).replace(
                          / \d{4}$/,
                          "",
                        )}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function rank(k: string) {
  return k === "empty" ? 3 : k === "stale" ? 2 : k === "review" ? 1 : 0;
}

function plusDays(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
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

/** Подсвечивает незаполненные [части] фразы позиционирования. */
export function Statement({ text }: { text: string }) {
  const parts = text.split(/(\[[^\]]+\])/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("[") ? (
          <span key={i} className="rounded bg-[#f3f2ed] px-1 text-[#9a988f]">
            {p.slice(1, -1)}
          </span>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
}
