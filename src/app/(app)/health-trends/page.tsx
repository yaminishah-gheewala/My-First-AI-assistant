import { getSession } from "@/lib/auth";
import { listAllValuesForUser } from "@/lib/reports";
import { NUTRIENT_MAP } from "@/lib/nutrients";
import HealthTrendsView, { TrendPoint } from "@/components/HealthTrendsView";

export default async function HealthTrendsPage() {
  const session = await getSession();
  const rows = await listAllValuesForUser(session!.userId);

  const byNutrient = new Map<string, TrendPoint[]>();
  for (const row of rows) {
    if (!NUTRIENT_MAP[row.nutrient_key]) continue;
    if (!byNutrient.has(row.nutrient_key)) byNutrient.set(row.nutrient_key, []);
    byNutrient.get(row.nutrient_key)!.push({ date: row.report_date, value: row.value });
  }

  const series = Array.from(byNutrient.entries()).map(([key, points]) => ({
    key,
    points,
  }));

  return <HealthTrendsView series={series} />;
}
