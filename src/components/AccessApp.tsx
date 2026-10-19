"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useI18n } from "@/i18n/client";
import { createClient } from "@/lib/supabase/client";
import {
  LIMITS,
  type Credential,
  type CredentialLogEntry,
} from "@/lib/credentials/shared";
import { Brand, Btn, ConfirmDialog, Field, Modal, Toast, inputCls } from "./ui";
import ProjectTitle from "./board/ProjectTitle";
import ProjectNav from "./ProjectNav";
import LangSwitcher from "./LangSwitcher";

/** Сколько секунд пароль виден после «Показать». */
const SHOW_SECONDS = 30;

type Draft = {
  title: string;
  url: string;
  login: string;
  password: string;
  note: string;
};
const EMPTY: Draft = { title: "", url: "", login: "", password: "", note: "" };

const ACTION_LABEL: Record<CredentialLogEntry["action"], string> = {
  view: "посмотрел пароль",
  copy: "скопировал пароль",
  create: "добавил",
  update: "изменил",
  delete: "удалил",
};

/** Копирование, которое работает и после запроса к серверу (Safari требует ClipboardItem). */
async function copyAsync(get: () => Promise<string>) {
  if (typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
    const blob = get().then((s) => new Blob([s], { type: "text/plain" }));
    await navigator.clipboard.write([new ClipboardItem({ "text/plain": blob })]);
    return;
  }
  await navigator.clipboard.writeText(await get());
}

