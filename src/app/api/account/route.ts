import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession, clearAllAuthCookies, verifyPassword } from "@/lib/auth";
import { findUserById, updatePassword, deleteUser } from "@/lib/users";

const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = passwordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const user = await findUserById(session.userId);
  if (!user) return NextResponse.json({ error: "Account not found" }, { status: 404 });

  const valid = await verifyPassword(parsed.data.currentPassword, user.password_hash);
  if (!valid) {
    return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
  }

  await updatePassword(user.id, parsed.data.newPassword);
  return NextResponse.json({ ok: true });
}

const deleteSchema = z.object({
  password: z.string().min(1, "Password is required to delete your account"),
});

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = deleteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const user = await findUserById(session.userId);
  if (!user) return NextResponse.json({ error: "Account not found" }, { status: 404 });

  const valid = await verifyPassword(parsed.data.password, user.password_hash);
  if (!valid) {
    return NextResponse.json({ error: "Password is incorrect" }, { status: 400 });
  }

  await deleteUser(user.id);
  await clearAllAuthCookies();
  return NextResponse.json({ ok: true });
}
