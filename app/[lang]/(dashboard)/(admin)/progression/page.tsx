import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProgressionView from "./page-view";

export const metadata = {
  title: "Team Progression | Remotive SalesHub",
  description: "Track your team's sales progress, goals, and performance"
};

export default async function ProgressionPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/en/auth/login");
  }

  // Get user role
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      profile: { select: { role: true } }
    }
  });

  const role = user?.profile?.role || "salesperson";

  // Only managers and above can access
  if (!["owner", "director", "manager"].includes(role)) {
    redirect("/en/dashboard");
  }

  return <ProgressionView session={session} role={role} />;
}
