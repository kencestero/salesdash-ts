import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, Settings, TestTube, Info } from "lucide-react";
import EmailSender from "@/components/email/email-sender";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata = {
  title: "Email Center - Remotive Logistics Dashboard",
  description: "Send branded emails to customers and team members",
};

export default async function EmailCenterPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/en/auth/login");
  }

  const isConfigured = !!process.env.RESEND_API_KEY;

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Mail className="h-8 w-8 text-orange-500" />
          Email Center
        </h1>
        <p className="text-muted-foreground">
          Send professional, branded emails to customers and team members
        </p>
      </div>

      {/* Configuration Status */}
      {!isConfigured && (
        <Alert className="mb-6 border-orange-500 bg-orange-50">
          <Settings className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>Email service not configured yet.</strong>
            <br />
            To enable email sending:
            <ol className="list-decimal list-inside mt-2 space-y-1">
              <li>Sign up at <a href="https://resend.com" target="_blank" rel="noopener" className="underline">resend.com</a> (free 3,000 emails/month)</li>
              <li>Get your API key from the Resend dashboard</li>
              <li>Add <code className="bg-orange-100 px-1 rounded">RESEND_API_KEY</code> to Vercel environment variables</li>
              <li>Install packages: <code className="bg-orange-100 px-1 rounded">pnpm add resend @react-email/components</code></li>
            </ol>
          </AlertDescription>
        </Alert>
      )}

      {/* Test Email Button */}
      {isConfigured && (
        <Card className="mb-6 border-green-500 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <TestTube className="h-8 w-8 text-green-600 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-green-800 mb-1">Test Email Configuration</h3>
                <p className="text-sm text-green-700 mb-3">
                  Send a test email to verify your setup is working correctly
                </p>
                <Link href={`/api/email/test?to=${session.user.email}`} target="_blank">
                  <Button size="sm" variant="outline" className="border-green-600 text-green-700 hover:bg-green-100">
                    <TestTube className="mr-2 h-4 w-4" />
                    Send Test Email to {session.user.email}
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Email Templates */}
      <Tabs defaultValue="quote" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="quote">Quote Email</TabsTrigger>
          <TabsTrigger value="welcome">Welcome Email</TabsTrigger>
          <TabsTrigger value="password-reset">Password Reset</TabsTrigger>
        </TabsList>

        {/* Quote Email Tab */}
        <TabsContent value="quote" className="space-y-4">
          <EmailSender
            type="quote"
            defaultData={{
              repName: session.user.name || "Remotive Logistics Rep",
              repEmail: session.user.email,
            }}
          />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Info className="h-5 w-5" />
                Quote Email Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li>✅ Remotive Logistics orange branding with professional header</li>
                <li>✅ Unit details prominently displayed</li>
                <li>✅ Clickable "View My Quote" button links to quote page</li>
                <li>✅ Reply-to automatically set to your email</li>
                <li>✅ Mobile-responsive design</li>
                <li>✅ Footer with company info and legal links</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Welcome Email Tab */}
        <TabsContent value="welcome" className="space-y-4">
          <EmailSender type="welcome" />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Info className="h-5 w-5" />
                Welcome Email Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li>✅ Personalized greeting with employee details</li>
                <li>✅ Employee number and role highlighted</li>
                <li>✅ Quick start guide with dashboard link</li>
                <li>✅ Onboarding checklist included</li>
                <li>✅ Sent automatically when new users join (optional)</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Password Reset Tab */}
        <TabsContent value="password-reset" className="space-y-4">
          <EmailSender type="password-reset" />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Info className="h-5 w-5" />
                Password Reset Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li>✅ Secure password reset link</li>
                <li>✅ Expiration timer clearly displayed</li>
                <li>✅ Security warnings for unsolicited requests</li>
                <li>✅ One-time use token protection</li>
                <li>✅ Integration with forgot password flow</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Documentation Card */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Email Template Documentation</CardTitle>
          <CardDescription>
            All email templates are located in <code className="bg-muted px-1 rounded">/lib/email/templates/</code>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <strong>Base Template:</strong> <code className="bg-muted px-1 rounded">mj-cargo-base.tsx</code>
            <p className="text-muted-foreground">Reusable base template with Remotive Logistics orange branding, header, footer, and CTA button</p>
          </div>
          <div>
            <strong>API Endpoints:</strong>
            <ul className="list-disc list-inside text-muted-foreground ml-2 mt-1">
              <li><code className="bg-muted px-1 rounded">POST /api/email/send</code> - Send emails from dashboard</li>
              <li><code className="bg-muted px-1 rounded">GET /api/email/test</code> - Test email configuration</li>
            </ul>
          </div>
          <div>
            <strong>Resend Features:</strong>
            <ul className="list-disc list-inside text-muted-foreground ml-2 mt-1">
              <li>Email analytics and tracking (opens, clicks)</li>
              <li>Delivery reports and bounce handling</li>
              <li>Custom tags for categorization</li>
              <li>99.9% uptime SLA</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
