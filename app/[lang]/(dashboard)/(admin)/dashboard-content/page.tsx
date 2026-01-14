import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardContentManager from "./page-view";

export default async function DashboardContentPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/en/auth/login");
  }

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { profile: true },
  });

  if (!currentUser?.profile || !["owner", "director"].includes(currentUser.profile.role)) {
    redirect("/en/dashboard");
  }

  return <DashboardContentManager />;
}
