import type { Metadata } from "next";
import Link from "next/link";
import { Brand } from "@/components/ui";
import { getI18n } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: `${t("Страница не найдена")} · Planmaneger` };
}

/** 404: несуществующий адрес, удалённый проект или нет доступа к нему. */
export default async function NotFound() {
  const { t } = await getI18n();
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-line px-4 py-4 md:px-6">
        <Link href="/" className="inline-block" title={t("Все проекты")}>
          <Brand />
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-[480px] text-center">
          <div className="relative mx-auto mb-8 h-[120px] w-[220px]" aria-hidden>
            {/* «доска» с потерявшейся карточкой */}
            <div className="absolute inset-0 grid grid-cols-3 gap-2 rounded-[17px] border border-line bg-white p-3">
              {[0, 1, 2].map((c) => (
                <div key={c} className="flex flex-col gap-1.5 rounded-[9px] bg-[#f3f2ee] p-1.5">
                  <span className="h-3 rounded-[4px] bg-[#e2e0d8]" />
                  <span className="h-3 rounded-[4px] bg-[#e2e0d8]" />
                  {c !== 1 && <span className="h-3 rounded-[4px] bg-[#e2e0d8]" />}
                </div>
              ))}
            </div>
            <div className="absolute -top-4 -right-5 rotate-12 rounded-[10px] border border-dashed border-accent bg-white px-2.5 py-1.5 text-sm font-black text-accent shadow-soft">
              404
            </div>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight">
            {t("Такой страницы нет")}
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-muted">
            {t("Возможно, ссылка устарела, проект или задачу удалили, или у вас нет к ним доступа. Если вам прислали ссылку — попросите владельца проекта пригласить вас.")}
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-2">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-[11px] border border-ink bg-ink px-4 py-2 font-bold text-white transition hover:-translate-y-px hover:shadow-soft"
            >
              {t("К моим проектам")}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
