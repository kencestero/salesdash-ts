'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Key, Copy, Check, ArrowRight, ArrowLeft, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const ONBOARDING_STORAGE_KEY = 'remotive_onboarding';

interface OnboardingState {
  payplanAccepted: boolean;
  payplanAcceptedAt?: string;
  profileCompleted: boolean;
  profileData?: {
    firstName: string;
    lastName: string;
    phone: string;
    state: string;
  };
}

interface DailyCodeResponse {
  code: string;
  expiresAt: string;
  timeUntilReset: string;
}

function getOnboardingState(): OnboardingState {
  if (typeof window === 'undefined') {
    return { payplanAccepted: false, profileCompleted: false };
  }
  try {
    const stored = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to parse onboarding state:', e);
  }
  return { payplanAccepted: false, profileCompleted: false };
}

export default function OnboardingInvitePage() {
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [codeData, setCodeData] = useState<DailyCodeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<OnboardingState['profileData'] | null>(null);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const onboardingState = getOnboardingState();

    // Check if payplan was accepted
    if (!onboardingState.payplanAccepted) {
      router.push('/onboarding/payplan');
      return;
    }

    // Check if profile was completed
    if (!onboardingState.profileCompleted) {
      router.push('/onboarding/profile');
      return;
    }

    setProfileData(onboardingState.profileData || null);

    // Fetch the daily code
    fetchDailyCode();
  }, [router]);

  const fetchDailyCode = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/onboarding/daily-code');
      if (res.ok) {
        const data = await res.json();
        setCodeData(data);
      } else {
        const errorData = await res.json();
        setError(errorData.error || 'Failed to fetch code');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!codeData?.code) return;

    try {
      await navigator.clipboard.writeText(codeData.code);
      setCopied(true);
      toast.success('Code copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy code');
    }
  };

  const handleContinueToSignup = () => {
    if (!codeData?.code) return;
    // Navigate to signup with code prefilled
    router.push(`/en/auth/join?code=${encodeURIComponent(codeData.code)}`);
  };

  const handleBack = () => {
    router.push('/onboarding/profile');
  };

  if (!mounted) {
    return null;
  }

  return (
    <Card className="max-w-lg w-full bg-white/10 backdrop-blur-md border-white/20 text-white">
      <CardHeader className="text-center border-b border-white/10">
        <div className="mx-auto w-16 h-16 bg-[#E96114]/20 rounded-full flex items-center justify-center mb-4">
          <Key className="w-8 h-8 text-[#E96114]" />
        </div>
        <CardTitle className="text-2xl">Your Secret Invite Code</CardTitle>
        <CardDescription className="text-gray-300">
          Step 3 of 3: Use this code to create your account
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* Welcome message */}
        {profileData && (
          <div className="text-center text-gray-300">
            Welcome, <span className="text-white font-medium">{profileData.firstName}</span>! Here's your invite code.
          </div>
        )}

        {/* Code display */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-[#E96114] mb-3" />
            <p className="text-gray-400">Generating your code...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="w-10 h-10 text-red-400 mb-3" />
            <p className="text-red-400 mb-4">{error}</p>
            <Button onClick={fetchDailyCode} variant="outline" className="border-white/30 text-white hover:bg-white/10">
              Try Again
            </Button>
          </div>
        ) : codeData ? (
          <>
            {/* Code box */}
            <div className="relative">
              <div className="bg-[#09213C] border-2 border-[#E96114]/50 rounded-xl p-6 text-center">
                <div className="font-mono text-3xl sm:text-4xl font-bold tracking-[0.2em] text-white select-all">
                  {codeData.code}
                </div>
              </div>
              <Button
                onClick={handleCopy}
                size="sm"
                className="absolute -top-3 -right-3 bg-[#E96114] hover:bg-[#E96114]/90 rounded-full w-10 h-10 p-0"
              >
                {copied ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </Button>
            </div>

            {/* Expiry warning */}
            <div className="flex items-center justify-center gap-2 text-sm text-amber-400 bg-amber-400/10 rounded-lg p-3">
              <Clock className="w-4 h-4" />
              <span>
                Code resets in <strong>{codeData.timeUntilReset}</strong> (midnight ET)
              </span>
            </div>

            {/* Instructions */}
            <div className="bg-white/5 rounded-lg p-4 text-sm text-gray-300 space-y-2">
              <p className="font-medium text-white">What's next?</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Copy the code above</li>
                <li>Click "Continue to Sign Up"</li>
                <li>Enter your email, password, and the invite code</li>
                <li>Verify your email to activate your account</li>
              </ol>
            </div>
          </>
        ) : null}

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <Button
            onClick={handleBack}
            variant="outline"
            className="flex-1 border-white/30 text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button
            onClick={handleContinueToSignup}
            disabled={loading || !!error || !codeData}
            className="flex-1 bg-[#E96114] hover:bg-[#E96114]/90 text-white"
          >
            Continue to Sign Up
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
