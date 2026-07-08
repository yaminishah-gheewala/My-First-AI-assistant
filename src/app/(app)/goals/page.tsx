import { getSession } from "@/lib/auth";
import { listGoals } from "@/lib/goals";
import GoalsList from "@/components/GoalsList";

export default async function GoalsPage() {
  const session = await getSession();
  const goals = await listGoals(session!.userId);
  return <GoalsList goals={goals} />;
}
