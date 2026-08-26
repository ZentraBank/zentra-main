"use client";

import {
  FormEvent,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import { ApiError } from "@/src/lib/api-error";
import { usePlatformAuth } from "@/src/context/platform-auth-context";

export function LoginForm() {
  const router = useRouter();

  const { login } = usePlatformAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError(null);
    setIsSubmitting(true);

    try {
      await login({
        email: email.trim().toLowerCase(),
        password,
        deviceName:
          typeof navigator !== "undefined"
            ? navigator.userAgent
            : undefined,
      });

      router.replace("/dashboard");
      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.message
          : caught instanceof Error
            ? caught.message
            : "Unable to sign in."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-sm font-medium"
        >
          Email address
        </label>

        <input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) =>
            setEmail(event.target.value)
          }
          required
          disabled={isSubmitting}
          className="h-12 w-full rounded-xl border border-white/15 bg-white/5 px-4 outline-none transition focus:border-white/40 disabled:cursor-not-allowed disabled:opacity-60"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-2 block text-sm font-medium"
        >
          Password
        </label>

        <input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) =>
            setPassword(event.target.value)
          }
          required
          disabled={isSubmitting}
          className="h-12 w-full rounded-xl border border-white/15 bg-white/5 px-4 outline-none transition focus:border-white/40 disabled:cursor-not-allowed disabled:opacity-60"
        />
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-300"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="h-12 w-full rounded-xl bg-white font-semibold text-black transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting
          ? "Signing in…"
          : "Sign in"}
      </button>
    </form>
  );
}