import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { makeCode } from "@/lib/join-code";

export default async function JoinCodePage() {
  const session = await getServerSession(authOptions as any);
  const email = session?.user?.email?.toLowerCase() || "";
  const admins = (process.env.ADMIN_EMAILS || "")
    .split(",").map(s => s.trim().toLowerCase()).filter(Boolean);

  if (!admins.includes(email)) {
    return (
      <div className="p-8">
        <h1 className="text-xl font-semibold text-red-600">Not authorized</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Only admin users can view join codes.
        </p>
      </div>
    );
  }

  const secret = process.env.ACCESS_JOIN_SECRET || "";
  if (!secret) {
    return (
      <div className="p-8">
        <h1 className="text-xl font-semibold text-yellow-600">Configuration Error</h1>
        <p className="text-sm text-muted-foreground mt-2">
          ACCESS_JOIN_SECRET not configured in environment.
        </p>
      </div>
    );
  }

  const code = makeCode(secret, 0);

  return (
    <div className="p-8 space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Today&apos;s Join Code</h1>
        <p className="text-sm text-muted-foreground">Share this with new team members</p>
      </div>
      
      <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950 p-6 rounded-lg border border-orange-200 dark:border-orange-800">
        <div className="text-4xl font-bold tracking-[0.5em] text-center text-orange-600 dark:text-orange-400 font-mono">
          {code}
        </div>
      </div>
      
      <div className="text-sm text-muted-foreground space-y-1">
        <p>• This code changes daily at midnight UTC</p>
        <p>• New hires enter this code to gain access to the dashboard</p>
        <p>• Yesterday&apos;s code is valid until noon today</p>
      </div>
    </div>
  );
}