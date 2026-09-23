"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Brand, Btn, Field, inputCls } from "@/components/ui";

// Вход через Google временно скрыт. Чтобы включить — настройте провайдера в Supabase и поставьте true.
const GOOGLE_ENABLED = false;

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/";
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    params.get("error") ? "Не удалось войти. Попробуйте ещё раз." : null,
  );
  const [info, setInfo] = useState<string | null>(null);

  const supabase = createClient();
  const callback = () =>
    `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      setLoading(false);
      if (error)
        return setError(
          error.message === "Invalid login credentials"
            ? "Неверный email или пароль"
            : error.message,
        );
      router.replace(next);
      router.refresh();
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name }, emailRedirectTo: callback() },
      });
      setLoading(false);
      if (error) return setError(error.message);
      if (data.session) {
        router.replace(next);
        router.refresh();
      } else {
        setInfo(
          "Мы отправили письмо для подтверждения. Перейдите по ссылке из письма, чтобы войти.",
        );
      }
    }
  }

  async function google() {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callback() },
    });
    if (error) setError(error.message);
  }

  return (
    <div className="w-full max-w-[420px] rounded-[18px] border border-line bg-white p-6 shadow-soft">
      <Brand />
      <h1 className="mt-5 text-2xl font-extrabold tracking-tight">
        {mode === "signin" ? "Вход" : "Регистрация"}
      </h1>
      <p className="mt-1 text-muted">
        Планирование проектов по фазам и задачам
      </p>

      {GOOGLE_ENABLED && (
        <>
          <Btn type="button" onClick={google} className="mt-5 w-full py-2.5">
            <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
              <path
                fill="#FFC107"
                d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"
              />
              <path
                fill="#FF3D00"
                d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
              />
              <path
                fill="#4CAF50"
                d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"
              />
              <path
                fill="#1976D2"
                d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"
              />
            </svg>
            Продолжить с Google
          </Btn>

          <div className="my-4 flex items-center gap-3 text-xs text-muted">
            <span className="h-px flex-1 bg-line" /> или по email{" "}
            <span className="h-px flex-1 bg-line" />
          </div>
        </>
      )}
      {!GOOGLE_ENABLED && <div className="mt-5" />}

      <form onSubmit={submit}>
        {mode === "signup" && (
          <Field label="Имя">
            <input
              className={inputCls}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Как вас называть"
            />
          </Field>
        )}
        <Field label="Email">
          <input
            className={inputCls}
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </Field>
        <Field label="Пароль">
          <input
            className={inputCls}
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={
              mode === "signin" ? "current-password" : "new-password"
            }
          />
        </Field>
        {error && (
          <p className="mt-2 rounded-lg bg-[#fff0ed] px-3 py-2 text-sm text-bad">
            {error}
          </p>
        )}
        {info && (
          <p className="mt-2 rounded-lg bg-[#e8f5ef] px-3 py-2 text-sm text-ok">
            {info}
          </p>
        )}
        <Btn
          type="submit"
          variant="primary"
          disabled={loading}
          className="mt-4 w-full py-2.5"
        >
          {loading ? "…" : mode === "signin" ? "Войти" : "Создать аккаунт"}
        </Btn>
      </form>

      <p className="mt-4 text-center text-sm text-muted">
        {mode === "signin" ? "Нет аккаунта?" : "Уже есть аккаунт?"}{" "}
        <button
          className="font-bold text-ink underline"
          onClick={() => {
            setMode(mode === "signin" ? "signup" : "signin");
            setError(null);
            setInfo(null);
          }}
        >
          {mode === "signin" ? "Зарегистрироваться" : "Войти"}
        </button>
      </p>
    </div>
  );
}
