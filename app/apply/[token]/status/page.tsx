"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface ApplicationStatus {
  id: string;
  appNumber: string;
  status: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
}

export default function ApplicationStatusPage() {
  const params = useParams();
  const shareToken = params.token as string;
  const [application, setApplication] = useState<ApplicationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch(`/api/credit-applications?shareToken=${shareToken}`);

        if (!response.ok) {
          throw new Error("Application not found");
        }

        const data = await response.json();
        setApplication(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load status");
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [shareToken]);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "submitted":
        return {
          icon: <Clock className="w-8 h-8 text-blue-600" />,
          color: "bg-blue-100 text-blue-800 border-blue-200",
          title: "Under Review",
          description: "Your application is being reviewed by our finance team",
        };
      case "approved":
        return {
          icon: <CheckCircle2 className="w-8 h-8 text-green-600" />,
          color: "bg-green-100 text-green-800 border-green-200",
          title: "Approved!",
          description: "Congratulations! Your application has been approved",
        };
      case "declined":
        return {
          icon: <XCircle className="w-8 h-8 text-red-600" />,
          color: "bg-red-100 text-red-800 border-red-200",
          title: "Declined",
          description: "Unfortunately, we were unable to approve your application at this time",
        };
      case "needs_review":
        return {
          icon: <AlertCircle className="w-8 h-8 text-yellow-600" />,
          color: "bg-yellow-100 text-yellow-800 border-yellow-200",
          title: "Additional Information Needed",
          description: "Please contact us to provide additional information",
        };
      default:
        return {
          icon: <Clock className="w-8 h-8 text-gray-600" />,
          color: "bg-gray-100 text-gray-800 border-gray-200",
          title: "Pending",
          description: "Your application is pending review",
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading application status...</p>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
        <Card className="max-w-md">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
            <CardTitle className="text-center">Application Not Found</CardTitle>
            <CardDescription className="text-center">
              We couldn't find an application with this link
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 text-center">
              Please check the link or contact us for assistance.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusInfo = getStatusInfo(application.status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              {statusInfo.icon}
            </div>
            <CardTitle className="text-2xl">Application Status</CardTitle>
            <CardDescription>
              {application.firstName} {application.lastName}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-700 mb-1">
                Application Number:
              </p>
              <p className="text-xl font-bold text-gray-900">{application.appNumber}</p>
            </div>

            <div className={`border rounded-lg p-6 ${statusInfo.color}`}>
              <div className="flex items-center gap-3 mb-2">
                <Badge variant="secondary" className="text-sm">
                  {statusInfo.title}
                </Badge>
              </div>
              <p className="text-sm">{statusInfo.description}</p>
            </div>

            {application.status === "approved" && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm font-medium text-green-900 mb-2">
                  Next Steps:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm text-green-800">
                  <li>A sales representative will contact you shortly</li>
                  <li>We'll finalize your financing terms</li>
                  <li>Schedule your equipment pickup or delivery</li>
                </ul>
              </div>
            )}

            {application.status === "needs_review" && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm font-medium text-yellow-900 mb-2">
                  Action Required:
                </p>
                <p className="text-sm text-yellow-800">
                  Please contact us at your earliest convenience. We may need additional
                  documentation or information to complete your application.
                </p>
              </div>
            )}

            {application.status === "declined" && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm font-medium text-red-900 mb-2">
                  Alternative Options:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm text-red-800">
                  <li>Consider a larger down payment</li>
                  <li>Explore our rent-to-own program</li>
                  <li>Contact us to discuss other financing options</li>
                </ul>
              </div>
            )}

            <div className="pt-4 border-t text-center">
              <p className="text-xs text-gray-500">
                Applied on {new Date(application.createdAt).toLocaleDateString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Questions? Contact us at info@mjcargosales.com
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
