import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Board from "@/components/board/Board";
import type { Member, Phase, Project, Task } from "@/lib/types";
import { DEFAULT_SIZE_DAYS } from "@/lib/types";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login");

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!project) notFound();

  const [{ data: phases }, { data: tasks }, { data: members }, { data: me }] =
    await Promise.all([
      supabase
        .from("phases")
        .select("*")
        .eq("project_id", id)
        .order("position"),
      supabase
        .from("tasks")
        .select("*, comments(count)")
        .eq("project_id", id)
        .order("position"),
      supabase
        .from("project_members")
        .select(
          "user_id, role, profile:profiles(id,email,full_name,avatar_url)",
        )
        .eq("project_id", id),
      supabase
        .from("profiles")
        .select("id,email,full_name,avatar_url")
        .eq("id", auth.user.id)
        .single(),
    ]);

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
    />
  );
}
