import Link from "next/link";
import { getSession } from "@/lib/auth";
import { listReports, getReportValues } from "@/lib/reports";
import { NUTRIENT_MAP, getStatus } from "@/lib/nutrients";
import DeleteReportButton from "@/components/DeleteReportButton";

export default async function ReportsPage() {
  const session = await getSession();
  const reports = listReports(session!.userId);

  const summaries = reports.map((report) => {
    const values = getReportValues(report.id);
    let outOfRange = 0;
    for (const v of values) {
      const nutrient = NUTRIENT_MAP[v.nutrient_key];
      if (nutrient && getStatus(nutrient, v.value) !== "normal") outOfRange++;
    }
    return { report, count: values.length, outOfRange };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Saved Reports</h1>
          <p className="text-slate-500 text-sm mt-1">All the lab reports you&apos;ve submitted.</p>
        </div>
        <Link
          href="/dashboard"
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          + New Report
        </Link>
      </div>

      {summaries.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          You haven&apos;t submitted any reports yet.{" "}
          <Link href="/dashboard" className="text-emerald-700 font-medium hover:underline">
            Submit your first report
          </Link>
          .
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {summaries.map(({ report, count, outOfRange }) => (
            <div key={report.id} className="rounded-xl border border-slate-200 bg-white p-5 flex flex-col justify-between">
              <div>
                <p className="font-semibold text-slate-900">
                  {new Date(report.report_date + "T00:00:00").toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  {count} value{count === 1 ? "" : "s"} logged
                </p>
                {outOfRange > 0 ? (
                  <span className="mt-2 inline-block rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                    {outOfRange} out of range
                  </span>
                ) : (
                  <span className="mt-2 inline-block rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                    All normal
                  </span>
                )}
              </div>
              <div className="mt-4 flex items-center gap-2">
                <Link
                  href={`/reports/${report.id}`}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  View details
                </Link>
                <DeleteReportButton reportId={report.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
