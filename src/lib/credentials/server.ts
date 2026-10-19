// Серверная часть «Доступов»: проверка входа/прав и разбор тела запроса.
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { credentialsConfigured } from "./crypto";
import { LIMITS } from "./shared";

export const noStore = { "Cache-Control": "no-store" };

export function fail(error: string, status: number) {
  return NextResponse.json({ error }, { status, headers: noStore });
}

/** Пользователь вошёл и он владелец/редактор проекта; ключ шифрования задан. */
export async function editorContext(projectId: string) {
  if (!credentialsConfigured())
    return { error: fail("Хранилище доступов не настроено: нет CREDENTIALS_KEY", 503) };
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { error: fail("Нужно войти", 401) };
  const { data: editor } = await supabase.rpc("is_project_editor", { p_project: projectId });
  if (!editor) return { error: fail("Нет доступа", 403) };
  return { supabase, user: auth.user };
}

const str = (v: unknown, max: number) =>
  typeof v === "string" ? v.trim().slice(0, max) || null : null;

/** Поля записи из тела. password: undefined — не менять, "" — убрать. */
export function parseBody(b: Record<string, unknown>) {
  return {
    title: str(b.title, LIMITS.title),
    url: str(b.url, LIMITS.url),
    login: str(b.login, LIMITS.login),
    note: str(b.note, LIMITS.note),
    password:
      typeof b.password === "string"
        ? b.password.slice(0, LIMITS.password)
        : undefined,
  };
}
