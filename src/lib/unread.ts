"use client";
// Непрочитанные комментарии (миграция 0009): что написали другие после
// моей отметки о прочтении задачи. Открыл задачу — прочитал.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";

export type UnreadComment = {
  id: string;
  task_id: string;
  task_name: string;
  body: string;
  created_at: string;
  author_id: string;
  author_name: string | null;
};

export function useUnreadComments(
  supabase: SupabaseClient,
  projectId: string,
) {
  const [list, setList] = useState<UnreadComment[]>([]);
  /** false — миграция 0009 не запущена, функция недоступна */
  const [enabled, setEnabled] = useState(true);
  const seq = useRef(0);

  const fetchList = useCallback(
    () =>
      supabase.rpc("my_unread_comments", { p_project: projectId }).then(
        ({ data, error }) => ({
          ok: !error,
          rows: (data ?? []) as UnreadComment[],
        }),
      ),
    [supabase, projectId],
  );
  const apply = useCallback(
    (n: number, r: { ok: boolean; rows: UnreadComment[] }) => {
      if (n !== seq.current) return; // пришёл более свежий ответ
      setEnabled(r.ok);
      if (r.ok) setList(r.rows);
    },
    [],
  );

  const reload = useCallback(async () => {
    const n = ++seq.current;
    apply(n, await fetchList());
  }, [fetchList, apply]);

  useEffect(() => {
    const n = ++seq.current;
    fetchList().then((r) => apply(n, r));
  }, [fetchList, apply]);

  const byTask = useMemo(() => {
    const m: Record<string, number> = {};
    for (const c of list) m[c.task_id] = (m[c.task_id] ?? 0) + 1;
    return m;
  }, [list]);

  /** Отметить задачи прочитанными. Вернёт id комментариев, которые были новыми. */
  const markRead = useCallback(
    async (taskIds: string[]) => {
      if (!enabled || !taskIds.length) return new Set<string>();
      const now = new Date().toISOString();
      const fresh = new Set(
        list.filter((c) => taskIds.includes(c.task_id)).map((c) => c.id),
      );
      seq.current++; // не дать старому reload вернуть прочитанное
      setList((xs) => xs.filter((c) => !taskIds.includes(c.task_id)));
      await supabase.from("comment_reads").upsert(
        taskIds.map((task_id) => ({
          task_id,
          project_id: projectId,
          last_read_at: now,
        })),
        { onConflict: "user_id,task_id" },
      );
      return fresh;
    },
    [enabled, list, supabase, projectId],
  );

  return { list, byTask, enabled, reload, markRead };
}
