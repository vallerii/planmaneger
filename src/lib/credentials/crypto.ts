// Шифрование паролей из раздела «Доступы» (миграция 0016). ТОЛЬКО на сервере.
// AES-256-GCM, ключ — CREDENTIALS_KEY (32 байта в base64 или 64 hex-символа) в env Vercel.
// Шифротекст привязан к проекту (AAD = project_id): скопировать его в другой проект бесполезно.
// Формат: "v1:" + base64(iv 12 байт | tag 16 байт | шифротекст).
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const PREFIX = "v1:";

function key(): Buffer | null {
  const raw = process.env.CREDENTIALS_KEY?.trim();
  if (!raw) return null;
  const buf = /^[0-9a-f]{64}$/i.test(raw)
    ? Buffer.from(raw, "hex")
    : Buffer.from(raw, "base64");
  return buf.length === 32 ? buf : null;
}

/** Ключ задан и правильной длины. */
export const credentialsConfigured = () => key() !== null;

export function encryptSecret(plain: string, projectId: string): string {
  const k = key();
  if (!k) throw new Error("CREDENTIALS_KEY не задан");
  const iv = randomBytes(12);
  const c = createCipheriv("aes-256-gcm", k, iv);
  c.setAAD(Buffer.from(projectId));
  const ct = Buffer.concat([c.update(plain, "utf8"), c.final()]);
  return PREFIX + Buffer.concat([iv, c.getAuthTag(), ct]).toString("base64");
}

export function decryptSecret(enc: string, projectId: string): string {
  const k = key();
  if (!k) throw new Error("CREDENTIALS_KEY не задан");
  if (!enc.startsWith(PREFIX)) throw new Error("Неизвестный формат");
  const buf = Buffer.from(enc.slice(PREFIX.length), "base64");
  const d = createDecipheriv("aes-256-gcm", k, buf.subarray(0, 12));
  d.setAAD(Buffer.from(projectId));
  d.setAuthTag(buf.subarray(12, 28));
  return Buffer.concat([d.update(buf.subarray(28)), d.final()]).toString("utf8");
}
