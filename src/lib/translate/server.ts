// AI-перевод: сбор текстов проекта, поиск изменённого, запрос в OpenAI. Только сервер.
import type { createClient } from "@/lib/supabase/server";
import {
  hashText,
  mapStrings,
  needsAi,
  PROFILE_FIELDS,
  TR_LANGS,
  type TrLang,
  type TrMap,
} from "./content";

type Db = Awaited<ReturnType<typeof createClient>>;

export type Segment = { key: string; text: string };

/** Все тексты проекта, которые нужно переводить (русский оригинал). */
export async function collectSegments(supabase: Db, projectId: string) {
  const [project, phases, tasks, profile, items] = await Promise.all([
    supabase
      .from("projects")
      .select("id,name,translate_comments")
      .eq("id", projectId)
      .single(),
    supabase.from("phases").select("id,name").eq("project_id", projectId),
    supabase
      .from("tasks")
      .select("id,name,description")
      .eq("project_id", projectId),
    supabase
      .from("product_profiles")
      .select("*")
      .eq("project_id", projectId)
      .maybeSingle(),
    supabase
      .from("profile_items")
      .select("id,title,data")
      .eq("project_id", projectId),
  ]);
  const err = project.error || phases.error || tasks.error || items.error;
  if (err) throw new Error(err.message);

  const out = new Map<string, string>();
  const add = (key: string, text: string | null | undefined) => {
    if (needsAi(text)) out.set(key, text);
  };
  const addDeep = (value: unknown, prefix: string) =>
    mapStrings(value, prefix, (k, s) => {
      add(k, s);
      return s;
    });

  add("project.name", project.data.name);
  for (const p of phases.data ?? []) add(`phase:${p.id}.name`, p.name);
  for (const t of tasks.data ?? []) {
    add(`task:${t.id}.name`, t.name);
    add(`task:${t.id}.description`, t.description);
  }
  if (profile.data) {
    const p = profile.data as Record<string, unknown>;
    for (const f of PROFILE_FIELDS) if (f in p) addDeep(p[f], `profile.${f}`);
  }
  for (const i of items.data ?? []) {
    add(`item:${i.id}.title`, i.title);
    addDeep(i.data ?? {}, `item:${i.id}.data`);
  }

  const withComments = !!project.data.translate_comments;
  if (withComments) {
    const { data: comments, error } = await supabase
      .from("comments")
      .select("id,body")
      .eq("project_id", projectId);
    if (error) throw new Error(error.message);
    for (const c of comments ?? []) add(`comment:${c.id}.body`, c.body);
  }

  return {
    segments: [...out].map(([key, text]) => ({ key, text })),
    withComments,
  };
}

export async function loadTranslations(supabase: Db, projectId: string) {
  const { data, error } = await supabase
    .from("project_translations")
    .select("lang,data,updated_at")
    .eq("project_id", projectId);
  if (error) throw new Error(error.message);
  const by = {} as Record<TrLang, { data: TrMap; updated_at: string | null }>;
  for (const l of TR_LANGS) by[l] = { data: {}, updated_at: null };
  for (const r of data ?? [])
    if (r.lang === "en" || r.lang === "de")
      by[r.lang as TrLang] = { data: (r.data ?? {}) as TrMap, updated_at: r.updated_at };
  return by;
}

/** Что нужно перевести: нет перевода хотя бы на один язык или оригинал изменился. */
export function pendingSegments(
  segments: Segment[],
  tr: Record<TrLang, { data: TrMap }>,
) {
  return segments.filter((s) => {
    const h = hashText(s.text);
    return TR_LANGS.some((l) => tr[l].data[s.key]?.h !== h);
  });
}

/** Ключи в переводе, которых больше нет в проекте (удалённые задачи и т.п.). */
export function staleKeys(segments: Segment[], tr: TrMap) {
  const live = new Set(segments.map((s) => s.key));
  return Object.keys(tr).filter((k) => !live.has(k));
}

/** Порция для одного запроса: не больше N фрагментов и ~M символов. */
export function takeBatch(pending: Segment[], maxItems = 40, maxChars = 6000) {
  const out: Segment[] = [];
  let chars = 0;
  for (const s of pending) {
    if (out.length && (out.length >= maxItems || chars + s.text.length > maxChars))
      break;
    out.push(s);
    chars += s.text.length;
  }
  return out;
}

// ---------------------------------------------------------------
// OpenAI
// ---------------------------------------------------------------

const SYSTEM = `You translate content of a product-management planner from Russian into English (en) and German (de).
The input is a JSON object: keys are ids, values are Russian texts (task names, task descriptions, product profile notes, hypotheses, comments).
Return ONLY a JSON object with the same keys, each value an object {"en": "...", "de": "..."}.

Rules:
- Translate meaning naturally and concisely, in the style of a professional product/startup workspace. Keep the tone of the original (short labels stay short).
- Keep HTML exactly: same tags, same attributes, same order; translate only the text between tags. Never add or remove tags.
- Do not translate URLs, emails, code, numbers, currency amounts, product and company names, people's names.
- Keep these terms as is: ICP, MVP, North Star, TAM, SAM, SOM, CAC, LTV, JTBD, Proceed, Adjust, Pivot, Stop, Discovery, Validation, Growth, Launch, Build, KPI, B2B, B2C, SaaS.
- Keep line breaks, bullet markers, emojis and placeholders like [ICP] or {x}.
- If a text is already in English, return it unchanged for "en" and translate it for "de".
- Every key from the input must be present in the output.`;

export type AiResult = Record<string, { en: string; de: string }>;

export async function translateBatch(batch: Segment[]) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("NO_KEY");
  const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";
  // короткие id вместо длинных ключей — меньше токенов
  const input: Record<string, string> = {};
  batch.forEach((s, i) => (input[`k${i}`] = s.text));

  const base = (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
  const res = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: JSON.stringify(input) },
      ],
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`OpenAI ${res.status}: ${text.slice(0, 300)}`);
  }
  const json = await res.json();
  const content: string = json.choices?.[0]?.message?.content ?? "{}";
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("OpenAI вернул не JSON");
  }

  const ok: AiResult = {};
  batch.forEach((s, i) => {
    const v = parsed[`k${i}`] as { en?: unknown; de?: unknown } | undefined;
    if (!v || typeof v.en !== "string" || typeof v.de !== "string") return;
    if (!v.en.trim() || !v.de.trim()) return;
    if (!sameTags(s.text, v.en) || !sameTags(s.text, v.de)) return;
    ok[s.key] = { en: v.en, de: v.de };
  });
  return {
    ok,
    usage: json.usage as
      | { prompt_tokens: number; completion_tokens: number }
      | undefined,
    model,
  };
}

/** HTML не сломан: те же теги в том же количестве. */
function sameTags(a: string, b: string) {
  const tags = (s: string) => (s.match(/<\/?[a-z][a-z0-9]*/gi) ?? []).join(",").toLowerCase();
  return tags(a) === tags(b);
}

/** Перевод проекта для текущего языка интерфейса (для страниц). RU или нет миграции — null. */
export async function loadPageTranslation(
  supabase: Db,
  projectId: string,
  lang: string,
): Promise<TrMap | null> {
  if (lang !== "en" && lang !== "de") return null;
  const { data, error } = await supabase
    .from("project_translations")
    .select("data")
    .eq("project_id", projectId)
    .eq("lang", lang)
    .maybeSingle();
  if (error || !data) return null;
  return (data.data ?? {}) as TrMap;
}
