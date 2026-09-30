// AI-перевод проекта на EN и DE (миграция 0012).
// GET  — статус: когда обновляли, сколько текстов ждут перевода.
// POST — перевести следующую порцию; браузер вызывает повторно, пока remaining > 0.
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { hashText, TR_LANGS, type TrMap } from "@/lib/translate/content";
import {
  collectSegments,
  loadTranslations,
  pendingSegments,
  staleKeys,
  takeBatch,
  translateBatch,
} from "@/lib/translate/server";

export const maxDuration = 60;

type Ctx = { params: Promise<{ id: string }> };

const fail = (status: number, error: string) =>
  NextResponse.json({ error }, { status });

async function guard(projectId: string) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { error: fail(401, "Нужно войти") } as const;
  const { data: editor, error } = await supabase.rpc("is_project_editor", {
    p_project: projectId,
  });
  if (error) return { error: fail(500, error.message) } as const;
  if (!editor)
    return {
      error: fail(403, "Обновлять перевод может только владелец или редактор"),
    } as const;
  return { supabase } as const;
}

/** Таблицы нет — миграция 0012 не запущена. */
const noMigration = (msg: string) =>
  /project_translations|translate_comments|merge_translations/.test(msg);

export async function GET(_req: Request, { params }: Ctx) {
  const { id } = await params;
  const g = await guard(id);
  if ("error" in g) return g.error;
  try {
    const { segments, withComments } = await collectSegments(g.supabase, id);
    const tr = await loadTranslations(g.supabase, id);
    const status = Object.fromEntries(
      TR_LANGS.map((l) => {
        const pending = segments.filter(
          (s) => tr[l].data[s.key]?.h !== hashText(s.text),
        ).length;
        return [l, { updated_at: tr[l].updated_at, pending }];
      }),
    );
    return NextResponse.json({
      total: segments.length,
      pending: pendingSegments(segments, tr).length,
      translateComments: withComments,
      configured: !!process.env.OPENAI_API_KEY,
      ...status,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (noMigration(msg)) return fail(409, "MIGRATION");
    return fail(500, msg);
  }
}

export async function POST(_req: Request, { params }: Ctx) {
  const { id } = await params;
  const g = await guard(id);
  if ("error" in g) return g.error;
  try {
    const { segments } = await collectSegments(g.supabase, id);
    const tr = await loadTranslations(g.supabase, id);
    const pending = pendingSegments(segments, tr);
    const batch = takeBatch(pending);

    let translated = 0;
    let usage = { prompt_tokens: 0, completion_tokens: 0 };
    const patch: Record<string, TrMap> = { en: {}, de: {} };
    if (batch.length) {
      const res = await translateBatch(batch);
      if (res.usage) usage = res.usage;
      for (const s of batch) {
        const r = res.ok[s.key];
        if (!r) continue;
        const h = hashText(s.text);
        patch.en[s.key] = { h, t: r.en };
        patch.de[s.key] = { h, t: r.de };
        translated++;
      }
    }

    // сохраняем, даже если переводить нечего: убираем ключи удалённых текстов
    let updatedAt: string | null = null;
    for (const l of TR_LANGS) {
      const remove = staleKeys(segments, tr[l].data);
      if (!Object.keys(patch[l]).length && !remove.length && !batch.length)
        continue;
      const { data, error } = await g.supabase.rpc("merge_translations", {
        p_project: id,
        p_lang: l,
        p_patch: patch[l],
        p_remove: remove,
      });
      if (error) throw new Error(error.message);
      updatedAt = data as string;
    }

    return NextResponse.json({
      translated,
      failed: batch.length - translated,
      remaining: pending.length - translated,
      updatedAt,
      usage,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg === "NO_KEY")
      return fail(500, "NO_KEY");
    if (noMigration(msg)) return fail(409, "MIGRATION");
    return fail(502, msg);
  }
}
