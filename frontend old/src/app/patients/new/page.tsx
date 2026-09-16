"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = "https://drishtiai-backend-mu35.onrender.com";

type Patient = {
  id: number;
  patient_code?: string;
  name: string;
  age: number;
  gender: string;
};

export default function NewPatientPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");

    // -----------------------------
    // VALIDATION
    // -----------------------------

    if (!name.trim() || !age || !gender) {
      setError(
        "Please complete all patient details."
      );
      return;
    }

    const numericAge = Number(age);

    if (
      !Number.isInteger(numericAge) ||
      numericAge < 1 ||
      numericAge > 120
    ) {
      setError(
        "Please enter a valid age between 1 and 120."
      );
      return;
    }

    // -----------------------------
    // TOKEN
    // -----------------------------

    const token = localStorage.getItem(
      "drishtiai_token"
    );

    if (!token) {
      router.push("/login");
      return;
    }

    setLoading(true);

    try {
      // -----------------------------
      // CREATE PATIENT
      // -----------------------------

      const response = await fetch(
        `${API_URL}/patients`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            name: name.trim(),
            age: numericAge,
            gender,
          }),
        }
      );

      // -----------------------------
      // READ RESPONSE SAFELY
      // -----------------------------

      let data: any = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      // -----------------------------
      // EXPIRED TOKEN
      // -----------------------------

      if (response.status === 401) {
        localStorage.removeItem(
          "drishtiai_token"
        );

        localStorage.removeItem(
          "drishtiai_current_patient"
        );

        router.push("/login");
        return;
      }

      // -----------------------------
      // API ERROR
      // -----------------------------

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Unable to create patient."
        );
      }

      // -----------------------------
      // GET PATIENT FROM RESPONSE
      // -----------------------------

      const createdPatient: Patient =
        data.patient || data;

      if (!createdPatient?.id) {
        console.error(
          "Unexpected patient response:",
          data
        );

        throw new Error(
          "Patient was created but no patient ID was returned."
        );
      }

      // -----------------------------
      // SAVE CURRENT PATIENT
      // -----------------------------

      localStorage.setItem(
        "drishtiai_current_patient",
        JSON.stringify(createdPatient)
      );

      // -----------------------------
      // VERIFY STORAGE
      // -----------------------------

      const storedPatient =
        localStorage.getItem(
          "drishtiai_current_patient"
        );

      if (!storedPatient) {
        throw new Error(
          "Patient created, but could not be saved locally."
        );
      }

      console.log(
        "Current patient:",
        JSON.parse(storedPatient)
      );

      // -----------------------------
      // GO TO ANALYSIS
      // -----------------------------

      router.push(
        `/analysis?patientId=${createdPatient.id}`
      );

    } catch (err) {
      console.error(
        "Patient creation error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to connect to DrishtiAI."
      );
    } finally {
      setLoading(false);
    }
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
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0F766E] font-semibold text-white">
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

      <div className="mx-auto max-w-3xl px-6 py-12">

        {/* STEPPER */}

        <div className="mb-10 flex items-center justify-center">

          <div className="flex items-center">

            <div className="flex items-center gap-2">

              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0F766E] text-sm font-semibold text-white">
                1
              </div>

              <span className="text-sm font-semibold text-[#0F766E]">
                Patient
              </span>

            </div>

            <div className="mx-4 h-px w-12 bg-[#CBD5E1]" />

            <div className="flex items-center gap-2">

              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E2E8F0] text-sm font-semibold text-[#64748B]">
                2
              </div>

              <span className="text-sm text-[#94A3B8]">
                Analysis
              </span>

            </div>

            <div className="mx-4 h-px w-12 bg-[#CBD5E1]" />

            <div className="flex items-center gap-2">

              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E2E8F0] text-sm font-semibold text-[#64748B]">
                3
              </div>

              <span className="text-sm text-[#94A3B8]">
                Results
              </span>

            </div>

          </div>

        </div>

        {/* TITLE */}

        <div className="text-center">

          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#0F766E]">
            New assessment
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            Patient Information
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#64748B]">
            Enter basic patient information before
            starting the retinal screening assessment.
          </p>

        </div>

        {/* FORM */}

        <div className="mt-8 rounded-2xl border border-[#E2E8F0] bg-white p-7 shadow-sm sm:p-9">

          <form onSubmit={handleSubmit}>

            <div className="grid gap-6">

              {/* NAME */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-[#334155]">
                  Patient name
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  placeholder="Enter patient's full name"
                  disabled={loading}
                  className="w-full rounded-lg border border-[#CBD5E1] px-4 py-3 text-sm outline-none transition placeholder:text-[#94A3B8] focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/10 disabled:bg-[#F8FAFC]"
                />

              </div>

              {/* AGE + GENDER */}

              <div className="grid gap-6 sm:grid-cols-2">

                <div>

                  <label className="mb-2 block text-sm font-semibold text-[#334155]">
                    Age
                  </label>

                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={age}
                    onChange={(e) =>
                      setAge(e.target.value)
                    }
                    placeholder="e.g. 52"
                    disabled={loading}
                    className="w-full rounded-lg border border-[#CBD5E1] px-4 py-3 text-sm outline-none transition placeholder:text-[#94A3B8] focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/10 disabled:bg-[#F8FAFC]"
                  />

                </div>

                <div>

                  <label className="mb-2 block text-sm font-semibold text-[#334155]">
                    Gender
                  </label>

                  <select
                    value={gender}
                    onChange={(e) =>
                      setGender(e.target.value)
                    }
                    disabled={loading}
                    className="w-full rounded-lg border border-[#CBD5E1] bg-white px-4 py-3 text-sm text-[#334155] outline-none transition focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/10 disabled:bg-[#F8FAFC]"
                  >

                    <option value="">
                      Select gender
                    </option>

                    <option value="Male">
                      Male
                    </option>

                    <option value="Female">
                      Female
                    </option>

                    <option value="Other">
                      Other
                    </option>

                    <option value="Prefer not to say">
                      Prefer not to say
                    </option>

                  </select>

                </div>

              </div>

            </div>

            {/* INFO */}

            <div className="mt-7 rounded-xl border border-[#CCFBF1] bg-[#F0FDFA] p-4">

              <div className="flex gap-3">

                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-sm text-[#0F766E]">
                  i
                </div>

                <div>

                  <p className="text-sm font-semibold text-[#115E59]">
                    Patient record
                  </p>

                  <p className="mt-1 text-xs leading-5 text-[#0F766E]">
                    A unique patient ID will be
                    generated automatically. Your
                    retinal assessment will be linked
                    to this patient record.
                  </p>

                </div>

              </div>

            </div>

            {/* ERROR */}

            {error && (
              <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* BUTTON */}

            <button
              type="submit"
              disabled={loading}
              className="mt-7 flex w-full items-center justify-center rounded-lg bg-[#0F766E] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#115E59] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Creating patient..."
                : "Continue to Analysis →"}
            </button>

          </form>

        </div>

        <p className="mt-7 text-center text-xs leading-5 text-[#94A3B8]">
          Patient information should be entered
          accurately for proper record management.
        </p>

      </div>

    </main>
  );
}