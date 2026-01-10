import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import SalesReportView from "./page-view";

export const metadata = {
  title: "Sales Report | Remotive",
  description: "View and analyze sales performance",
};

export default async function SalesReportPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/en/login");
  }

  return <SalesReportView session={session} />;
}
