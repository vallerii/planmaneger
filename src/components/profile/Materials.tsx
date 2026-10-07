"use client";

import { useI18n } from "@/i18n/client";
import { useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ProfileItem } from "@/lib/profile";
import type { ProfileCtx } from "./ProfileApp";
import { LinkOut } from "./Market";
import { AddBtn, AutoText, Empty, Label, RemoveBtn, Section } from "./fields";

/** Бакет Storage для документов проекта (миграция 0013). */
export const FILES_BUCKET = "project-files";
const MAX_MB = 50;

/** Вкладка «Материалы»: ссылки (Figma, сайт, доступы в менеджере паролей…) и документы. */
export default function Materials({ ctx }: { ctx: ProfileCtx }) {
  const { t } = useI18n();
  const links = ctx.byKind("link");
  const files = ctx.byKind("file");

  return (
    <div className="space-y-5">
      {!ctx.canMaterials && (
        <div className="rounded-[13px] border border-[#edd48e] bg-[#fff5d8] px-4 py-3 text-sm text-[#6b4c00]">
          {t("Для материалов и заметок запустите {file} в Supabase → SQL Editor, затем обновите страницу.", {
            file: "supabase/migrations/0013_materials_notes.sql",
          })}
        </div>
      )}

      <Section
        id="link"
        title={t("Ссылки")}
        desc={t("Figma, сайт, репозиторий, аналитика, таблицы — всё, что не хочется потерять.")}
      >
        {links.length === 0 ? (
          <Empty>{t("Ссылок пока нет.")}</Empty>
        ) : (
          <div className="space-y-2">
            <div className="hidden gap-2 px-1 md:grid md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)_64px]">
              <Label>{t("Название")}</Label>
              <Label>{t("Ссылка")}</Label>
            </div>
            {links.map((l) => (
              <LinkRow key={l.id} l={l} ctx={ctx} />
            ))}
          </div>
        )}
        <AddBtn onClick={() => ctx.addItem("link", { url: "" })}>
          {t("+ Добавить ссылку")}
        </AddBtn>
        <p className="mt-3 text-xs text-muted">
          {t("Пароли здесь не храните: добавьте ссылку на запись в менеджере паролей (1Password, Bitwarden…).")}
        </p>
      </Section>

      <Section
        id="file"
        title={t("Документы")}
        desc={t("Договоры, презентации, исследования, макеты. До {n} МБ на файл.", { n: MAX_MB })}
      >
        <Files files={files} ctx={ctx} />
      </Section>
    </div>
  );
}

function LinkRow({ l, ctx }: { l: ProfileItem; ctx: ProfileCtx }) {
  const { t } = useI18n();
  return (
    <div
      data-item={l.id}
      id={`sec-item-${l.id}`}
      className="grid scroll-mt-24 items-start gap-2 rounded-[12px] border border-line p-2 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)_64px] md:border-0 md:p-0"
    >
      <AutoText
        value={l.title}
        onSave={(v) => ctx.updateItem(l.id, { title: v })}
        placeholder={t("Макеты в Figma")}
        className="font-bold"
        single
      />
      <AutoText
        value={l.data.url ?? ""}
        onSave={(v) => {
          const url = v.trim();
          // пустое название — подставим домен
          const title = !l.title.trim() && url ? hostOf(url) : undefined;
          ctx.updateItem(l.id, title ? { title, data: { url } } : { data: { url } });
        }}
        placeholder="https://…"
        className="text-sm"
        single
      />
      <div className="flex items-center justify-end gap-1 pt-0.5">
        <LinkOut url={l.data.url} />
        <RemoveBtn onClick={() => ctx.askRemove(l.id)} />
      </div>
    </div>
  );
}

