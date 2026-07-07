import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getReport, getReportValues, deleteReport } from "@/lib/reports";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;
  const report = getReport(session.userId, id);
  if (!report) return NextResponse.json({ error: "Report not found" }, { status: 404 });

  const values = getReportValues(report.id);
  return NextResponse.json({ report, values });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;
  const report = getReport(session.userId, id);
  if (!report) return NextResponse.json({ error: "Report not found" }, { status: 404 });

  deleteReport(session.userId, id);
  return NextResponse.json({ ok: true });
}
