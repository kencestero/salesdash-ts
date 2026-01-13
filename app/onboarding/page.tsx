'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // If there's an entry token, redirect to the new location
    const entry = searchParams.get('entry');
    if (entry) {
      router.replace(`/onboarding/rep?entry=${entry}`);
    }
  }, [searchParams, router]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{
        background:
          "linear-gradient(135deg, #E96114 0%, #09213C 50%, #050d18 100%)",
      }}
    >
      <Card className="max-w-md w-full bg-white/10 backdrop-blur-md border-white/20 text-white">
        <CardContent className="pt-8 pb-8 text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-amber-400" />
          </div>
          <h2 className="text-xl font-semibold">Onboarding Link Required</h2>
          <p className="text-gray-300 text-sm">
            To join Remotive Logistics as a sales rep, you need a unique onboarding link
            from an authorized recruiter.
          </p>
          <p className="text-gray-400 text-xs">
            If you believe you should have access, please contact the person who
            invited you to get a valid onboarding link.
          </p>
          <Button
            variant="outline"
            className="border-white/30 text-white hover:bg-white/10 mt-4"
            onClick={() => window.location.href = 'https://remotivelogistics.com'}
          >
            Return to Website
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * /onboarding is no longer publicly accessible.
 * Users need a unique entry token to access the onboarding flow.
 * This page shows an error message for anyone accessing the old URL.
 */
export default function OnboardingRedirectPage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen flex flex-col items-center justify-center p-4"
          style={{
            background:
              "linear-gradient(135deg, #E96114 0%, #09213C 50%, #050d18 100%)",
          }}
        >
          <Loader2 className="w-8 h-8 animate-spin text-white" />
        </div>
      }
    >
      <OnboardingContent />
    </Suspense>
  );
}
