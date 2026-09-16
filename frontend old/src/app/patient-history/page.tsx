"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API_URL = "https://drishtiai-backend-mu35.onrender.com";

type Patient = {
  id: number;
  patient_code?: string;
  name: string;
  age: number;
  gender: string;
};

type Assessment = {
  id: number;
  patient_id: number;
  filename?: string;
  grade: number;
  severity: string;
  confidence: number;
  created_at?: string;
};

export default function PatientHistoryPage() {
  const router = useRouter();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] =
    useState<Patient | null>(null);

  const [assessments, setAssessments] =
    useState<Assessment[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ============================================================
  // LOAD PATIENTS
  // ============================================================

  useEffect(() => {
    const token = localStorage.getItem("drishtiai_token");

    if (!token) {
      router.push("/login");
      return;
    }

    fetch(`${API_URL}/patients`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (response) => {
        if (response.status === 401) {
          localStorage.removeItem("drishtiai_token");
          router.push("/login");
          return null;
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail || "Unable to load patients."
          );
        }

        return data;
      })
      .then((data) => {
        if (!data) return;

        const list: Patient[] = Array.isArray(data)
          ? data
          : data.patients || [];

        setPatients(list);

        // Restore current patient
        const saved =
          localStorage.getItem(
            "drishtiai_current_patient"
          );

        if (saved) {
          try {
            const savedPatient = JSON.parse(saved);

            const found = list.find(
              (patient) =>
                patient.id === savedPatient.id
            );

            if (found) {
              setSelectedPatient(found);
              loadAssessments(found.id);
            }
          } catch {
            console.log(
              "No valid current patient found."
            );
          }
        }

        setLoading(false);
      })
      .catch((err) => {
        console.error(err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to connect to backend."
        );

        setLoading(false);
      });
  }, [router]);

  // ============================================================
  // LOAD ASSESSMENTS
  // ============================================================

  async function loadAssessments(
    patientId: number
  ) {
    const token =
      localStorage.getItem("drishtiai_token");

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      setError("");

      const response = await fetch(
        `${API_URL}/patients/${patientId}/assessments`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        localStorage.removeItem(
          "drishtiai_token"
        );

        router.push("/login");
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Unable to load assessments."
        );
      }

      const history: Assessment[] =
        Array.isArray(data)
          ? data
          : data.assessments || [];

      setAssessments(history);
    } catch (err) {
      console.error(err);

      setAssessments([]);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load assessment history."
      );
    }
  }

  // ============================================================
  // SELECT PATIENT
  // ============================================================

  function handlePatientSelect(
    patient: Patient
  ) {
    setSelectedPatient(patient);

    setAssessments([]);

    localStorage.setItem(
      "drishtiai_current_patient",
      JSON.stringify(patient)
    );

    loadAssessments(patient.id);
  }

  // ============================================================
  // VIEW REPORT
  // ============================================================

  function viewReport(
    assessment: Assessment
  ) {
    if (!selectedPatient) return;

    localStorage.setItem(
      "drishtiai_current_patient",
      JSON.stringify(selectedPatient)
    );

    localStorage.setItem(
      "drishtiai_latest_result",
      JSON.stringify({
        success: true,
        filename:
          assessment.filename ||
          "Retinal Assessment",
        grade: assessment.grade,
        severity: assessment.severity,
        confidence: assessment.confidence,
      })
    );

    router.push("/results");
  }

  // ============================================================
  // DATE
  // ============================================================

  function formatDate(
    date?: string
  ) {
    if (!date) return "Date unavailable";

    try {
      return new Date(date).toLocaleString(
        "en-IN",
        {
          dateStyle: "medium",
          timeStyle: "short",
        }
      );
    } catch {
      return date;
    }
  }

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F8FAFC]">

        <div className="flex min-h-screen items-center justify-center">

          <div className="text-center">

            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#CCFBF1] border-t-[#0F766E]" />

            <p className="mt-4 text-sm text-[#64748B]">
              Loading patients...
            </p>

          </div>

        </div>

      </main>
    );
  }

  // ============================================================
  // PAGE
  // ============================================================

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
            href="/dashboard"
            className="text-sm font-medium text-[#64748B] hover:text-[#0F766E]"
          >
            ← Dashboard
          </Link>

        </div>

      </header>

      {/* CONTENT */}

      <div className="mx-auto max-w-7xl px-6 py-10">

        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">

          <div>

            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#0F766E]">
              Records
            </p>

            <h1 className="mt-2 text-3xl font-semibold">
              Patient History
            </h1>

            <p className="mt-2 text-sm text-[#64748B]">
              View patients and previous retinal
              screening assessments.
            </p>

          </div>

          <Link
            href="/patients/new"
            className="rounded-lg bg-[#0F766E] px-5 py-3 text-center text-sm font-semibold text-white hover:bg-[#115E59]"
          >
            + New Patient
          </Link>

        </div>

        {/* ERROR */}

        {error && (

          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4">

            <p className="text-sm text-red-700">
              {error}
            </p>

          </div>

        )}

        {/* MAIN GRID */}

        <div className="mt-8 grid gap-6 lg:grid-cols-3">

          {/* PATIENT LIST */}

          <div className="rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">

            <div className="border-b border-[#E2E8F0] px-5 py-4">

              <div className="flex items-center justify-between">

                <h2 className="font-semibold">
                  Patients
                </h2>

                <span className="rounded-full bg-[#F1F5F9] px-3 py-1 text-xs font-semibold text-[#64748B]">
                  {patients.length}
                </span>

              </div>

            </div>

            {patients.length === 0 ? (

              <div className="px-6 py-12 text-center">

                <p className="text-sm font-semibold">
                  No patients found
                </p>

                <Link
                  href="/patients/new"
                  className="mt-4 inline-block text-sm font-semibold text-[#0F766E]"
                >
                  Create Patient →
                </Link>

              </div>

            ) : (

              <div>

                {patients.map(
                  (patient) => {

                    const selected =
                      selectedPatient?.id ===
                      patient.id;

                    return (

                      <button
                        key={patient.id}
                        onClick={() =>
                          handlePatientSelect(
                            patient
                          )
                        }
                        className={`w-full border-b border-[#F1F5F9] px-5 py-4 text-left ${
                          selected
                            ? "bg-[#F0FDFA]"
                            : "hover:bg-[#F8FAFC]"
                        }`}
                      >

                        <div className="flex items-center gap-3">

                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#CCFBF1] font-bold text-[#0F766E]">
                            {patient.name
                              ?.charAt(0)
                              ?.toUpperCase()}
                          </div>

                          <div>

                            <p className="text-sm font-semibold">
                              {patient.name}
                            </p>

                            <p className="mt-1 text-xs text-[#64748B]">
                              {patient.patient_code ||
                                `PT-${patient.id}`}
                              {" • "}
                              {patient.age} yrs
                              {" • "}
                              {patient.gender}
                            </p>

                          </div>

                        </div>

                      </button>

                    );
                  }
                )}

              </div>

            )}

          </div>

          {/* HISTORY */}

          <div className="lg:col-span-2">

            {!selectedPatient ? (

              <div className="flex min-h-[450px] items-center justify-center rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">

                <div className="text-center">

                  <p className="text-lg font-semibold">
                    Select a patient
                  </p>

                  <p className="mt-2 text-sm text-[#64748B]">
                    Select a patient from the left
                    to view assessment history.
                  </p>

                </div>

              </div>

            ) : (

              <div className="rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">

                {/* PATIENT HEADER */}

                <div className="border-b border-[#E2E8F0] p-6">

                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

                    <div>

                      <p className="text-xs font-bold uppercase tracking-wide text-[#0F766E]">
                        Patient Record
                      </p>

                      <h2 className="mt-1 text-xl font-semibold">
                        {selectedPatient.name}
                      </h2>

                      <p className="mt-1 text-xs text-[#64748B]">
                        {selectedPatient.patient_code ||
                          `PT-${selectedPatient.id}`}
                        {" • "}
                        {selectedPatient.age} years
                        {" • "}
                        {selectedPatient.gender}
                      </p>

                    </div>

                    <Link
                      href={`/analysis?patientId=${selectedPatient.id}`}
                      className="rounded-lg bg-[#0F766E] px-4 py-2.5 text-center text-xs font-semibold text-white"
                    >
                      + New Analysis
                    </Link>

                  </div>

                </div>

                {/* ASSESSMENTS */}

                <div className="p-6">

                  <div className="mb-5 flex items-center justify-between">

                    <h3 className="font-semibold">
                      Assessment History
                    </h3>

                    <span className="text-xs text-[#64748B]">
                      {assessments.length} assessment
                      {assessments.length === 1
                        ? ""
                        : "s"}
                    </span>

                  </div>

                  {assessments.length === 0 ? (

                    <div className="rounded-xl bg-[#F8FAFC] px-6 py-12 text-center">

                      <p className="text-sm font-semibold">
                        No assessments yet
                      </p>

                      <p className="mt-2 text-xs text-[#64748B]">
                        Start an analysis for this
                        patient.
                      </p>

                      <Link
                        href={`/analysis?patientId=${selectedPatient.id}`}
                        className="mt-5 inline-block rounded-lg bg-[#0F766E] px-4 py-2.5 text-xs font-semibold text-white"
                      >
                        Start Analysis →
                      </Link>

                    </div>

                  ) : (

                    <div className="space-y-4">

                      {assessments.map(
                        (assessment) => (

                          <div
                            key={assessment.id}
                            className="rounded-xl border border-[#E2E8F0] p-5"
                          >

                            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

                              <div>

                                <p className="text-sm font-semibold">
                                  {assessment.filename ||
                                    "Retinal Assessment"}
                                </p>

                                <p className="mt-1 text-xs text-[#94A3B8]">
                                  {formatDate(
                                    assessment.created_at
                                  )}
                                </p>

                              </div>

                              <button
                                onClick={() =>
                                  viewReport(
                                    assessment
                                  )
                                }
                                className="rounded-lg border border-[#CBD5E1] px-4 py-2 text-xs font-semibold hover:border-[#0F766E] hover:text-[#0F766E]"
                              >
                                View Report
                              </button>

                            </div>

                            <div className="mt-5 grid grid-cols-3 gap-3">

                              <div className="rounded-lg bg-[#F8FAFC] p-3">

                                <p className="text-[10px] uppercase text-[#94A3B8]">
                                  Grade
                                </p>

                                <p className="mt-1 text-lg font-bold">
                                  {assessment.grade}
                                </p>

                              </div>

                              <div className="rounded-lg bg-[#F8FAFC] p-3">

                                <p className="text-[10px] uppercase text-[#94A3B8]">
                                  Severity
                                </p>

                                <p className="mt-1 truncate text-sm font-bold">
                                  {assessment.severity}
                                </p>

                              </div>

                              <div className="rounded-lg bg-[#F8FAFC] p-3">

                                <p className="text-[10px] uppercase text-[#94A3B8]">
                                  Confidence
                                </p>

                                <p className="mt-1 text-lg font-bold text-[#0F766E]">
                                  {Number(
                                    assessment.confidence
                                  ).toFixed(1)}
                                  %
                                </p>

                              </div>

                            </div>

                          </div>

                        )
                      )}

                    </div>

                  )}

                </div>

              </div>

            )}

          </div>

        </div>

        <p className="mt-8 text-center text-xs text-[#94A3B8]">
          DrishtiAI is an AI-assisted screening
          platform and does not replace professional
          medical diagnosis.
        </p>

      </div>

    </main>
  );
}