/**
 * CRM Pipeline Professional Demo Page (Server Component)
 * Showcases the redesigned professional pipeline cards with enhanced features
 */

import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import PipelineProDemoView from "./page-view";

export const metadata: Metadata = {
  title: "Pipeline Pro Demo | SalesDash CRM",
  description: "Professional CRM pipeline redesign demonstration with enhanced features and modern UI",
};

export default async function PipelineProDemoPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/en/login");
  }

  return <PipelineProDemoView />;
}
