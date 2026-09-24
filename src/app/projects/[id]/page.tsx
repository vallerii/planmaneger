import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Board from "@/components/board/Board";
import type { Member, Phase, Project, Task } from "@/lib/types";
import { DEFAULT_SIZE_DAYS } from "@/lib/types";

export default async function ProjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ task?: string }>;
}) {
  const { id } = await params;
  const { task: openTaskId } = await searchParams;
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login");

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!project) notFound();

  const [
    { data: phases },
    { data: tasks },
    { data: members },
    { data: me },
    { data: profile },
    hypRes,
    linkProbe,
  ] = await Promise.all([
    supabase.from("phases").select("*").eq("project_id", id).order("position"),
    supabase
      .from("tasks")
      .select("*, comments(count)")
      .eq("project_id", id)
      .order("position"),
    supabase
      .from("project_members")
      .select("user_id, role, profile:profiles(id,email,full_name,avatar_url)")
      .eq("project_id", id),
    supabase
      .from("profiles")
      .select("id,email,full_name,avatar_url")
      .eq("id", auth.user.id)
      .single(),
    // если миграция 0003 ещё не применена — просто вернётся ошибка, и миссии не будет
    supabase
      .from("product_profiles")
      .select("mission")
      .eq("project_id", id)
      .maybeSingle(),
    supabase
      .from("profile_items")
      .select("id,title,status")
      .eq("project_id", id)
      .eq("kind", "hypothesis")
      .order("position"),
    // есть ли колонка tasks.hypothesis_id (миграция 0004)
    supabase.from("tasks").select("hypothesis_id").limit(1),
  ]);
  const hypotheses =
    hypRes.error || linkProbe.error
      ? null
      : (hypRes.data as { id: string; title: string; status: string }[]);

  const normTasks: Task[] = (tasks ?? []).map(({ comments, ...t }) => ({
    ...(t as Task),
    comment_count:
      Array.isArray(comments) && comments[0]
        ? (comments[0] as { count: number }).count
        : 0,
  }));

  return (
    <Board
      initialProject={{
        ...(project as Project),
        size_days: { ...DEFAULT_SIZE_DAYS, ...(project.size_days ?? {}) },
      }}
      initialPhases={(phases ?? []) as Phase[]}
      initialTasks={normTasks}
      initialMembers={(members ?? []) as unknown as Member[]}
      me={me!}
      mission={profile?.mission ?? null}
      hypotheses={hypotheses}
      initialTaskId={openTaskId ?? null}
    />
  );
}
