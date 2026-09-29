"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useTransition,
} from "react";
import { DEFAULT_LANG, LANG_COOKIE, type Lang, makeI18n } from "./core";

type Ctx = ReturnType<typeof makeI18n> & {
  setLang: (l: Lang) => void;
  pending: boolean;
};

const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({
  lang: initial,
  children,
}: {
  lang: Lang;
  children: React.ReactNode;
}) {
  const [lang, setState] = useState<Lang>(initial);
  const [seen, setSeen] = useState<Lang>(initial);
  // пришёл новый язык с сервера (после refresh)
  if (initial !== seen) {
    setSeen(initial);
    setState(initial);
  }
  const router = useRouter();
  const [pending, start] = useTransition();
  const setLang = useCallback(
    (l: Lang) => {
      document.cookie = `${LANG_COOKIE}=${l}; path=/; max-age=31536000; samesite=lax`;
      document.documentElement.lang = l;
      setState(l);
      start(() => router.refresh());
    },
    [router],
  );
  const value = useMemo(
    () => ({ ...makeI18n(lang), setLang, pending }),
    [lang, setLang, pending],
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

const fallback = { ...makeI18n(DEFAULT_LANG), setLang: () => {}, pending: false };

export function useI18n(): Ctx {
  return useContext(I18nContext) ?? fallback;
}

export const useT = () => useI18n().t;
