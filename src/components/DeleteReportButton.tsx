"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteReportButton({
  reportId,
  redirectTo,
}: {
  reportId: string;
  redirectTo?: string;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      await fetch(`/api/reports/${reportId}`, { method: "DELETE" });
      if (redirectTo) {
        router.push(redirectTo);
      }
      router.refresh();
    } finally {
      setDeleting(false);
      setConfirming(false);
    }
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-1.5">
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
        >
          {deleting ? "Deleting..." : "Confirm"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
    >
      Delete
    </button>
  );
}
