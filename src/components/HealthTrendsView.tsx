"use client";

import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceArea,
  Dot,
} from "recharts";
import { NUTRIENT_MAP, getStatus, getStatusColor, statusBadgeClasses } from "@/lib/nutrients";
import { statusLabel } from "@/components/NutrientSlider";

export interface TrendPoint {
  date: string;
  value: number;
}

interface Series {
  key: string;
  points: TrendPoint[];
}

function formatDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "2-digit",
  });
}

function CustomDot(props: { cx?: number; cy?: number; payload?: TrendPoint; nutrientKey: string }) {
  const { cx, cy, payload, nutrientKey } = props;
  if (cx == null || cy == null || !payload) return null;
  const nutrient = NUTRIENT_MAP[nutrientKey];
  const status = getStatus(nutrient, payload.value);
  return <Dot cx={cx} cy={cy} r={4.5} fill={getStatusColor(status)} stroke="#fff" strokeWidth={1.5} />;
}

function TrendTooltip({
  active,
  payload,
  nutrientKey,
}: {
  active?: boolean;
  payload?: { payload: TrendPoint }[];
  nutrientKey: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0].payload;
  const nutrient = NUTRIENT_MAP[nutrientKey];
  const status = getStatus(nutrient, point.value);
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-md text-sm">
      <p className="text-slate-500 text-xs">{formatDate(point.date)}</p>
      <p className="font-semibold text-slate-900">
        {point.value} {nutrient.unit}
      </p>
      <span className={`inline-block mt-1 rounded-full px-2 py-0.5 text-xs font-semibold ${statusBadgeClasses(status)}`}>
        {statusLabel(status)}
      </span>
    </div>
  );
}

function MiniSparkline({ series, onClick, active }: { series: Series; onClick: () => void; active: boolean }) {
  const nutrient = NUTRIENT_MAP[series.key];
  const latest = series.points[series.points.length - 1];
  const status = getStatus(nutrient, latest.value);

  return (
    <button
      onClick={onClick}
      className={`text-left rounded-xl border p-4 transition ${
        active ? "border-emerald-400 ring-2 ring-emerald-100" : "border-slate-200 hover:border-slate-300"
      } bg-white`}
    >
      <div className="flex items-center justify-between gap-2 mb-1">
        <p className="text-sm font-medium text-slate-800 truncate">{nutrient.name}</p>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusBadgeClasses(status)}`}>
          {statusLabel(status)}
        </span>
      </div>
      <p className="text-xs text-slate-400 mb-2">
        {series.points.length} report{series.points.length === 1 ? "" : "s"} · latest {latest.value} {nutrient.unit}
      </p>
      {series.points.length > 1 ? (
        <div className="h-10">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series.points} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
              <Line
                type="monotone"
                dataKey="value"
                stroke="#059669"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-10 flex items-center text-xs text-slate-400">Add another report to see a trend</div>
      )}
    </button>
  );
}

export default function HealthTrendsView({ series }: { series: Series[] }) {
  const sorted = useMemo(
    () =>
      [...series].sort((a, b) => NUTRIENT_MAP[a.key].name.localeCompare(NUTRIENT_MAP[b.key].name)),
    [series]
  );
  const [selectedKey, setSelectedKey] = useState<string | null>(sorted[0]?.key ?? null);
  const selected = sorted.find((s) => s.key === selectedKey) ?? null;
  const nutrient = selected ? NUTRIENT_MAP[selected.key] : null;

  if (sorted.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Health Trends</h1>
          <p className="text-slate-500 text-sm mt-1">
            Charts showing how your lab metrics change across report dates.
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          No submitted reports yet. Once you submit a lab report, trends will appear here.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Health Trends</h1>
        <p className="text-slate-500 text-sm mt-1">
          See how your lab metrics change across report dates. The shaded band is the normal
          range; dot color shows low (red), normal (green), or high (orange).
        </p>
      </div>

      {selected && nutrient && (
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <h2 className="font-semibold text-slate-900">{nutrient.name}</h2>
            <span className="text-xs text-slate-400">
              Normal range: {nutrient.low}–{nutrient.high} {nutrient.unit}
            </span>
          </div>
          {selected.points.length > 1 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={selected.points} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                  <ReferenceArea y1={nutrient.low} y2={nutrient.high} fill="#22c55e" fillOpacity={0.08} strokeOpacity={0} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDate}
                    tick={{ fontSize: 12, fill: "#94a3b8" }}
                    axisLine={{ stroke: "#e2e8f0" }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[nutrient.min, nutrient.max]}
                    tick={{ fontSize: 12, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                    width={40}
                  />
                  <Tooltip content={<TrendTooltip nutrientKey={nutrient.key} />} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#059669"
                    strokeWidth={2}
                    dot={(props) => {
                      const { key, ...rest } = props as { key?: string };
                      return <CustomDot key={key} {...rest} nutrientKey={nutrient.key} />;
                    }}
                    activeDot={{ r: 6 }}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="rounded-lg bg-slate-50 p-6 text-center text-sm text-slate-500">
              You have one report with this value ({selected.points[0].value} {nutrient.unit}).
              Submit another report to start seeing a trend line.
            </div>
          )}
        </div>
      )}

      <div>
        <h2 className="font-semibold text-slate-900 mb-3">All tracked metrics</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((s) => (
            <MiniSparkline
              key={s.key}
              series={s}
              active={s.key === selectedKey}
              onClick={() => setSelectedKey(s.key)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
