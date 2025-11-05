"use client";

import { Suspense, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import RequestForm from "@/components/sales-tools/RequestForm";
import { useToast } from "@/components/ui/use-toast";

export default function RequestPage() {
  const { toast } = useToast();
  const { data: session } = useSession();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile with rep code and manager info
  useEffect(() => {
    if (!session?.user?.email) {
      setLoading(false);
      return;
    }

    fetch("/api/user/profile")
      .then((res) => res.json())
      .then((data) => {
        setUserProfile(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch user profile:", err);
        setLoading(false);
      });
  }, [session]);

  // Listen for form-level browser events (optional safety for unexpected errors)
  useEffect(() => {
    const handler = (e: ErrorEvent) => {
      toast({
        title: "Unexpected error",
        description: e.message || "Something went wrong.",
      });
    };
    window.addEventListener("error", handler);
    return () => window.removeEventListener("error", handler);
  }, [toast]);

  if (loading) {
    return <div className="text-sm text-neutral-400">Loading…</div>;
  }

  return (
    <Suspense fallback={<div className="text-sm text-neutral-400">Loading…</div>}>
      <div className="mx-auto w-full max-w-2xl">
        <h1 className="mb-2 text-2xl font-semibold tracking-tight">
          Request Tool
        </h1>
        <p className="mb-6 text-sm text-neutral-400">
          Submit a quick request. We'll email the details and log it.
        </p>
        <RequestForm userProfile={userProfile} />
      </div>
    </Suspense>
  );
}
