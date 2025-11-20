import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ActivityDashboard } from "@/components/dashboard/ActivityDashboard";

export default async function ActivityDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/en/login");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-default-900">Activity Dashboard</h1>
          <p className="text-sm text-default-600 mt-1">
            Track and analyze all CRM activities
          </p>
        </div>
      </div>

      <ActivityDashboard />
    </div>
  );
}
