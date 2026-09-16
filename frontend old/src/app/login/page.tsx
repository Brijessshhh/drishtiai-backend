"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API_URL = "https://drishtiai-backend-mu35.onrender.com";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!email.trim() || !password) {
      setError("Please enter email and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      console.log("LOGIN RESPONSE:", data);

      if (!response.ok) {
        throw new Error(
          data?.detail || data?.message || "Invalid email or password."
        );
      }

      // Save token if backend provides one
      if (data?.access_token) {
        localStorage.setItem("drishtiai_token", data.access_token);
      }

      if (data?.token) {
        localStorage.setItem("drishtiai_token", data.token);
      }

      // Save username/name
      const userName =
        data?.user?.name ||
        data?.user?.full_name ||
        data?.name ||
        data?.full_name ||
        email.split("@")[0];

      localStorage.setItem("drishtiai_user_name", userName);

      // Login successful
      router.push("/dashboard");
      router.refresh();

    } catch (err) {
      console.error("LOGIN ERROR:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to sign in. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex items-center justify-center px-6">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0F766E] font-bold text-xl text-white">
              D
            </div>

            <div className="text-left">
              <p className="text-xl font-bold">DrishtiAI</p>
              <p className="text-xs text-[#64748B]">
                Retinal Intelligence Platform
              </p>
            </div>
          </Link>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-8 shadow-sm">

          <h1 className="text-2xl font-semibold">
            Welcome back
          </h1>

          <p className="mt-2 text-sm text-[#64748B]">
            Sign in to access your DrishtiAI workspace.
          </p>

          <form onSubmit={handleLogin} className="mt-7 space-y-5">

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                className="w-full rounded-lg border border-[#CBD5E1] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/10"
              />
            </div>

            {/* Password */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium"
                >
                  Password
                </label>

                <button
                  type="button"
                  onClick={() =>
                    setError("Please contact the administrator to reset your password.")
                  }
                  className="text-xs font-semibold text-[#0F766E] hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                className="w-full rounded-lg border border-[#CBD5E1] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/10"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#0F766E] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#115E59] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>

          </form>

          {/* Register */}
          <div className="mt-7 border-t border-[#E2E8F0] pt-6 text-center text-sm text-[#64748B]">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="font-semibold text-[#0F766E] hover:underline"
            >
              Create account
            </Link>
          </div>

        </div>

        <p className="mt-6 text-center text-xs leading-5 text-[#94A3B8]">
          DrishtiAI provides AI-assisted screening and
          does not replace professional medical diagnosis.
        </p>

      </div>
    </main>
  );
}