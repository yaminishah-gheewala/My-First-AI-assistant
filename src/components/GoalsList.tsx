"use client";

import { useState } from "react";
import Link from "next/link";
import { NUTRIENT_MAP } from "@/lib/nutrients";
import type { Goal } from "@/lib/goals";

export default function GoalsList({ goals: initialGoals }: { goals: Goal[] }) {
  const [goals, setGoals] = useState(initialGoals);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function toggleGoal(goal: Goal) {
    const nextCompleted = !goal.completed;
    setBusyId(goal.id);
    setGoals((gs) => gs.map((g) => (g.id === goal.id ? { ...g, completed: nextCompleted } : g)));
    try {
      await fetch(`/api/goals/${goal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: nextCompleted }),
      });
    } finally {
      setBusyId(null);
    }
  }

  async function removeGoal(goal: Goal) {
    setBusyId(goal.id);
    setGoals((gs) => gs.filter((g) => g.id !== goal.id));
    try {
      await fetch(`/api/goals/${goal.id}`, { method: "DELETE" });
    } finally {
      setBusyId(null);
    }
  }

  const active = goals.filter((g) => !g.completed);
  const completed = goals.filter((g) => g.completed);

  if (goals.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">My Goals</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Lifestyle goals you&apos;re tracking.</p>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 text-center text-sm text-slate-500 dark:text-slate-400">
          You don&apos;t have any goals yet. Submit a report on the{" "}
          <Link href="/dashboard" className="text-emerald-700 dark:text-emerald-400 font-medium hover:underline">
            Analyzer
          </Link>{" "}
          and click &quot;+ Track goal&quot; on any suggestion to add one here.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">My Goals</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          {active.length} active, {completed.length} completed.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5">
        <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Active</h2>
        {active.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">No active goals — nice work!</p>
        ) : (
          <ul className="space-y-2">
            {active.map((goal) => (
              <GoalRow
                key={goal.id}
                goal={goal}
                busy={busyId === goal.id}
                onToggle={() => toggleGoal(goal)}
                onRemove={() => removeGoal(goal)}
              />
            ))}
          </ul>
        )}
      </div>

      {completed.length > 0 && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5">
          <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Completed</h2>
          <ul className="space-y-2">
            {completed.map((goal) => (
              <GoalRow
                key={goal.id}
                goal={goal}
                busy={busyId === goal.id}
                onToggle={() => toggleGoal(goal)}
                onRemove={() => removeGoal(goal)}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function GoalRow({
  goal,
  busy,
  onToggle,
  onRemove,
}: {
  goal: Goal;
  busy: boolean;
  onToggle: () => void;
  onRemove: () => void;
}) {
  const nutrient = goal.nutrient_key ? NUTRIENT_MAP[goal.nutrient_key] : undefined;
  return (
    <li className="flex items-start gap-3 rounded-lg border border-slate-100 dark:border-slate-700 px-3 py-2.5">
      <button
        onClick={onToggle}
        disabled={busy}
        aria-label={goal.completed ? "Mark as active" : "Mark as complete"}
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition ${
          goal.completed
            ? "border-emerald-600 bg-emerald-600 text-white"
            : "border-slate-300 dark:border-slate-600 hover:border-emerald-500"
        }`}
      >
        {goal.completed && "✓"}
      </button>
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${goal.completed ? "text-slate-400 dark:text-slate-500 line-through" : "text-slate-800 dark:text-slate-200"}`}>
          {goal.title}
        </p>
        {nutrient && (
          <span className="mt-1 inline-block rounded-full bg-slate-100 dark:bg-slate-700 px-2 py-0.5 text-xs text-slate-500 dark:text-slate-400">
            {nutrient.name}
          </span>
        )}
      </div>
      <button
        onClick={onRemove}
        disabled={busy}
        className="shrink-0 text-xs text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400"
      >
        Remove
      </button>
    </li>
  );
}
