"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = "https://drishtiai-backend-mu35.onrender.com";

export default function Register() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [password, setPassword] = useState("");
  const [consent, setConsent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRegister(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!role) {
      setError("Please select your role.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (!consent) {
      setError("Please accept the screening disclaimer.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: fullName.trim(),
          email: email.trim().toLowerCase(),
          role,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Registration failed.");
      }

      router.push("/login?registered=true");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create your account."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-[#0F172A]">
      <div className="grid min-h-screen lg:grid-cols-2">
        <section className="hidden bg-[#0F172A] p-12 lg:flex lg:flex-col lg:justify-between xl:p-16">
          <Link href="/" className="flex items-center gap-3 text-white">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0F766E] font-semibold">
              D
            </div>
            <div>
              <p className="text-lg font-bold">DrishtiAI</p>
              <p className="text-xs text-[#94A3B8]">
                Retinal Intelligence Platform
              </p>
            </div>
          </Link>

          <div className="max-w-lg">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#5EEAD4]">
              Join DrishtiAI
            </p>

            <h1 className="mt-5 text-4xl font-semibold leading-tight text-white xl:text-5xl">
              Bring intelligent retinal screening into your workflow.
            </h1>

            <p className="mt-6 leading-7 text-[#94A3B8]">
              Create your workspace to analyze retinal images, manage patient
              assessments and review AI-assisted results.
            </p>

            <div className="mt-10 space-y-3">
              {[
                ["01", "AI-assisted retinal analysis"],
                ["02", "Structured patient history"],
                ["03", "Explainable AI with Grad-CAM"],
              ].map(([number, text]) => (
                <div
                  key={number}
                  className="flex items-center gap-3 border border-white/10 bg-white/5 p-4"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0F766E] text-sm text-white">
                    {number}
                  </div>
                  <p className="text-sm text-[#CBD5E1]">{text}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-[#64748B]">
            AI-assisted screening • Research & educational platform
          </p>
        </section>

        <section className="flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-md">
            <Link
              href="/"
              className="mb-10 inline-flex items-center gap-3 lg:hidden"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0F766E] font-semibold text-white">
                D
              </div>
              <div>
                <p className="font-bold">DrishtiAI</p>
                <p className="text-xs text-[#64748B]">
                  Retinal Intelligence Platform
                </p>
              </div>
            </Link>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#0F766E]">
                Get started
              </p>

              <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                Create your account
              </h2>

              <p className="mt-3 text-sm leading-6 text-[#64748B]">
                Set up your DrishtiAI workspace to begin managing retinal
                assessments.
              </p>
            </div>

            <form onSubmit={handleRegister} className="mt-8 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#334155]">
                  Full name
                </label>

                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  type="text"
                  placeholder="Enter your full name"
                  autoComplete="name"
                  className="w-full rounded-lg border border-[#CBD5E1] bg-white px-4 py-3 text-sm outline-none transition placeholder:text-[#94A3B8] focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#334155]">
                  Email address
                </label>

                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="w-full rounded-lg border border-[#CBD5E1] bg-white px-4 py-3 text-sm outline-none transition placeholder:text-[#94A3B8] focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#334155]">
                  Role
                </label>

                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full rounded-lg border border-[#CBD5E1] bg-white px-4 py-3 text-sm text-[#334155] outline-none transition focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/10"
                >
                  <option value="">Select your role</option>
                  <option value="Doctor">Doctor</option>
                  <option value="Ophthalmologist">Ophthalmologist</option>
                  <option value="Healthcare Professional">
                    Healthcare Professional
                  </option>
                  <option value="Researcher">Researcher</option>
                  <option value="Student">Student</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#334155]">
                  Password
                </label>

                <div className="relative">
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    autoComplete="new-password"
                    className="w-full rounded-lg border border-[#CBD5E1] bg-white px-4 py-3 pr-20 text-sm outline-none transition placeholder:text-[#94A3B8] focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/10"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#64748B] hover:text-[#0F766E]"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>

                <p className="mt-2 text-xs text-[#94A3B8]">
                  Minimum 8 characters
                </p>
              </div>

              <label className="flex items-start gap-3 pt-1 text-xs leading-5 text-[#64748B]">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-[#CBD5E1] accent-[#0F766E]"
                />

                <span>
                  I understand that DrishtiAI provides AI-assisted screening
                  and does not replace professional medical diagnosis.
                </span>
              </label>

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-[#0F766E] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#115E59] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Creating account..." : "Create account"}
              </button>
            </form>

            <p className="mt-7 text-center text-sm text-[#64748B]">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-[#0F766E] hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}