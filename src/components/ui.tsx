"use client";

import { useEffect, type ReactNode, type ButtonHTMLAttributes } from "react";

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
