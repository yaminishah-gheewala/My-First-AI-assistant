import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getSession, RETURNING_COOKIE } from "@/lib/auth";

export default async function RootPage() {
  const session = await getSession();
  if (session) redirect("/dashboard");
  const cookieStore = await cookies();
  const returning = cookieStore.get(RETURNING_COOKIE)?.value === "1";
  redirect(returning ? "/login" : "/signup");
}
