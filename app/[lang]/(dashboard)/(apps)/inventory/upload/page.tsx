import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import UploadPageView from "./page-view";

export const metadata: Metadata = {
  title: "Upload Inventory - Remotive Logistics SalesDash",
  description: "Upload trailer inventory from manufacturers",
};

export default async function UploadInventoryPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/en/login");
  }

  return <UploadPageView session={session} />;
}
