"use client";

import { useState } from "react";
import { Btn, Modal } from "../ui";

export const LinkIcon = ({ size = 16 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

/** Публичная ссылка на задачу: открывается без входа, только просмотр. */
export default function ShareDialog({
  open,
  onClose,
  taskName,
  token,
  onChange,
}: {
  open: boolean;
  onClose: () => void;
  taskName: string;
  token: string | null;
  onChange: (token: string | null) => void;
}) {
  const [copied, setCopied] = useState(false);
  const link =
    token && typeof window !== "undefined"
      ? `${window.location.origin}/t/${token}`
      : "";

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  return (
    <Modal open={open} onClose={onClose} title="Ссылка на задачу" width={520}>
      {token ? (
        <>
          <p className="text-[15px] leading-relaxed text-[#45443e]">
            Любой, у кого есть ссылка, может посмотреть задачу «
            <b>{taskName}</b>» без входа: название, статус, сроки и описание.
            Комментарии и остальной проект не видны. Редактировать по ссылке
            нельзя.
          </p>
          <div className="mt-4 flex gap-2">
            <input
              readOnly
              value={link}
              onFocus={(e) => e.currentTarget.select()}
              className="min-w-0 flex-1 rounded-[10px] border border-line bg-[#fafafa] px-2.5 py-2.5 text-sm outline-none"
            />
            <Btn variant="primary" onClick={copy}>
              {copied ? "✓ Скопировано" : "Скопировать"}
            </Btn>
          </div>
          <div className="mt-5 flex items-center justify-between gap-2">
            <button
              onClick={() => onChange(null)}
              className="text-sm font-bold text-bad hover:underline"
              title="Старая ссылка перестанет открываться"
            >
              Отключить ссылку
            </button>
            <div className="flex gap-2">
              <a href={link} target="_blank" rel="noopener noreferrer">
                <Btn>Открыть ↗</Btn>
              </a>
              <Btn onClick={onClose}>Готово</Btn>
            </div>
          </div>
        </>
      ) : (
        <>
          <p className="text-[15px] leading-relaxed text-[#45443e]">
            Создайте ссылку, чтобы отправить задачу «<b>{taskName}</b>»
            исполнителю, у которого нет доступа к проекту. По ссылке откроется
            отдельная страница только с этой задачей — без входа и без
            возможности редактировать.
          </p>
          <div className="mt-6 flex justify-end gap-2">
            <Btn onClick={onClose}>Отмена</Btn>
            <Btn
              variant="primary"
              onClick={() => onChange(crypto.randomUUID())}
            >
              <LinkIcon size={14} /> Создать ссылку
            </Btn>
          </div>
        </>
      )}
    </Modal>
  );
}
