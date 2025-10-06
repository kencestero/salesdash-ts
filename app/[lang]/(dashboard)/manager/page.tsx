import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Key } from "lucide-react";

export const metadata: Metadata = {
  title: "Manager Access",
  description: "Manager-only access page",
};

// Generate daily secret code based on current date
function getDailySecretCode(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const dateString = `${year}-${month}-${day}`;

  // Simple hash function to generate 6-digit code from date
  let hash = 0;
  for (let i = 0; i < dateString.length; i++) {
    const char = dateString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }

  // Convert to 6-digit positive number
  const code = Math.abs(hash % 1000000).toString().padStart(6, '0');
  return code;
}

// Get time until midnight
function getTimeUntilMidnight(): string {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);

  const diff = midnight.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return `${hours}h ${minutes}m`;
}

export default async function ManagerPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/auth/login");
  }

  // Get user profile with role
  const userProfile = await prisma.userProfile.findUnique({
    where: { email: session.user.email },
  });

  // Check if user is manager or owner
  const isAuthorized = userProfile?.role === "manager" || userProfile?.role === "owner";

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertDescription>
                You do not have permission to access this page. Only managers and owners can view this content.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  const secretCode = getDailySecretCode();
  const timeUntilReset = getTimeUntilMidnight();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Manager Access</h1>
        <p className="text-muted-foreground">Daily rotating secret code for secure access</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Today&apos;s Secret Code
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-primary/10 p-6 rounded-lg text-center">
            <div className="text-sm text-muted-foreground mb-2">Current Access Code</div>
            <div className="text-5xl font-bold font-mono tracking-wider">{secretCode}</div>
          </div>

          <Alert>
            <AlertDescription className="text-center">
              This code resets daily at 12:00 AM
              <br />
              <span className="font-semibold">Time until reset: {timeUntilReset}</span>
            </AlertDescription>
          </Alert>

          <div className="text-sm text-muted-foreground space-y-1">
            <p>• Share this code only with authorized personnel</p>
            <p>• Code changes automatically at midnight</p>
            <p>• This page is only accessible to managers and owners</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
