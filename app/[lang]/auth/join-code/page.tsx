import { getAllTodayCodes } from "@/lib/joinCode";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function JoinCodePage() {
  // Only managers and owners can see this page
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/en/auth/login");
  }

  // Check if user is owner or manager
  const owners = process.env.OWNERS?.split(",") || [];
  const managers = process.env.MANAGERS?.split(",") || [];
  const isAuthorized = owners.includes(session.user.email) || managers.includes(session.user.email);

  // Also check database role
  const userProfile = await prisma.userProfile.findUnique({
    where: { userId: session.user.id },
  });

  const hasManagerRole = userProfile?.role === "owner" || userProfile?.role === "manager";

  if (!isAuthorized && !hasManagerRole) {
    redirect("/en/dashboard");
  }

  const codes = getAllTodayCodes();

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-semibold mb-6">Today&apos;s Join Codes</h1>
      <p className="text-sm mb-6 opacity-70">
        Share these codes with new hires based on their role. Codes rotate daily at midnight (NY time).
      </p>

      <div className="space-y-4">
        {/* Salesperson Code */}
        <div className="bg-card p-6 rounded-lg border">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-medium">Sales Representative</h2>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">SALESPERSON</span>
          </div>
          <div className="text-3xl font-mono bg-muted p-4 rounded text-center">{codes.salesperson}</div>
          <p className="text-xs mt-2 opacity-60">For sales team members</p>
        </div>

        {/* Manager Code */}
        <div className="bg-card p-6 rounded-lg border border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-medium">Manager</h2>
            <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">MANAGER</span>
          </div>
          <div className="text-3xl font-mono bg-muted p-4 rounded text-center">{codes.manager}</div>
          <p className="text-xs mt-2 opacity-60">For team managers</p>
        </div>

        {/* Owner Code - Only show to owners */}
        {(owners.includes(session.user.email) || userProfile?.role === "owner") && (
          <div className="bg-card p-6 rounded-lg border border-red-200">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-medium">Owner / Admin</h2>
              <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">OWNER</span>
            </div>
            <div className="text-3xl font-mono bg-muted p-4 rounded text-center">{codes.owner}</div>
            <p className="text-xs mt-2 opacity-60">⚠️ Ask owners before sharing this code</p>
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> The role assigned is based on which code the new user enters during signup.
        </p>
      </div>
    </main>
  );
}