function hostOf(url: string) {
  try {
    const h = new URL(/^https?:\/\//i.test(url) ? url : `https://${url}`).hostname;
    return h.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function Files({ files, ctx }: { files: ProfileItem[]; ctx: ProfileCtx }) {
  const { t, lang } = useI18n();
  const supabase = useMemo(() => createClient(), []);
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);

  async function upload(list: FileList | File[]) {
    setError(null);
    for (const f of Array.from(list)) {
      if (f.size > MAX_MB * 1024 * 1024) {
        setError(t("«{name}» больше {n} МБ — не загружен.", { name: f.name, n: MAX_MB }));
        continue;
      }
      setBusy((b) => [...b, f.name]);
      // в пути только латиница: имя файла храним в записи
      const ext = (f.name.match(/\.([A-Za-z0-9]{1,8})$/)?.[1] ?? "").toLowerCase();
      const path = `${ctx.projectId}/${crypto.randomUUID()}${ext ? "." + ext : ""}`;
      const { error: upErr } = await supabase.storage
        .from(FILES_BUCKET)
        .upload(path, f, { contentType: f.type || undefined, upsert: false });
      if (upErr) {
        setError(t("Не удалось загрузить «{name}»: {msg}", { name: f.name, msg: upErr.message }));
      } else {
        const ok = await ctx.addItem(
          "file",
          { path, size: f.size, mime: f.type, file_name: f.name },
          f.name,
          { focus: false },
        );
        if (!ok) await supabase.storage.from(FILES_BUCKET).remove([path]);
      }
      setBusy((b) => b.filter((x) => x !== f.name));
    }
  }

  async function open(it: ProfileItem, download: boolean) {
    // окно открываем сразу, по клику — иначе браузер заблокирует всплывающее окно
    const win = download ? null : window.open("about:blank", "_blank");
    const { data, error: e } = await supabase.storage
      .from(FILES_BUCKET)
      .createSignedUrl(
        it.data.path,
        60,
        download ? { download: it.data.file_name || it.title || true } : undefined,
      );
    if (e || !data) {
      win?.close();
      return setError(t("Не удалось открыть файл:") + " " + (e?.message ?? ""));
    }
    if (win) {
      win.opener = null;
      win.location.replace(data.signedUrl);
    } else window.location.assign(data.signedUrl);
  }

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString(lang === "ru" ? "ru-RU" : lang === "de" ? "de-DE" : "en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  return (
    <div
      onDragOver={(e) => {
        if (!ctx.canMaterials) return;
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        // fieldset disabled (просмотр) — кнопки загрузки нет, перетаскивание тоже игнорируем
        if (!ctx.canMaterials || input.current?.closest("fieldset")?.disabled) return;
        if (e.dataTransfer.files.length) upload(e.dataTransfer.files);
      }}
      className={`rounded-[12px] transition ${drag ? "bg-[#fff4ef] ring-2 ring-accent/40" : ""}`}
    >
      {files.length === 0 && !busy.length ? (
        <Empty>{t("Документов пока нет.")}</Empty>
      ) : (
        <div className="divide-y divide-[#efede6] rounded-[12px] border border-line">
          {files.map((f) => (
            <div
              key={f.id}
              id={`sec-item-${f.id}`}
              className="flex scroll-mt-24 items-center gap-3 px-3 py-2.5"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] bg-[#f5f4ef] text-[10px] font-extrabold text-muted uppercase">
                {extOf(f.data.file_name || f.title) || "file"}
              </span>
              <div className="min-w-0 flex-1">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    open(f, false);
                  }}
                  className="block font-bold break-words hover:underline"
                  title={t("Открыть")}
                >
                  {f.title || f.data.file_name || t("без названия")}
                </a>
                <div className="text-xs text-muted">
                  {fmtSize(f.data.size)} · {fmtDate(f.created_at)}
                </div>
              </div>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  open(f, true);
                }}
                className="shrink-0 rounded-[8px] px-2 py-1 text-sm font-bold text-muted hover:bg-[#f5f4ef] hover:text-ink"
                title={t("Скачать")}
              >
                ↓
              </a>
              <RemoveBtn onClick={() => ctx.askRemove(f.id)} />
            </div>
          ))}
          {busy.map((name) => (
            <div key={name} className="flex items-center gap-3 px-3 py-2.5 text-sm text-muted">
              <span className="h-9 w-9 shrink-0 animate-pulse rounded-[9px] bg-[#f5f4ef]" />
              {t("Загружаю «{name}»…", { name })}
            </div>
          ))}
        </div>
      )}
      {error && <p className="mt-2 text-sm text-bad">{error}</p>}
      <input
        ref={input}
        type="file"
        multiple
        hidden
        onChange={(e) => {
          if (e.target.files?.length) upload(e.target.files);
          e.target.value = "";
        }}
      />
      {ctx.canMaterials && (
        <AddBtn onClick={() => input.current?.click()}>
          {t("+ Загрузить документ (или перетащите файлы сюда)")}
        </AddBtn>
      )}
    </div>
  );
}

const extOf = (name: string) => name.match(/\.([A-Za-z0-9]{1,5})$/)?.[1] ?? "";

function fmtSize(b?: number) {
  if (!b) return "—";
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${Math.round(b / 1024)} KB`;
  return `${(b / 1024 / 1024).toFixed(1)} MB`;
}
