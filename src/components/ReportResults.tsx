"use client";

import { useState } from "react";
import { NutrientDef, getStatus, statusBadgeClasses } from "@/lib/nutrients";
import NutrientSlider, { statusLabel } from "@/components/NutrientSlider";

export interface ReportResultValue {
  nutrient: NutrientDef;
  value: number;
}

export default function ReportResults({ values }: { values: ReportResultValue[] }) {
  const [addedGoals, setAddedGoals] = useState<Set<string>>(new Set());

  async function addGoal(nutrient: NutrientDef, tip: string) {
    const id = `${nutrient.key}::${tip}`;
    setAddedGoals((s) => new Set(s).add(id));
    await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: tip, nutrientKey: nutrient.key }),
    });
  }

  const outOfRange = values.filter((r) => getStatus(r.nutrient, r.value) !== "normal");
  const inRange = values.filter((r) => getStatus(r.nutrient, r.value) === "normal");

  return (
    <div className="space-y-6">
      {outOfRange.length === 0 ? (
        <div className="rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40 p-5 text-emerald-800 dark:text-emerald-300">
          🎉 All of the values in this report fall within the normal range. Keep up your current habits!
        </div>
      ) : (
        <div className="rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/40 p-5 text-amber-900 dark:text-amber-300">
          {outOfRange.length} of {values.length} value{values.length === 1 ? "" : "s"}
          {outOfRange.length === 1 ? " is" : " are"} outside the normal range. Review the
          breakdowns below for dietary and lifestyle suggestions.
        </div>
      )}

      <div className="space-y-4">
        {outOfRange.map(({ nutrient, value }) => {
          const status = getStatus(nutrient, value);
          const meaning = status === "low" ? nutrient.lowMeaning : nutrient.highMeaning;
          return (
            <div key={nutrient.key} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">{nutrient.name}</h3>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusBadgeClasses(status)}`}>
                  {statusLabel(status)} · {value} {nutrient.unit}
                </span>
              </div>
              <NutrientSlider nutrient={nutrient} value={value} />
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">{meaning}</p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                <span className="font-medium text-slate-800 dark:text-slate-200">Dietary factors: </span>
                {nutrient.dietaryFactors}
              </p>
              <div className="mt-3">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mb-1.5">Suggested lifestyle goals</p>
                <div className="flex flex-wrap gap-2">
                  {nutrient.lifestyleTips.map((tip) => {
                    const id = `${nutrient.key}::${tip}`;
                    const added = addedGoals.has(id);
                    return (
                      <button
                        key={tip}
                        disabled={added}
                        onClick={() => addGoal(nutrient, tip)}
                        className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                          added
                            ? "border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 cursor-default"
                            : "border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-400"
                        }`}
                      >
                        {added ? "✓ Added: " : "+ Track goal: "}
                        {tip}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {inRange.length > 0 && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Within normal range</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {inRange.map(({ nutrient, value }) => (
              <div key={nutrient.key} className="rounded-lg bg-slate-50 dark:bg-slate-900 px-3 py-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-700 dark:text-slate-300">{nutrient.name}</span>
                  <span className="text-slate-500 dark:text-slate-400">
                    {value} {nutrient.unit}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
