"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Brand, Btn, ConfirmDialog, Modal, Toast } from "../ui";
import { useRouter } from "next/navigation";
import { stepChecklist, stepProgress, type ProfileStep } from "@/lib/steps";
import ProjectTitle from "../board/ProjectTitle";
import ProjectNav from "../ProjectNav";
import {
  DEFAULT_STATUS,
  KIND_LABEL,
  type HistoryEntry,
  type ItemKind,
  type LinkedTask,
  type ProfileSection,
  type ProductProfile,
  type ProfileItem,
  type SectionId,
  type Tab,
} from "@/lib/profile";
import Overview from "./Overview";
import Foundation from "./Foundation";
import Hypotheses from "./Hypotheses";
import RisksDecisions from "./RisksDecisions";
import Market from "./Market";
import EconomicsTab from "./Economics";
import GtmTab from "./Gtm";
import MetricsTab from "./Metrics";
import type { Economics } from "@/lib/economics";

const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Обзор" },
  { id: "foundation", label: "Основа" },
  { id: "hypotheses", label: "Гипотезы" },
  { id: "market", label: "Рынок" },
  { id: "gtm", label: "Выход на рынок" },
  { id: "economics", label: "Экономика" },
  { id: "metrics", label: "Метрики" },
  { id: "risks", label: "Риски и решения" },
];

/* eslint-disable @typescript-eslint/no-explicit-any */
export type ItemPatch = {
  title?: string;
  status?: string;
  position?: number;
  data?: Record<string, any>;
};
/* eslint-enable @typescript-eslint/no-explicit-any */

export type ProfileCtx = {
  projectName: string;
  profile: ProductProfile;
  items: ProfileItem[];
  history: HistoryEntry[];
  byKind: (k: ItemKind) => ProfileItem[];
  saveProfile: (
    patch: Partial<ProductProfile>,
    section?: ProfileSection,
  ) => void;
  patchPositioning: (patch: Partial<ProductProfile["positioning"]>) => void;
  patchThesis: (patch: Partial<ProductProfile["thesis"]>) => void;
  addItem: (
    kind: ItemKind,
    data?: ProfileItem["data"],
    title?: string,
    opts?: { focus?: boolean },
  ) => Promise<void>;
  updateItem: (id: string, patch: ItemPatch) => void;
  askRemove: (id: string) => void;
  markReviewed: (sec: SectionId) => void;
  addNote: (text: string) => Promise<void>;
  goTo: (tab: Tab, sec?: string) => void;
  /** куда перейти внутри раздела (например «thesis:advantage») */
  focus: string | null;
  setFocus: (f: string | null) => void;
  patchEconomics: (patch: Partial<Economics>) => void;
  canEconomics: boolean;
  /** миграция 0007: метрики, каналы, путь клиента, видение, размер рынка, GTM */
  canCycle: boolean;
  projectId: string;
  phases: { id: string; name: string }[];
  tasks: LinkedTask[];
  canLinkTasks: boolean;
  createTask: (
    hypothesisId: string,
    name: string,
    phaseId: string,
    deadline?: string | null,
  ) => Promise<boolean>;
};

/** Задача фазы 0, связанная с вкладкой профиля. */
export type StepTask = {
  id: string;
  profile_step: ProfileStep;
  status: string;
  progress: number;
};

