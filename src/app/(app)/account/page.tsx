import { getSession } from "@/lib/auth";
import { getUserNutrientSettings } from "@/lib/settings";
import { findUserById } from "@/lib/users";
import AccountPanel from "@/components/AccountPanel";

export default async function AccountPage() {
  const session = await getSession();
  const user = (await findUserById(session!.userId))!;
  const settings = await getUserNutrientSettings(session!.userId);

  return (
    <AccountPanel
      name={user.name}
      email={user.email}
      memberSince={user.created_at}
      initialSettings={settings}
    />
  );
}
