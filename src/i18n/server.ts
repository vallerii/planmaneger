import { cookies } from "next/headers";
import { DEFAULT_LANG, isLang, LANG_COOKIE, type Lang, makeI18n } from "./core";

export async function getLang(): Promise<Lang> {
  const v = (await cookies()).get(LANG_COOKIE)?.value;
  return isLang(v) ? v : DEFAULT_LANG;
}

export async function getI18n() {
  return makeI18n(await getLang());
}
