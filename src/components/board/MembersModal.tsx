"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Invite, Member, Profile } from "@/lib/types";
import { initials } from "@/lib/schedule";
import { Btn, Modal, inputCls } from "../ui";

type Props = {
  open: boolean;
  onClose: () => void;
  projectId: string;
  isOwner: boolean;
  me: Profile;
  members: Member[];
  setMembers: (m: Member[]) => void;
  toast: (t: string) => void;
};

export default function MembersModal({
  open,
  onClose,
  projectId,
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (open) reload();
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
    toast(data === "added" ? "Участник добавлен" : "Приглашение сохранено");
    reload();
  }

  async function removeMember(uid: string) {
    if (!confirm("Убрать участника из проекта?")) return;
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
    reload();
  }

  return (
    <Modal open={open} onClose={onClose} title="Участники проекта" width={560}>
      <div className="max-h-[50vh] overflow-auto">
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
                  onClick={() => removeMember(m.user_id)}
                  className="text-lg text-[#aaa] hover:text-bad"
                  title="Убрать"
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
              <button
                onClick={() => cancelInvite(i.id)}
                className="text-lg text-[#aaa] hover:text-bad"
                title="Отменить приглашение"
              >
                ×
              </button>
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
          <p className="mt-2 text-[11px] text-muted">
            Если у человека уже есть аккаунт — он сразу получит доступ. Если нет
            — отправьте ему ссылку на сайт: после регистрации с этим email
            проект появится у него автоматически.
          </p>
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
    </Modal>
  );
}
