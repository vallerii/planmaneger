"use client";

import { useI18n } from "@/i18n/client";
import { useEffect, useMemo, useRef, useState } from "react";
import type { UnreadComment } from "@/lib/unread";
import { plainFromHtml } from "@/lib/schedule";

/** Колокольчик в шапке доски: непрочитанные мной комментарии проекта. */
export default function CommentsBell({
  list,
  onOpenTask,
  onReadAll,
}: {
  list: UnreadComment[];
  onOpenTask: (taskId: string) => void;
  onReadAll: () => void;
}) {
  const { t, locale } = useI18n();
  const time = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }),
    [locale],
  );
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; right: number } | null>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const count = list.length;

  function toggle() {
    if (!open && btn.current) {
      const r = btn.current.getBoundingClientRect();
      setPos({
        top: r.bottom + 8,
        right: Math.max(8, window.innerWidth - r.right),
      });
    }
    setOpen((o) => !o);
  }

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!panel.current?.contains(t) && !btn.current?.contains(t))
        setOpen(false);
    };
    const k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", h);
    window.addEventListener("keydown", k);
    window.addEventListener("resize", () => setOpen(false), { once: true });
    return () => {
      document.removeEventListener("mousedown", h);
      window.removeEventListener("keydown", k);
    };
  }, [open]);

  return (
    <>
      <button
        ref={btn}
        onClick={toggle}
        title={count ? t("Новых комментариев: {n}", { n: count }) : t("Новых комментариев нет")}
        aria-label={
          count ? t("Новых комментариев: {n}", { n: count }) : t("Новых комментариев нет")
        }
        className={`relative inline-flex shrink-0 items-center justify-center rounded-[11px] border px-3 py-2 font-bold transition hover:-translate-y-px hover:shadow-soft ${
          count
            ? "border-[#f3b7ab] bg-[#fff0ed] text-bad"
            : "border-line bg-white text-ink"
        }`}
      >
        <BellIcon />
        {count > 0 && (
          <span className="ml-1.5 min-w-[18px] rounded-full bg-bad px-1.5 text-center text-[11px] leading-[18px] font-black text-white">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </button>

      {open && pos && (
        <div
          ref={panel}
          style={{ top: pos.top, right: pos.right }}
          className="fixed z-50 w-[360px] max-w-[calc(100vw-16px)] overflow-hidden rounded-[14px] border border-line bg-white shadow-[0_12px_40px_rgba(20,20,10,.16)]"
        >
          <div className="flex items-center gap-2 border-b border-[#efede6] px-4 py-3">
            <b className="text-sm">{t("Новые комментарии")}</b>
            {count > 0 && (
              <button
                onClick={() => {
                  onReadAll();
                  setOpen(false);
                }}
                className="ml-auto text-xs font-bold text-muted hover:text-ink"
              >
                {t("Отметить всё прочитанным")}
              </button>
            )}
          </div>
          {count === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-muted">
              {t("Всё прочитано.")}
            </p>
          ) : (
            <ul className="max-h-[60vh] overflow-y-auto">
              {list.map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => {
                      onOpenTask(c.task_id);
                      setOpen(false);
                    }}
                    className="block w-full border-b border-[#f3f1eb] px-4 py-2.5 text-left hover:bg-[#faf9f6]"
                  >
                    <div className="flex items-baseline gap-2">
                      <span className="h-2 w-2 shrink-0 translate-y-[-1px] rounded-full bg-bad" />
                      <span className="min-w-0 flex-1 truncate text-sm font-bold">
                        {c.task_name ? t(c.task_name) : t("Без названия")}
                      </span>
                      <time className="shrink-0 text-[10px] text-muted">
                        {time.format(new Date(c.created_at))}
                      </time>
                    </div>
                    <div className="mt-0.5 line-clamp-2 pl-4 text-xs text-[#45443e]">
                      <b>{c.author_name || t("Участник")}:</b>{" "}
                      {plainFromHtml(c.body)}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </>
  );
}

function BellIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}
