import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { getUserNutrientSettings, setNutrientEnabled } from "@/lib/settings";
import { NUTRIENT_MAP } from "@/lib/nutrients";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  return NextResponse.json({ settings: getUserNutrientSettings(session.userId) });
}

const schema = z.object({
  nutrientKey: z.string().min(1),
  enabled: z.boolean(),
});

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  if (!NUTRIENT_MAP[parsed.data.nutrientKey]) {
    return NextResponse.json({ error: "Unknown nutrient" }, { status: 400 });
  }

  setNutrientEnabled(session.userId, parsed.data.nutrientKey, parsed.data.enabled);
  return NextResponse.json({ ok: true });
}
