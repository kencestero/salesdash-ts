import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Key, Users, Shield, Clock, ArrowRight } from "lucide-react";
import OwnerCodeRequestButton from "@/components/owner-code-request-button";

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
            View Today Join Codes
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
            {/* Steps... */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">1</div>
              <div>
                <h3 className="font-semibold mb-1">View Available Codes</h3>
                <p className="text-sm text-muted-foreground">Visit the join codes page to see today codes.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">2</div>
              <div>
                <h3 className="font-semibold mb-1">Choose the Right Code</h3>
                <p className="text-sm text-muted-foreground">Select the code matching the role for the new hire.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">3</div>
              <div>
                <h3 className="font-semibold mb-1">Share the Code</h3>
                <p className="text-sm text-muted-foreground">Send the 6-character code via text, email, or phone.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">4</div>
              <div>
                <h3 className="font-semibold mb-1">They Sign Up</h3>
                <p className="text-sm text-muted-foreground">New hire goes to salesdash-ts.vercel.app/en/auth/join</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">5</div>
              <div>
                <h3 className="font-semibold mb-1">Role Auto-Assigned</h3>
                <p className="text-sm text-muted-foreground">Their role is automatically set based on the code used.</p>
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
            <p className="text-sm text-muted-foreground mb-2">For hiring new sales team members</p>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>✅ Access to sales dashboard</li>
              <li>✅ Lead management</li>
              <li>❌ Cannot view join codes</li>
            </ul>
          </div>

          {/* Manager */}
          <div className="border-l-4 border-orange-500 pl-4 py-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded font-medium">MANAGER</span>
              <h3 className="font-semibold">Manager Code</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-2">For hiring team managers</p>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>✅ All Salesperson permissions</li>
              <li>✅ Can view join codes</li>
              <li>❌ Cannot see Owner code</li>
            </ul>
          </div>

          {/* Director */}
          <div className="border-l-4 border-purple-500 pl-4 py-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded font-medium">DIRECTOR</span>
              <h3 className="font-semibold">Director Code</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-2">For hiring senior management and directors</p>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>✅ All Manager permissions</li>
              <li>✅ Multi-team oversight</li>
              <li>❌ Cannot see Owner code</li>
            </ul>
          </div>

          {/* Owner - Request via Email */}
          <div className="border-l-4 border-red-500 pl-4 py-2 bg-red-50/50">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded font-medium">OWNER</span>
              <h3 className="font-semibold">Owner/Admin Code</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              ⚠️ For adding new owners/administrators - <strong>Highest security level</strong>
            </p>
            <ul className="text-sm space-y-1 text-muted-foreground mb-3">
              <li>✅ Full system access</li>
              <li>✅ Can view ALL 4 codes</li>
              <li>✅ System configuration</li>
            </ul>
            <OwnerCodeRequestButton />
          </div>
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
              <span>Codes change every day at midnight (New York time).</span>
            </AlertDescription>
          </Alert>

          <Alert>
            <AlertDescription className="flex items-start gap-2">
              <span className="font-semibold">🔢 Employee Numbers:</span>
              <span>Every team member gets a unique employee number. All activity is tracked.</span>
            </AlertDescription>
          </Alert>

          <Alert variant="destructive">
            <AlertDescription className="flex items-start gap-2">
              <span className="font-semibold">🔐 Owner Code Security:</span>
              <span>The Owner code is never displayed. It must be requested via email for maximum security.</span>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
