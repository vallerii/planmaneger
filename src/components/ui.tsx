"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type ButtonHTMLAttributes,
} from "react";
import { createPortal } from "react-dom";

export function Btn({
  variant = "default",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "primary" | "ghost" | "danger";
}) {
  const base =
    "inline-flex items-center justify-center gap-1.5 rounded-[11px] px-3 py-2 font-bold transition hover:-translate-y-px hover:shadow-soft disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap";
  const styles = {
    default: "border border-line bg-white text-ink",
    primary: "border border-ink bg-ink text-white",
    ghost:
      "text-muted hover:bg-white hover:text-ink hover:shadow-none hover:translate-y-0",
    danger: "border border-line bg-white text-bad",
  }[variant];
  return <button className={`${base} ${styles} ${className}`} {...props} />;
}

export function Modal({
  open,
  onClose,
  title,
  children,
  width = 520,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  width?: number;
}) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 p-5"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full rounded-[18px] bg-white p-5 shadow-2xl"
        style={{ maxWidth: width }}
      >
        <h2 className="mb-4 text-[21px] font-bold">{title}</h2>
        {children}
      </div>
    </div>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="my-3 block">
      <span className="mb-1.5 block text-xs font-bold text-muted">{label}</span>
      {children}
    </label>
  );
}

export const inputCls =
  "w-full rounded-[10px] border border-line bg-[#fafafa] px-2.5 py-2.5 outline-none focus:border-ink/40 focus:bg-white";

export function Toast({ text }: { text: string | null }) {
  return (
    <div
      className={`pointer-events-none fixed right-5 bottom-5 z-[80] rounded-[11px] bg-ink px-4 py-2.5 text-white transition ${
        text ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
      }`}
    >
      {text}
    </div>
  );
}

export function Brand() {
  return (
    <div className="flex items-center text-lg font-extrabold tracking-tight">
      <i className="mr-2 inline-block h-2.5 w-2.5 rotate-12 rounded-[3px] bg-accent" />
      Planmaneger
    </div>
  );
}

// ---------------------------------------------------------------
// Select — красивый выпадающий список (вместо нативного <select>)
// ---------------------------------------------------------------
export type SelectOption<T extends string> = {
  value: T;
  label: ReactNode;
  hint?: ReactNode;
};

