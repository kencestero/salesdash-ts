/**
 * CRM Pipeline Page (Server Component)
 * Fetches initial data and renders the pipeline view
 */

import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import PipelineView from "./page-view";

export const metadata: Metadata = {
  title: "Sales Pipeline | SalesDash CRM",
  description: "Visual kanban board for managing your sales pipeline",
};

export default async function PipelinePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/en/login");
  }

  return <PipelineView session={session} />;
}
