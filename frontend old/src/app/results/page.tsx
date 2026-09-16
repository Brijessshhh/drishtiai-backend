"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Patient = {
  id: number;
  patient_code?: string;
  name: string;
  age: number;
  gender: string;
};

type Result = {
  success?: boolean;
  filename?: string;
  grade: number;
  severity: string;
  confidence: number;
  gradcam_image?: string;
};

export default function ResultsPage() {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [originalImage, setOriginalImage] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    try {
      const storedPatient = localStorage.getItem(
        "drishtiai_current_patient"
      );

      const storedResult = localStorage.getItem(
        "drishtiai_latest_result"
      );

      const storedImage = localStorage.getItem(
        "drishtiai_original_image"
      );

      if (storedPatient) {
        setPatient(JSON.parse(storedPatient));
      }

      if (storedResult) {
        setResult(JSON.parse(storedResult));
      }

      if (storedImage) {
        setOriginalImage(storedImage);
      }

      setDate(
        new Date().toLocaleString("en-IN", {
          dateStyle: "medium",
          timeStyle: "short",
        })
      );
    } catch (error) {
      console.error(
        "Unable to load report:",
        error
      );
    }
  }, []);

  function printReport() {
    window.print();
  }

  function goBack() {
    window.history.back();
  }

  if (!patient || !result) {
    return (
      <main className="min-h-screen bg-[#F8FAFC] text-[#0F172A]">

        <header className="border-b border-[#E2E8F0] bg-white print:hidden">
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

          </div>
        </header>

        <div className="mx-auto max-w-xl px-6 py-20 text-center">

          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-10 shadow-sm">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F1F5F9] text-xl">
              !
            </div>

            <h1 className="mt-5 text-xl font-semibold">
              Report unavailable
            </h1>

            <p className="mt-2 text-sm leading-6 text-[#64748B]">
              No completed assessment was found.
              Please perform an analysis first.
            </p>

            <Link
              href="/patients/new"
              className="mt-6 inline-flex rounded-lg bg-[#0F766E] px-5 py-3 text-sm font-semibold text-white hover:bg-[#115E59]"
            >
              Start New Analysis →
            </Link>

          </div>

        </div>
      </main>
    );
  }

  const confidence = Math.min(
    Math.max(Number(result.confidence) || 0, 0),
    100
  );

  const grade = Number(result.grade);

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-[#0F172A]">

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <header className="border-b border-[#E2E8F0] bg-white print:hidden">

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

          <div className="flex items-center gap-3">

            <button
              onClick={goBack}
              className="rounded-lg border border-[#CBD5E1] bg-white px-4 py-2.5 text-sm font-medium text-[#475569] hover:border-[#0F766E] hover:text-[#0F766E]"
            >
              ← Back
            </button>

            <button
              onClick={printReport}
              className="rounded-lg bg-[#0F766E] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#115E59]"
            >
              Print / Save PDF
            </button>

          </div>

        </div>

      </header>

      {/* =====================================================
          REPORT
      ===================================================== */}

      <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8">

        {/* REPORT HEADER */}

        <section className="rounded-2xl border border-[#DDE5E7] bg-white p-7 shadow-sm">

          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">

            <div>

              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0F766E]">
                DrishtiAI Clinical Screening
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight">
                Retinal Analysis Report
              </h1>

              <p className="mt-2 text-sm text-[#64748B]">
                AI-assisted diabetic retinopathy
                screening report
              </p>

            </div>

            <div className="sm:text-right">

              <span className="inline-flex rounded-full bg-[#ECFDF5] px-3 py-1.5 text-xs font-bold text-[#047857]">
                ✓ Analysis Completed
              </span>

              {date && (
                <p className="mt-3 text-xs text-[#94A3B8]">
                  {date}
                </p>
              )}

            </div>

          </div>

        </section>

        {/* =====================================================
            PATIENT INFORMATION
        ===================================================== */}

        <section className="mt-5 overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">

          <div className="border-b border-[#E2E8F0] px-6 py-4">

            <h2 className="font-semibold">
              Patient Information
            </h2>

          </div>

          <div className="grid gap-6 p-6 sm:grid-cols-4">

            <div>
              <p className="text-xs text-[#64748B]">
                Patient Name
              </p>

              <p className="mt-1 font-semibold">
                {patient.name}
              </p>
            </div>

            <div>
              <p className="text-xs text-[#64748B]">
                Patient ID
              </p>

              <p className="mt-1 break-all font-semibold">
                {patient.patient_code ||
                  `DR-${patient.id}`}
              </p>
            </div>

            <div>
              <p className="text-xs text-[#64748B]">
                Age
              </p>

              <p className="mt-1 font-semibold">
                {patient.age} years
              </p>
            </div>

            <div>
              <p className="text-xs text-[#64748B]">
                Gender
              </p>

              <p className="mt-1 font-semibold">
                {patient.gender}
              </p>
            </div>

          </div>

        </section>

        {/* =====================================================
            SCREENING RESULT
        ===================================================== */}

        <section className="mt-5 rounded-2xl border border-[#BFEDE5] bg-white p-7 shadow-sm">

          <div className="grid gap-8 md:grid-cols-3 md:items-center">

            <div className="md:col-span-2">

              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#0F766E]">
                Screening Result
              </p>

              <h2 className="mt-2 text-4xl font-bold">
                {result.severity}
              </h2>

              <p className="mt-2 text-sm text-[#64748B]">
                {grade === 0
                  ? "No diabetic retinopathy detected"
                  : "Retinal changes detected"}
              </p>

            </div>

            <div className="flex justify-start md:justify-end">

              <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full border-[7px] border-[#CCFBF1] bg-[#F0FDFA]">

                <span className="text-3xl font-bold text-[#0F766E]">
                  {grade}
                </span>

                <span className="mt-1 text-[10px] font-bold uppercase tracking-wide text-[#64748B]">
                  DR Grade
                </span>

              </div>

            </div>

          </div>

        </section>

        {/* =====================================================
            METRICS
        ===================================================== */}

        <section className="mt-5 grid gap-5 sm:grid-cols-2">

          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">

            <p className="text-xs text-[#64748B]">
              DR Grade
            </p>

            <p className="mt-2 text-3xl font-bold">
              {grade}
            </p>

            <p className="mt-1 text-xs text-[#94A3B8]">
              Model classification
            </p>

          </div>

          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-xs text-[#64748B]">
                  Model Confidence
                </p>

                <p className="mt-2 text-3xl font-bold text-[#0F766E]">
                  {confidence.toFixed(2)}%
                </p>
              </div>

              <div className="text-2xl">
                ✓
              </div>

            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#E2E8F0]">

              <div
                className="h-full rounded-full bg-[#0F766E]"
                style={{
                  width: `${confidence}%`,
                }}
              />

            </div>

          </div>

        </section>

        {/* =====================================================
            IMAGE + GRAD CAM
        ===================================================== */}

        <section className="mt-5 rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">

          <div className="mb-5">

            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#64748B]">
              Visual Analysis
            </p>

            <h2 className="mt-1 text-xl font-semibold">
              Retinal Image & Explainable AI
            </h2>

          </div>

          <div className="grid gap-5 md:grid-cols-2">

            {/* ORIGINAL IMAGE */}

            <div className="overflow-hidden rounded-xl border border-[#E2E8F0]">

              <div className="border-b border-[#E2E8F0] px-4 py-3">

                <p className="text-sm font-semibold">
                  Retinal Image
                </p>

                <p className="mt-1 truncate text-xs text-[#64748B]">
                  {result.filename ||
                    "Analyzed retinal image"}
                </p>

              </div>

              <div className="flex min-h-[300px] items-center justify-center bg-[#0F172A] p-4">

                {originalImage ? (

                  <img
                    src={originalImage}
                    alt="Original retinal fundus image"
                    className="max-h-[400px] max-w-full rounded-lg object-contain"
                  />

                ) : (

                  <div className="px-6 text-center text-sm text-white/60">
                    Original retinal image is not
                    available in this report.
                  </div>

                )}

              </div>

            </div>

            {/* GRAD CAM */}

            <div className="overflow-hidden rounded-xl border border-[#E2E8F0]">

              <div className="border-b border-[#E2E8F0] px-4 py-3">

                <p className="text-sm font-semibold">
                  Explainable AI
                </p>

                <p className="mt-1 text-xs text-[#64748B]">
                  Grad-CAM attention visualization
                </p>

              </div>

              <div className="flex min-h-[300px] items-center justify-center bg-[#0F172A] p-4">

                {result.gradcam_image ? (

                  <img
                    src={result.gradcam_image}
                    alt="Grad-CAM attention visualization"
                    className="max-h-[400px] max-w-full rounded-lg object-contain"
                  />

                ) : (

                  <div className="px-6 text-center text-sm text-white/60">
                    Grad-CAM visualization is not
                    available.
                  </div>

                )}

              </div>

            </div>

          </div>

        </section>

        {/* =====================================================
            INTERPRETATION
        ===================================================== */}

        <section className="mt-5 rounded-2xl border border-[#BFEDE5] bg-[#F0FDFA] p-6">

          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#0F766E]">
            AI Screening Interpretation
          </p>

          <p className="mt-3 text-sm leading-7 text-[#115E59]">

            The DrishtiAI model classified this retinal
            image as{" "}

            <strong>
              {result.severity}
            </strong>

            {" "}with a confidence of{" "}

            <strong>
              {confidence.toFixed(2)}%
            </strong>

            . The Grad-CAM visualization is provided
            as an explainability aid for the model
            prediction.

          </p>

        </section>

        {/* =====================================================
            RECOMMENDATION
        ===================================================== */}

        <section className="mt-5 rounded-2xl border border-[#E2E8F0] bg-white p-6">

          <h2 className="font-semibold">
            Clinical Note
          </h2>

          <p className="mt-2 text-sm leading-6 text-[#64748B]">
            This result is intended for AI-assisted
            screening and clinical decision support.
            Further evaluation should be performed
            by a qualified healthcare professional.
          </p>

        </section>

        {/* =====================================================
            DISCLAIMER
        ===================================================== */}

        <div className="mt-7 border-t border-[#CBD5E1] pt-5 text-center">

          <p className="text-xs leading-5 text-[#64748B]">
            DrishtiAI is an AI-assisted screening tool
            and does not replace examination, diagnosis,
            or treatment by a qualified healthcare
            professional.
          </p>

        </div>

        {/* PRINT BUTTON */}

        <div className="mt-7 flex justify-center print:hidden">

          <button
            onClick={printReport}
            className="rounded-lg bg-[#0F766E] px-7 py-3 text-sm font-semibold text-white hover:bg-[#115E59]"
          >
            Print / Save Report as PDF
          </button>

        </div>

      </div>

      {/* =====================================================
          PRINT STYLES
      ===================================================== */}

      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 12mm;
          }

          body {
            background: white !important;
          }

          main {
            background: white !important;
          }

          .print\\:hidden {
            display: none !important;
          }

          section {
            break-inside: avoid;
          }

          img {
            break-inside: avoid;
          }
        }
      `}</style>

    </main>
  );
}