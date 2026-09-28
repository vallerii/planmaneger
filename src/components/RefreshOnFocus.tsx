"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Обновить серверные данные страницы при возврате на вкладку и раз в минуту. */
export default function RefreshOnFocus({ every = 60_000 }: { every?: number }) {
  const router = useRouter();
  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === "visible") router.refresh();
    };
    const iv = setInterval(refresh, every);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      clearInterval(iv);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [router, every]);
  return null;
}
