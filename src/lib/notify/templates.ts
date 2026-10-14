// Тексты писем на языке получателя (profiles.lang). Строки — через словари интерфейса.
import { isLang, makeI18n, type Lang } from "@/i18n/core";
import type { Mail } from "./mailer";

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );

const lang = (l: string | null | undefined): Lang => (isLang(l) ? l : "ru");

function layout(title: string, body: string, footer: string) {
  return `<!doctype html><html><body style="margin:0;background:#f6f5f0;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1d1c19">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f5f0;padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #e3e1d9;border-radius:14px">
<tr><td style="padding:22px 24px 6px;font-size:13px;font-weight:800;letter-spacing:.06em;color:#8f8d85;text-transform:uppercase">Planmaneger</td></tr>
<tr><td style="padding:0 24px 6px;font-size:20px;font-weight:800;line-height:1.3">${title}</td></tr>
<tr><td style="padding:8px 24px 22px;font-size:15px;line-height:1.5">${body}</td></tr>
</table>
<div style="max-width:560px;padding:12px 8px;font-size:12px;color:#8f8d85;line-height:1.5">${footer}</div>
</td></tr></table></body></html>`;
}

const button = (href: string, label: string) =>
  `<a href="${esc(href)}" style="display:inline-block;margin-top:14px;background:#1d1c19;color:#ffffff;text-decoration:none;font-weight:700;padding:10px 16px;border-radius:10px">${esc(label)}</a>`;

export type AssignRow = {
  email: string;
  lang: string | null;
  recipient_name: string | null;
  project_id: string;
  project_name: string;
  task_id: string;
  task_name: string;
  deadline: string | null;
  actor_name: string | null;
};

export function assignMail(r: AssignRow, baseUrl: string): Mail {
  const l = lang(r.lang);
  const { t, date } = makeI18n(l);
  const task = t(r.task_name);
  const url = `${baseUrl}/projects/${r.project_id}?task=${r.task_id}`;
  const settings = `${baseUrl}/`;
  const who = r.actor_name || t("Участник проекта");
  const subject = t("Вам назначена задача: {task}", { task });
  const due = r.deadline
    ? t("Дедлайн: {date}", { date: date(new Date(r.deadline + "T00:00:00")) })
    : "";
  const html = layout(
    esc(t("Вам назначена задача")),
    `<p style="margin:0 0 10px">${esc(t("{who} назначил(а) вас исполнителем в проекте «{project}»:", { who, project: r.project_name }))}</p>
<p style="margin:0;padding:12px 14px;background:#f5f4ef;border-radius:10px;font-weight:700">${esc(task)}${due ? `<br><span style="font-weight:400;font-size:13px;color:#5d5b54">${esc(due)}</span>` : ""}</p>
${button(url, t("Открыть задачу"))}`,
    esc(t("Письма можно отключить на главной странице планера: ✉ Уведомления.")) +
      ` <a href="${esc(settings)}" style="color:#8f8d85">${esc(baseUrl.replace(/^https?:\/\//, ""))}</a>`,
  );
  const text = [
    t("{who} назначил(а) вас исполнителем в проекте «{project}»:", { who, project: r.project_name }),
    "",
    task + (due ? ` (${due})` : ""),
    "",
    `${t("Открыть задачу")}: ${url}`,
  ].join("\n");
  return { to: r.email, toName: r.recipient_name, subject, html, text };
}

export type DigestRow = {
  user_id: string;
  email: string;
  lang: string | null;
  recipient_name: string | null;
  project_id: string;
  project_name: string;
  task_id: string;
  task_name: string;
  author_name: string | null;
  body: string;
  created_at: string;
};

/** Одно письмо на пользователя: непрочитанные комментарии, сгруппированные по задачам. */
export function digestMail(rows: DigestRow[], baseUrl: string): Mail {
  const r0 = rows[0];
  const l = lang(r0.lang);
  const { t, tp } = makeI18n(l);
  const n = rows.length;
  const tasks = new Map<string, DigestRow[]>();
  for (const r of rows) {
    const k = `${r.project_id}/${r.task_id}`;
    tasks.set(k, [...(tasks.get(k) ?? []), r]);
  }
  const projects = new Set(rows.map((r) => r.project_name));
  const subject =
    projects.size === 1
      ? t("{n} в «{project}»", {
          n: `${n} ${tp(n, "новый комментарий", "новых комментария", "новых комментариев")}`,
          project: r0.project_name,
        })
      : `${n} ${tp(n, "новый комментарий", "новых комментария", "новых комментариев")}`;

  const time = new Intl.DateTimeFormat(l === "ru" ? "ru-RU" : l === "de" ? "de-DE" : "en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: process.env.NOTIFY_TIMEZONE || "Europe/Kyiv",
  });
  const short = (s: string) => (s.length > 400 ? s.slice(0, 400).trimEnd() + "…" : s);

  let html = "";
  const text: string[] = [];
  for (const list of tasks.values()) {
    const r = list[0];
    const url = `${baseUrl}/projects/${r.project_id}?task=${r.task_id}`;
    html += `<div style="margin:0 0 18px;padding:12px 14px;border:1px solid #e3e1d9;border-radius:10px">
<div style="font-size:12px;color:#8f8d85">${esc(r.project_name)}</div>
<a href="${esc(url)}" style="font-weight:700;color:#1d1c19;text-decoration:none">${esc(t(r.task_name))}</a>`;
    text.push(`${r.project_name} — ${t(r.task_name)}`, url);
    for (const c of list) {
      const who = c.author_name || t("Пользователь");
      html += `<div style="margin-top:10px;padding-left:10px;border-left:3px solid #e3e1d9">
<div style="font-size:12px;color:#5d5b54"><b>${esc(who)}</b> · ${esc(time.format(new Date(c.created_at)))}</div>
<div style="white-space:pre-wrap;word-break:break-word">${esc(short(c.body))}</div></div>`;
      text.push(`  ${who}: ${short(c.body).replace(/\n/g, "\n  ")}`);
    }
    html += `</div>`;
    text.push("");
  }
  const first = rows[0];
  const open = `${baseUrl}/projects/${first.project_id}`;
  return {
    to: r0.email,
    toName: r0.recipient_name,
    subject,
    html: layout(
      esc(t("Непрочитанные комментарии")),
      html + button(projects.size === 1 ? open : `${baseUrl}/`, t("Открыть планер")),
      esc(t("Письма можно отключить на главной странице планера: ✉ Уведомления.")),
    ),
    text: text.join("\n"),
  };
}
