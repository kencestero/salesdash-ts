"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CreditApplicationForm } from "@/components/credit/CreditApplicationForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function PublicCreditApplicationPage() {
  const params = useParams();
  const router = useRouter();
  const shareToken = params.token as string;
  const [isSuccess, setIsSuccess] = useState(false);
  const [appNumber, setAppNumber] = useState<string | null>(null);

  const handleSuccess = (applicationNumber: string) => {
    setAppNumber(applicationNumber);
    setIsSuccess(true);
  };

  if (isSuccess && appNumber) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#E96114]/5 via-white to-[#09213C]/5 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="max-w-3xl border-2 border-green-500/30 shadow-2xl">
            <CardHeader className="text-center bg-gradient-to-r from-green-50 to-emerald-50 border-b-2 border-green-200">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="mx-auto w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mb-4 shadow-xl shadow-green-500/50"
              >
                <CheckCircle2 className="w-14 h-14 text-white" />
              </motion.div>
              <CardTitle className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Application Submitted Successfully!
              </CardTitle>
              <CardDescription className="text-lg mt-2">
                Thank you for choosing Remotive Logistics Trailers Finance Center
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 pt-8">
              <div className="bg-gradient-to-r from-[#E96114]/10 to-[#09213C]/10 border-2 border-[#E96114]/30 rounded-xl p-6 text-center shadow-lg">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Your Application Number:
                </p>
                <p className="text-4xl font-bold bg-gradient-to-r from-[#E96114] to-[#09213C] bg-clip-text text-transparent tracking-wider">
                  {appNumber}
                </p>
                <p className="text-xs text-gray-500 mt-2">Save this number for your records</p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-3 p-4 bg-[#E96114]/5 rounded-lg border border-[#E96114]/20">
                  <div className="w-8 h-8 rounded-full bg-[#E96114] text-white flex items-center justify-center font-bold flex-shrink-0">
                    1
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Immediate Email Confirmation</p>
                    <p className="text-sm text-gray-600">
                      Check your inbox for a confirmation with your application details
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-[#09213C]/5 rounded-lg border border-[#09213C]/20">
                  <div className="w-8 h-8 rounded-full bg-[#09213C] text-white flex items-center justify-center font-bold flex-shrink-0">
                    2
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Fast Review Process</p>
                    <p className="text-sm text-gray-600">
                      Our finance team will review within 1-2 business days (often same-day!)
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                    3
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Get Approved & Drive Away</p>
                    <p className="text-sm text-gray-600">
                      Once approved, your sales rep will contact you to finalize and schedule delivery
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t-2 border-dashed border-gray-200 text-center">
                <p className="text-sm text-gray-600 font-medium mb-2">
                  Questions? We're here to help!
                </p>
                <p className="text-xs text-gray-500">
                  Contact our finance team anytime with your application number:<br/>
                  <strong className="text-[#E96114]">{appNumber}</strong>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E96114]/5 via-white to-[#09213C]/5 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">

        <CreditApplicationForm
          shareToken={shareToken}
          onSubmitSuccess={handleSuccess}
        />

        <div className="mt-12 text-center">
          <div className="max-w-2xl mx-auto p-6 bg-white/80 backdrop-blur rounded-xl border border-[#E96114]/20 shadow-lg">
            <p className="text-sm text-gray-600 leading-relaxed">
              🔒 <strong>Your information is secure</strong> and will only be used to process your credit
              application. By submitting this form, you authorize Remotive Logistics Trailers to
              perform a credit check. All data is encrypted and handled in accordance with federal privacy laws.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
