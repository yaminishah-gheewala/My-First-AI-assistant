import { getSession } from "@/lib/auth";
import { getUserNutrientSettings } from "@/lib/settings";
import LabAnalyzer from "@/components/LabAnalyzer";

export default async function DashboardPage() {
  const session = await getSession();
  const settings = getUserNutrientSettings(session!.userId);
  return <LabAnalyzer initialSettings={settings} />;
}
