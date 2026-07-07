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
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-800">
          🎉 All of the values in this report fall within the normal range. Keep up your current habits!
        </div>
      ) : (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-amber-900">
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
            <div key={nutrient.key} className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <h3 className="font-semibold text-slate-900">{nutrient.name}</h3>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusBadgeClasses(status)}`}>
                  {statusLabel(status)} · {value} {nutrient.unit}
                </span>
              </div>
              <NutrientSlider nutrient={nutrient} value={value} />
              <p className="mt-3 text-sm text-slate-600">{meaning}</p>
              <p className="mt-2 text-sm text-slate-600">
                <span className="font-medium text-slate-800">Dietary factors: </span>
                {nutrient.dietaryFactors}
              </p>
              <div className="mt-3">
                <p className="text-sm font-medium text-slate-800 mb-1.5">Suggested lifestyle goals</p>
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
                            ? "border-emerald-300 bg-emerald-50 text-emerald-700 cursor-default"
                            : "border-slate-300 text-slate-600 hover:border-emerald-400 hover:text-emerald-700"
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
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="font-semibold text-slate-900 mb-3">Within normal range</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {inRange.map(({ nutrient, value }) => (
              <div key={nutrient.key} className="rounded-lg bg-slate-50 px-3 py-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-700">{nutrient.name}</span>
                  <span className="text-slate-500">
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
