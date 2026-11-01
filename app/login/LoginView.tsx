"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { Brand } from "@/components/layout/Brand";
import { CarShowcase } from "@/components/three/CarShowcase";
import { Button } from "@/components/ui/Button";
import { ApiClientError, apiMutate } from "@/lib/api-client";
import type { SessionUser } from "@/lib/types";

export function LoginView({ from }: { from: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Enter your email and password to continue.");
      return;
    }

    setPending(true);
    try {
      await apiMutate<SessionUser>("/api/auth/login", "POST", {
        email: email.trim(),
        password,
      });
      router.replace(from);
      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof ApiClientError
          ? caught.message
          : "Unable to sign in. Check your connection and try again."
      );
      setPending(false);
    }
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-[1.12fr_0.88fr]">
      <section className="relative hidden min-h-screen overflow-hidden border-r border-line/80 bg-[#080a0d] lg:flex lg:flex-col">
        <div className="absolute inset-0 grid-bg opacity-25" />
        <div className="absolute inset-0 bg-[radial-gradient(780px_540px_at_50%_38%,rgba(240,68,56,0.14),transparent_65%)]" />
        <div className="relative z-10 flex items-center justify-between px-9 pt-8">
          <Brand />
          <span className="rounded-full border border-line bg-panel/70 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted backdrop-blur">
            Business OS · 2026
          </span>
        </div>

        <div className="relative min-h-0 flex-1">
          <CarShowcase className="absolute inset-0" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#080a0d] to-transparent" />
        </div>

        <div className="relative z-10 px-9 pb-9">
          <p className="max-w-[460px] text-[22px] font-bold leading-[1.25] tracking-[-0.03em] text-ink">
            One command centre for the entire workshop.
          </p>
          <p className="mt-2 max-w-[430px] text-xs leading-relaxed text-muted">
            Leads, restoration jobs, quotes, parts, store orders and customer
            updates — engineered into a single operations cockpit.
          </p>
          <div className="mt-6 grid max-w-[470px] grid-cols-3 gap-3 border-t border-line/80 pt-5">
            {[
              ["12", "Workshop bays"],
              ["98.2%", "On-time delivery"],
              ["1", "Unified OS"],
            ].map(([value, label]) => (
              <div key={label}>
                <div className="text-lg font-bold tracking-[-0.03em] text-ink">
                  {value}
                </div>
                <div className="mt-0.5 text-[10px] text-muted">{label}</div>
              </div>
            ))}
          </div>
          <p className="mt-6 text-[10px] text-[#5f6b79]">
            Prototype crafted by Furqan Khan
          </p>
        </div>
      </section>

      <section className="relative flex min-h-screen flex-col">
        <div className="flex items-center justify-between px-5 pt-6 lg:hidden">
          <Brand />
          <span className="text-[10px] uppercase tracking-[0.16em] text-muted">
            Admin access
          </span>
        </div>

        <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-[370px]"
          >
            <div className="mb-8 hidden lg:block">
              <Brand />
            </div>

            <div className="eyebrow">Secure admin access</div>
            <h1 className="mt-2 text-[30px] font-bold leading-tight tracking-[-0.04em] text-ink">
              Welcome back
            </h1>
            <p className="mt-2 text-xs leading-relaxed text-muted">
              Sign in to manage the AutoForge command centre. Sessions are
              protected with signed, HttpOnly cookies.
            </p>

            <form onSubmit={onSubmit} className="mt-7 space-y-4" noValidate>
              <div>
                <label className="label" htmlFor="email">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5f6b79]" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="username"
                    inputMode="email"
                    className="input pl-9"
                    placeholder="admin@autoforge.local"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    disabled={pending}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5f6b79]" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    className="input px-9"
                    placeholder="••••••••••"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    disabled={pending}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-2.5 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-md text-[#7f8b99] transition-colors hover:bg-panel2 hover:text-ink"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {error ? (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  role="alert"
                  className="rounded-lg border border-[#5c2b29] bg-[#241716] px-3 py-2.5 text-[11px] leading-relaxed text-[#ffb3ad]"
                >
                  {error}
                </motion.p>
              ) : null}

              <Button
                type="submit"
                variant="primary"
                className="h-10 w-full"
                loading={pending}
              >
                {pending ? "Signing in" : "Enter command centre"}
                {!pending ? <ArrowRight className="h-4 w-4" /> : null}
              </Button>
            </form>

            <div className="mt-6 rounded-lg border border-line/70 bg-panel2/45 px-3.5 py-3">
              <p className="text-[10px] leading-relaxed text-muted">
                Access is restricted to seeded administrators. If you have not
                initialised the database, run{" "}
                <code className="rounded bg-[#0e1217] px-1 py-0.5 font-mono text-[10px] text-ink">
                  npm run seed
                </code>{" "}
                using the credentials in your environment file.
              </p>
            </div>

            <p className="mt-7 text-center text-[10px] text-[#5f6b79]">
              AutoForge · Automotive Business Prototype
            </p>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
