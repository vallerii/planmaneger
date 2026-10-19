"use client";

import { useMemo, useState } from "react";
import { useI18n } from "@/i18n/client";
import { createClient } from "@/lib/supabase/client";
import {
  TEAM_ROLES,
  TEAM_ROLE_LABEL,
  type Profile,
  type TeamMember,
  type TeamRole,
} from "@/lib/types";
import { sameName, similarNames, teamRoleIcon, teamRoleLabel } from "@/lib/team";
import { Avatar, Btn, Modal, inputCls } from "../ui";

type Props = {
  open: boolean;
  onClose: () => void;
  projectId: string;
  me: Profile;
  team: TeamMember[];
  setTeam: (fn: (t: TeamMember[]) => TeamMember[]) => void;
  toast: (t: string) => void;
  /** добавили человека — например, сразу назначить его на открытую задачу */
  onAdded?: (m: TeamMember) => void;
};

type Draft = {
  name: string;
  role: TeamRole;
  role_custom: string;
  contact: string;
};
const EMPTY: Draft = { name: "", role: "developer", role_custom: "", contact: "" };
const COLS = "id,name,role,role_custom,contact,archived";

const selectCls =
  "rounded-[10px] border border-line bg-[#fafafa] px-2 py-2.5 font-semibold outline-none focus:border-ink/40 focus:bg-white";

/**
 * «Команда проекта» — программисты, дизайнеры и др. без регистрации.
 * Отдельно от участников (клиенты, менеджеры). Удалить нельзя — только в архив.
 */