export default function ProfileApp({
  project,
  initialProfile,
  profileExists,
  initialItems,
  initialHistory,
  initialTab,
  missingTables,
  needsMarket = false,
  needsEconomics = false,
  needsCycle = false,
  initialTasks = [],
  phases = [],
  stepTasks: initialStepTasks = [],
}: {
  project: { id: string; name: string };
  initialProfile: ProductProfile;
  profileExists: boolean;
  initialItems: ProfileItem[];
  initialHistory: HistoryEntry[];
  initialTab?: string;
  missingTables: boolean;
  needsMarket?: boolean;
  needsEconomics?: boolean;
  needsCycle?: boolean;
  initialTasks?: LinkedTask[];
  phases?: { id: string; name: string }[];
  stepTasks?: StepTask[];
}) {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const [name, setName] = useState(project.name);
  const [tab, setTab] = useState<Tab>(
    TABS.some((t) => t.id === initialTab) ? (initialTab as Tab) : "overview",
  );
  const [profile, setProfile] = useState(initialProfile);
  const profileRef = useRef(initialProfile);
  const existsRef = useRef(profileExists);
  const [items, _setItems] = useState(initialItems);
  // актуальные записи для отложенных сохранений (AutoText сохраняет с задержкой)
  const itemsRef = useRef(initialItems);
  const setItems = useCallback((fn: (xs: ProfileItem[]) => ProfileItem[]) => {
    itemsRef.current = fn(itemsRef.current);
    _setItems(itemsRef.current);
  }, []);
  const [history, setHistory] = useState(initialHistory);
  const [tasks, setTasks] = useState(initialTasks);
  const [pending, setPending] = useState(0);
  // несохранённые изменения: профиль целиком + изменённые записи
  const dirtyProfile = useRef(false);
  const dirtyItems = useRef(new Set<string>());
  // какие «необязательные» колонки профиля меняли (появились в миграциях 0004+)
  const dirtyCols = useRef(new Set<string>());
  const [dirtyCount, setDirtyCount] = useState(0);
  const markDirty = useCallback(() => {
    setDirtyCount((dirtyProfile.current ? 1 : 0) + dirtyItems.current.size);
  }, []);
  const [saving, setSaving] = useState(false);
  const [leaveTo, setLeaveTo] = useState<string | null>(null);
  const [, setStepTasks] = useState(initialStepTasks);
  const stepTasksRef = useRef(initialStepTasks);
  const [toastText, setToastText] = useState<string | null>(null);
  const [removeId, setRemoveId] = useState<string | null>(null);

  const toast = useCallback((t: string) => {
    setToastText(t);
    setTimeout(() => setToastText(null), 2200);
  }, []);

  const track = useCallback(
    async (p: PromiseLike<{ error: { message: string } | null }>) => {
      setPending((n) => n + 1);
      const { error } = await p;
      setPending((n) => n - 1);
      if (error) toast("Ошибка сохранения: " + error.message);
      return !error;
    },
    [toast],
  );

  const reloadHistory = useCallback(async () => {
    const { data } = await supabase
      .from("profile_history")
      .select("*, actor:profiles(full_name,email)")
      .eq("project_id", project.id)
      .order("created_at", { ascending: false })
      .limit(200);
    if (data) setHistory(data as unknown as HistoryEntry[]);
  }, [supabase, project.id]);

  // ---------- профиль (миссия, позиционирование, тезис, review) ----------
  const saveProfile = useCallback(
    (patch: Partial<ProductProfile>, section?: ProfileSection) => {
      const now = new Date().toISOString();
      const cur = profileRef.current;
      const next: ProductProfile = {
        ...cur,
        ...patch,
        updated: section ? { ...cur.updated, [section]: now } : cur.updated,
      };
      profileRef.current = next;
      setProfile(next);
      // запишется по кнопке «Сохранить»
      Object.keys(patch).forEach((k) => dirtyCols.current.add(k));
      dirtyProfile.current = true;
      markDirty();
    },
    [markDirty],
  );

  /** Сразу записать отдельные колонки профиля (без кнопки «Сохранить»). */
  const writeProfileNow = useCallback(
    (cols: Partial<ProductProfile>) => {
      const next = { ...profileRef.current, ...cols };
      profileRef.current = next;
      setProfile(next);
      existsRef.current = true;
      return track(
        supabase
          .from("product_profiles")
          .upsert({ project_id: project.id, ...cols }),
      );
    },
    [supabase, project.id, track],
  );

  const patchPositioning = useCallback(
    (patch: Partial<ProductProfile["positioning"]>) =>
      saveProfile(
        { positioning: { ...profileRef.current.positioning, ...patch } },
        "positioning",
      ),
    [saveProfile],
  );
  const patchThesis = useCallback(
    (patch: Partial<ProductProfile["thesis"]>) =>
      saveProfile(
        { thesis: { ...profileRef.current.thesis, ...patch } },
        "thesis",
      ),
    [saveProfile],
  );

  const patchEconomics = useCallback(
    (patch: Partial<Economics>) =>
      saveProfile(
        { economics: { ...profileRef.current.economics, ...patch } },
        "plan",
      ),
    [saveProfile],
  );

  const markReviewed = useCallback(
    (sec: SectionId) => {
      writeProfileNow({
        reviewed: {
          ...profileRef.current.reviewed,
          [sec]: new Date().toISOString(),
        },
      });
      toast("Отмечено как актуальное");
    },
    [writeProfileNow, toast],
  );

  // ---------- записи ----------
  const addItem = useCallback(
    async (
      kind: ItemKind,
      data: ProfileItem["data"] = {},
      title = "",
      opts: { focus?: boolean } = {},
    ) => {
      const same = itemsRef.current.filter((i) => i.kind === kind);
      const position = same.length
        ? Math.max(...same.map((i) => i.position)) + 1
        : 0;
      setPending((n) => n + 1);
      const { data: row, error } = await supabase
        .from("profile_items")
        .insert({
          project_id: project.id,
          kind,
          title,
          status: DEFAULT_STATUS[kind],
          data,
          position,
        })
        .select()
        .single();
      setPending((n) => n - 1);
      if (error) return toast("Ошибка: " + error.message);
      setItems((xs) => [...xs, row as ProfileItem]);
      reloadHistory();
      if (opts.focus === false) return;
      // фокус на новом элементе
      setTimeout(() => {
        const el = document.querySelector<HTMLTextAreaElement>(
          `[data-item="${row.id}"] textarea`,
        );
        el?.focus();
        el?.scrollIntoView({ block: "center", behavior: "smooth" });
      }, 60);
    },
    [supabase, project.id, toast, reloadHistory, setItems],
  );

  const updateItem = useCallback(
    async (id: string, patch: ItemPatch) => {
      const cur = itemsRef.current.find((i) => i.id === id);
      if (!cur) return;
      const dbPatch: Record<string, unknown> = {};
      if (patch.title !== undefined) dbPatch.title = patch.title;
      if (patch.status !== undefined) dbPatch.status = patch.status;
      if (patch.position !== undefined) dbPatch.position = patch.position;
      if (patch.data) dbPatch.data = { ...cur.data, ...patch.data };
      const now = new Date().toISOString();
      setItems((xs) =>
        xs.map((i) =>
          i.id === id
            ? { ...i, ...(dbPatch as Partial<ProfileItem>), updated_at: now }
            : i,
        ),
      );
      // запишется по кнопке «Сохранить»
      dirtyItems.current.add(id);
      markDirty();
    },
    [setItems, markDirty],
  );

  // ---------- задачи фазы 0: прогресс из заполненности профиля ----------
  const syncSteps = useCallback(async () => {
    const updates = stepTasksRef.current
      .filter((t) => t.status !== "done")
      .map((t) => ({
        t,
        progress: stepProgress(
          stepChecklist(t.profile_step, profileRef.current, itemsRef.current),
        ),
      }))
      .filter(({ t, progress }) => progress !== t.progress);
    if (!updates.length) return;
    await Promise.all(
      updates.map(({ t, progress }) =>
        supabase.from("tasks").update({ progress }).eq("id", t.id),
      ),
    );
    stepTasksRef.current = stepTasksRef.current.map((t) => {
      const u = updates.find((x) => x.t.id === t.id);
      return u ? { ...t, progress: u.progress } : t;
    });
    setStepTasks(stepTasksRef.current);
  }, [supabase]);

  // ---------- кнопка «Сохранить» ----------
  const saveAll = useCallback(async () => {
    if (saving) return false;
    if (!dirtyProfile.current && !dirtyItems.current.size) return true;
    setSaving(true);
    const jobs: {
      kind: "profile" | "item";
      id?: string;
      p: PromiseLike<{ error: { message: string } | null }>;
    }[] = [];
    if (dirtyProfile.current) {
      const next = profileRef.current;
      const row: Record<string, unknown> = {
        project_id: project.id,
        mission: next.mission,
        positioning: next.positioning,
        thesis: next.thesis,
        next_review: next.next_review,
        reviewed: next.reviewed,
        updated: next.updated,
        updated_at: new Date().toISOString(),
      };
      // колонки из миграций 0004/0005 — отправляем, только когда они нужны
      for (const col of [
        "market_notes",
        "economics",
        "vision",
        "market_size",
        "gtm",
      ] as const)
        if (dirtyCols.current.has(col)) row[col] = next[col];
      jobs.push({
        kind: "profile",
        p: supabase.from("product_profiles").upsert(row),
      });
    }
    for (const id of dirtyItems.current) {
      const it = itemsRef.current.find((i) => i.id === id);
      if (!it) continue;
      jobs.push({
        kind: "item",
        id,
        p: supabase
          .from("profile_items")
          .update({
            title: it.title,
            status: it.status,
            data: it.data,
            position: it.position,
          })
          .eq("id", id),
      });
    }
    const results = await Promise.all(jobs.map((j) => j.p));
    let firstError: string | null = null;
    results.forEach((r, k) => {
      const j = jobs[k];
      if (r.error) {
        firstError ??= r.error.message;
        return;
      }
      if (j.kind === "profile") {
        dirtyProfile.current = false;
        dirtyCols.current.clear();
        existsRef.current = true;
      } else if (j.id) dirtyItems.current.delete(j.id);
    });
    markDirty();
    setSaving(false);
    if (firstError) {
      toast("Не удалось сохранить: " + firstError);
      return false;
    }
    toast("Сохранено ✓");
    reloadHistory();
    syncSteps();
    return true;
  }, [
    saving,
    supabase,
    project.id,
    markDirty,
    toast,
    reloadHistory,
    syncSteps,
  ]);

  async function removeItem(id: string) {
    setItems((xs) => xs.filter((i) => i.id !== id));
    setTasks((xs) =>
      xs.map((t) =>
        t.hypothesis_id === id ? { ...t, hypothesis_id: null } : t,
      ),
    );
    dirtyItems.current.delete(id);
    markDirty();
    const ok = await track(
      supabase.from("profile_items").delete().eq("id", id),
    );
    if (ok) {
      reloadHistory();
      syncSteps();
    }
  }

  const addNote = useCallback(
    async (text: string) => {
      const ok = await track(
        supabase
          .from("profile_history")
          .insert({ project_id: project.id, event: "note", note: text }),
      );
      if (ok) reloadHistory();
    },
    [supabase, project.id, track, reloadHistory],
  );

  const createTask = useCallback(
    async (
      hypothesisId: string,
      taskName: string,
      phaseId: string,
      deadline?: string | null,
    ) => {
      setPending((n) => n + 1);
      const { data: last } = await supabase
        .from("tasks")
        .select("position")
        .eq("phase_id", phaseId)
        .order("position", { ascending: false })
        .limit(1)
        .maybeSingle();
      const { data: row, error } = await supabase
        .from("tasks")
        .insert({
          project_id: project.id,
          phase_id: phaseId,
          name: taskName,
          size: "S",
          deadline: deadline || null,
          hypothesis_id: hypothesisId,
          position: (last?.position ?? -1) + 1,
        })
        .select("id,name,status,phase_id,hypothesis_id")
        .single();
      setPending((n) => n - 1);
      if (error) {
        toast("Ошибка: " + error.message);
        return false;
      }
      setTasks((xs) => [...xs, row as LinkedTask]);
      toast("Задача добавлена на доску");
      return true;
    },
    [supabase, project.id, toast],
  );

  const [focus, setFocus] = useState<string | null>(null);
  const goTo = useCallback((t: Tab, sec?: string) => {
    setTab(t);
    if (sec?.includes(":")) setFocus(sec);
    setTimeout(() => {
      if (sec)
        document
          .getElementById(`sec-${sec.split(":")[0]}`)
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      else window.scrollTo({ top: 0, behavior: "smooth" });
    }, 50);
  }, []);

  // старые поля позиционирования → тезис (однократно, если в тезисе пусто)
  useEffect(() => {
    const p = profileRef.current.positioning ?? {};
    const t = profileRef.current.thesis ?? {};
    const patch: Record<string, string> = {};
    if (p.category?.trim() && !t.category?.trim()) patch.category = p.category;
    if (p.value?.trim() && !t.value?.trim()) patch.value = p.value;
    if (p.difference?.trim() && !t.advantage?.trim())
      patch.advantage = p.difference;
    if (Object.keys(patch).length && !missingTables)
      writeProfileNow({ thesis: { ...t, ...patch } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ?sec=<раздел> — перейти к полю (ссылки из задач фазы 0)
  useEffect(() => {
    const url = new URL(window.location.href);
    const sec = url.searchParams.get("sec");
    if (!sec) return;
    url.searchParams.delete("sec");
    window.history.replaceState(null, "", url.toString());
    setTimeout(() => goTo(tab, sec), 100);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ?item=<id> — прокрутить к записи (ссылка «Открыть в профиле» из задачи)
  useEffect(() => {
    const item = new URL(window.location.href).searchParams.get("item");
    if (!item) return;
    setTimeout(() => {
      const el = document.getElementById(`sec-item-${item}`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      el?.classList.add("ring-2", "ring-accent/40");
      setTimeout(() => el?.classList.remove("ring-2", "ring-accent/40"), 2000);
    }, 150);
  }, []);

  // таб в адресе, чтобы ссылка открывала нужный раздел
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("tab", tab);
    url.searchParams.delete("item");
    window.history.replaceState(null, "", url.toString());
  }, [tab]);

  // предупреждение, если закрывают вкладку с несохранённым
  useEffect(() => {
    const h = (e: BeforeUnloadEvent) => {
      if (pending > 0 || dirtyCount > 0) e.preventDefault();
    };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [pending, dirtyCount]);

  // переходы по ссылкам внутри приложения — спросить, если есть несохранённое
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (!dirtyCount || e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement).closest("a");
      if (!a || a.target === "_blank") return;
      const href = a.getAttribute("href");
      if (!href || !href.startsWith("/")) return;
      e.preventDefault();
      e.stopPropagation();
      setLeaveTo(href);
    };
    document.addEventListener("click", h, true);
    return () => document.removeEventListener("click", h, true);
  }, [dirtyCount]);

  // Ctrl/Cmd + S
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        saveAll();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [saveAll]);

  const byKind = useCallback(
    (k: ItemKind) =>
      items.filter((i) => i.kind === k).sort((a, b) => a.position - b.position),
    [items],
  );

  const ctx: ProfileCtx = {
    projectName: name,
    profile,
    items,
    history,
    byKind,
    saveProfile,
    patchPositioning,
    patchThesis,
    addItem,
    updateItem,
    askRemove: setRemoveId,
    markReviewed,
    addNote,
    goTo,
    focus,
    setFocus,
    patchEconomics,
    canEconomics: !needsEconomics,
    canCycle: !needsCycle,
    projectId: project.id,
    phases,
    tasks,
    canLinkTasks: !needsMarket,
    createTask,
  };

  const removing = items.find((i) => i.id === removeId);

  async function rename(v: string) {
    setName(v);
    track(supabase.from("projects").update({ name: v }).eq("id", project.id));
  }

  return (
    <div className="min-h-screen">
      <header className="z-10 border-b border-line bg-bg/90 px-3.5 py-4 backdrop-blur md:sticky md:top-0 md:px-6">
        <div className="flex flex-wrap items-center gap-3 md:flex-nowrap md:gap-4">
          <div className="flex min-w-0 basis-full items-center gap-3 md:flex-1 md:basis-0 md:gap-4">
            <Link href="/" className="shrink-0" title="Все проекты">
              <Brand />
            </Link>
            <ProjectTitle
              projectId={project.id}
              name={name}
              onRename={rename}
              onBeforeNavigate={(href) => {
                if (!dirtyCount) return true;
                setLeaveTo(href);
                return false;
              }}
            />
          </div>
          <ProjectNav projectId={project.id} active="profile" />
          <div className="flex shrink-0 justify-end md:flex-1 md:basis-0">
            <button
              onClick={() => saveAll()}
              disabled={!dirtyCount || saving}
              title="Сохранить изменения (Ctrl+S)"
              className={`rounded-[10px] px-3.5 py-2 text-sm font-bold whitespace-nowrap transition ${
                dirtyCount
                  ? "bg-accent text-white shadow-[0_2px_10px_rgba(255,90,54,.3)] hover:brightness-105"
                  : "text-muted"
              } disabled:cursor-default`}
            >
              {saving ? "Сохраняю…" : dirtyCount ? "Сохранить" : "Сохранено ✓"}
            </button>
          </div>
        </div>
        <div className="mt-4 flex gap-1 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => goTo(t.id)}
              className={`rounded-[10px] px-3.5 py-2 text-sm font-bold whitespace-nowrap transition ${
                tab === t.id
                  ? "bg-ink text-white"
                  : "text-muted hover:bg-white hover:text-ink"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pt-6 pb-16 md:px-6">
        {missingTables && (
          <div className="mb-5 rounded-[13px] border border-[#edd48e] bg-[#fff5d8] px-4 py-3 text-sm text-[#6b4c00]">
            В базе ещё нет таблиц профиля. Запустите{" "}
            <b>supabase/migrations/0003_product_profile.sql</b> в Supabase → SQL
            Editor, затем обновите страницу.
          </div>
        )}
        {tab === "overview" && <Overview ctx={ctx} />}
        {tab === "foundation" && <Foundation ctx={ctx} />}
        {needsMarket && !missingTables && (
          <div className="mb-5 rounded-[13px] border border-[#edd48e] bg-[#fff5d8] px-4 py-3 text-sm text-[#6b4c00]">
            Для вкладки «Рынок» и связи гипотез с задачами запустите{" "}
            <b>supabase/migrations/0004_market_links.sql</b> в Supabase → SQL
            Editor, затем обновите страницу.
          </div>
        )}
        {needsCycle && !missingTables && (
          <div className="mb-5 rounded-[13px] border border-[#edd48e] bg-[#fff5d8] px-4 py-3 text-sm text-[#6b4c00]">
            Для метрик, выхода на рынок, видения и размера рынка запустите{" "}
            <b>supabase/migrations/0007_product_cycle.sql</b> в Supabase → SQL
            Editor, затем обновите страницу.
          </div>
        )}
        {tab === "hypotheses" && <Hypotheses ctx={ctx} />}
        {tab === "market" && <Market ctx={ctx} />}
        {tab === "gtm" && <GtmTab ctx={ctx} />}
        {tab === "economics" && <EconomicsTab ctx={ctx} />}
        {tab === "metrics" && <MetricsTab ctx={ctx} />}
        {tab === "risks" && <RisksDecisions ctx={ctx} />}
      </main>

      <ConfirmDialog
        open={!!removeId}
        title={`Удалить: ${removing ? KIND_LABEL[removing.kind].toLowerCase() : ""}?`}
        onClose={() => setRemoveId(null)}
        onConfirm={() => removeId && removeItem(removeId)}
      >
        «<b>{removing?.title || "без названия"}</b>» будет удалено. В истории
        останется запись об удалении.
      </ConfirmDialog>
      <Modal
        open={!!leaveTo}
        onClose={() => setLeaveTo(null)}
        title="Есть несохранённые изменения"
        width={460}
      >
        <p className="text-[15px] leading-relaxed text-[#45443e]">
          Сохранить их перед переходом?
        </p>
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <Btn onClick={() => setLeaveTo(null)}>Отмена</Btn>
          <Btn
            onClick={() => {
              const to = leaveTo!;
              dirtyProfile.current = false;
              dirtyItems.current.clear();
              markDirty();
              setLeaveTo(null);
              router.push(to);
            }}
          >
            Не сохранять
          </Btn>
          <Btn
            variant="primary"
            onClick={async () => {
              const to = leaveTo!;
              if (await saveAll()) {
                setLeaveTo(null);
                router.push(to);
              }
            }}
          >
            Сохранить и перейти
          </Btn>
        </div>
      </Modal>
      <Toast text={toastText} />
    </div>
  );
}
