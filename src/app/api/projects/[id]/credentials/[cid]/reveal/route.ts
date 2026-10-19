// Показать / скопировать пароль. Каждый вызов пишется в журнал (credential_reveal, миграция 0016).
import { NextResponse } from "next/server";
import { decryptSecret } from "@/lib/credentials/crypto";
import { editorContext, fail, noStore } from "@/lib/credentials/server";

type Ctx = { params: Promise<{ id: string; cid: string }> };

export async function POST(req: Request, { params }: Ctx) {
  const { id, cid } = await params;
  const ctx = await editorContext(id);
  if ("error" in ctx) return ctx.error;
  const body = (await req.json().catch(() => ({}))) as { action?: string };
  const action = body.action === "copy" ? "copy" : "view";

  const { data, error } = await ctx.supabase
    .rpc("credential_reveal", { p_id: cid, p_action: action })
    .maybeSingle();
  const row = data as { project_id: string; secret_enc: string | null } | null;
  if (error || !row || row.project_id !== id) return fail("Нет доступа", 403);
  if (!row.secret_enc) return NextResponse.json({ password: "" }, { headers: noStore });
  try {
    return NextResponse.json(
      { password: decryptSecret(row.secret_enc, id) },
      { headers: noStore },
    );
  } catch {
    // ключ сменили или запись повреждена
    return fail("Не удалось расшифровать пароль — возможно, сменился CREDENTIALS_KEY", 500);
  }
}
