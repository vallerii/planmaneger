import { TEAM_ROLE_ICON, TEAM_ROLE_LABEL, type TeamMember } from "./types";

type T = (key: string, vars?: Record<string, string | number>) => string;

/** «Программист» / своя подпись для «Другое». */
export function teamRoleLabel(m: Pick<TeamMember, "role" | "role_custom">, t: T) {
  if (m.role === "other" && m.role_custom?.trim()) return m.role_custom.trim();
  return t(TEAM_ROLE_LABEL[m.role] ?? TEAM_ROLE_LABEL.other);
}

export const teamRoleIcon = (m: Pick<TeamMember, "role">) =>
  TEAM_ROLE_ICON[m.role] ?? TEAM_ROLE_ICON.other;

/** Имя для показа: у клиента имени нет — тогда роль. */
export function teamDisplayName(m: TeamMember, t: T) {
  return m.name?.trim() || teamRoleLabel(m, t);
}

const norm = (s: string) =>
  s.toLowerCase().replace(/ё/g, "е").replace(/\s+/g, " ").trim();

function lev(a: string, b: string) {
  if (Math.abs(a.length - b.length) > 1) return 2;
  const d = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = d[0];
    d[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = d[j];
      d[j] = Math.min(d[j] + 1, d[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return d[b.length];
}

export const sameName = (a: string, b: string) => norm(a) === norm(b);

/** Похожие имена — чтобы не завести одного человека дважды («Олег» / «Олег К.» / «Олег»). */
export function similarNames(name: string, team: TeamMember[]) {
  const n = norm(name);
  if (n.length < 2) return [];
  const first = n.split(" ")[0];
  return team.filter((m) => {
    const o = norm(m.name ?? "");
    if (!o) return false;
    if (o === n) return true;
    if (n.length >= 3 && (o.includes(n) || n.includes(o))) return true;
    if (first.length >= 3 && o.split(" ")[0] === first) return true;
    return n.length >= 4 && lev(o, n) <= 1;
  });
}
