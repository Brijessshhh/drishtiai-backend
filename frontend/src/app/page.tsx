"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function LandingPage() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setLoggedIn(Boolean(localStorage.getItem("drishtiai_token")));
  }, []);

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-[#0F172A]">

      {/* NAVBAR */}
      <header className="border-b border-[#E2E8F0] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0F766E] text-lg font-bold text-white">
              D
            </div>

            <div>
              <p className="font-bold text-lg">DrishtiAI</p>
              <p className="text-xs text-[#64748B]">
                Retinal Intelligence Platform
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            {loggedIn ? (
              <Link
                href="/dashboard"
                className="rounded-lg bg-[#0F766E] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#115E59]"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-lg px-4 py-2.5 text-sm font-semibold text-[#334155] hover:text-[#0F766E]"
                >
                  Sign in
                </Link>

                <Link
                  href="/register"
                  className="rounded-lg bg-[#0F766E] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#115E59]"
                >
                  Get started
                </Link>
              </>
            )}
          </div>

        </div>
      </header>

      {/* HERO */}
      <section className="border-b border-[#E2E8F0] bg-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-2 lg:items-center lg:py-28">

          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#0F766E]">
              AI-assisted retinal screening
            </p>

            <h1 className="mt-5 max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Smarter retinal screening with{" "}
              <span className="text-[#0F766E]">
                explainable AI.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-[#64748B] sm:text-lg">
              DrishtiAI analyzes retinal fundus images to assist
              diabetic retinopathy screening, classify severity,
              and provide explainable AI visualization.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href={loggedIn ? "/dashboard" : "/login"}
                className="rounded-lg bg-[#0F766E] px-6 py-3.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-[#115E59]"
              >
                {loggedIn
                  ? "Open Dashboard →"
                  : "Start Screening →"}
              </Link>

              {!loggedIn && (
                <Link
                  href="/register"
                  className="rounded-lg border border-[#CBD5E1] bg-white px-6 py-3.5 text-center text-sm font-semibold text-[#334155] hover:border-[#0F766E] hover:text-[#0F766E]"
                >
                  Create account
                </Link>
              )}
            </div>

            <p className="mt-5 text-xs text-[#94A3B8]">
              AI-assisted screening tool — not a replacement
              for professional diagnosis.
            </p>
          </div>

          {/* HERO VISUAL */}
          <div className="relative">
            <div className="rounded-3xl border border-[#DDE5E7] bg-[#F8FAFC] p-5 shadow-sm">

              <div className="rounded-2xl bg-white p-6 shadow-sm">

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#0F766E]">
                      Screening Overview
                    </p>

                    <p className="mt-1 text-lg font-semibold">
                      Retinal Analysis
                    </p>
                  </div>

                  <div className="rounded-full bg-[#ECFDF5] px-3 py-1 text-xs font-bold text-[#047857]">
                    AI Ready
                  </div>
                </div>

                <div className="mt-7 grid grid-cols-2 gap-4">

                  <div className="rounded-xl border border-[#E2E8F0] p-5">
                    <p className="text-xs text-[#64748B]">
                      DR Grade
                    </p>

                    <p className="mt-2 text-3xl font-bold text-[#0F766E]">
                      2
                    </p>

                    <p className="mt-1 text-xs text-[#64748B]">
                      Moderate
                    </p>
                  </div>

                  <div className="rounded-xl border border-[#E2E8F0] p-5">
                    <p className="text-xs text-[#64748B]">
                      Confidence
                    </p>

                    <p className="mt-2 text-3xl font-bold">
                      61.8%
                    </p>

                    <p className="mt-1 text-xs text-[#64748B]">
                      Model confidence
                    </p>
                  </div>

                </div>

                <div className="mt-4 rounded-xl border border-[#E2E8F0] p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">
                      Explainable AI
                    </p>

                    <span className="text-xs font-semibold text-[#0F766E]">
                      Grad-CAM
                    </span>
                  </div>

                  <div className="mt-4 flex h-28 items-center justify-center rounded-lg bg-[#0F172A]">
                    <div className="h-16 w-16 rounded-full bg-[#0F766E]/80 blur-xl" />
                    <div className="absolute h-10 w-10 rounded-full bg-[#F59E0B]/70 blur-md" />
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-7xl px-6 py-20">

        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0F766E]">
            Platform
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight">
            Everything needed for an AI-assisted screening workflow.
          </h2>

          <p className="mt-4 text-sm leading-6 text-[#64748B]">
            From patient registration to retinal analysis and
            report generation, DrishtiAI keeps the workflow in
            one place.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">

          <FeatureCard
            icon="+"
            title="Patient Management"
            text="Create patient profiles and maintain assessment records for future review."
          />

          <FeatureCard
            icon="✓"
            title="AI Screening"
            text="Analyze retinal fundus images and classify diabetic retinopathy severity."
          />

          <FeatureCard
            icon="◉"
            title="Explainable Results"
            text="View model confidence and Grad-CAM visualization alongside screening results."
          />

        </div>
      </section>

      {/* WORKFLOW */}
      <section className="border-y border-[#E2E8F0] bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20">

          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0F766E]">
              Simple workflow
            </p>

            <h2 className="mt-3 text-3xl font-bold">
              From image to screening report
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-4">

            <Step number="01" title="Login">
              Securely access your screening workspace.
            </Step>

            <Step number="02" title="Patient">
              Create or select a patient record.
            </Step>

            <Step number="03" title="Analyze">
              Upload a retinal fundus image for AI analysis.
            </Step>

            <Step number="04" title="Result">
              Review severity, confidence and explainability.
            </Step>

          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="rounded-3xl bg-[#0F766E] px-8 py-12 text-center text-white sm:px-12">

          <h2 className="text-3xl font-bold">
            Begin your retinal screening workflow
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-white/80">
            Create a patient record, upload a fundus image and
            generate an AI-assisted screening report.
          </p>

          <Link
            href={loggedIn ? "/dashboard" : "/login"}
            className="mt-7 inline-flex rounded-lg bg-white px-6 py-3.5 text-sm font-semibold text-[#0F766E] hover:bg-[#F8FAFC]"
          >
            {loggedIn
              ? "Open Dashboard →"
              : "Start Screening →"}
          </Link>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#E2E8F0] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-8 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">

          <div>
            <p className="font-bold">
              DrishtiAI
            </p>

            <p className="text-xs text-[#94A3B8]">
              AI-Powered Retinal Care
            </p>
          </div>

          <p className="max-w-lg text-xs leading-5 text-[#94A3B8]">
            DrishtiAI is an AI-assisted screening platform and
            does not replace examination, diagnosis or treatment
            by a qualified healthcare professional.
          </p>

        </div>
      </footer>

    </main>
  );
}

function FeatureCard({
  icon,
  title,
  text,
}: {
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:border-[#0F766E] hover:shadow-md">

      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F0FDFA] text-xl font-bold text-[#0F766E]">
        {icon}
      </div>

      <h3 className="mt-6 text-lg font-semibold">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-6 text-[#64748B]">
        {text}
      </p>

    </div>
  );
}

function Step({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-6">

      <p className="text-xs font-bold tracking-widest text-[#0F766E]">
        {number}
      </p>

      <h3 className="mt-4 font-semibold">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-[#64748B]">
        {children}
      </p>

    </div>
  );
}