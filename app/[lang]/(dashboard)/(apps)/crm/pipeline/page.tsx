/**
 * CRM Pipeline Page (Server Component)
 * Enhanced with 3-way view toggle: Kanban | List | Table
 */

import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import PipelineViewEnhancedV2 from "./page-view-enhanced-v2";

export const metadata: Metadata = {
  title: "Sales Pipeline | SalesDash CRM",
  description: "Manage your sales pipeline with Kanban board, list view, and table view",
};

export default async function PipelinePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/en/login");
  }

  return <PipelineViewEnhancedV2 session={session} />;
}
