// Общие типы и проверки «Доступов» (клиент и сервер).

export type Credential = {
  id: string;
  project_id: string;
  title: string;
  url: string | null;
  login: string | null;
  has_secret: boolean;
  note: string | null;
  created_at: string;
  updated_at: string;
  updated_by: string | null;
};

/** Колонки без зашифрованного пароля — только их и можно читать. */
export const CREDENTIAL_COLS =
  "id,project_id,title,url,login,has_secret,note,created_at,updated_at,updated_by";

export type CredentialLogEntry = {
  id: string;
  title: string;
  user_id: string | null;
  action: "view" | "copy" | "create" | "update" | "delete";
  created_at: string;
};

export const LIMITS = { title: 120, url: 500, login: 200, password: 1000, note: 2000 };
