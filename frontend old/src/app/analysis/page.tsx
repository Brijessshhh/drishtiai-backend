"use client";

import Link from "next/link";
import { ChangeEvent, useState } from "react";

const API_URL = "https://drishtiai-backend-mu35.onrender.com";


type Result = {
  success: boolean;
  filename: string;
  grade: number;
  severity: string;
  confidence: number;
  gradcam_image: string;
};

export default function AnalysisPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) return;

    setError("");
    setResult(null);

    if (
      !["image/jpeg", "image/png", "image/jpg"].includes(
        selectedFile.type
      )
    ) {
      setError("Please upload a JPG or PNG retinal image.");
      return;
    }

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  }

  async function analyzeImage() {
    if (!file) {
      setError("Please select a retinal image first.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_URL}/predict`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Analysis failed.");
      }

      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to connect to DrishtiAI backend."
      );
    } finally {
      setLoading(false);
    }
  }

  function resetAnalysis() {
    setFile(null);
    setPreview("");
    setResult(null);
    setError("");
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-[#0F172A]">
      <header className="border-b border-[#E2E8F0] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-3"
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
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="text-3xl font-bold">
          Retinal Analysis
        </h1>

        <p className="mt-2 text-[#64748B]">
          Upload a retinal image for AI-assisted screening.
        </p>

        <div className="mt-8 rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
          <input
            type="file"
            accept="image/jpeg,image/png,image/jpg"
            onChange={handleFileChange}
            className="block w-full"
          />

          {preview && (
            <div className="mt-6">
              <img
                src={preview}
                alt="Retinal preview"
                className="max-h-96 rounded-xl border object-contain"
              />
            </div>
          )}

          {error && (
            <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="mt-6 flex gap-3">
            <button
              onClick={analyzeImage}
              disabled={!file || loading}
              className="rounded-xl bg-[#0F766E] px-6 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Analyzing..." : "Analyze Image"}
            </button>

            <button
              onClick={resetAnalysis}
              className="rounded-xl border border-[#CBD5E1] px-6 py-3 font-semibold"
            >
              Reset
            </button>
          </div>
        </div>

        {result && (
          <div className="mt-8 rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">
              Analysis Result
            </h2>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div className="rounded-xl bg-[#F8FAFC] p-4">
                <p className="text-sm text-[#64748B]">Grade</p>
                <p className="mt-1 text-2xl font-bold">
                  {result.grade}
                </p>
              </div>

              <div className="rounded-xl bg-[#F8FAFC] p-4">
                <p className="text-sm text-[#64748B]">
                  Severity
                </p>
                <p className="mt-1 text-xl font-bold">
                  {result.severity}
                </p>
              </div>

              <div className="rounded-xl bg-[#F8FAFC] p-4">
                <p className="text-sm text-[#64748B]">
                  Confidence
                </p>
                <p className="mt-1 text-2xl font-bold">
                  {result.confidence.toFixed(2)}%
                </p>
              </div>
            </div>

            {result.gradcam_image && (
              <div className="mt-8">
                <h3 className="mb-3 font-semibold">
                  Grad-CAM Explanation
                </h3>

                <img
                  src={result.gradcam_image}
                  alt="Grad-CAM visualization"
                  className="w-full rounded-xl border"
                />
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}