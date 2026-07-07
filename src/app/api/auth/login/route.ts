import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authenticateUser } from "@/lib/users";
import { createSessionToken, setSessionCookie } from "@/lib/auth";

const schema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }
  const { email, password } = parsed.data;
  const user = await authenticateUser(email, password);
  if (!user) {
    return NextResponse.json({ error: "Incorrect email or password" }, { status: 401 });
  }
  const token = await createSessionToken({ userId: user.id, email: user.email, name: user.name });
  await setSessionCookie(token);
  return NextResponse.json({ ok: true });
}
