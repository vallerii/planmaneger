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
  deadline: string | null;
  position: number;
  comment_count?: number;
};

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
  role: "owner" | "editor";
  profile: Profile | null;
};

export type Invite = { id: string; email: string; created_at: string };
