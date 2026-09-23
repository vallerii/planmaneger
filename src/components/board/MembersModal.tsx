"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Invite, Member, Profile } from "@/lib/types";
import { initials } from "@/lib/schedule";
import { Btn, ConfirmDialog, Modal, inputCls } from "../ui";

type Props = {
  open: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
  isOwner: boolean;
  me: Profile;
  members: Member[];
  setMembers: (m: Member[]) => void;
  toast: (t: string) => void;
};

/** Ссылка-приглашение: открывает регистрацию с уже заполненным email и ведёт в проект. */
function inviteLink(email: string, projectId: string, projectName: string) {
  const q = new URLSearchParams({
    invite: "1",
    email,
    project: projectName,
    next: `/projects/${projectId}`,
  });
  return `${window.location.origin}/login?${q.toString()}`;
}

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

const CopyIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <rect x="9" y="9" width="12" height="12" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

export default function MembersModal({
  open,
  onClose,
  projectId,
  projectName,
  isOwner,
  me,
  members,
  setMembers,
  toast,
}: Props) {
  const supabase = useMemo(() => createClient(), []);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [last, setLast] = useState<{
    email: string;
    link: string;
    added: boolean;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [removeId, setRemoveId] = useState<string | null>(null);

  async function reload() {
    const [{ data: m }, { data: inv }] = await Promise.all([
      supabase
        .from("project_members")
        .select(
          "user_id, role, profile:profiles(id,email,full_name,avatar_url)",
        )
        .eq("project_id", projectId),
      supabase
        .from("project_invites")
        .select("id,email,created_at")
        .eq("project_id", projectId)
        .order("created_at"),
    ]);
    if (m) setMembers(m as unknown as Member[]);
    setInvites((inv ?? []) as Invite[]);
  }

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      reload();
    } else {
      setLast(null);
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function invite() {
    const v = email.trim().toLowerCase();
    if (!v) return;
    setBusy(true);
    setError(null);
    const { data, error } = await supabase.rpc("invite_to_project", {
      p_project: projectId,
      p_email: v,
    });
    setBusy(false);
    if (error) return setError(error.message);
    setEmail("");
    setCopied(false);
    setLast({
      email: v,
      link: inviteLink(v, projectId, projectName),
      added: data === "added",
    });
    reload();
  }

  async function copyLast() {
    if (!last) return;
    if (await copy(last.link)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  async function copyFor(addr: string) {
    if (await copy(inviteLink(addr, projectId, projectName)))
      toast("Ссылка скопирована");
  }

  async function removeMember(uid: string) {
    const { error } = await supabase
      .from("project_members")
      .delete()
      .eq("project_id", projectId)
      .eq("user_id", uid);
    if (error) return setError(error.message);
    reload();
  }

  async function cancelInvite(id: string) {
    const { error } = await supabase
      .from("project_invites")
      .delete()
      .eq("id", id);
    if (error) return setError(error.message);
    if (last && invites.find((i) => i.id === id)?.email === last.email)
      setLast(null);
    reload();
  }

  const smallBtn =
    "grid h-8 w-8 shrink-0 place-items-center rounded-[8px] text-[#9a988f] transition hover:bg-[#f0efe9] hover:text-ink";
  const removing = members.find((m) => m.user_id === removeId);

  return (
    <Modal open={open} onClose={onClose} title="Участники проекта" width={560}>
      <div className="max-h-[45vh] overflow-auto">
        {members.map((m) => {
          const name = m.profile?.full_name || m.profile?.email || "—";
          return (
            <div
              key={m.user_id}
              className="flex items-center gap-3 border-b border-[#efede6] py-2.5"
            >
              <div className="grid h-[34px] w-[34px] place-items-center rounded-[10px] bg-ink text-[11px] font-black text-white">
                {initials(name)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate font-bold">
                  {name}{" "}
                  {m.user_id === me.id && (
                    <span className="font-normal text-muted">(вы)</span>
                  )}
                </div>
                <div className="truncate text-xs text-muted">
                  {m.profile?.email}
                </div>
              </div>
              <span className="rounded-full bg-[#efeee8] px-2 py-0.5 text-[10px] font-extrabold text-[#5d5b54]">
                {m.role === "owner" ? "владелец" : "редактор"}
              </span>
              {isOwner && m.role !== "owner" && (
                <button
                  onClick={() => setRemoveId(m.user_id)}
                  className={smallBtn + " hover:text-bad"}
                  title="Убрать из проекта"
                >
                  ×
                </button>
              )}
            </div>
          );
        })}
        {invites.map((i) => (
          <div
            key={i.id}
            className="flex items-center gap-3 border-b border-[#efede6] py-2.5"
          >
            <div className="grid h-[34px] w-[34px] place-items-center rounded-[10px] border border-dashed border-[#bdbbb2] text-xs text-muted">
              ?
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate font-bold">{i.email}</div>
              <div className="text-xs text-muted">ждёт регистрации</div>
            </div>
            {isOwner && (
              <>
                <button
                  onClick={() => copyFor(i.email)}
                  className={smallBtn}
                  title="Скопировать ссылку-приглашение"
                >
                  <CopyIcon />
                </button>
                <button
                  onClick={() => cancelInvite(i.id)}
                  className={smallBtn + " hover:text-bad"}
                  title="Отменить приглашение"
                >
                  ×
                </button>
              </>
            )}
          </div>
        ))}
      </div>

      {isOwner ? (
        <>
          <div className="mt-4 flex gap-2">
            <input
              type="email"
              className={inputCls}
              placeholder="email коллеги"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && invite()}
            />
            <Btn
              variant="primary"
              onClick={invite}
              disabled={busy || !email.trim()}
            >
              Пригласить
            </Btn>
          </div>

          {last ? (
            <div className="mt-3 rounded-xl border border-[#cfe6db] bg-[#eef7f2] p-3">
              <div className="text-sm text-[#0b5a40]">
                {last.added ? (
                  <>
                    <b>{last.email}</b> уже есть в системе и добавлен в проект.
                    Отправьте ссылку, чтобы открыть проект:
                  </>
                ) : (
                  <>
                    Отправьте <b>{last.email}</b> эту ссылку (в Telegram,
                    WhatsApp, почтой). По ней откроется регистрация с уже
                    заполненным email, а после входа — этот проект.
                  </>
                )}
              </div>
              <div className="mt-2 flex gap-2">
                <input
                  readOnly
                  value={last.link}
                  onFocus={(e) => e.currentTarget.select()}
                  className="min-w-0 flex-1 rounded-[9px] border border-[#cfe6db] bg-white px-2.5 py-2 text-xs text-[#35342f] outline-none"
                />
                <Btn
                  onClick={copyLast}
                  className={copied ? "border-ok text-ok" : ""}
                >
                  {copied ? (
                    "✓ Скопировано"
                  ) : (
                    <>
                      <CopyIcon /> Скопировать
                    </>
                  )}
                </Btn>
              </div>
            </div>
          ) : (
            <p className="mt-2 text-[11px] text-muted">
              После приглашения появится ссылка — отправьте её человеку.
              Скопировать её снова можно иконкой рядом с приглашением.
            </p>
          )}
        </>
      ) : (
        <p className="mt-4 text-[11px] text-muted">
          Приглашать участников может только владелец проекта.
        </p>
      )}
      {error && <p className="mt-2 text-sm text-bad">{error}</p>}
      <div className="mt-5 flex justify-end">
        <Btn onClick={onClose}>Готово</Btn>
      </div>

      <ConfirmDialog
        open={!!removeId}
        title="Убрать участника?"
        confirmText="Убрать"
        onClose={() => setRemoveId(null)}
        onConfirm={() => removeId && removeMember(removeId)}
      >
        <b>{removing?.profile?.full_name || removing?.profile?.email}</b>{" "}
        потеряет доступ к проекту «{projectName}». Задачи и комментарии
        останутся.
      </ConfirmDialog>
    </Modal>
  );
}
