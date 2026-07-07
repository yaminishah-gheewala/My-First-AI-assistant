import Link from "next/link";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getReport, getReportValues } from "@/lib/reports";
import { NUTRIENT_MAP } from "@/lib/nutrients";
import ReportResults, { ReportResultValue } from "@/components/ReportResults";
import DeleteReportButton from "@/components/DeleteReportButton";

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  const report = getReport(session!.userId, id);
  if (!report) notFound();

  const rows = getReportValues(report.id);
  const values: ReportResultValue[] = rows
    .map((row) => {
      const nutrient = NUTRIENT_MAP[row.nutrient_key];
      return nutrient ? { nutrient, value: row.value } : null;
    })
    .filter((v): v is ReportResultValue => v !== null);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/reports" className="text-sm text-emerald-700 hover:underline">
            ← Back to Saved Reports
          </Link>
          <h1 className="text-2xl font-semibold text-slate-900 mt-1">
            {new Date(report.report_date + "T00:00:00").toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </h1>
        </div>
        <DeleteReportButton reportId={report.id} redirectTo="/reports" />
      </div>

      <ReportResults values={values} />
    </div>
  );
}
