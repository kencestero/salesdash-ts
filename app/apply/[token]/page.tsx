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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="max-w-2xl">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Application Submitted!</CardTitle>
              <CardDescription>
                Thank you for applying for financing with MJ Cargo Sales
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-900 mb-1">
                  Your Application Number:
                </p>
                <p className="text-2xl font-bold text-blue-600">{appNumber}</p>
              </div>

              <div className="space-y-3 text-sm text-gray-600">
                <p>
                  <strong>What happens next?</strong>
                </p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>
                    Our finance team will review your application within 1-2 business days
                  </li>
                  <li>
                    You'll receive an email confirmation at the address you provided
                  </li>
                  <li>
                    We may contact you if additional information is needed
                  </li>
                  <li>
                    Once approved, a sales representative will reach out to finalize your
                    purchase
                  </li>
                </ul>
              </div>

              <div className="pt-4 border-t">
                <p className="text-xs text-gray-500 text-center">
                  Please save your application number for reference. You can contact us at
                  any time regarding your application.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Credit Application
          </h1>
          <p className="text-lg text-gray-600">
            MJ Cargo Sales - Finance Your Equipment Today
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Complete the form below to apply for financing
          </p>
        </div>

        <CreditApplicationForm
          shareToken={shareToken}
          onSubmitSuccess={handleSuccess}
        />

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            Your information is secure and will only be used to process your credit
            application. By submitting this form, you authorize MJ Cargo Sales to
            perform a credit check.
          </p>
        </div>
      </div>
    </div>
  );
}
