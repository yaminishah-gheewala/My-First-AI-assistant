"use client";

import { NutrientDef, getStatus, getStatusColor, LabStatus } from "@/lib/nutrients";

export function statusLabel(status: LabStatus) {
  if (status === "low") return "Low";
  if (status === "high") return "High";
  return "Normal";
}

export default function NutrientSlider({
  nutrient,
  value,
}: {
  nutrient: NutrientDef;
  value: number;
}) {
  const range = nutrient.max - nutrient.min;
  const lowPct = (Math.max(nutrient.low, nutrient.min) - nutrient.min) / range * 100;
  const highPct = (Math.min(nutrient.high, nutrient.max) - nutrient.min) / range * 100;
  const clamped = Math.min(Math.max(value, nutrient.min), nutrient.max);
  const markerPct = ((clamped - nutrient.min) / range) * 100;
  const status = getStatus(nutrient, value);
  const color = getStatusColor(status);

  return (
    <div>
      <div className="relative h-2.5 w-full rounded-full overflow-hidden bg-slate-100 dark:bg-slate-700 flex">
        <div className="h-full bg-red-400" style={{ width: `${lowPct}%` }} />
        <div className="h-full bg-emerald-400" style={{ width: `${highPct - lowPct}%` }} />
        <div className="h-full bg-orange-400" style={{ width: `${100 - highPct}%` }} />
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-4 w-4 rounded-full border-2 border-white dark:border-slate-900 shadow"
          style={{ left: `${markerPct}%`, background: color }}
          title={`${value} ${nutrient.unit}`}
        />
      </div>
      <div className="mt-1 flex justify-between text-[11px] text-slate-400 dark:text-slate-500">
        <span>{nutrient.min}</span>
        <span>
          {nutrient.low}–{nutrient.high} normal
        </span>
        <span>{nutrient.max}</span>
      </div>
    </div>
  );
}
