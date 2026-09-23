import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Brand } from "@/components/ui";
import UserMenu from "@/components/UserMenu";
import CreateProject from "@/components/CreateProject";

export default async function Home() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login");

  const [{ data: profile }, { data: projects }] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name,email")
      .eq("id", auth.user.id)
      .single(),
    supabase
      .from("projects")
      .select(
        "id,name,start_date,owner_id,created_at,phases(count),tasks(count),project_members(count)",
      )
      .order("created_at", { ascending: false }),
  ]);

  const count = (x: unknown) =>
    Array.isArray(x) && x[0] ? (x[0] as { count: number }).count : 0;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-line bg-bg/90 px-4 py-4 backdrop-blur md:px-6">
        <div className="mx-auto flex max-w-6xl items-center gap-4">
          <Brand />
          <div className="flex-1" />
          <UserMenu
            name={profile?.full_name ?? null}
            email={profile?.email ?? auth.user.email ?? ""}
          />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Проекты</h1>
            <p className="text-muted">
              Ваши проекты и проекты, куда вас пригласили
            </p>
          </div>
          <CreateProject />
        </div>

        {!projects?.length ? (
          <div className="rounded-[17px] border border-dashed border-[#bdbbb2] p-12 text-center text-muted">
            Пока нет проектов. Создайте первый — и добавьте в него фазы и
            задачи.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <Link
                key={p.id}
                href={`/projects/${p.id}`}
                className="group rounded-[17px] border border-line bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-soft"
              >
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-lg font-extrabold tracking-tight group-hover:text-accent">
                    {p.name}
                  </h2>
                  {p.owner_id !== auth.user!.id && (
                    <span className="rounded-full bg-[#efeee8] px-2 py-0.5 text-[10px] font-extrabold text-[#5d5b54]">
                      гость
                    </span>
                  )}
                </div>
                <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted">
                  <span>
                    <b className="text-ink">{count(p.phases)}</b> фаз
                  </span>
                  <span>
                    <b className="text-ink">{count(p.tasks)}</b> задач
                  </span>
                  <span>
                    <b className="text-ink">{count(p.project_members)}</b>{" "}
                    участн.
                  </span>
                  <span>
                    старт {new Date(p.start_date).toLocaleDateString("ru-RU")}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
