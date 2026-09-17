"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
const API_URL = "https://drishtiai-backend-mu35.onrender.com";

type Assessment = {
  id: number;
  filename?: string;
  grade: number;
  severity: string;
  confidence: number;
  created_at?: string;
};

type Patient = {
  id: number;
  patient_code?: string;
  name: string;
  age: number;
  gender: string;
  created_at?: string;
  assessments?: Assessment[];
};

export default function PatientPage() {
  const params = useParams();

  const patientId = params?.id;

  const [patient, setPatient] =
    useState<Patient | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (patientId) {
      loadPatient();
    }
  }, [patientId]);

  async function loadPatient() {
    try {
      const token = localStorage.getItem(
        "drishtiai_token"
      );

      if (!token) {
        setError("Please login again.");
        setLoading(false);
        return;
      }

      const response = await fetch(
        `${API_URL}/patients/${patientId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        localStorage.removeItem(
          "drishtiai_token"
        );

        localStorage.removeItem(
          "drishtiai_current_patient"
        );

        setError(
          "Your session has expired. Please login again."
        );

        setLoading(false);
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Unable to load patient."
        );
      }

      const patientData =
        data.patient || data;

      setPatient(patientData);

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load patient information."
      );
    } finally {
      setLoading(false);
    }
  }

  function formatDate(date?: string) {
    if (!date) return "—";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-[#0F172A]">

      {/* NAVBAR */}

      <header className="border-b border-[#E2E8F0] bg-white">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

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

          <Link
            href="/patient-history"
            className="text-sm font-semibold text-[#64748B] hover:text-[#0F766E]"
          >
            ← Patient History
          </Link>

        </div>

      </header>

      {/* CONTENT */}

      <div className="mx-auto max-w-7xl px-6 py-10">

        {loading && (
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-10 text-center">
            <p className="text-sm text-[#64748B]">
              Loading patient profile...
            </p>
          </div>
        )}

        {error && !loading && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {patient && !loading && (

          <>

            {/* HEADER */}

            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">

              <div>

                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#0F766E]">
                  Patient Profile
                </p>

                <h1 className="mt-2 text-3xl font-semibold">
                  {patient.name}
                </h1>

                <p className="mt-2 text-sm text-[#64748B]">
                  Patient ID:{" "}
                  {patient.patient_code ||
                    `PT-${patient.id}`}
                </p>

              </div>

              <Link
                href="/analysis"
                onClick={() => {
                  localStorage.setItem(
                    "drishtiai_current_patient",
                    JSON.stringify(patient)
                  );
                }}
                className="rounded-lg bg-[#0F766E] px-5 py-3 text-sm font-semibold text-white hover:bg-[#115E59]"
              >
                New Analysis →
              </Link>

            </div>

            {/* PATIENT DETAILS */}

            <div className="mt-8 grid gap-5 md:grid-cols-3">

              <div className="rounded-xl border border-[#E2E8F0] bg-white p-5">
                <p className="text-xs text-[#64748B]">
                  Patient name
                </p>

                <p className="mt-2 font-semibold">
                  {patient.name}
                </p>
              </div>

              <div className="rounded-xl border border-[#E2E8F0] bg-white p-5">
                <p className="text-xs text-[#64748B]">
                  Age
                </p>

                <p className="mt-2 font-semibold">
                  {patient.age} years
                </p>
              </div>

              <div className="rounded-xl border border-[#E2E8F0] bg-white p-5">
                <p className="text-xs text-[#64748B]">
                  Gender
                </p>

                <p className="mt-2 font-semibold">
                  {patient.gender}
                </p>
              </div>

            </div>

            {/* ASSESSMENT HISTORY */}

            <div className="mt-8 rounded-2xl border border-[#E2E8F0] bg-white">

              <div className="border-b border-[#E2E8F0] p-6">

                <h2 className="text-lg font-semibold">
                  Assessment History
                </h2>

                <p className="mt-1 text-sm text-[#64748B]">
                  Previous retinal screening
                  assessments for this patient.
                </p>

              </div>

              {patient.assessments &&
              patient.assessments.length > 0 ? (

                <div className="overflow-x-auto p-6">

                  <table className="w-full min-w-[650px] text-left">

                    <thead>

                      <tr className="border-b border-[#E2E8F0] text-xs uppercase tracking-wide text-[#64748B]">

                        <th className="pb-3">
                          Date
                        </th>

                        <th className="pb-3">
                          Grade
                        </th>

                        <th className="pb-3">
                          Severity
                        </th>

                        <th className="pb-3">
                          Confidence
                        </th>

                        <th className="pb-3">
                          Image
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {patient.assessments.map(
                        (assessment) => (

                          <tr
                            key={assessment.id}
                            className="border-b border-[#F1F5F9] last:border-0"
                          >

                            <td className="py-4 text-sm">
                              {formatDate(
                                assessment.created_at
                              )}
                            </td>

                            <td className="py-4">

                              <span className="rounded-full bg-[#F1F5F9] px-3 py-1 text-xs font-semibold">
                                Grade{" "}
                                {assessment.grade}
                              </span>

                            </td>

                            <td className="py-4 text-sm font-medium">
                              {assessment.severity}
                            </td>

                            <td className="py-4 text-sm font-semibold text-[#0F766E]">
                              {Number(
                                assessment.confidence
                              ).toFixed(2)}
                              %
                            </td>

                            <td className="max-w-[200px] truncate py-4 text-xs text-[#64748B]">
                              {assessment.filename ||
                                "Retinal image"}
                            </td>

                          </tr>

                        )
                      )}

                    </tbody>

                  </table>

                </div>

              ) : (

                <div className="p-10 text-center">

                  <p className="text-sm font-medium">
                    No assessments yet
                  </p>

                  <p className="mt-2 text-xs text-[#64748B]">
                    Start a retinal analysis to
                    create the first assessment.
                  </p>

                  <Link
                    href="/analysis"
                    onClick={() => {
                      localStorage.setItem(
                        "drishtiai_current_patient",
                        JSON.stringify(patient)
                      );
                    }}
                    className="mt-5 inline-flex rounded-lg bg-[#0F766E] px-5 py-3 text-sm font-semibold text-white"
                  >
                    Start Analysis
                  </Link>

                </div>

              )}

            </div>

            {/* FOOTER NOTE */}

            <p className="mt-8 text-center text-xs text-[#94A3B8]">
              DrishtiAI provides AI-assisted
              screening and does not replace
              professional medical diagnosis.
            </p>

          </>

        )}

      </div>

    </main>
  );
}