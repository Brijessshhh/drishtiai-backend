"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [name, setName] = useState("there");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const token = localStorage.getItem("drishtiai_token");

      // No login session
      if (!token) {
        window.location.replace("/");
        return;
      }

      const storedUser = localStorage.getItem("drishtiai_user");

      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);

          const userName =
            user?.name ||
            user?.full_name ||
            user?.username ||
            user?.email ||
            "there";

          setName(userName);
        } catch {
          // Ignore invalid user data
        }
      } else {
        const oldName =
          localStorage.getItem("drishtiai_user_name");

        if (oldName) {
          setName(oldName);
        }
      }

      setReady(true);
    } catch (error) {
      console.error("Session error:", error);
      window.location.replace("/");
    }
  }, []);

  function signOut() {
    // Clear ALL authentication/session data
    localStorage.removeItem("drishtiai_token");
    localStorage.removeItem("drishtiai_user");
    localStorage.removeItem("drishtiai_user_name");

    // Clear temporary patient/result data
    localStorage.removeItem("drishtiai_current_patient");
    localStorage.removeItem("drishtiai_latest_result");

    // Go back to login
    window.location.replace("/");
  }

  if (!ready) {
    return (
      <main className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <p className="text-sm text-[#64748B]">
          Loading DrishtiAI...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-[#0F172A]">

      {/* NAVBAR */}
      <header className="border-b border-[#E2E8F0] bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">

          <Link
            href="/dashboard"
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0F766E] font-bold text-white">
              D
            </div>

            <div>
              <p className="font-bold">
                DrishtiAI
              </p>

              <p className="text-xs text-[#64748B]">
                Retinal Intelligence Platform
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-4">

            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold">
                {name}
              </p>

              <p className="text-xs text-[#64748B]">
                Healthcare Professional
              </p>
            </div>

            <button
              type="button"
              onClick={signOut}
              className="rounded-lg border border-[#CBD5E1] bg-white px-4 py-2.5 text-sm font-medium text-[#334155] hover:border-[#0F766E] hover:text-[#0F766E]"
            >
              Sign out
            </button>

          </div>
        </div>
      </header>

      {/* CONTENT */}
      <div className="mx-auto max-w-6xl px-6 py-12">

        {/* INTRO */}
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0F766E]">
            Workspace
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            Good to see you, {name}.
          </h1>

          <p className="mt-2 text-sm text-[#64748B]">
            Start a retinal assessment or review
            previous patient records.
          </p>
        </div>

        {/* MAIN CARDS */}
        <div className="mt-9 grid gap-5 md:grid-cols-3">

          {/* NEW ANALYSIS */}
          <Link
            href="/patients/new"
            className="group rounded-2xl bg-[#0F766E] p-7 text-white transition hover:-translate-y-1 hover:bg-[#115E59] hover:shadow-lg"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/10 text-2xl">
                +
              </div>

              <span className="text-2xl transition group-hover:translate-x-1">
                →
              </span>
            </div>

            <h2 className="mt-8 text-xl font-semibold">
              New Retinal Analysis
            </h2>

            <p className="mt-3 text-sm leading-6 text-white/80">
              Create a patient record and upload a
              fundus image for AI-assisted diabetic
              retinopathy screening.
            </p>
          </Link>

          {/* PATIENT HISTORY */}
          <Link
            href="/patient-history"
            className="group rounded-2xl border border-[#E2E8F0] bg-white p-7 transition hover:-translate-y-1 hover:border-[#0F766E] hover:shadow-lg"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#F0FDFA] text-xl text-[#0F766E]">
              ◷
            </div>

            <h2 className="mt-8 text-xl font-semibold">
              Patient History
            </h2>

            <p className="mt-3 text-sm leading-6 text-[#64748B]">
              Review previous retinal assessments,
              patient records, grades, severity and
              screening results.
            </p>

            <div className="mt-6 flex items-center text-sm font-semibold text-[#0F766E]">
              View patient records
              <span className="ml-2 transition group-hover:translate-x-1">
                →
              </span>
            </div>
          </Link>

          {/* AI SCREENING */}
          <Link
            href="/analysis"
            className="group rounded-2xl border border-[#E2E8F0] bg-white p-7 transition hover:-translate-y-1 hover:border-[#0F766E] hover:shadow-lg"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#F8FAFC] text-xl text-[#334155]">
              ✓
            </div>

            <h2 className="mt-8 text-xl font-semibold">
              AI Screening
            </h2>

            <p className="mt-3 text-sm leading-6 text-[#64748B]">
              Analyze retinal images with severity
              classification, confidence score and
              explainable AI visualization.
            </p>

            <div className="mt-6 flex items-center text-sm font-semibold text-[#0F766E]">
              Open screening
              <span className="ml-2 transition group-hover:translate-x-1">
                →
              </span>
            </div>
          </Link>

        </div>

        {/* QUICK START */}
        <section className="mt-9 rounded-2xl border border-[#E2E8F0] bg-white p-7">

          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#64748B]">
                Quick Start
              </p>

              <h2 className="mt-2 text-lg font-semibold">
                Begin a retinal assessment
              </h2>

              <p className="mt-2 text-sm text-[#64748B]">
                Create a patient profile and upload a
                clear fundus photograph for AI-assisted
                screening.
              </p>
            </div>

            <Link
              href="/patients/new"
              className="shrink-0 rounded-lg bg-[#0F766E] px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#115E59]"
            >
              Start Analysis →
            </Link>

          </div>
        </section>

        {/* FOOTER */}
        <p className="mt-10 text-center text-xs leading-5 text-[#94A3B8]">
          DrishtiAI is an AI-assisted screening platform
          and does not replace professional medical
          diagnosis.
        </p>

      </div>
    </main>
  );
}