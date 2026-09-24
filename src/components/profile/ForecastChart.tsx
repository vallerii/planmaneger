"use client";

import { useEffect, useRef, useState } from "react";
import { money, type Currency, type ForecastRow } from "@/lib/economics";

const SERIES = [
  { key: "revenue", label: "Выручка", color: "#2f6fd6", dash: "" },
  { key: "total", label: "Расходы всего", color: "#d9822b", dash: "6 4" },
  { key: "profit", label: "Прибыль", color: "#0f8a5f", dash: "" },
] as const;

const H = 260;
const PAD = { top: 16, right: 16, bottom: 28, left: 64 };

/** Линейный график: выручка, расходы и прибыль по месяцам. */
export default function ForecastChart({
  rows,
  currency,
}: {
  rows: ForecastRow[];
  currency: Currency;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(800);
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) =>
      setW(Math.max(280, e.contentRect.width)),
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  if (!rows.length) return null;
  const vals = rows.flatMap((r) => [r.revenue, r.total, r.profit]);
  const hasData = vals.some((v) => v !== 0);
  let min = Math.min(0, ...vals);
  let max = Math.max(0, ...vals);
  if (min === max) max = min + 1;
  const pad = (max - min) * 0.06;
  min = min < 0 ? min - pad : 0;
  max += pad;

  const iw = w - PAD.left - PAD.right;
  const ih = H - PAD.top - PAD.bottom;
  const x = (i: number) =>
    PAD.left + (rows.length === 1 ? iw / 2 : (i / (rows.length - 1)) * iw);
  const y = (v: number) => PAD.top + ((max - v) / (max - min)) * ih;
  const ticks = niceTicks(min, max, 4);
  const short = (v: number) => compact(v, currency);
  const labelEvery = rows.length > 24 ? 6 : 3;

  const path = (k: (typeof SERIES)[number]["key"]) =>
    rows
      .map((r, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(r[k]).toFixed(1)}`)
      .join(" ");

  const onMove = (ev: React.PointerEvent<SVGRectElement>) => {
    const rect = ev.currentTarget.getBoundingClientRect();
    const px = ev.clientX - rect.left;
    const i = Math.round((px / rect.width) * (rows.length - 1));
    setHover(Math.max(0, Math.min(rows.length - 1, i)));
  };

  const hr = hover !== null ? rows[hover] : null;
  const last = rows[rows.length - 1];

  return (
    <div>
      <div className="mb-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
        {SERIES.map((s) => (
          <span key={s.key} className="inline-flex items-center gap-1.5">
            <svg width="18" height="8" aria-hidden>
              <line
                x1="0"
                y1="4"
                x2="18"
                y2="4"
                stroke={s.color}
                strokeWidth="2"
                strokeDasharray={s.dash}
              />
            </svg>
            {s.label}
          </span>
        ))}
      </div>
      <div ref={wrap} className="relative">
        <svg
          width={w}
          height={H}
          role="img"
          aria-label="Прогноз: выручка, расходы и прибыль по месяцам"
          className="block"
        >
          {ticks.map((t) => (
            <g key={t}>
              <line
                x1={PAD.left}
                x2={w - PAD.right}
                y1={y(t)}
                y2={y(t)}
                stroke={t === 0 ? "#bdbbb2" : "#efede6"}
                strokeWidth={1}
              />
              <text
                x={PAD.left - 8}
                y={y(t) + 4}
                textAnchor="end"
                className="fill-[#8f8d85] text-[11px] tabular-nums"
              >
                {short(t)}
              </text>
            </g>
          ))}
          {rows.map((r, i) =>
            r.m === 1 || r.m % labelEvery === 0 ? (
              <text
                key={r.m}
                x={x(i)}
                y={H - 8}
                textAnchor="middle"
                className="fill-[#8f8d85] text-[11px]"
              >
                M{r.m}
              </text>
            ) : null,
          )}
          {hasData &&
            SERIES.map((s) => (
              <path
                key={s.key}
                d={path(s.key)}
                fill="none"
                stroke={s.color}
                strokeWidth={2}
                strokeDasharray={s.dash}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            ))}
          {/* подписи на конце линий */}
          {hasData &&
            w > 520 &&
            SERIES.map((s) => (
              <circle
                key={s.key}
                cx={x(rows.length - 1)}
                cy={y(last[s.key])}
                r={4}
                fill={s.color}
                stroke="#fff"
                strokeWidth={2}
              />
            ))}
          {hr && hover !== null && (
            <g pointerEvents="none">
              <line
                x1={x(hover)}
                x2={x(hover)}
                y1={PAD.top}
                y2={PAD.top + ih}
                stroke="#8f8d85"
                strokeDasharray="3 3"
              />
              {SERIES.map((s) => (
                <circle
                  key={s.key}
                  cx={x(hover)}
                  cy={y(hr[s.key])}
                  r={4.5}
                  fill={s.color}
                  stroke="#fff"
                  strokeWidth={2}
                />
              ))}
            </g>
          )}
          <rect
            x={PAD.left}
            y={PAD.top}
            width={iw}
            height={ih}
            fill="transparent"
            onPointerMove={onMove}
            onPointerLeave={() => setHover(null)}
          />
        </svg>
        {!hasData && (
          <div className="absolute inset-0 grid place-items-center text-sm text-muted">
            Нет данных для графика
          </div>
        )}
        {hr && hover !== null && (
          <div
            className="pointer-events-none absolute top-2 z-10 w-[190px] rounded-[10px] border border-line bg-white px-3 py-2 text-xs shadow-[0_6px_20px_rgba(20,20,10,.12)]"
            style={{ left: Math.min(Math.max(x(hover) + 12, 0), w - 200) }}
          >
            <div className="mb-1 font-extrabold">Месяц {hr.m}</div>
            {SERIES.map((s) => (
              <div key={s.key} className="flex items-center gap-1.5">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: s.color }}
                />
                <span className="text-muted">{s.label}</span>
                <span className="ml-auto font-bold tabular-nums">
                  {money(hr[s.key], currency)}
                </span>
              </div>
            ))}
            <div className="mt-1 flex border-t border-[#efede6] pt-1">
              <span className="text-muted">Накоплено</span>
              <span
                className={`ml-auto font-bold tabular-nums ${hr.cumulative < 0 ? "text-bad" : ""}`}
              >
                {money(hr.cumulative, currency)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function niceTicks(min: number, max: number, count: number) {
  const span = max - min;
  const raw = span / count;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const step =
    [1, 2, 2.5, 5, 10].map((k) => k * mag).find((s) => span / s <= count + 1) ??
    raw;
  const out: number[] = [];
  for (let v = Math.ceil(min / step) * step; v <= max + 1e-9; v += step)
    out.push(Math.abs(v) < 1e-9 ? 0 : v);
  return out;
}

function compact(v: number, currency: Currency) {
  const sym = currency === "EUR" ? "€" : currency === "USD" ? "$" : "₽";
  const a = Math.abs(v);
  const s =
    a >= 1e6
      ? `${+(v / 1e6).toFixed(1)} млн`
      : a >= 1e3
        ? `${+(v / 1e3).toFixed(a >= 1e4 ? 0 : 1)} тыс`
        : `${Math.round(v)}`;
  return `${s} ${sym}`;
}
