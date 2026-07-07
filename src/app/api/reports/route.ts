import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { createReport, listReports } from "@/lib/reports";
import { NUTRIENT_MAP } from "@/lib/nutrients";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  return NextResponse.json({ reports: await listReports(session.userId) });
}

const schema = z.object({
  reportDate: z.string().min(1),
  note: z.string().max(500).optional(),
  values: z
    .array(
      z.object({
        key: z.string().min(1),
        value: z.number().finite(),
      })
    )
    .min(1, "Enter at least one lab value"),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const values = parsed.data.values.filter((v) => NUTRIENT_MAP[v.key]);
  if (values.length === 0) {
    return NextResponse.json({ error: "No valid lab values provided" }, { status: 400 });
  }

  const report = await createReport(session.userId, parsed.data.reportDate, parsed.data.note, values);
  return NextResponse.json({ report });
}