const hostOf = (url: string) => {
  try {
    return new URL(/^https?:\/\//i.test(url) ? url : `https://${url}`).host;
  } catch {
    return url;
  }
};
const hrefOf = (url: string) => (/^https?:\/\//i.test(url) ? url : `https://${url}`);

/**
 * «Доступы» проекта: логины и пароли клиента.
 * Пароль зашифрован на сервере; показать / скопировать — через API, каждое действие в журнале.
 */
export default function AccessApp({
  project,
  meId,
  isOwner,
  initial,
  initialLog,
  people,
  needsMigration,
  configured,
}: {
  project: { id: string; name: string };
  meId: string;
  isOwner: boolean;
  initial: Credential[];
  initialLog: CredentialLogEntry[] | null;
  people: Record<string, string>;
  needsMigration: boolean;
  configured: boolean;
}) {
  const { t, locale } = useI18n();
  const supabase = useMemo(() => createClient(), []);
  const [items, setItems] = useState(initial);
  const [log, setLog] = useState(initialLog);
  const [query, setQuery] = useState("");
  const [edit, setEdit] = useState<{ id: string | null; draft: Draft } | null>(null);
  const [showPwd, setShowPwd] = useState(false);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [removeId, setRemoveId] = useState<string | null>(null);
  const [logOpen, setLogOpen] = useState(false);
  const [logWho, setLogWho] = useState("");
  const [revealed, setRevealed] = useState<{ id: string; password: string; until: number } | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [toastText, setToastText] = useState<string | null>(null);

  const canWork = configured && !needsMigration;
  const api = `/api/projects/${project.id}/credentials`;
  const when = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }),
    [locale],
  );
  const nameOf = (id: string | null) =>
    id === meId ? t("я") : (id && people[id]) || t("бывший участник");

  const toast = useCallback((s: string) => {
    setToastText(s);
    setTimeout(() => setToastText(null), 2200);
  }, []);

  // пароль открыт — тикаем и прячем по таймеру или когда вкладку свернули
  useEffect(() => {
    if (!revealed) return;
    const tick = setInterval(() => {
      const n = Date.now();
      setNow(n);
      if (n >= revealed.until) setRevealed(null);
    }, 1000);
    const hide = () => document.hidden && setRevealed(null);
    document.addEventListener("visibilitychange", hide);
    return () => {
      clearInterval(tick);
      document.removeEventListener("visibilitychange", hide);
    };
  }, [revealed]);

  // журнал у владельца — обновляем после действий
  const reloadLog = useCallback(async () => {
    if (!isOwner) return;
    const { data } = await supabase
      .from("credential_log")
      .select("id,title,user_id,action,created_at")
      .eq("project_id", project.id)
      .order("created_at", { ascending: false })
      .limit(300);
    if (data) setLog(data as CredentialLogEntry[]);
  }, [isOwner, supabase, project.id]);

  async function reveal(id: string, action: "view" | "copy") {
    const res = await fetch(`${api}/${id}/reveal`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.error || t("Не удалось получить пароль"));
    reloadLog();
    return body.password as string;
  }

  async function show(id: string) {
    if (revealed?.id === id) return setRevealed(null);
    try {
      const password = await reveal(id, "view");
      setNow(Date.now());
      setRevealed({ id, password, until: Date.now() + SHOW_SECONDS * 1000 });
    } catch (e) {
      toast((e as Error).message);
    }
  }

  async function copyPassword(id: string) {
    try {
      await copyAsync(() => reveal(id, "copy"));
      toast(t("Пароль скопирован"));
    } catch (e) {
      toast((e as Error).message || t("Не удалось скопировать"));
    }
  }

  async function copyText(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      toast(t("Скопировано"));
    } catch {
      toast(t("Не удалось скопировать"));
    }
  }

  function openEdit(c: Credential | null) {
    setFormError(null);
    setShowPwd(false);
    setEdit(
      c
        ? {
            id: c.id,
            draft: {
              title: c.title,
              url: c.url ?? "",
              login: c.login ?? "",
              password: "",
              note: c.note ?? "",
            },
          }
        : { id: null, draft: EMPTY },
    );
  }

  async function save(clearPassword = false) {
    if (!edit || !edit.draft.title.trim()) return;
    setBusy(true);
    setFormError(null);
    const { password, ...rest } = edit.draft;
    const body: Record<string, string> = { ...rest };
    // при изменении пустое поле — пароль не трогаем
    if (!edit.id || password || clearPassword) body.password = clearPassword ? "" : password;
    const res = await fetch(edit.id ? `${api}/${edit.id}` : api, {
      method: edit.id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const out = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setFormError(out.error || t("Не удалось сохранить"));
    const c = out.credential as Credential;
    setItems((xs) =>
      (xs.some((x) => x.id === c.id) ? xs.map((x) => (x.id === c.id ? c : x)) : [...xs, c]).sort(
        (a, b) => a.title.localeCompare(b.title),
      ),
    );
    if (revealed?.id === c.id) setRevealed(null);
    setEdit(null);
    toast(edit.id ? t("Сохранено") : t("Доступ добавлен"));
    reloadLog();
  }

  async function remove(id: string) {
    const { error } = await supabase.from("project_credentials").delete().eq("id", id);
    if (error) return toast(error.message);
    setItems((xs) => xs.filter((x) => x.id !== id));
    toast(t("Доступ удалён"));
    reloadLog();
  }

  const q = query.trim().toLowerCase();
  const shown = q
    ? items.filter((c) =>
        [c.title, c.url, c.login, c.note].some((v) => v?.toLowerCase().includes(q)),
      )
    : items;
  const logShown = (log ?? []).filter((l) => !logWho || l.user_id === logWho);
  const logPeople = [...new Set((log ?? []).map((l) => l.user_id).filter(Boolean))] as string[];
  const removing = items.find((c) => c.id === removeId);

  const iconBtn =
    "rounded-[8px] px-2 py-1 text-xs font-bold text-muted transition hover:bg-[#f0efe9] hover:text-ink disabled:opacity-40 disabled:pointer-events-none";

  return (
    <div className="min-h-screen">
      <header className="z-10 border-b border-line bg-bg/90 px-3.5 py-4 backdrop-blur md:sticky md:top-0 md:px-6">
        <div className="flex flex-wrap items-center gap-3 md:flex-nowrap md:gap-4">
          <div className="flex min-w-0 basis-full items-center gap-3 md:flex-1 md:basis-0 md:gap-4">
            <Link href="/" className="shrink-0" title={t("Все проекты")}>
              <Brand />
            </Link>
            <ProjectTitle projectId={project.id} name={project.name} />
          </div>
          <ProjectNav projectId={project.id} active="access" access />
          <div className="flex shrink-0 items-center justify-end gap-2 md:flex-1 md:basis-0">
            <LangSwitcher />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 pt-6 pb-16 md:px-6">
        {needsMigration && (
          <div className="mb-5 rounded-[13px] border border-[#edd48e] bg-[#fff5d8] px-4 py-3 text-sm text-[#6b4c00]">
            {t("Для раздела «Доступы» запустите {file} в Supabase → SQL Editor, затем обновите страницу.", {
              file: "supabase/migrations/0016_credentials.sql",
            })}
          </div>
        )}
        {!configured && (
          <div className="mb-5 rounded-[13px] border border-[#edd48e] bg-[#fff5d8] px-4 py-3 text-sm text-[#6b4c00]">
            {t("Хранилище не настроено: добавьте ключ шифрования CREDENTIALS_KEY в Vercel → Settings → Environment Variables и сделайте Redeploy. Как получить ключ — в .env.local.example.")}
          </div>
        )}

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold">{t("Доступы")}</h1>
            <p className="mt-1 text-sm text-muted">
              {t("Логины и пароли клиента: админки, хостинг, почта. Пароли хранятся в зашифрованном виде, их видят только владелец и редакторы. Клиент раздел не видит. Каждый просмотр и копирование пароля записываются в журнал.")}
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            {isOwner && log && (
              <Btn onClick={() => setLogOpen(true)}>🕘 {t("Журнал")}</Btn>
            )}
            <Btn variant="primary" onClick={() => openEdit(null)} disabled={!canWork}>
              {t("＋ Добавить доступ")}
            </Btn>
          </div>
        </div>

        {items.length > 5 && (
          <input
            className={inputCls + " mb-3"}
            placeholder={t("Поиск по названию, сайту, логину…")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        )}

        {!needsMigration && items.length === 0 && (
          <div className="rounded-[17px] border border-dashed border-line px-5 py-10 text-center text-muted">
            {t("Пока пусто. Добавьте первый доступ — например, админку сайта клиента.")}
          </div>
        )}

        <div className="grid gap-3">
          {shown.map((c) => {
            const open = revealed?.id === c.id;
            const left = open ? Math.max(0, Math.ceil((revealed.until - now) / 1000)) : 0;
            return (
              <div key={c.id} className="rounded-[15px] border border-line bg-white p-4">
                <div className="flex flex-wrap items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[16px] font-bold">🔑 {c.title}</div>
                    {c.url && (
                      <a
                        href={hrefOf(c.url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[#165dca] hover:underline"
                      >
                        {hostOf(c.url)} ↗
                      </a>
                    )}
                  </div>
                  <button className={iconBtn} onClick={() => openEdit(c)} disabled={!canWork}>
                    {t("Изменить")}
                  </button>
                  <button className={iconBtn + " hover:text-bad"} onClick={() => setRemoveId(c.id)}>
                    {t("Удалить")}
                  </button>
                </div>

                <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                  <div className="flex min-w-0 items-center gap-2 rounded-[10px] bg-[#f5f4ef] px-3 py-2">
                    <span className="shrink-0 text-xs font-bold text-muted">{t("Логин")}</span>
                    <span className="min-w-0 flex-1 truncate font-semibold">
                      {c.login || <span className="text-muted">—</span>}
                    </span>
                    {c.login && (
                      <button className={iconBtn} onClick={() => copyText(c.login!)}>
                        {t("Копировать")}
                      </button>
                    )}
                  </div>
                  <div className="flex min-w-0 items-center gap-2 rounded-[10px] bg-[#f5f4ef] px-3 py-2">
                    <span className="shrink-0 text-xs font-bold text-muted">{t("Пароль")}</span>
                    {c.has_secret ? (
                      <>
                        <span className="min-w-0 flex-1 truncate font-mono font-semibold">
                          {open ? revealed.password : "••••••••••"}
                        </span>
                        {open && (
                          <span className="shrink-0 text-[11px] text-muted tabular-nums">
                            {left} {t("с")}
                          </span>
                        )}
                        <button className={iconBtn} onClick={() => show(c.id)} disabled={!canWork}>
                          {open ? t("Скрыть") : t("Показать")}
                        </button>
                        <button className={iconBtn} onClick={() => copyPassword(c.id)} disabled={!canWork}>
                          {t("Копировать")}
                        </button>
                      </>
                    ) : (
                      <span className="flex-1 text-muted">{t("не задан")}</span>
                    )}
                  </div>
                </div>

                {c.note && (
                  <p className="mt-2 text-sm whitespace-pre-wrap text-[#45443e]">{c.note}</p>
                )}
                <div className="mt-2 text-[11px] text-muted">
                  {t("Изменено")}: {when.format(new Date(c.updated_at))} · {nameOf(c.updated_by)}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <Modal
        open={!!edit}
        onClose={() => setEdit(null)}
        title={edit?.id ? t("Изменить доступ") : t("Новый доступ")}
      >
        {edit && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              save();
            }}
            autoComplete="off"
          >
            <Field label={t("Название *")}>
              <input
                className={inputCls}
                autoFocus
                maxLength={LIMITS.title}
                placeholder={t("Например: Админка WordPress")}
                value={edit.draft.title}
                onChange={(e) => setEdit({ ...edit, draft: { ...edit.draft, title: e.target.value } })}
              />
            </Field>
            <Field label={t("Ссылка")}>
              <input
                className={inputCls}
                maxLength={LIMITS.url}
                placeholder="https://site.com/wp-admin"
                value={edit.draft.url}
                onChange={(e) => setEdit({ ...edit, draft: { ...edit.draft, url: e.target.value } })}
              />
            </Field>
            <div className="grid gap-x-3 sm:grid-cols-2">
              <Field label={t("Логин")}>
                <input
                  className={inputCls}
                  maxLength={LIMITS.login}
                  // чтобы браузер не подставлял сюда ваш собственный логин
                  autoComplete="off"
                  name="cred-login"
                  value={edit.draft.login}
                  onChange={(e) => setEdit({ ...edit, draft: { ...edit.draft, login: e.target.value } })}
                />
              </Field>
              <Field label={t("Пароль")}>
                <span className="relative block">
                  <input
                    className={inputCls + " pr-16 font-mono"}
                    type={showPwd ? "text" : "password"}
                    maxLength={LIMITS.password}
                    autoComplete="new-password"
                    name="cred-secret"
                    placeholder={edit.id ? t("пусто — не менять") : ""}
                    value={edit.draft.password}
                    onChange={(e) => setEdit({ ...edit, draft: { ...edit.draft, password: e.target.value } })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((v) => !v)}
                    className="absolute top-1/2 right-2 -translate-y-1/2 text-xs font-bold text-muted hover:text-ink"
                  >
                    {showPwd ? t("Скрыть") : t("Показать")}
                  </button>
                </span>
              </Field>
            </div>
            <Field label={t("Заметка")}>
              <textarea
                className={inputCls + " min-h-[70px]"}
                maxLength={LIMITS.note}
                placeholder={t("2FA на телефоне клиента, доступ до конца проекта…")}
                value={edit.draft.note}
                onChange={(e) => setEdit({ ...edit, draft: { ...edit.draft, note: e.target.value } })}
              />
            </Field>
            {formError && <div className="mb-2 text-sm text-bad">{formError}</div>}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
              {edit.id && items.find((c) => c.id === edit.id)?.has_secret ? (
                <Btn type="button" variant="ghost" onClick={() => save(true)} disabled={busy}>
                  {t("Убрать пароль")}
                </Btn>
              ) : (
                <span />
              )}
              <div className="flex gap-2">
                <Btn type="button" onClick={() => setEdit(null)}>
                  {t("Отмена")}
                </Btn>
                <Btn type="submit" variant="primary" disabled={busy || !edit.draft.title.trim()}>
                  {t("Сохранить")}
                </Btn>
              </div>
            </div>
          </form>
        )}
      </Modal>

      {isOwner && log && (
        <Modal open={logOpen} onClose={() => setLogOpen(false)} title={t("Журнал доступов")} width={620}>
          <p className="-mt-2 mb-3 text-sm text-muted">
            {t("Кто открывал и менял доступы. Видите только вы как владелец проекта.")}
          </p>
          {logPeople.length > 1 && (
            <select
              value={logWho}
              onChange={(e) => setLogWho(e.target.value)}
              className="mb-3 rounded-[10px] border border-line bg-[#fafafa] px-2 py-2 text-sm font-semibold"
            >
              <option value="">{t("Все участники")}</option>
              {logPeople.map((id) => (
                <option key={id} value={id}>
                  {nameOf(id)}
                </option>
              ))}
            </select>
          )}
          <div className="max-h-[55vh] overflow-auto">
            {logShown.length === 0 && (
              <div className="py-6 text-center text-sm text-muted">{t("Записей пока нет")}</div>
            )}
            {logShown.map((l) => (
              <div key={l.id} className="flex gap-3 border-b border-[#efede6] py-2 text-sm">
                <span className="w-[110px] shrink-0 text-muted tabular-nums">
                  {when.format(new Date(l.created_at))}
                </span>
                <span className="min-w-0 flex-1">
                  <b>{nameOf(l.user_id)}</b>{" "}
                  <span className={l.action === "view" || l.action === "copy" ? "text-[#9a6b00]" : ""}>
                    {t(ACTION_LABEL[l.action])}
                  </span>{" "}
                  «{l.title}»
                </span>
              </div>
            ))}
          </div>
        </Modal>
      )}

      <ConfirmDialog
        open={!!removeId}
        title={t("Удалить доступ?")}
        confirmText={t("Удалить")}
        onClose={() => setRemoveId(null)}
        onConfirm={() => removeId && remove(removeId)}
      >
        {t("Запись «{title}» удалится вместе с паролем. В журнале останется отметка об удалении.", {
          title: removing?.title ?? "",
        })}
      </ConfirmDialog>
      <Toast text={toastText} />
    </div>
  );
}
