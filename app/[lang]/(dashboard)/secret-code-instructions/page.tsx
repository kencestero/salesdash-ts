import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Key, Users, Shield, Clock, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Secret Code Instructions",
  description: "Guide for inviting new team members with role-based codes",
};

export default async function SecretCodeInstructionsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/en/auth/login");
  }

  // Check if user is owner or manager
  const owners = process.env.OWNERS?.split(",") || [];
  const managers = process.env.MANAGERS?.split(",") || [];
  const isAuthorized = owners.includes(session.user.email) || managers.includes(session.user.email);

  const userProfile = await prisma.userProfile.findUnique({
    where: { userId: session.user.id },
  });

  const hasManagerRole = userProfile?.role === "owner" || userProfile?.role === "manager";

  if (!isAuthorized && !hasManagerRole) {
    redirect("/en/dashboard");
  }

  const isOwner = owners.includes(session.user.email) || userProfile?.role === "owner";

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Secret Code Instructions</h1>
        <p className="text-muted-foreground">
          Learn how to invite new team members using role-based join codes
        </p>
      </div>

      {/* Quick Access Button */}
      <div className="mb-6">
        <Link href="/en/auth/join-code">
          <Button size="lg" className="w-full sm:w-auto">
            <Key className="mr-2 h-4 w-4" />
            View Today's Join Codes
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* How It Works */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            How the 4-Code System Works
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            {/* Step 1 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                1
              </div>
              <div>
                <h3 className="font-semibold mb-1">View Available Codes</h3>
                <p className="text-sm text-muted-foreground">
                  Visit the join codes page to see today's codes. You'll see different codes based on your role.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                2
              </div>
              <div>
                <h3 className="font-semibold mb-1">Choose the Right Code</h3>
                <p className="text-sm text-muted-foreground">
                  Select the code that matches the role you want to assign to the new hire.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                3
              </div>
              <div>
                <h3 className="font-semibold mb-1">Share the Code</h3>
                <p className="text-sm text-muted-foreground">
                  Send the 6-character code to the new team member via text, email, or phone.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                4
              </div>
              <div>
                <h3 className="font-semibold mb-1">They Sign Up</h3>
                <p className="text-sm text-muted-foreground">
                  New hire goes to <code className="bg-muted px-1 py-0.5 rounded text-xs">salesdash-ts.vercel.app/en/auth/join</code>, enters the code, and signs in with Google.
                </p>
              </div>
            </div>

            {/* Step 5 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                5
              </div>
              <div>
                <h3 className="font-semibold mb-1">Role Auto-Assigned</h3>
                <p className="text-sm text-muted-foreground">
                  Their role is automatically set based on which code they used. Done!
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* The 4 Code Types */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            The 4 Code Types
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Salesperson */}
          <div className="border-l-4 border-blue-500 pl-4 py-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-medium">SALESPERSON</span>
              <h3 className="font-semibold">Sales Representative Code</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              For hiring new sales team members
            </p>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>✅ Access to sales dashboard</li>
              <li>✅ Lead management</li>
              <li>✅ Customer information</li>
              <li>❌ Cannot view join codes</li>
            </ul>
          </div>

          {/* Manager */}
          <div className="border-l-4 border-orange-500 pl-4 py-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded font-medium">MANAGER</span>
              <h3 className="font-semibold">Manager Code</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              For hiring team managers
            </p>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>✅ All Salesperson permissions</li>
              <li>✅ Can view join codes (Salesperson + Manager)</li>
              <li>✅ Team management features</li>
              <li>❌ Cannot see Owner code</li>
            </ul>
          </div>

          {/* Director */}
          <div className="border-l-4 border-purple-500 pl-4 py-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded font-medium">DIRECTOR</span>
              <h3 className="font-semibold">Director Code</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              For hiring senior management and directors
            </p>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>✅ All Manager permissions</li>
              <li>✅ Multi-team oversight</li>
              <li>✅ Advanced analytics and reporting</li>
              <li>✅ Can view all team member activities</li>
              <li>❌ Cannot see Owner code</li>
            </ul>
          </div>

          {/* Owner - Only show to owners */}
          {isOwner && (
            <div className="border-l-4 border-red-500 pl-4 py-2 bg-red-50/50">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded font-medium">OWNER</span>
                <h3 className="font-semibold">Owner/Admin Code</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                ⚠️ For adding new owners/administrators - <strong>Ask owners before sharing!</strong>
              </p>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>✅ Full system access</li>
                <li>✅ Can view ALL 3 codes</li>
                <li>✅ System configuration</li>
                <li>✅ User management</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Important Notes */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Important Notes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Alert>
            <AlertDescription className="flex items-start gap-2">
              <span className="font-semibold">🔄 Daily Rotation:</span>
              <span>Codes change every day at midnight (New York time). Always check for the latest code.</span>
            </AlertDescription>
          </Alert>

          <Alert>
            <AlertDescription className="flex items-start gap-2">
              <span className="font-semibold">🔒 One-Time Use:</span>
              <span>Once someone joins with a code, they don't need it again. Their role is permanently saved.</span>
            </AlertDescription>
          </Alert>

          <Alert>
            <AlertDescription className="flex items-start gap-2">
              <span className="font-semibold">📧 Google Account Required:</span>
              <span>New users must have a Google account to sign in. No other sign-in methods are available.</span>
            </AlertDescription>
          </Alert>

          <Alert>
            <AlertDescription className="flex items-start gap-2">
              <span className="font-semibold">🔢 Employee Numbers:</span>
              <span>Every team member gets a unique employee number (e.g., REP123456, SMA123456, DIR123456). All their activity in the Dashboard is tracked and can be viewed by Managers, Directors, and Owners.</span>
            </AlertDescription>
          </Alert>

          {isOwner && (
            <Alert variant="destructive">
              <AlertDescription className="flex items-start gap-2">
                <span className="font-semibold">⚠️ Owner Code Security:</span>
                <span>The Owner code grants full system access. Only share with trusted administrators and notify other owners first.</span>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Example Message Template */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Example Invitation Message</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-4 rounded-lg text-sm font-mono">
            <p className="mb-2">Hi [Name],</p>
            <p className="mb-2">Welcome to MJ Cargo Trailers!</p>
            <p className="mb-2">To access the SalesDash system:</p>
            <p className="mb-1">1. Go to: <span className="text-primary">salesdash-ts.vercel.app/en/auth/join</span></p>
            <p className="mb-1">2. Enter this code: <span className="bg-yellow-200 px-2 py-0.5 rounded">ABC123</span></p>
            <p className="mb-2">3. Sign in with your Google account</p>
            <p className="mb-2">The code expires at midnight (NY time), so please complete registration today.</p>
            <p>Questions? Contact me at [Your Contact]</p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/en/auth/join-code">
          <Card className="hover:bg-accent transition-colors cursor-pointer h-full">
            <CardContent className="pt-6">
              <Key className="h-8 w-8 mb-2 text-primary" />
              <h3 className="font-semibold mb-1">View Join Codes</h3>
              <p className="text-sm text-muted-foreground">
                See today's codes for all roles
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/en/dashboard">
          <Card className="hover:bg-accent transition-colors cursor-pointer h-full">
            <CardContent className="pt-6">
              <ArrowRight className="h-8 w-8 mb-2 text-primary" />
              <h3 className="font-semibold mb-1">Back to Dashboard</h3>
              <p className="text-sm text-muted-foreground">
                Return to main dashboard
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
