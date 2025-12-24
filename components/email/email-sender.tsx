"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";

interface EmailSenderProps {
  type: "welcome" | "quote" | "password-reset";
  defaultData?: Record<string, any>;
  onSuccess?: () => void;
}

export default function EmailSender({ type, defaultData = {}, onSuccess }: EmailSenderProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState(defaultData);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSend = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch("/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, data: formData }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || result.error);
      }

      setSuccess(true);
      toast.success(`${type} email sent successfully!`);
      onSuccess?.();
    } catch (err: any) {
      console.error("Email send error:", err);
      setError(err.message);
      toast.error(`Failed to send email: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const renderForm = () => {
    switch (type) {
      case "welcome":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="user@example.com"
                value={formData.email || ""}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="userName">User Name</Label>
              <Input
                id="userName"
                name="userName"
                placeholder="John Doe"
                value={formData.userName || ""}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="userRole">Role</Label>
              <Input
                id="userRole"
                name="userRole"
                placeholder="Salesperson"
                value={formData.userRole || ""}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="employeeNumber">Employee Number</Label>
              <Input
                id="employeeNumber"
                name="employeeNumber"
                placeholder="REP123456"
                value={formData.employeeNumber || ""}
                onChange={handleChange}
                required
              />
            </div>
          </>
        );

      case "quote":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="customerEmail">Customer Email</Label>
              <Input
                id="customerEmail"
                name="customerEmail"
                type="email"
                placeholder="customer@example.com"
                value={formData.customerEmail || ""}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerName">Customer Name</Label>
              <Input
                id="customerName"
                name="customerName"
                placeholder="Jane Smith"
                value={formData.customerName || ""}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unitDescription">Unit Description</Label>
              <Input
                id="unitDescription"
                name="unitDescription"
                placeholder="7x16 Tandem Axle Enclosed Cargo Trailer"
                value={formData.unitDescription || ""}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unitPrice">Unit Price</Label>
              <Input
                id="unitPrice"
                name="unitPrice"
                type="number"
                placeholder="8500"
                value={formData.unitPrice || ""}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quoteLink">Quote Link</Label>
              <Input
                id="quoteLink"
                name="quoteLink"
                type="url"
                placeholder="https://salesdash.com/quote/abc123"
                value={formData.quoteLink || ""}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="repName">Rep Name</Label>
              <Input
                id="repName"
                name="repName"
                placeholder="Your Name"
                value={formData.repName || ""}
                onChange={handleChange}
                required
              />
            </div>
          </>
        );

      case "password-reset":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="user@example.com"
                value={formData.email || ""}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="userName">User Name</Label>
              <Input
                id="userName"
                name="userName"
                placeholder="John Doe"
                value={formData.userName || ""}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="resetLink">Reset Link</Label>
              <Input
                id="resetLink"
                name="resetLink"
                type="url"
                placeholder="https://salesdash.com/reset/token123"
                value={formData.resetLink || ""}
                onChange={handleChange}
                required
              />
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-orange-500" />
          Send {type.charAt(0).toUpperCase() + type.slice(1).replace("-", " ")} Email
        </CardTitle>
        <CardDescription>
          This email will use the Remotive Logistics branded template with orange styling
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {renderForm()}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-500 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Email sent successfully! Check the recipient's inbox (and spam folder).
            </AlertDescription>
          </Alert>
        )}

        <Button
          onClick={handleSend}
          disabled={loading || success}
          className="w-full"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending Email...
            </>
          ) : success ? (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Email Sent!
            </>
          ) : (
            <>
              <Mail className="mr-2 h-4 w-4" />
              Send Email
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
