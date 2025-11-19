import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import MessagesView from "./page-view";

export default async function MessagesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/en/login");
  }

  return <MessagesView session={session} />;
}
