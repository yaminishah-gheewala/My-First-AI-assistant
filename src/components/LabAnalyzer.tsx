"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  NUTRIENTS,
  NutrientCategory,
  NutrientDef,
  getStatus,
  statusBadgeClasses,
} from "@/lib/nutrients";
import NutrientSlider, { statusLabel } from "@/components/NutrientSlider";
import ReportResults from "@/components/ReportResults";

const CATEGORY_ORDER: NutrientCategory[] = [
  "Protein & Nutrition Status",
  "Blood Sugar",
  "Lipids",
  "Vitamins",
  "Minerals & Electrolytes",
  "Iron Panel",
  "Trace Elements",
];

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

interface SubmittedValue {
  nutrient: NutrientDef;
  value: number;
}

export default function LabAnalyzer({
  initialSettings,
}: {
  initialSettings: Record<string, boolean>;
}) {
  const enabledNutrients = useMemo(
    () => NUTRIENTS.filter((n) => initialSettings[n.key] !== false),
    [initialSettings]
  );

  const [reportDate, setReportDate] = useState(todayIso());
  const [values, setValues] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SubmittedValue[] | null>(null);

  const grouped = useMemo(() => {
    const map = new Map<NutrientCategory, NutrientDef[]>();
    for (const n of enabledNutrients) {
      if (!map.has(n.category)) map.set(n.category, []);
      map.get(n.category)!.push(n);
    }
    return map;
  }, [enabledNutrients]);

  function setValue(key: string, raw: string) {
    setValues((v) => ({ ...v, [key]: raw }));
  }

  async function submitReport() {
    setError(null);
    const entries = Object.entries(values)
      .map(([key, raw]) => ({ key, value: parseFloat(raw) }))
      .filter((e) => Number.isFinite(e.value));

    if (entries.length === 0) {
      setError("Enter at least one lab value before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportDate, values: entries }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not save report");
        return;
      }
      const submitted: SubmittedValue[] = entries
        .map((e) => {
          const nutrient = enabledNutrients.find((n) => n.key === e.key);
          return nutrient ? { nutrient, value: e.value } : null;
        })
        .filter((v): v is SubmittedValue => v !== null);
      setResult(submitted);
    } finally {
      setSubmitting(false);
    }
  }

  function startNewReport() {
    setResult(null);
    setValues({});
    setReportDate(todayIso());
  }

  if (result) {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Report submitted</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Here&apos;s what your numbers mean and how to work toward healthier levels.
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/goals"
              className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              My Goals
            </Link>
            <Link
              href="/reports"
              className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              View Saved Reports
            </Link>
            <button
              onClick={startNewReport}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
            >
              Start New Report
            </button>
          </div>
        </div>
        <ReportResults values={result} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Lab Result Analyzer</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Enter numbers from a lab report below. Each value is plotted on a color-coded scale
          (red = low, green = normal, orange = high) and updates as you type.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Report date</label>
        <input
          type="date"
          value={reportDate}
          onChange={(e) => setReportDate(e.target.value)}
          className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-sm px-3 py-2">
          {error}
        </div>
      )}

      {enabledNutrients.length === 0 ? (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 text-sm text-slate-600 dark:text-slate-400">
          You&apos;ve disabled all nutrients in{" "}
          <Link href="/account" className="text-emerald-700 dark:text-emerald-400 font-medium hover:underline">
            My Account
          </Link>
          . Enable the ones your lab report includes to get started.
        </div>
      ) : (
        Array.from(grouped.entries())
          .sort((a, b) => CATEGORY_ORDER.indexOf(a[0]) - CATEGORY_ORDER.indexOf(b[0]))
          .map(([category, nutrients]) => (
            <div key={category} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5">
              <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">{category}</h2>
              <div className="space-y-5">
                {nutrients.map((nutrient) => {
                  const raw = values[nutrient.key] ?? "";
                  const num = parseFloat(raw);
                  const hasValue = raw.trim() !== "" && Number.isFinite(num);
                  const status = hasValue ? getStatus(nutrient, num) : null;
                  return (
                    <div key={nutrient.key}>
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                        <label className="text-sm font-medium text-slate-800 dark:text-slate-200">
                          {nutrient.name}{" "}
                          <span className="text-slate-400 dark:text-slate-500 font-normal">({nutrient.unit})</span>
                        </label>
                        <div className="flex items-center gap-2">
                          {status && (
                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusBadgeClasses(status)}`}>
                              {statusLabel(status)}
                            </span>
                          )}
                          <input
                            type="number"
                            step="any"
                            value={raw}
                            onChange={(e) => setValue(nutrient.key, e.target.value)}
                            placeholder="—"
                            className="w-28 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-2.5 py-1.5 text-sm text-right focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                      </div>
                      <NutrientSlider nutrient={nutrient} value={hasValue ? num : nutrient.low} />
                      {status && status !== "normal" && (
                        <div className="mt-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3 text-sm text-slate-600 dark:text-slate-400">
                          <p className="mb-1.5">
                            {status === "low" ? nutrient.lowMeaning : nutrient.highMeaning}
                          </p>
                          <p>
                            <span className="font-medium text-slate-800 dark:text-slate-200">Dietary factors: </span>
                            {nutrient.dietaryFactors}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
      )}

      {enabledNutrients.length > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={submitReport}
            disabled={submitting}
            className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 transition disabled:opacity-60"
          >
            {submitting ? "Submitting..." : "Submit Report"}
          </button>
          <Link
            href="/reports"
            className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
          >
            View Saved Reports
          </Link>
        </div>
      )}
    </div>
  );
}
