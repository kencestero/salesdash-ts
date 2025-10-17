"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CreditApplicationForm } from "@/components/credit/CreditApplicationForm";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export default function PublicCreditApplicationPage() {
  const params = useParams();
  const router = useRouter();
  const repCode = params.repCode as string;

  const [repInfo, setRepInfo] = useState<{
    repCode: string;
    repName: string;
    valid: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [appNumber, setAppNumber] = useState<string | null>(null);

  useEffect(() => {
    async function validateRepCode() {
      try {
        // Validate the rep code exists
        const response = await fetch(`/api/validate-rep/${repCode}`);

        if (!response.ok) {
          throw new Error("Invalid or expired representative code");
        }

        const data = await response.json();
        setRepInfo({
          repCode,
          repName: data.repName,
          valid: true,
        });
      } catch (err: any) {
        console.error("Error validating rep code:", err);
        setError(err.message || "Failed to validate representative code");
        setRepInfo({
          repCode,
          repName: "Unknown",
          valid: false,
        });
      } finally {
        setLoading(false);
      }
    }

    if (repCode) {
      validateRepCode();
    }
  }, [repCode]);

  const handleSubmitSuccess = (submittedAppNumber: string) => {
    setAppNumber(submittedAppNumber);
    setSubmitted(true);

    // Scroll to top to show success message
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-[#E96114] mb-4" />
          <p className="text-lg text-gray-600">Validating representative code...</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-6">
        <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <CheckCircle2 className="w-14 h-14 text-white" />
          </div>

          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-[#E96114] to-[#09213C] bg-clip-text text-transparent">
            Application Submitted!
          </h1>

          <p className="text-xl text-gray-700 mb-2">
            Thank you for submitting your credit application.
          </p>

          <div className="bg-gradient-to-r from-[#E96114]/10 to-[#09213C]/10 rounded-2xl p-6 my-8 border-2 border-[#E96114]/30">
            <p className="text-sm text-gray-600 mb-2">Your Application Number</p>
            <p className="text-3xl font-bold text-[#09213C] tracking-wider">{appNumber}</p>
          </div>

          <div className="bg-blue-50 rounded-xl p-6 border border-blue-200 mb-6">
            <div className="flex items-start gap-3">
              <User className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
              <div className="text-left">
                <p className="font-semibold text-blue-900 mb-1">Your Sales Representative</p>
                <p className="text-blue-700">
                  {repInfo?.repName} (Rep Code: {repCode})
                </p>
                <p className="text-sm text-blue-600 mt-2">
                  Your representative has been notified and will review your application shortly.
                </p>
              </div>
            </div>
          </div>

          <div className="text-left space-y-3 text-gray-600 mb-8">
            <p className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              We'll review your application within 24-48 hours
            </p>
            <p className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              You'll receive an email confirmation shortly
            </p>
            <p className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              Your representative will contact you with next steps
            </p>
          </div>

          <p className="text-sm text-gray-500">
            Questions? Contact us at{" "}
            <a href="tel:+15555551234" className="text-[#E96114] hover:underline font-semibold">
              (555) 555-1234
            </a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Representative Info Banner */}
        {repInfo?.valid && (
          <Alert className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
            <User className="h-5 w-5 text-blue-600" />
            <AlertDescription className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="font-semibold text-blue-900 text-lg">
                  Application Handled by: {repInfo.repName}
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  Rep Code: <span className="font-mono font-bold">{repCode}</span>
                </p>
              </div>
              <div className="flex items-center gap-2 bg-green-100 px-4 py-2 rounded-full">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">Verified Representative</span>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Error Banner */}
        {error && (
          <Alert className="mb-8 bg-red-50 border-2 border-red-200">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <AlertDescription className="text-red-800">
              <p className="font-semibold">Error validating representative code</p>
              <p className="text-sm mt-1">{error}</p>
              <p className="text-sm mt-2">
                You can still submit your application, but it won't be assigned to a specific representative.
              </p>
            </AlertDescription>
          </Alert>
        )}

        {/* Credit Application Form */}
        <CreditApplicationForm
          shareToken={repCode} // Use repCode as shareToken for tracking
          onSubmitSuccess={handleSubmitSuccess}
        />
      </div>
    </div>
  );
}
