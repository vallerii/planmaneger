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

export type Task = {
  id: string;
  project_id: string;
  phase_id: string;
  name: string;
  size: Size;
  description: string;
  progress: number;
  needs_discussion: boolean;
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
