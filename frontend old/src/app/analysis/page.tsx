"use client";

import Link from "next/link";
import { ChangeEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = "https://drishtiai-backend-mu35.onrender.com";

type Result = {
  success: boolean;
  filename: string;
  grade: number;
  severity: string;
  confidence: number;
  gradcam_image: string;
};

type Patient = {
  id: number;
  patient_code?: string;
  name: string;
  age: number;
  gender: string;
};

export default function AnalysisPage() {
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState<Result | null>(null);

  const [patient, setPatient] = useState<Patient | null>(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  // ============================================================
  // LOAD CURRENT PATIENT
  // ============================================================

  useEffect(() => {
    try {
      const storedPatient = localStorage.getItem(
        "drishtiai_current_patient"
      );

      if (storedPatient) {
        setPatient(JSON.parse(storedPatient));
      }
    } catch (error) {
      console.error(
        "Unable to load patient:",
        error
      );
    }
  }, []);

  // ============================================================
  // FILE SELECTION
  // ============================================================

  function handleFileChange(
    e: ChangeEvent<HTMLInputElement>
  ) {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    setError("");
    setResult(null);

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      setError(
        "Please upload a JPG or PNG retinal image."
      );
      return;
    }

    // 10 MB limit
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError(
        "Image size must be less than 10 MB."
      );
      return;
    }

    setFile(selectedFile);

    const objectUrl =
      URL.createObjectURL(selectedFile);

    setPreview(objectUrl);
  }

  // ============================================================
  // ANALYZE IMAGE
  // ============================================================

  async function analyzeImage() {
    setError("");

    if (!file) {
      setError(
        "Please select a retinal image first."
      );
      return;
    }

    if (!patient) {
      setError(
        "No patient selected. Please create or select a patient first."
      );
      return;
    }

    const token = localStorage.getItem(
      "drishtiai_token"
    );

    if (!token) {
      setError(
        "Your session has expired. Please login again."
      );

      router.push("/login");
      return;
    }

    setLoading(true);
    setSaving(false);

    try {
      // ========================================================
      // STEP 1 — SEND IMAGE TO AI BACKEND
      // ========================================================

      const formData = new FormData();

      formData.append("file", file);

      const response = await fetch(
        `${API_URL}/predict`,
        {
          method: "POST",
          body: formData,
        }
      );

      let data: any = {};

      try {
        data = await response.json();
      } catch {
        throw new Error(
          "Backend returned an invalid response."
        );
      }

      if (response.status === 401) {
        localStorage.removeItem(
          "drishtiai_token"
        );

        throw new Error(
          "Your session has expired. Please login again."
        );
      }

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Retinal image analysis failed."
        );
      }

      // ========================================================
      // STEP 2 — STORE AI RESULT
      // ========================================================

      const analysisResult: Result = {
        success: Boolean(data.success),
        filename:
          data.filename || file.name,
        grade: Number(data.grade),
        severity:
          data.severity || "Unknown",
        confidence:
          Number(data.confidence) || 0,
        gradcam_image:
          data.gradcam_image || "",
      };

      setResult(analysisResult);

      // ========================================================
      // STEP 3 — SAVE RESULT LOCALLY
      // ========================================================

      localStorage.setItem(
        "drishtiai_latest_result",
        JSON.stringify(analysisResult)
      );

      localStorage.setItem(
        "drishtiai_current_patient",
        JSON.stringify(patient)
      );

      // ========================================================
      // STEP 4 — SAVE ORIGINAL IMAGE LOCALLY
      // ========================================================

      try {
        const reader = new FileReader();

        reader.onload = () => {
          localStorage.setItem(
            "drishtiai_original_image",
            String(reader.result)
          );
        };

        reader.readAsDataURL(file);
      } catch (imageError) {
        console.warn(
          "Could not save original image:",
          imageError
        );
      }

      // ========================================================
      // STEP 5 — SAVE ASSESSMENT TO DATABASE
      // ========================================================

      setSaving(true);

      const saveResponse = await fetch(
        `${API_URL}/assessments`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            patient_id: patient.id,

            filename:
              analysisResult.filename,

            grade:
              analysisResult.grade,

            severity:
              analysisResult.severity,

            confidence:
              analysisResult.confidence,
          }),
        }
      );

      let saveData: any = {};

      try {
        saveData =
          await saveResponse.json();
      } catch {
        saveData = {};
      }

      // ========================================================
      // TOKEN EXPIRED
      // ========================================================

      if (saveResponse.status === 401) {
        localStorage.removeItem(
          "drishtiai_token"
        );

        localStorage.removeItem(
          "drishtiai_current_patient"
        );

        throw new Error(
          "Your session has expired. Please login again."
        );
      }

      if (!saveResponse.ok) {
        throw new Error(
          saveData.detail ||
            "Analysis completed, but assessment could not be saved."
        );
      }

      // ========================================================
      // STEP 6 — SAVE DATABASE RESPONSE
      // ========================================================

      if (saveData) {
        localStorage.setItem(
          "drishtiai_latest_assessment",
          JSON.stringify(saveData)
        );
      }

      // ========================================================
      // STEP 7 — GO TO REPORT
      // ========================================================

      setSaving(false);

      router.push("/results");

    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to connect to DrishtiAI backend."
      );
    } finally {
      setLoading(false);
      setSaving(false);
    }
  }

  // ============================================================
  // RESET
  // ============================================================

  function resetAnalysis() {
    setFile(null);
    setPreview("");
    setResult(null);
    setError("");

    localStorage.removeItem(
      "drishtiai_latest_result"
    );

    localStorage.removeItem(
      "drishtiai_original_image"
    );
  }

  // ============================================================
  // UI
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

        {/* HEADER */}

        <div>

          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#0F766E]">
            AI Screening
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Retinal Image Analysis
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#64748B]">
            Upload a fundus photograph to generate
            an AI-assisted diabetic retinopathy
            assessment with explainable visualization.
          </p>

        </div>

        {/* PATIENT */}

        {patient ? (

          <div className="mt-6 rounded-xl border border-[#CCFBF1] bg-[#F0FDFA] px-5 py-4">

            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">

              <div>

                <p className="text-xs font-semibold uppercase tracking-wide text-[#0F766E]">
                  Current Patient
                </p>

                <p className="mt-1 font-semibold text-[#115E59]">
                  {patient.name}
                </p>

                <p className="mt-1 text-xs text-[#0F766E]">

                  {patient.patient_code ||
                    `PT-${patient.id}`}

                  {" • "}

                  {patient.age} years

                  {" • "}

                  {patient.gender}

                </p>

              </div>

              <Link
                href="/patients/new"
                className="text-xs font-semibold text-[#0F766E] hover:underline"
              >
                Change patient
              </Link>

            </div>

          </div>

        ) : (

          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">

            <p className="text-sm font-semibold text-amber-800">
              No patient selected
            </p>

            <p className="mt-1 text-xs text-amber-700">
              Create a patient before starting an
              assessment.
            </p>

            <Link
              href="/patients/new"
              className="mt-3 inline-block text-xs font-semibold text-amber-800 underline"
            >
              Create Patient →
            </Link>

          </div>

        )}

        {/* WORKSPACE */}

        <div className="mt-8 grid gap-6 lg:grid-cols-5">

          {/* UPLOAD */}

          <section className="lg:col-span-3">

            <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6">

              <div className="flex items-center justify-between">

                <div>

                  <h2 className="font-semibold">
                    Upload retinal image
                  </h2>

                  <p className="mt-1 text-xs text-[#64748B]">
                    JPG or PNG • Maximum 10 MB
                  </p>

                </div>

                {file && (

                  <button
                    onClick={resetAnalysis}
                    className="text-xs font-semibold text-[#64748B] hover:text-[#0F766E]"
                  >
                    Remove
                  </button>

                )}

              </div>

              {!preview ? (

                <label className="mt-6 flex min-h-[360px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#CBD5E1] bg-[#F8FAFC] px-6 text-center transition hover:border-[#0F766E] hover:bg-[#F0FDFA]">

                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E6FFFA] text-2xl text-[#0F766E]">
                    ↑
                  </div>

                  <h3 className="mt-5 font-semibold">
                    Upload fundus image
                  </h3>

                  <p className="mt-2 max-w-sm text-sm leading-6 text-[#64748B]">
                    Select a clear retinal photograph
                    from your computer.
                  </p>

                  <span className="mt-5 rounded-lg bg-[#0F766E] px-5 py-3 text-sm font-semibold text-white">
                    Choose image
                  </span>

                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/jpg"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                </label>

              ) : (

                <div className="mt-6 overflow-hidden rounded-xl border border-[#E2E8F0] bg-[#0F172A]">

                  <div className="flex min-h-[360px] items-center justify-center p-5">

                    <img
                      src={preview}
                      alt="Uploaded retinal image"
                      className="max-h-[500px] max-w-full object-contain"
                    />

                  </div>

                  <div className="border-t border-white/10 bg-white px-5 py-4">

                    <p className="truncate text-sm font-medium">
                      {file?.name}
                    </p>

                    <p className="mt-1 text-xs text-[#64748B]">
                      Ready for AI analysis
                    </p>

                  </div>

                </div>

              )}

              {/* ERROR */}

              {error && (

                <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>

              )}

              {/* BUTTON */}

              <button
                onClick={analyzeImage}
                disabled={
                  !file ||
                  !patient ||
                  loading
                }
                className="mt-5 w-full rounded-lg bg-[#0F766E] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#115E59] disabled:cursor-not-allowed disabled:opacity-50"
              >

                {loading

                  ? saving
                    ? "Saving assessment..."
                    : "Analyzing retinal image..."

                  : "Analyze Image →"}

              </button>

            </div>

          </section>

          {/* RESULT PREVIEW */}

          <section className="lg:col-span-2">

            <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6">

              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#64748B]">
                Assessment
              </p>

              <h2 className="mt-2 text-xl font-semibold">
                AI Result
              </h2>

              {!result ? (

                <div className="mt-6 flex min-h-[420px] flex-col items-center justify-center rounded-xl bg-[#F8FAFC] px-6 text-center">

                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white text-xl shadow-sm">
                    ◉
                  </div>

                  <p className="mt-5 text-sm font-medium">
                    No assessment yet
                  </p>

                  <p className="mt-2 max-w-xs text-xs leading-5 text-[#64748B]">
                    Upload a retinal image and run
                    the AI analysis to generate your
                    report.
                  </p>

                </div>

              ) : (

                <div className="mt-6 space-y-5">

                  {/* SEVERITY */}

                  <div className="rounded-xl border border-[#E2E8F0] p-5">

                    <p className="text-xs text-[#64748B]">
                      Detected severity
                    </p>

                    <div className="mt-3 flex items-end justify-between gap-3">

                      <h3 className="text-3xl font-bold">
                        {result.severity}
                      </h3>

                      <span className="rounded-full bg-[#F1F5F9] px-3 py-1 text-xs font-semibold text-[#475569]">
                        Grade {result.grade}
                      </span>

                    </div>

                  </div>

                  {/* CONFIDENCE */}

                  <div className="rounded-xl border border-[#E2E8F0] p-5">

                    <div className="flex items-center justify-between">

                      <p className="text-xs text-[#64748B]">
                        Model confidence
                      </p>

                      <p className="text-lg font-bold text-[#0F766E]">
                        {Number(
                          result.confidence
                        ).toFixed(2)}
                        %
                      </p>

                    </div>

                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#E2E8F0]">

                      <div
                        className="h-full rounded-full bg-[#0F766E]"
                        style={{
                          width: `${Math.min(
                            Math.max(
                              Number(
                                result.confidence
                              ),
                              0
                            ),
                            100
                          )}%`,
                        }}
                      />

                    </div>

                  </div>

                  {/* GRAD CAM */}

                  <div className="rounded-xl border border-[#E2E8F0] p-5">

                    <p className="text-xs text-[#64748B]">
                      Explainable AI
                    </p>

                    <h3 className="mt-1 font-semibold">
                      Grad-CAM
                    </h3>

                    <div className="mt-4 overflow-hidden rounded-lg bg-[#0F172A]">

                      {result.gradcam_image ? (

                        <img
                          src={result.gradcam_image}
                          alt="Grad-CAM visualization"
                          className="max-h-[300px] w-full object-contain"
                        />

                      ) : (

                        <div className="flex min-h-[250px] items-center justify-center text-sm text-white/60">
                          Grad-CAM unavailable
                        </div>

                      )}

                    </div>

                  </div>

                </div>

              )}

            </div>

          </section>

        </div>

        {/* FOOTER */}

        <p className="mt-8 text-center text-xs leading-5 text-[#94A3B8]">
          DrishtiAI provides AI-assisted screening
          and does not replace professional medical
          diagnosis.
        </p>

      </div>

    </main>
  );
}