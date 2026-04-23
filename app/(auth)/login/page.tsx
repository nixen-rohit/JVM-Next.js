"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion, type Variants } from "framer-motion";
import {
  Lock,
  Mail,
  RotateCw ,
  ArrowRight,
  Eye,
  EyeOff,
  X,
} from "lucide-react";

type LoginForm = {
  email: string;
  password: string;
};

type ApiErrorResponse = {
  error?: string;
  message?: string;
};

export default function AdminLoginPage() {
  const [form, setForm] = useState<LoginForm>({
    email: "",
    password: "",
  });
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const router = useRouter();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data: ApiErrorResponse = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || data.message || "Login failed"
        );
      }

      router.push("/admin");
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "An unexpected error occurred";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants: Variants = {
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: {
      opacity: 0,
      y: 20,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-linear-to-r from-zinc-950 via-zinc-900 to-emerald-950/30 px-4">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-40 -top-40 h-80 w-80 animate-pulse rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 animate-pulse rounded-full bg-emerald-600/10 blur-3xl delay-1000" />
        <div className="absolute left-1/2 top-1/2 h-150 w-150 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/5 blur-3xl" />

        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(16,185,129,0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(16,185,129,0.3) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Card */}
      <motion.div
        initial={{
          opacity: 0,
          scale: 0.95,
        }}
        animate={{
          opacity: 1,
          scale: 1,
        }}
        transition={{
          duration: 0.5,
          ease: "easeOut",
        }}
        className="relative w-full max-w-md"
      >
        <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-zinc-900/80 shadow-2xl shadow-emerald-900/20 backdrop-blur-xl">
          <div className="h-1 bg-linear-to-r from-transparent via-emerald-500 to-transparent" />

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="p-8 md:p-10"
          >
            {/* Header */}
            <motion.div
              variants={itemVariants}
              className="mb-8 text-center"
            >
              <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10">
                <Lock className="h-7 w-7 text-emerald-400" />
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
                Admin Portal
              </h1>

              <p className="mt-2 text-sm text-zinc-400">
                Restricted access • Authorized personnel only
              </p>
            </motion.div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: -10,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4"
              >
                <span className="flex-1 text-sm text-red-400">
                  {error}
                </span>

                <button
                  type="button"
                  onClick={() => setError("")}
                  className="text-red-400/70 transition hover:text-red-300"
                  aria-label="Dismiss error"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            )}

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              {/* Email */}
              <motion.div
                variants={itemVariants}
                className="relative"
              >
                <label
                  htmlFor="email"
                  className="sr-only"
                >
                  Admin Email
                </label>

                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                  <Mail className="h-5 w-5" />
                </div>

                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  autoComplete="username"
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-800/50 py-3.5 pl-12 pr-4 text-white placeholder-zinc-500 transition-all duration-200 focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </motion.div>

              {/* Password */}
              <motion.div
                variants={itemVariants}
                className="relative"
              >
                <label
                  htmlFor="password"
                  className="sr-only"
                >
                  Password
                </label>

                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                  <Lock className="h-5 w-5" />
                </div>

                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-800/50 py-3.5 pl-12 pr-12 text-white placeholder-zinc-500 transition-all duration-200 focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((prev) => !prev)
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 transition  "
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </motion.div>

              {/* Submit */}
              <motion.div variants={itemVariants}>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full overflow-hidden rounded-xl bg-linear-to-r from-emerald-600 to-emerald-500 px-6 py-3.5 font-medium text-white shadow-lg shadow-emerald-900/30 transition-all duration-300 hover:from-emerald-500 hover:to-emerald-400 hover:shadow-emerald-900/50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        
                        
                         <RotateCw   className="h-5 w-5 animate-spin"/>
                        Authenticating...
                      </>
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </span>

                  <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                </button>
              </motion.div>
            </form>

            {/* Footer */}
            <motion.div
              variants={itemVariants}
              className="mt-8 border-t border-zinc-800 pt-6 text-center"
            >
              <p className="text-xs text-zinc-500">
                Secured with end-to-end encryption 
              </p>
            </motion.div>
          </motion.div>
        </div>

        <div className="absolute -inset-1 -z-10 rounded-2xl bg-linear-to-r from-emerald-500/20 to-emerald-600/20 blur-xl opacity-50" />
      </motion.div>
    </div>
  );
}