export function Select<T extends string>({
  value,
  options,
  onChange,
  size = "md",
  className = "",
  menuWidth,
  ariaLabel,
}: {
  value: T;
  options: SelectOption<T>[];
  onChange: (v: T) => void;
  size?: "sm" | "md";
  className?: string;
  menuWidth?: number;
  ariaLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [pos, setPos] = useState<{
    top: number;
    left: number;
    width: number;
    up: boolean;
  } | null>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const id = useId();
  const current = options.find((o) => o.value === value);

  const place = useCallback(() => {
    const r = btn.current?.getBoundingClientRect();
    if (!r) return;
    const w = Math.max(r.width, menuWidth ?? 0);
    const estH = Math.min(options.length * 40 + 12, 320);
    const up = r.bottom + estH + 8 > window.innerHeight && r.top > estH + 8;
    const left = Math.min(Math.max(8, r.left), window.innerWidth - w - 8);
    setPos({ top: up ? r.top - 6 : r.bottom + 6, left, width: w, up });
  }, [menuWidth, options.length]);

  function openMenu() {
    place();
    setActive(
      Math.max(
        0,
        options.findIndex((o) => o.value === value),
      ),
    );
    setOpen(true);
  }

  useLayoutEffect(() => {
    if (!open) return;
    const close = (e: Event) => {
      const t = e.target as Node;
      if (menu.current?.contains(t) || btn.current?.contains(t)) return;
      setOpen(false);
    };
    const reflow = () => setOpen(false);
    document.addEventListener("pointerdown", close, true);
    window.addEventListener("resize", reflow);
    window.addEventListener("scroll", reflow, true);
    return () => {
      document.removeEventListener("pointerdown", close, true);
      window.removeEventListener("resize", reflow);
      window.removeEventListener("scroll", reflow, true);
    };
  }, [open]);

  function pick(i: number) {
    const o = options[i];
    if (o) onChange(o.value);
    setOpen(false);
    btn.current?.focus();
  }

  function onKey(e: React.KeyboardEvent) {
    e.stopPropagation();
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        openMenu();
      }
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(options.length - 1, a + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      pick(active);
    } else if (e.key === "Tab") {
      setOpen(false);
    }
  }

  const stop = (e: React.SyntheticEvent) => e.stopPropagation();
  const trigger =
    size === "sm"
      ? "h-[26px] gap-1 rounded-[7px] bg-[#eeece5] pl-2 pr-1.5 text-[11px] font-black hover:bg-[#e5e2d8]"
      : "h-[42px] w-full gap-2 rounded-[10px] border border-line bg-[#fafafa] px-3 text-left hover:border-[#c9c6bb] focus-visible:border-ink/40";

  return (
    <>
      <button
        ref={btn}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        aria-label={ariaLabel}
        onPointerDown={stop}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (open) setOpen(false);
          else openMenu();
        }}
        onKeyDown={onKey}
        className={`inline-flex items-center justify-between outline-none transition ${trigger} ${
          open
            ? size === "sm"
              ? "bg-[#e5e2d8]"
              : "border-ink/40 bg-white"
            : ""
        } ${className}`}
      >
        <span className="min-w-0 truncate">{current?.label ?? "—"}</span>
        <svg
          width={size === "sm" ? 10 : 12}
          height={size === "sm" ? 10 : 12}
          viewBox="0 0 12 12"
          className={`shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
        >
          <path
            d="M2.5 4.5 6 8l3.5-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {open &&
        pos &&
        createPortal(
          <div
            ref={menu}
            id={id}
            role="listbox"
            onPointerDown={stop}
            onClick={stop}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className="fixed z-[100] max-h-[320px] overflow-auto rounded-xl border border-line bg-white p-1.5 shadow-[0_18px_50px_rgba(20,20,10,.16)] animate-[menuIn_.12s_ease-out]"
            style={{
              left: pos.left,
              width: pos.width,
              top: pos.up ? undefined : pos.top,
              bottom: pos.up ? window.innerHeight - pos.top : undefined,
            }}
          >
            {options.map((o, i) => {
              const selected = o.value === value;
              return (
                <div
                  key={o.value}
                  role="option"
                  aria-selected={selected}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => pick(i)}
                  className={`flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm ${
                    i === active ? "bg-[#f3f2ed]" : ""
                  } ${selected ? "font-extrabold" : "font-semibold"}`}
                >
                  <span className="min-w-0 flex-1 truncate">{o.label}</span>
                  {o.hint && (
                    <span className="shrink-0 text-xs font-semibold text-muted">
                      {o.hint}
                    </span>
                  )}
                  <span
                    className={`w-3.5 shrink-0 text-ok ${selected ? "" : "invisible"}`}
                  >
                    ✓
                  </span>
                </div>
              );
            })}
          </div>,
          document.body,
        )}
    </>
  );
}

// ---------------------------------------------------------------
// Stepper — число с кнопками − / +
// ---------------------------------------------------------------
export function Stepper({
  value,
  onChange,
  min = 1,
  max = 20,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  const clamp = (n: number) =>
    Math.max(min, Math.min(max, Math.round(n) || min));
  const b =
    "grid h-[42px] w-[42px] shrink-0 place-items-center text-lg font-bold text-ink transition hover:bg-[#f0efe9] disabled:opacity-30 disabled:hover:bg-transparent";
  return (
    <div className="inline-flex shrink-0 items-stretch overflow-hidden rounded-[10px] border border-line bg-[#fafafa] focus-within:border-ink/40 focus-within:bg-white">
      <button
        type="button"
        className={b}
        disabled={value <= min}
        onClick={() => onChange(clamp(value - 1))}
        aria-label="Меньше"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
          <path
            d="M3 7h8"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>
      <input
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(clamp(Number(e.target.value)))}
        className="w-14 min-w-0 border-x border-line bg-transparent text-center font-extrabold outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <button
        type="button"
        className={b}
        disabled={value >= max}
        onClick={() => onChange(clamp(value + 1))}
        aria-label="Больше"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
          <path
            d="M3 7h8M7 3v8"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
}
