import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createUser } from "@/lib/users";
import { createSessionToken, setSessionCookie } from "@/lib/auth";

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
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
  const { name, email, password } = parsed.data;
  try {
    const user = await createUser(email, name, password);
    const token = await createSessionToken({ userId: user.id, email: user.email, name: user.name });
    await setSessionCookie(token);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not create account";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
