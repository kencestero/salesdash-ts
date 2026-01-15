import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import MySalesReportView from "./page-view";

export const metadata = {
  title: "My Sales | Remotive",
  description: "View your personal sales performance",
};

export default async function MySalesReportPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/en/login");
  }

  return <MySalesReportView session={session} />;
}
