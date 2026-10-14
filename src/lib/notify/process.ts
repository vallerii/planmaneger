// Разбор очереди писем (миграция 0014).
//  • назначили задачу — сразу после назначения (планер дёргает /api/projects/[id]/notify)
//    и страховкой по расписанию (/api/cron/notify);
//  • непрочитанные комментарии — сводкой по расписанию, если не прочитаны за NOTIFY_DELAY_MINUTES.
import type { SupabaseClient } from "@supabase/supabase-js";
import { sendMail } from "./mailer";
import { assignMail, digestMail, type AssignRow, type DigestRow } from "./templates";

export type NotifyResult = { sent: number; failed: number; errors: string[] };

const empty = (): NotifyResult => ({ sent: 0, failed: 0, errors: [] });

export function appBaseUrl(req: Request) {
  const env = process.env.APP_URL || process.env.NEXT_PUBLIC_SITE_URL;
  if (env) return env.replace(/\/+$/, "");
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL)
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return new URL(req.url).origin;
}

export async function sendAssignments(
  admin: SupabaseClient,
  baseUrl: string,
  projectId: string | null,
): Promise<NotifyResult> {
  const res = empty();
  const { data, error } = await admin.rpc("claim_assign_notifications", {
    p_project: projectId,
  });
  if (error) {
    res.errors.push(error.message);
    return res;
  }
  const rows = (data ?? []) as (AssignRow & { n_id: string })[];
  const failedIds: string[] = [];
  await Promise.all(
    rows.map(async (r) => {
      try {
        await sendMail(assignMail(r, baseUrl));
        res.sent++;
      } catch (e) {
        res.failed++;
        res.errors.push(String((e as Error).message ?? e));
        failedIds.push(r.n_id);
      }
    }),
  );
  // не ушло — вернуть в очередь, повторит следующий запуск
  if (failedIds.length)
    await admin.from("task_notifications").update({ sent_at: null }).in("id", failedIds);
  return res;
}

export async function sendCommentDigests(
  admin: SupabaseClient,
  baseUrl: string,
): Promise<NotifyResult> {
  const res = empty();
  const delay = Math.max(0, Number(process.env.NOTIFY_DELAY_MINUTES ?? 10) || 0);
  const { data, error } = await admin.rpc("claim_comment_digests", {
    p_delay_minutes: delay,
  });
  if (error) {
    res.errors.push(error.message);
    return res;
  }
  const byUser = new Map<string, DigestRow[]>();
  for (const r of (data ?? []) as DigestRow[])
    byUser.set(r.user_id, [...(byUser.get(r.user_id) ?? []), r]);
  await Promise.all(
    [...byUser.values()].map(async (rows) => {
      try {
        await sendMail(digestMail(rows, baseUrl));
        res.sent++;
      } catch (e) {
        res.failed++;
        res.errors.push(String((e as Error).message ?? e));
        // не ушло — откатить отметку, чтобы эти комментарии попали в следующее письмо
        const first = Math.min(...rows.map((r) => Date.parse(r.created_at)));
        await admin
          .from("profiles")
          .update({ comments_notified_at: new Date(first - 1).toISOString() })
          .eq("id", rows[0].user_id);
      }
    }),
  );
  return res;
}
