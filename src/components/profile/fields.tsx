"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Select, TrashIcon, trashBtnCls } from "../ui";
import { TONE, freshnessLabel, type Freshness, type Tone } from "@/lib/profile";

/** Текстовое поле: изменения сразу уходят в состояние профиля, в базу — по кнопке «Сохранить». */
export function AutoText({
  value,
  onSave,
  placeholder,
  rows = 2,
  className = "",
  single,
}: {
  value: string;
  onSave: (v: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
  single?: boolean;
}) {
  const [v, setV] = useState(value ?? "");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const last = useRef(value ?? "");
  const ref = useRef<HTMLTextAreaElement>(null);

  // внешнее обновление (например, после сохранения) — только если поле не в фокусе
  useEffect(() => {
    if (document.activeElement !== ref.current && value !== last.current) {
      last.current = value ?? "";
      setV(value ?? "");
    }
  }, [value]);

  useEffect(() => {
    const el = ref.current;
    if (!el || single) return;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + 2 + "px";
  }, [v, single]);

  const flush = (val: string) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    if (val !== last.current) {
      last.current = val;
      onSave(val);
    }
  };

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  return (
    <textarea
      ref={ref}
      value={v}
      rows={single ? 1 : rows}
      placeholder={placeholder}
      onChange={(e) => {
        const val = single
          ? e.target.value.replace(/\n/g, " ")
          : e.target.value;
        setV(val);
        flush(val);
      }}
      onBlur={() => flush(v)}
      onKeyDown={(e) => {
        if (single && e.key === "Enter") {
          e.preventDefault();
          e.currentTarget.blur();
        }
      }}
      className={`w-full resize-none rounded-[10px] border border-transparent bg-[#f5f4ef] px-3 py-2 leading-relaxed outline-none transition placeholder:text-[#aaa] hover:border-line focus:border-ink/30 focus:bg-white ${
        single ? "overflow-hidden whitespace-nowrap" : ""
      } ${className}`}
    />
  );
}

export function Label({
  children,
  hint,
}: {
  children: ReactNode;
  hint?: string;
}) {
  return (
    <div className="mb-1.5 flex items-baseline gap-2">
      <span className="text-[11px] font-bold text-muted">{children}</span>
      {hint && <span className="text-[11px] text-[#aaa]">{hint}</span>}
    </div>
  );
}

