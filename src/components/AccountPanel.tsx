"use client";

import { useState, useMemo, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { NUTRIENTS } from "@/lib/nutrients";
import ThemeToggle from "@/components/ThemeToggle";

export default function AccountPanel({
  name,
  email,
  memberSince,
  initialSettings,
}: {
  name: string;
  email: string;
  memberSince: string;
  initialSettings: Record<string, boolean>;
}) {
  const router = useRouter();

  // --- change password ---
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState<string | null>(null);
  const [pwSaving, setPwSaving] = useState(false);

  async function changePassword(e: FormEvent) {
    e.preventDefault();
    setPwError(null);
    setPwSuccess(null);
    if (newPassword !== confirmPassword) {
      setPwError("New passwords do not match.");
      return;
    }
    setPwSaving(true);
    try {
      const res = await fetch("/api/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPwError(data.error ?? "Could not update password");
        return;
      }
      setPwSuccess("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } finally {
      setPwSaving(false);
    }
  }

  // --- nutrient toggles ---
  const [settings, setSettings] = useState(initialSettings);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const sortedNutrients = useMemo(
    () => [...NUTRIENTS].sort((a, b) => a.name.localeCompare(b.name)),
    []
  );

  async function toggleNutrient(key: string) {
    const next = !settings[key];
    setSettings((s) => ({ ...s, [key]: next }));
    setSavingKey(key);
    try {
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nutrientKey: key, enabled: next }),
      });
    } finally {
      setSavingKey(null);
    }
  }

  // --- delete account ---
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function deleteAccount() {
    setDeleteError(null);
    setDeleting(true);
    try {
      const res = await fetch("/api/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: deletePassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setDeleteError(data.error ?? "Could not delete account");
        return;
      }
      router.push("/signup");
      router.refresh();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">My Account</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage your profile, security, and tracked nutrients.</p>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5">
        <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Appearance</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">Choose how Health Nutrition Lab looks on this device.</p>
        <ThemeToggle />
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5">
        <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Account info</h2>
        <dl className="grid gap-3 sm:grid-cols-2 text-sm">
          <div>
            <dt className="text-slate-500 dark:text-slate-400">Name</dt>
            <dd className="text-slate-900 dark:text-slate-100 font-medium">{name}</dd>
          </div>
          <div>
            <dt className="text-slate-500 dark:text-slate-400">Email</dt>
            <dd className="text-slate-900 dark:text-slate-100 font-medium">{email}</dd>
          </div>
          <div>
            <dt className="text-slate-500 dark:text-slate-400">Member since</dt>
            <dd className="text-slate-900 dark:text-slate-100 font-medium">
              {new Date(memberSince).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </dd>
          </div>
        </dl>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5">
        <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Change password</h2>
        <form onSubmit={changePassword} className="space-y-3 max-w-sm">
          {pwError && (
            <div className="rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-sm px-3 py-2">
              {pwError}
            </div>
          )}
          {pwSuccess && (
            <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400 text-sm px-3 py-2">
              {pwSuccess}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Current password</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">New password</label>
            <input
              type="password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Confirm new password</label>
            <input
              type="password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <button
            type="submit"
            disabled={pwSaving}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {pwSaving ? "Saving..." : "Update password"}
          </button>
        </form>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5">
        <div className="flex items-baseline justify-between">
          <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">Tracked nutrients</h2>
          <span className="text-xs text-slate-400 dark:text-slate-500">
            {Object.values(settings).filter(Boolean).length} of {NUTRIENTS.length} enabled
          </span>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Turn off any nutrient your lab report doesn&apos;t include. Disabled nutrients are hidden
          from the analyzer.
        </p>
        <div className="grid gap-x-6 gap-y-1 sm:grid-cols-2">
          {sortedNutrients.map((n) => {
            const enabled = settings[n.key] !== false;
            return (
              <label
                key={n.key}
                className="flex items-center justify-between gap-3 py-2 border-b border-slate-100 dark:border-slate-700 last:border-0 sm:border-0"
              >
                <span className="text-sm text-slate-700 dark:text-slate-300">{n.name}</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={enabled}
                  disabled={savingKey === n.key}
                  onClick={() => toggleNutrient(n.key)}
                  className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition ${
                    enabled ? "bg-emerald-600" : "bg-slate-300 dark:bg-slate-600"
                  } disabled:opacity-60`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      enabled ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </label>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 p-5">
        <h2 className="font-semibold text-red-800 dark:text-red-300 mb-1">Delete account</h2>
        <p className="text-sm text-red-700 dark:text-red-400 mb-3">
          This permanently deletes your account, saved reports, goals, and settings. This cannot
          be undone.
        </p>
        {deleteError && (
          <div className="rounded-lg bg-white dark:bg-slate-800 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-sm px-3 py-2 mb-3">
            {deleteError}
          </div>
        )}
        {!confirmingDelete ? (
          <button
            onClick={() => setConfirmingDelete(true)}
            className="rounded-lg border border-red-300 dark:border-red-800 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-medium text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40"
          >
            Delete my account
          </button>
        ) : (
          <div className="max-w-sm space-y-3">
            <div>
              <label className="block text-sm font-medium text-red-800 dark:text-red-300 mb-1">
                Enter your password to confirm
              </label>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                className="w-full rounded-lg border border-red-300 dark:border-red-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={deleteAccount}
                disabled={deleting || !deletePassword}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
              >
                {deleting ? "Deleting..." : "Permanently delete account"}
              </button>
              <button
                onClick={() => {
                  setConfirmingDelete(false);
                  setDeletePassword("");
                  setDeleteError(null);
                }}
                className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
