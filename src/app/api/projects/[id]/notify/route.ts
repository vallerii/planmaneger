// Отправить письма «вам назначили задачу» по проекту сразу после назначения (миграция 0014).
// Вызывается из планера; что отправлять — решает очередь в базе, а не запрос.
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { mailConfigured } from "@/lib/notify/mailer";
import { appBaseUrl, sendAssignments } from "@/lib/notify/process";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Ctx) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Нужно войти" }, { status: 401 });
  const { data: editor } = await supabase.rpc("is_project_editor", { p_project: id });
  if (!editor) return NextResponse.json({ error: "Нет доступа" }, { status: 403 });

  const admin = createAdminClient();
  if (!admin || !mailConfigured())
    return NextResponse.json({ skipped: "email не настроен" });

  const res = await sendAssignments(admin, appBaseUrl(req), id);
  if (res.errors.length) console.error("[notify] назначения:", res.errors);
  return NextResponse.json({ sent: res.sent, failed: res.failed });
}
