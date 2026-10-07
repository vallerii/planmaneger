import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import NotesApp from "@/components/NotesApp";
import { getLang } from "@/i18n/server";
import { loadPageTranslation } from "@/lib/translate/server";

/** Заметки по проекту: одно большое поле с rich text (product_profiles.notes, миграция 0013). */
export default async function NotesPage({
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
    .select("id,name")
    .eq("id", id)
    .maybeSingle();
  if (!project) notFound();

  const [notesRes, meRes] = await Promise.all([
    supabase
      .from("product_profiles")
      .select("notes")
      .eq("project_id", id)
      .maybeSingle(),
    supabase
      .from("project_members")
      .select("role")
      .eq("project_id", id)
      .eq("user_id", auth.user.id)
      .maybeSingle(),
  ]);
  const translations = await loadPageTranslation(supabase, id, await getLang());

  return (
    <NotesApp
      project={project as { id: string; name: string }}
      initialNotes={(notesRes.data?.notes as string | undefined) ?? ""}
      needsMigration={!!notesRes.error}
      readOnly={meRes.data?.role === "viewer"}
      translations={translations}
    />
  );
}
