// Отправка писем через HTTP API почтового сервиса (без SMTP и лишних пакетов).
// Нужен один из ключей: RESEND_API_KEY (resend.com) или BREVO_API_KEY (brevo.com),
// и адрес отправителя EMAIL_FROM — «Planmaneger <noreply@ваш-домен>».
// Только сервер: ключи без NEXT_PUBLIC_.

export type Mail = {
  to: string;
  toName?: string | null;
  subject: string;
  html: string;
  text: string;
};

/** Можно ли отправлять письма: есть отправитель, ключ сервиса и service_role для очереди. */
export function mailConfigured() {
  return (
    !!process.env.EMAIL_FROM &&
    !!process.env.SUPABASE_SERVICE_ROLE_KEY &&
    !!(process.env.RESEND_API_KEY || process.env.BREVO_API_KEY)
  );
}

function parseFrom(from: string) {
  const m = /^\s*(.*?)\s*<([^>]+)>\s*$/.exec(from);
  return m ? { name: m[1].replace(/^"|"$/g, "") || undefined, email: m[2] } : { email: from.trim() };
}

export async function sendMail(mail: Mail): Promise<void> {
  const from = process.env.EMAIL_FROM;
  if (!from) throw new Error("EMAIL_FROM не задан");

  if (process.env.RESEND_API_KEY) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [mail.to],
        subject: mail.subject,
        html: mail.html,
        text: mail.text,
      }),
    });
    if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
    return;
  }

  if (process.env.BREVO_API_KEY) {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": process.env.BREVO_API_KEY,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        sender: parseFrom(from),
        to: [{ email: mail.to, ...(mail.toName ? { name: mail.toName } : {}) }],
        subject: mail.subject,
        htmlContent: mail.html,
        textContent: mail.text,
      }),
    });
    if (!res.ok) throw new Error(`Brevo ${res.status}: ${await res.text()}`);
    return;
  }

  throw new Error("Не задан RESEND_API_KEY или BREVO_API_KEY");
}
