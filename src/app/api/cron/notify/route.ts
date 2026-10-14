// Плановая рассылка (миграция 0014): сводки непрочитанных комментариев
// и неотправленные письма о назначении. Запускать раз в 5–10 минут
// (Supabase pg_cron → supabase/cron_notify.sql) с заголовком
// Authorization: Bearer <CRON_SECRET>.
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { mailConfigured } from "@/lib/notify/mailer";
import { appBaseUrl, sendAssignments, sendCommentDigests } from "@/lib/notify/process";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

async function run(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`)
    return NextResponse.json({ error: "Нет доступа" }, { status: 401 });

  // почта ещё не подключена — не ошибка: просто ничего не отправляем
  const admin = createAdminClient();
  if (!admin || !mailConfigured())
    return NextResponse.json({
      skipped: "email не настроен: нужны SUPABASE_SERVICE_ROLE_KEY, EMAIL_FROM и RESEND_API_KEY или BREVO_API_KEY",
    });

  const base = appBaseUrl(req);
  const assigned = await sendAssignments(admin, base, null);
  const comments = await sendCommentDigests(admin, base);
  const errors = [...assigned.errors, ...comments.errors];
  if (errors.length) console.error("[notify] cron:", errors);
  return NextResponse.json({
    assigned: { sent: assigned.sent, failed: assigned.failed },
    comments: { sent: comments.sent, failed: comments.failed },
    errors: errors.slice(0, 5),
  });
}

export const GET = run;
export const POST = run;
