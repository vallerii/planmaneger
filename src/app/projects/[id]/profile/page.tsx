import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProfileApp, { type StepTask } from "@/components/profile/ProfileApp";
import { CYCLE_TEMPLATE } from "@/lib/steps";
import {
  emptyProfile,
  type HistoryEntry,
  type LinkedTask,
  type ProductProfile,
  type ProfileItem,
} from "@/lib/profile";

export default async function ProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { id } = await params;
  const { tab } = await searchParams;
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login?expired=1");

  const { data: project } = await supabase
    .from("projects")
    .select("id,name")
    .eq("id", id)
    .maybeSingle();
  if (!project) notFound();

  const [
    profileRes,
    itemsRes,
    historyRes,
    tasksRes,
    phasesRes,
    econProbe,
    stepsFirst,
    cycleProbe,
    mvpProbe,
    meRes,
  ] = await Promise.all([
    supabase
      .from("product_profiles")
      .select("*")
      .eq("project_id", id)
      .maybeSingle(),
    supabase
      .from("profile_items")
      .select("*")
      .eq("project_id", id)
      .order("position"),
    supabase
      .from("profile_history")
      .select("*, actor:profiles(full_name,email)")
      .eq("project_id", id)
      .order("created_at", { ascending: false })
      .limit(200),
    // задачи, привязанные к гипотезам (колонка появляется в миграции 0004)
    supabase
      .from("tasks")
      .select("id,name,status,phase_id,hypothesis_id")
      .eq("project_id", id)
      .not("hypothesis_id", "is", null),
    supabase
      .from("phases")
      .select("id,name")
      .eq("project_id", id)
      .order("position"),
    // есть ли колонка economics (миграция 0005)
    supabase.from("product_profiles").select("economics").limit(1),
    // задачи, связанные с профилем (миграция 0006; counted_from — 0008)
    selectSteps(supabase, id),
    // есть ли колонки полного цикла (миграция 0007)
    supabase.from("product_profiles").select("vision").limit(1),
    // шаблон цикла: MVP и пересмотр задач (миграция 0008)
    supabase.from("product_profiles").select("mvp").limit(1),
    // моя роль в проекте: клиент / партнёр — только просмотр
    supabase
      .from("project_members")
      .select("role")
      .eq("project_id", id)
      .eq("user_id", auth.user.id)
      .maybeSingle(),
  ]);
  const readOnly = meRes.data?.role === "viewer";
  // Задачи шаблона, созданные до миграции 0008, остались без связи с профилем —
  // привязываем их по названию, чтобы прогресс снова считался из профиля.
  let stepsRes = stepsFirst;
  if (!mvpProbe.error && !readOnly) {
    const linked = await relinkTemplateTasks(supabase, id);
    if (linked) stepsRes = await selectSteps(supabase, id);
  }
  const steps = stepsRes.error
    ? await supabase
        .from("tasks")
        .select("id,name,profile_step,status,progress")
        .eq("project_id", id)
        .not("profile_step", "is", null)
    : stepsRes;

  const missingTables =
    !!profileRes.error && profileRes.error.code !== "PGRST116";
  const needsMarket = !missingTables && !!tasksRes.error;
  const needsEconomics = !missingTables && !!econProbe.error;
  const base = emptyProfile(id);
  const profile: ProductProfile = profileRes.data
    ? { ...base, ...(profileRes.data as ProductProfile) }
    : base;

  return (
    <ProfileApp
      project={project as { id: string; name: string }}
      initialProfile={profile}
      profileExists={!!profileRes.data}
      initialItems={(itemsRes.data ?? []) as ProfileItem[]}
      initialHistory={(historyRes.data ?? []) as unknown as HistoryEntry[]}
      initialTab={tab}
      missingTables={missingTables}
      needsMarket={needsMarket}
      needsEconomics={needsEconomics}
      needsCycle={!missingTables && !!cycleProbe.error}
      needsTemplate={!missingTables && !!mvpProbe.error}
      readOnly={readOnly}
      stepTasks={(steps.data ?? []) as StepTask[]}
      initialTasks={(tasksRes.data ?? []) as LinkedTask[]}
      phases={(phasesRes.data ?? []) as { id: string; name: string }[]}
    />
  );
}

type Db = Awaited<ReturnType<typeof createClient>>;

function selectSteps(supabase: Db, projectId: string) {
  return supabase
    .from("tasks")
    .select("id,name,profile_step,status,progress,counted_from")
    .eq("project_id", projectId)
    .not("profile_step", "is", null);
}

/** Привязать задачи шаблона без profile_step по названию. Вернёт, сколько привязали. */
async function relinkTemplateTasks(supabase: Db, projectId: string) {
  const byName = new Map(
    CYCLE_TEMPLATE.flatMap((ph) => ph.tasks)
      .filter((t) => t.step)
      .map((t) => [t.name, t.step!] as const),
  );
  const { data } = await supabase
    .from("tasks")
    .select("id,name")
    .eq("project_id", projectId)
    .is("profile_step", null)
    .in("name", [...byName.keys()]);
  if (!data?.length) return 0;
  const results = await Promise.all(
    data.map((t) =>
      supabase
        .from("tasks")
        .update({ profile_step: byName.get(t.name) })
        .eq("id", t.id),
    ),
  );
  return results.filter((r) => !r.error).length;
}
