"use client";

import { useState } from "react";
import {
  buildPositioning,
  type PosPart,
  type PosStatement,
} from "@/lib/profile";
import type { ProfileCtx } from "./ProfileApp";

/** Позиционирование: собирается из ICP, проблем, тезиса и конкурентов. Своих полей нет. */
export default function Positioning({ ctx }: { ctx: ProfileCtx }) {
  const list = buildPositioning(ctx.profile, ctx.items, ctx.projectName);
  return (
    <div>
      <div className="flex flex-wrap items-baseline gap-2">
        <div className="text-[11px] font-extrabold tracking-[.08em] text-muted uppercase">
          Позиционирование
        </div>
        <span className="text-[11px] text-[#aaa]">
          собирается само из ICP, проблем, тезиса и конкурентов · серое —
          нажмите, чтобы заполнить
        </span>
      </div>
      <div className="mt-2 flex flex-col gap-2.5">
        {list.map((s, i) => (
          <StatementCard
            key={s.icp?.id ?? i}
            s={s}
            ctx={ctx}
            multi={list.length > 1}
          />
        ))}
      </div>
    </div>
  );
}

function StatementCard({
  s,
  ctx,
  multi,
}: {
  s: PosStatement;
  ctx: ProfileCtx;
  multi: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const p = (k: string) => (
    <Part part={s.parts.find((x) => x.key === k)!} ctx={ctx} />
  );
  return (
    <div
      className={`rounded-[13px] border px-4 py-3 ${s.complete ? "border-[#bfe3d1] bg-[#f3faf6]" : "border-line bg-[#faf9f6]"}`}
    >
      <div className="mb-1 flex items-center gap-2">
        {multi && s.icp && (
          <span className="min-w-0 truncate text-xs font-bold text-muted">
            для «{s.icp.title || "ICP без названия"}»
          </span>
        )}
        <div className="flex-1" />
        {s.complete && (
          <button
            onClick={async () => {
              await navigator.clipboard.writeText(s.text);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
            className="shrink-0 text-xs font-bold text-[#0b6b4c] hover:underline"
          >
            {copied ? "Скопировано ✓" : "Скопировать"}
          </button>
        )}
      </div>
      <p className="leading-relaxed text-[#35342f]">
        Для {p("icp")}, у которых {p("problem")}, {ctx.projectName} —{" "}
        {p("category")}: {p("value")}. В отличие от {p("alternatives")}, мы{" "}
        {p("difference")}.
      </p>
    </div>
  );
}

function Part({ part, ctx }: { part: PosPart; ctx: ProfileCtx }) {
  if (part.text) return <b className="font-bold">{part.text}</b>;
  return (
    <button
      onClick={() => ctx.goTo(part.target.tab, part.target.sec)}
      className="rounded bg-[#ecebe5] px-1 text-[#8f8d85] underline decoration-dotted underline-offset-2 hover:bg-[#e2e0d8] hover:text-ink"
      title="Перейти и заполнить"
    >
      {part.placeholder}
    </button>
  );
}
