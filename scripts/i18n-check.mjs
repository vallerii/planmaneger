// Проверка словарей интерфейса: какие русские строки из t("…") / rich("…") / tp(…)
// есть в коде, но нет в src/i18n/en.ts или de.ts.
// Запуск: node scripts/i18n-check.mjs
// Строки-константы (label: "…" в lib/*.ts) выводятся через t() в компонентах —
// их скрипт не видит; при добавлении новых подписей проверьте их вручную.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const walk = (d) =>
  readdirSync(d).flatMap((f) => {
    const p = join(d, f);
    return statSync(p).isDirectory() ? walk(p) : /\.tsx?$/.test(p) ? [p] : [];
  });

const dictKeys = (file) => {
  const src = readFileSync(file, "utf8");
  const keys = new Set();
  for (const m of src.matchAll(/^ {2}("(?:[^"\\]|\\.)*"):\s*$/gm))
    keys.add(JSON.parse(m[1]));
  return keys;
};

const en = dictKeys("src/i18n/en.ts");
const de = dictKeys("src/i18n/de.ts");
const used = new Map();
const CY = /[А-Яа-яЁё]/;
for (const file of walk("src")) {
  if (file.includes(`${join("src", "i18n")}`)) continue;
  const src = readFileSync(file, "utf8");
  const re = /\b(?:t|tr|rich)\(\s*("(?:[^"\\\n]|\\.)*")|\btp\([^,]+,((?:\s*"(?:[^"\\\n]|\\.)*",?){3})/g;
  for (const m of src.matchAll(re)) {
    const strs = m[1] ? [m[1]] : [...m[2].matchAll(/"(?:[^"\\\n]|\\.)*"/g)].map((x) => x[0]);
    for (const s of strs) {
      const k = JSON.parse(s);
      if (CY.test(k) && !used.has(k)) used.set(k, file);
    }
  }
}

let missing = 0;
for (const [k, file] of used) {
  const lack = [!en.has(k) && "en", !de.has(k) && "de"].filter(Boolean);
  if (lack.length) {
    missing++;
    console.log(`[${lack.join(",")}] ${JSON.stringify(k)}  ← ${file}`);
  }
}
console.log(
  missing ? `\nНет перевода: ${missing}` : `OK: ${used.size} строк переведены на en и de`,
);
process.exit(missing ? 1 : 0);
