import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AccessApp from "@/components/AccessApp";
import { credentialsConfigured } from "@/lib/credentials/crypto";
import {
  CREDENTIAL_COLS,
  type Credential,
  type CredentialLogEntry,
} from "@/lib/credentials/shared";

/** «Доступы»: логины и пароли клиента (миграция 0016). Только владелец и редакторы. */
export default async function AccessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login?expired=1");

  const { data: project } = await supabase
    .from("projects")
    .select("id,name,owner_id")
    .eq("id", id)
    .maybeSingle();
  if (!project) notFound();

  const { data: members } = await supabase
    .from("project_members")
    .select("user_id, role, profile:profiles(id,email,full_name)")
    .eq("project_id", id);
  const myRole = members?.find((m) => m.user_id === auth.user!.id)?.role;
  // клиенту (viewer) раздел не показываем вовсе
  if (myRole !== "owner" && myRole !== "editor") redirect(`/projects/${id}`);
  const isOwner = myRole === "owner";

  const [credRes, logRes] = await Promise.all([
    supabase
      .from("project_credentials")
      .select(CREDENTIAL_COLS)
      .eq("project_id", id)
      .order("title"),
    isOwner
      ? supabase
          .from("credential_log")
          .select("id,title,user_id,action,created_at")
          .eq("project_id", id)
          .order("created_at", { ascending: false })
          .limit(300)
      : Promise.resolve({ data: null, error: null }),
  ]);

  const people: Record<string, string> = {};
  for (const m of members ?? []) {
    const p = m.profile as unknown as { email?: string; full_name?: string } | null;
    people[m.user_id] = p?.full_name || p?.email || "—";
  }

  return (
    <AccessApp
      project={{ id: project.id, name: project.name }}
      meId={auth.user.id}
      isOwner={isOwner}
      initial={(credRes.data ?? []) as Credential[]}
      initialLog={(logRes.data ?? null) as CredentialLogEntry[] | null}
      people={people}
      needsMigration={!!credRes.error}
      configured={credentialsConfigured()}
    />
  );
}
