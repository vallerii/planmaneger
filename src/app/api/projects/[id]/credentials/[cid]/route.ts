// Изменить запись в «Доступах». password не передан — пароль не меняется, "" — убрать пароль.
import { NextResponse } from "next/server";
import { encryptSecret } from "@/lib/credentials/crypto";
import { editorContext, fail, noStore, parseBody } from "@/lib/credentials/server";
import { CREDENTIAL_COLS } from "@/lib/credentials/shared";

type Ctx = { params: Promise<{ id: string; cid: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  const { id, cid } = await params;
  const ctx = await editorContext(id);
  if ("error" in ctx) return ctx.error;
  const f = parseBody(await req.json().catch(() => ({})));
  if (!f.title) return fail("Укажите название", 400);

  const patch: Record<string, string | null> = {
    title: f.title,
    url: f.url,
    login: f.login,
    note: f.note,
  };
  if (f.password !== undefined)
    patch.secret_enc = f.password ? encryptSecret(f.password, id) : null;

  const { data, error } = await ctx.supabase
    .from("project_credentials")
    .update(patch)
    .eq("id", cid)
    .eq("project_id", id)
    .select(CREDENTIAL_COLS)
    .maybeSingle();
  if (error) return fail(error.message, 400);
  if (!data) return fail("Запись не найдена", 404);
  return NextResponse.json({ credential: data }, { headers: noStore });
}
