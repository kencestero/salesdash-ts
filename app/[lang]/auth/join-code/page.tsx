import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { makeCode } from "@/lib/join-code";

export default async function JoinCodePage() {
  const session = await getServerSession(authOptions as any);
  const email = session?.user?.email?.toLowerCase() || "";
  const admins = (process.env.ADMIN_EMAILS || "")
    .split(",").map(s => s.trim().toLowerCase()).filter(Boolean);

  if (!admins.includes(email)) {
    return <div className="p-8">Not authorized.</div>;
  }

  const secret = process.env.ACCESS_JOIN_SECRET || "";
  const code = makeCode(secret, 0);

  return (
    <div className="p-8 space-y-2">
      <h1 className="text-xl font-semibold">Today&apos;s join code</h1>
      <div className="text-3xl font-bold tracking-widest">{code}</div>
      <p className="text-sm text-muted-foreground">Share this with new hires. Changes daily.</p>
    </div>
  );
}