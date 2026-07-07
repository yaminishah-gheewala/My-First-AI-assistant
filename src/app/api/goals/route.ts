import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { createGoal, listGoals } from "@/lib/goals";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  return NextResponse.json({ goals: await listGoals(session.userId) });
}

const schema = z.object({
  title: z.string().trim().min(1).max(200),
  nutrientKey: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const goal = await createGoal(session.userId, parsed.data.title, parsed.data.nutrientKey);
  return NextResponse.json({ goal });
}