export default function TeamModal({
  open,
  onClose,
  projectId,
  me,
  team,
  setTeam,
  toast,
  onAdded,
}: Props) {
  const { t } = useI18n();
  const supabase = useMemo(() => createClient(), []);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [editId, setEditId] = useState<string | null>(null);
  const [edit, setEdit] = useState<Draft>(EMPTY);
  const [showArchived, setShowArchived] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const active = team.filter((m) => !m.archived);
  const archived = team.filter((m) => m.archived);
  const similar = similarNames(draft.name, team);
  const exactActive = similar.find((m) => !m.archived && sameName(m.name ?? "", draft.name));
  const exactArchived = similar.find((m) => m.archived && sameName(m.name ?? "", draft.name));

  const errText = (msg: string) =>
    /project_team_name_uniq|duplicate key/.test(msg)
      ? t("Человек с таким именем уже есть в команде")
      : msg;

  const payload = (d: Draft) => ({
    name: d.name.trim(),
    role: d.role,
    role_custom: d.role === "other" ? d.role_custom.trim() || null : null,
    contact: d.contact.trim() || null,
  });

  async function add() {
    if (!draft.name.trim() || exactActive) return;
    setBusy(true);
    setError(null);
    const { data, error } = await supabase
      .from("project_team")
      .insert({ project_id: projectId, created_by: me.id, ...payload(draft) })
      .select(COLS)
      .single();
    setBusy(false);
    if (error) return setError(errText(error.message));
    const m = data as TeamMember;
    setTeam((ts) => (ts.some((x) => x.id === m.id) ? ts : [...ts, m]));
    setDraft(EMPTY);
    toast(t("{name} добавлен в команду", { name: m.name ?? "" }));
    onAdded?.(m);
  }

  async function save(id: string) {
    if (!edit.name.trim()) return;
    setError(null);
    const p = payload(edit);
    const { error } = await supabase.from("project_team").update(p).eq("id", id);
    if (error) return setError(errText(error.message));
    setTeam((ts) => ts.map((m) => (m.id === id ? { ...m, ...p } : m)));
    setEditId(null);
  }

  async function setArchived(m: TeamMember, value: boolean) {
    setError(null);
    const { error } = await supabase
      .from("project_team")
      .update({ archived: value })
      .eq("id", m.id);
    if (error) return setError(errText(error.message));
    setTeam((ts) => ts.map((x) => (x.id === m.id ? { ...x, archived: value } : x)));
    toast(
      value
        ? t("{name} в архиве — в старых задачах остаётся", { name: m.name ?? "" })
        : t("{name} снова в команде", { name: m.name ?? "" }),
    );
  }

  const roleFields = (d: Draft, set: (d: Draft) => void) => (
    <>
      <select
        value={d.role}
        onChange={(e) => set({ ...d, role: e.target.value as TeamRole })}
        className={selectCls}
        aria-label={t("Роль")}
      >
        {TEAM_ROLES.map((r) => (
          <option key={r} value={r}>
            {t(TEAM_ROLE_LABEL[r])}
          </option>
        ))}
      </select>
      {d.role === "other" && (
        <input
          className={inputCls}
          placeholder={t("Какая роль? (копирайтер, SEO…)")}
          maxLength={40}
          value={d.role_custom}
          onChange={(e) => set({ ...d, role_custom: e.target.value })}
        />
      )}
    </>
  );

  const smallBtn =
    "rounded-[8px] px-2 py-1 text-xs font-bold text-muted transition hover:bg-[#f0efe9] hover:text-ink";

  const row = (m: TeamMember) =>
    editId === m.id ? (
      <div key={m.id} className="space-y-2 border-b border-[#efede6] py-3">
        <input
          className={inputCls}
          value={edit.name}
          maxLength={80}
          onChange={(e) => setEdit({ ...edit, name: e.target.value })}
          aria-label={t("Имя")}
        />
        <div className="flex flex-wrap gap-2">{roleFields(edit, setEdit)}</div>
        <input
          className={inputCls}
          placeholder={t("Контакт: Telegram, телефон…")}
          maxLength={200}
          value={edit.contact}
          onChange={(e) => setEdit({ ...edit, contact: e.target.value })}
        />
        <div className="flex justify-end gap-2">
          <Btn variant="ghost" onClick={() => setEditId(null)}>
            {t("Отмена")}
          </Btn>
          <Btn variant="primary" onClick={() => save(m.id)} disabled={!edit.name.trim()}>
            {t("Сохранить")}
          </Btn>
        </div>
      </div>
    ) : (
      <div
        key={m.id}
        className={`flex items-center gap-3 border-b border-[#efede6] py-2.5 ${m.archived ? "opacity-60" : ""}`}
      >
        <Avatar name={m.name ?? "?"} size={34} external />
        <div className="min-w-0 flex-1">
          <div className="truncate font-bold">{m.name}</div>
          <div className="truncate text-xs text-muted">
            {teamRoleIcon(m)} {teamRoleLabel(m, t)}
            {m.contact && <> · {m.contact}</>}
          </div>
        </div>
        {m.archived ? (
          <button className={smallBtn} onClick={() => setArchived(m, false)}>
            {t("Вернуть")}
          </button>
        ) : (
          <>
            <button
              className={smallBtn}
              onClick={() => {
                setEditId(m.id);
                setEdit({
                  name: m.name ?? "",
                  role: m.role,
                  role_custom: m.role_custom ?? "",
                  contact: m.contact ?? "",
                });
              }}
            >
              {t("Изменить")}
            </button>
            <button
              className={smallBtn + " hover:text-bad"}
              onClick={() => setArchived(m, true)}
              title={t("Убрать из списка выбора. В старых задачах исполнитель сохранится")}
            >
              {t("В архив")}
            </button>
          </>
        )}
      </div>
    );

  return (
    <Modal open={open} onClose={onClose} title={t("Команда проекта")} width={560}>
      <p className="-mt-1 mb-3 text-sm text-muted">
        {t("Программисты, дизайнеры и другие исполнители — без регистрации и писем. Их можно назначать на задачи. Клиент видит только роль, без имени и контакта.")}
      </p>

      <div className="max-h-[40vh] overflow-auto">
        {active.length === 0 && (
          <div className="rounded-xl border border-dashed border-line px-3 py-4 text-center text-sm text-muted">
            {t("В команде пока никого нет")}
          </div>
        )}
        {active.map(row)}
        {archived.length > 0 && (
          <>
            <button
              className="mt-2 text-xs font-bold text-muted hover:text-ink"
              onClick={() => setShowArchived((v) => !v)}
            >
              {showArchived ? "▾" : "▸"} {t("В архиве")} · {archived.length}
            </button>
            {showArchived && archived.map(row)}
          </>
        )}
      </div>

      <div className="mt-4 rounded-xl bg-[#f5f4ef] p-3">
        <div className="mb-2 text-xs font-extrabold tracking-[.07em] text-muted uppercase">
          {t("Добавить в команду")}
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            className={inputCls + " min-w-[180px] flex-1"}
            placeholder={t("Имя, например «Олег»")}
            maxLength={80}
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && add()}
          />
          {roleFields(draft, setDraft)}
        </div>
        <input
          className={inputCls + " mt-2"}
          placeholder={t("Контакт: Telegram, телефон… (необязательно)")}
          maxLength={200}
          value={draft.contact}
          onChange={(e) => setDraft({ ...draft, contact: e.target.value })}
          onKeyDown={(e) => e.key === "Enter" && add()}
        />

        {similar.length > 0 && (
          <div className="mt-2 rounded-lg border border-[#f0dca8] bg-[#fdf6e3] px-3 py-2 text-sm text-[#7a5a0c]">
            {exactActive
              ? t("Такой человек уже есть в команде:")
              : t("Возможно, этот человек уже есть:")}
            <ul className="mt-1 space-y-1">
              {similar.map((m) => (
                <li key={m.id} className="flex items-center gap-2">
                  <b>{m.name}</b>
                  <span className="text-xs">
                    {teamRoleLabel(m, t)}
                    {m.archived && <> · {t("в архиве")}</>}
                  </span>
                  {m.archived && (
                    <button
                      className="ml-auto text-xs font-bold underline"
                      onClick={() => {
                        setArchived(m, false);
                        setDraft(EMPTY);
                      }}
                    >
                      {t("Вернуть")}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {error && <div className="mt-2 text-sm text-bad">{error}</div>}

        <div className="mt-3 flex justify-end">
          <Btn
            variant="primary"
            onClick={add}
            disabled={busy || !draft.name.trim() || !!exactActive || !!exactArchived}
          >
            {t("Добавить")}
          </Btn>
        </div>
      </div>
    </Modal>
  );
}
