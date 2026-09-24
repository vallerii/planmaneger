import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProfileApp, { type StepTask } from "@/components/profile/ProfileApp";
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
  if (!auth.user) redirect("/login");

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
    stepsRes,
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
    // задачи фазы 0 (миграция 0006)
    supabase
      .from("tasks")
      .select("id,profile_step,status,progress")
      .eq("project_id", id)
      .not("profile_step", "is", null),
  ]);

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
      stepTasks={(stepsRes.data ?? []) as StepTask[]}
      initialTasks={(tasksRes.data ?? []) as LinkedTask[]}
      phases={(phasesRes.data ?? []) as { id: string; name: string }[]}
    />
  );
}
