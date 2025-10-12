"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, Loader2, CheckCircle2, AlertCircle, ShieldAlert } from "lucide-react";
import { toast } from "react-hot-toast";

export default function OwnerCodeRequestButton() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRequest = async () => {
    if (!confirm(
      "⚠️ SECURITY CONFIRMATION\n\n" +
      "You are about to request the Owner code, which grants FULL SYSTEM ACCESS.\n\n" +
      "The code will be sent via email to:\n" +
      "• mjcargotrailers@gmail.com\n" +
      "• kencestero@gmail.com\n\n" +
      "Your request will be logged for security purposes.\n\n" +
      "Do you want to proceed?"
    )) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch("/api/email/request-owner-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || result.error);
      }

      setSuccess(true);
      toast.success("Owner code request sent! Check email.");
    } catch (err: any) {
      console.error("Owner code request error:", err);
      setError(err.message);
      toast.error(`Failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <Button
        onClick={handleRequest}
        disabled={loading || success}
        variant="destructive"
        size="sm"
        className="w-full"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending Request...
          </>
        ) : success ? (
          <>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Request Sent!
          </>
        ) : (
          <>
            <ShieldAlert className="mr-2 h-4 w-4" />
            Request Owner Code via Email
          </>
        )}
      </Button>

      {success && (
        <Alert className="border-green-500 bg-green-50">
          <Mail className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 text-xs">
            Owner code has been sent to:<br />
            • mjcargotrailers@gmail.com<br />
            • kencestero@gmail.com
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">{error}</AlertDescription>
        </Alert>
      )}

      <p className="text-xs text-muted-foreground">
        🔐 For security, the Owner code is never displayed in the dashboard.
        It will be sent to administrators via email.
      </p>
    </div>
  );
}
