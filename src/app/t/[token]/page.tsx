import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Brand } from "@/components/ui";
import RichViewer from "@/components/RichViewer";
import {
  DEFAULT_SIZE_DAYS,
  STATUS_META,
  type Size,
  type Status,
} from "@/lib/types";
import { dateRu, parseDate } from "@/lib/schedule";

export const metadata: Metadata = {
  title: "Задача · Planmaneger",
  robots: { index: false, follow: false },
};

type Shared = {
  name: string;
  description: string;
  size: Size;
  status: Status;
  progress: number;
  deadline: string | null;
  phase_name: string;
  project_name: string;
  size_days: Record<Size, number> | null;
  updated_at: string;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function SharedTaskPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  let task: Shared | null = null;
  if (UUID.test(token)) {
    const supabase = await createClient();
    const { data } = await supabase.rpc("get_shared_task", { p_token: token });
    task = (Array.isArray(data) ? data[0] : null) as Shared | null;
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-line px-4 py-4 md:px-6">
        <div className="mx-auto max-w-3xl">
          <Brand />
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8 md:px-6">
        {!task ? (
          <div className="rounded-[17px] border border-line bg-white p-10 text-center">
            <h1 className="text-xl font-extrabold">Ссылка недоступна</h1>
            <p className="mt-2 text-muted">
              Задача не найдена или доступ по ссылке был отключён.
            </p>
          </div>
        ) : (
          <article className="rounded-[17px] border border-line bg-white p-5 shadow-soft md:p-7">
            <div className="text-xs font-bold text-muted">
              {task.project_name} · {task.phase_name}
            </div>
            <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight md:text-3xl">
              {task.name}
            </h1>

            <div className="mt-5 grid grid-cols-2 gap-2.5 md:grid-cols-4">
              <Info label="Статус">
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-xs font-extrabold ${STATUS_META[task.status].badge}`}
                >
                  {STATUS_META[task.status].label}
                </span>
              </Info>
              <Info label="Прогресс">
                <div className="font-extrabold">
                  {task.status === "done" ? 100 : task.progress}%
                </div>
                <div className="mt-1.5 h-[5px] overflow-hidden rounded-full bg-[#eceae4]">
                  <span
                    className="block h-full rounded-full bg-ok"
                    style={{
                      width: `${task.status === "done" ? 100 : task.progress}%`,
                    }}
                  />
                </div>
              </Info>
              <Info label="Размер">
                <span className="font-extrabold">{task.size}</span>{" "}
                <span className="text-sm text-muted">
                  ·{" "}
                  {(task.size_days ?? DEFAULT_SIZE_DAYS)[task.size] ??
                    DEFAULT_SIZE_DAYS[task.size]}{" "}
                  раб. дн.
                </span>
              </Info>
              <Info label="Дедлайн">
                <span className="font-extrabold">
                  {task.deadline ? dateRu(parseDate(task.deadline)) : "—"}
                </span>
              </Info>
            </div>

            <h2 className="mt-7 mb-2 text-xs font-extrabold tracking-[.07em] text-muted uppercase">
              Описание
            </h2>
            {task.description ? (
              <div className="rounded-[13px] border border-line p-4">
                <RichViewer html={task.description} />
              </div>
            ) : (
              <p className="text-muted">Описание пока не добавлено.</p>
            )}

            <p className="mt-6 text-xs text-muted">
              Обновлено{" "}
              {new Date(task.updated_at).toLocaleString("ru-RU", {
                day: "2-digit",
                month: "long",
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              · только просмотр
            </p>
          </article>
        )}
      </main>
    </div>
  );
}

function Info({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-line p-3">
      <div className="mb-1.5 text-[11px] font-bold text-muted">{label}</div>
      {children}
    </div>
  );
}
