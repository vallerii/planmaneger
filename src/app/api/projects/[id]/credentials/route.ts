// Создать запись в «Доступах» (миграция 0016). Пароль шифруется здесь, на сервере.
import { NextResponse } from "next/server";
import { encryptSecret } from "@/lib/credentials/crypto";
import { editorContext, fail, noStore, parseBody } from "@/lib/credentials/server";
import { CREDENTIAL_COLS } from "@/lib/credentials/shared";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Ctx) {
  const { id } = await params;
  const ctx = await editorContext(id);
  if ("error" in ctx) return ctx.error;
  const f = parseBody(await req.json().catch(() => ({})));
  if (!f.title) return fail("Укажите название", 400);

  const { data, error } = await ctx.supabase
    .from("project_credentials")
    .insert({
      project_id: id,
      title: f.title,
      url: f.url,
      login: f.login,
      note: f.note,
      secret_enc: f.password ? encryptSecret(f.password, id) : null,
    })
    .select(CREDENTIAL_COLS)
    .single();
  if (error) return fail(error.message, 400);
  return NextResponse.json({ credential: data }, { headers: noStore });
}
