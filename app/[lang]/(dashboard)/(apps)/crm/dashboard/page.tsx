/**
 * CRM Dashboard Page (Server Component)
 * Manager command center with team metrics
 */

import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import EnhancedDashboardView from "./page-view-enhanced";

export const metadata: Metadata = {
  title: "CRM Dashboard | SalesDash",
  description: "Team performance and lead insights",
};

export default async function CRMDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/en/login");
  }

  return <EnhancedDashboardView session={session} />;
}
