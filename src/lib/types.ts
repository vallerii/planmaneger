export const SIZES = ["S", "M", "L", "XL", "XXL"] as const;
export type Size = (typeof SIZES)[number];
export type SizeDays = Record<Size, number>;

export const DEFAULT_SIZE_DAYS: SizeDays = { S: 1, M: 2, L: 4, XL: 8, XXL: 16 };

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
};

/** Настройки писем (миграция 0014). */
export type NotifyPrefs = {
  notify_assign: boolean;
  notify_comments: boolean;
};

export type Project = {
  id: string;
  name: string;
  start_date: string;
  size_days: SizeDays;
  owner_id: string;
  created_at: string;
};

export type Phase = {
  id: string;
  project_id: string;
  name: string;
  position: number;
};

export const STATUSES = [
  "todo",
  "in_progress",
  "discuss",
  "revisit",
  "done",
  "cancelled",
] as const;
export type Status = (typeof STATUSES)[number];

export const STATUS_META: Record<
  Status,
  { label: string; badge: string; dot: string }
> = {
  todo: {
    label: "Не начато",
    badge: "bg-[#efeee8] text-[#5d5b54]",
    dot: "bg-[#b5b3aa]",
  },
  in_progress: {
    label: "В процессе",
    badge: "bg-[#e6effc] text-[#1d4f9a]",
    dot: "bg-[#3b7be0]",
  },
  discuss: {
    label: "Нужно обсудить",
    badge: "bg-[#fff5d8] text-[#6b4c00]",
    dot: "bg-warn",
  },
  revisit: {
    label: "На пересмотре",
    badge: "bg-[#efe9fb] text-[#5b3aa6]",
    dot: "bg-[#8b6ad8]",
  },
  done: { label: "Готово", badge: "bg-[#e8f5ef] text-[#0b6b4c]", dot: "bg-ok" },
  cancelled: {
    label: "Отменено",
    badge: "bg-[#f3f2ee] text-[#8f8d85] line-through",
    dot: "bg-[#8f8d85]",
  },
};

export type Task = {
  id: string;
  project_id: string;
  phase_id: string;
  name: string;
  size: Size;
  description: string;
  progress: number;
  needs_discussion: boolean;
  status: Status;
  share_token?: string | null;
  hypothesis_id?: string | null;
  profile_step?: string | null;
  /** С какого момента задача считает изменения в профиле (миграция 0008). */
  counted_from?: string | null;
  deadline: string | null;
  position: number;
  /** исполнитель — владелец или редактор проекта (миграция 0014) */
  assignee_id?: string | null;
  comment_count?: number;
  /** непрочитанные мной комментарии (только на клиенте) */
  unread?: number;
  /** исполнитель для карточки (только на клиенте) */
  assignee?: Pick<Profile, "full_name" | "email"> | null;
  /** не подходит под фильтр «Исполнитель» — карточка приглушена (только на клиенте) */
  dimmed?: boolean;
};

/** Кого можно назначить исполнителем: владелец и редакторы. */
export const assignable = (members: Member[]) =>
  members.filter((m) => m.role !== "viewer" && m.profile);

export type Comment = {
  id: string;
  task_id: string;
  author_id: string;
  body: string;
  created_at: string;
  author?: Pick<Profile, "full_name" | "email"> | null;
};

export type Member = {
  user_id: string;
  role: Role;
  profile: Profile | null;
};

export type Invite = {
  id: string;
  email: string;
  created_at: string;
  role?: "editor" | "viewer";
};

/** owner — владелец, editor — редактор, viewer — клиент / партнёр (только просмотр). */
export type Role = "owner" | "editor" | "viewer";

export const ROLE_LABEL: Record<Role, string> = {
  owner: "владелец",
  editor: "редактор",
  viewer: "клиент · просмотр",
};