export function Badge({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-extrabold whitespace-nowrap ${TONE[tone].badge}`}
    >
      {children}
    </span>
  );
}

export function FreshBadge({ f }: { f: Freshness }) {
  const tone: Tone =
    f.kind === "fresh"
      ? "green"
      : f.kind === "review"
        ? "yellow"
        : f.kind === "stale"
          ? "red"
          : "gray";
  return <Badge tone={tone}>{freshnessLabel(f)}</Badge>;
}

/** Выпадающий список статуса с цветной точкой. */
export function StatusPick({
  value,
  options,
  onChange,
  size = "md",
}: {
  value: string;
  options: { value: string; label: string; tone: Tone }[];
  onChange: (v: string) => void;
  size?: "sm" | "md";
}) {
  return (
    <Select
      value={value}
      size={size}
      menuWidth={190}
      onChange={onChange}
      className={
        size === "md"
          ? "!h-[36px] !w-auto min-w-[170px] !rounded-lg !border-0 !bg-[#f5f4ef] text-sm font-bold"
          : ""
      }
      options={options.map((o) => ({
        value: o.value,
        label: (
          <span className="inline-flex items-center gap-2">
            <span
              className={`h-2 w-2 shrink-0 rounded-full ${TONE[o.tone].dot}`}
            />
            {o.label}
          </span>
        ),
      }))}
    />
  );
}

/** Простой выпадающий список (тип, приоритет, связь с ICP и т.п.). */
export function Pick({
  value,
  options,
  onChange,
  placeholder = "—",
}: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <Select
      value={value ?? ""}
      onChange={onChange}
      menuWidth={220}
      className="!h-[36px] !rounded-lg !border-0 !bg-[#f5f4ef] text-sm"
      options={[
        { value: "", label: <span className="text-muted">{placeholder}</span> },
        ...options.map((o) => ({ value: o.value, label: o.label })),
      ]}
    />
  );
}

export function Section({
  id,
  title,
  desc,
  fresh,
  onReviewed,
  action,
  children,
}: {
  id: string;
  title: string;
  desc?: string;
  fresh?: Freshness;
  onReviewed?: () => void;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section
      id={`sec-${id}`}
      className="scroll-mt-24 rounded-[17px] border border-line bg-white"
    >
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#efede6] px-5 py-4">
        <div className="min-w-0">
          <h2 className="text-lg font-extrabold tracking-tight">{title}</h2>
          {desc && <p className="mt-0.5 text-sm text-muted">{desc}</p>}
        </div>
        <div className="flex items-center gap-2">
          {fresh && <FreshBadge f={fresh} />}
          {fresh &&
            (fresh.kind === "review" || fresh.kind === "stale") &&
            onReviewed && (
              <button
                onClick={onReviewed}
                className="rounded-[8px] border border-line px-2 py-1 text-xs font-bold text-muted hover:bg-[#f5f4ef] hover:text-ink"
                title="Проверили — данные актуальны, изменений нет"
              >
                ✓ Актуально
              </button>
            )}
          {action}
        </div>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

export function RemoveBtn({
  onClick,
  title = "Удалить",
}: {
  onClick: () => void;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={trashBtnCls}
      title={title}
      aria-label={title}
    >
      <TrashIcon />
    </button>
  );
}

export function AddBtn({
  onClick,
  children,
}: {
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="mt-3 w-full rounded-[12px] border border-dashed border-[#bdbbb2] p-2.5 text-sm font-bold text-[#666] hover:bg-[#faf9f6]"
    >
      {children}
    </button>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-[12px] bg-[#faf9f6] px-4 py-6 text-center text-sm text-muted">
      {children}
    </div>
  );
}

/** Числовое поле: как AutoText, в базу — по кнопке «Сохранить». */
export function NumField({
  value,
  onSave,
  suffix,
  placeholder = "0",
  disabled,
}: {
  value: number | undefined;
  onSave: (v: number) => void;
  suffix?: string;
  placeholder?: string;
  disabled?: boolean;
}) {
  const [v, setV] = useState(value ? String(value) : "");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const last = useRef(value ?? 0);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (
      document.activeElement !== ref.current &&
      (value ?? 0) !== last.current
    ) {
      last.current = value ?? 0;
      setV(value ? String(value) : "");
    }
  }, [value]);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const flush = (raw: string) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    const num = parseFloat(raw.replace(",", ".").replace(/\s/g, ""));
    const val = Number.isFinite(num) ? num : 0;
    if (val !== last.current) {
      last.current = val;
      onSave(val);
    }
  };

  return (
    <div
      className={`flex h-[36px] items-center rounded-lg border border-transparent bg-[#f5f4ef] px-2.5 transition hover:border-line focus-within:border-ink/30 focus-within:bg-white ${
        disabled ? "opacity-40" : ""
      }`}
    >
      <input
        ref={ref}
        inputMode="decimal"
        disabled={disabled}
        value={v}
        placeholder={placeholder}
        onChange={(e) => {
          const raw = e.target.value.replace(/[^\d.,\s-]/g, "");
          setV(raw);
          flush(raw);
        }}
        onBlur={() => flush(v)}
        className="w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-[#aaa]"
      />
      {suffix && (
        <span className="shrink-0 pl-1 text-xs text-muted">{suffix}</span>
      )}
    </div>
  );
}

/** Переключатель из нескольких вариантов. */
export function Segmented<T extends string | number>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="inline-flex rounded-[10px] bg-[#eceae3] p-0.5">
      {options.map((o) => (
        <button
          key={String(o.value)}
          onClick={() => onChange(o.value)}
          className={`rounded-[8px] px-3 py-1.5 text-sm font-bold whitespace-nowrap transition ${
            o.value === value
              ? "bg-white text-ink shadow-[0_1px_4px_rgba(20,20,10,.08)]"
              : "text-muted hover:text-ink"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
