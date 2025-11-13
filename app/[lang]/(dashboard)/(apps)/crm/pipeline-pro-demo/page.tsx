/**
 * CRM Pipeline Professional Demo Page (Server Component)
 * Showcases the redesigned professional pipeline cards with enhanced features
 */

import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import PipelineProDemoViewV2 from "./page-view-v2";

export const metadata: Metadata = {
  title: "Pipeline Pro Demo V2 | SalesDash CRM",
  description: "Enhanced CRM pipeline with theme colors, horizontal cards, table view, and required call notes",
};

export default async function PipelineProDemoPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/en/login");
  }

  return <PipelineProDemoViewV2 />;
}
