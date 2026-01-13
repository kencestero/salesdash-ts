'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle, Copy, Check, ArrowRight, Clock } from 'lucide-react';

export default function RepCompletePage() {
  const [mounted, setMounted] = useState(false);
  const [signupCode, setSignupCode] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    // Get the signup code from session storage
    const code = sessionStorage.getItem('remotive_signup_code');
    const expires = sessionStorage.getItem('remotive_signup_code_expires');

    if (!code) {
      // No code - something went wrong, redirect to start
      router.push('/onboarding/rep');
      return;
    }

    setSignupCode(code);
    setExpiresAt(expires);
  }, [router]);

  const handleCopyCode = async () => {
    if (!signupCode) return;

    try {
      await navigator.clipboard.writeText(signupCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleGoToSignup = () => {
    // Clear session storage
    sessionStorage.removeItem('remotive_signup_code');
    sessionStorage.removeItem('remotive_signup_code_expires');
    sessionStorage.removeItem('remotive_rep_onboarding');

    // Navigate to signup with code
    window.location.href = `/en/auth/join?code=${signupCode}`;
  };

  const formatExpiry = () => {
    if (!expiresAt) return null;
    const date = new Date(expiresAt);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (!mounted || !signupCode) {
    return null;
  }

  return (
    <Card className="max-w-lg w-full bg-white/10 backdrop-blur-md border-white/20 text-white">
      <CardHeader className="text-center border-b border-white/10">
        <div className="mx-auto w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="w-10 h-10 text-green-400" />
        </div>
        <CardTitle className="text-2xl">Onboarding Complete!</CardTitle>
        <CardDescription className="text-gray-300">
          Step 4 of 4: Use your signup code to create your account
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* Success message */}
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-center">
          <p className="text-green-300 text-sm">
            Your pay plan acceptance and W-9 have been recorded.
          </p>
        </div>

        {/* Signup code display */}
        <div className="space-y-2">
          <p className="text-center text-gray-300 text-sm">
            Your one-time signup code:
          </p>
          <div className="bg-[#09213C] border-2 border-[#E96114] rounded-lg p-6 text-center">
            <p className="text-3xl font-mono font-bold tracking-wider text-white">
              {signupCode}
            </p>
          </div>
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyCode}
              className="border-white/30 text-white hover:bg-white/10"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2 text-green-400" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Code
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Expiration warning */}
        {expiresAt && (
          <div className="flex items-center justify-center gap-2 text-amber-400 text-sm">
            <Clock className="w-4 h-4" />
            <span>This code expires {formatExpiry()}</span>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-white/5 rounded-lg p-4 space-y-2 text-sm text-gray-300">
          <p className="font-medium text-white">Next Steps:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Click the button below to go to the signup page</li>
            <li>Enter your signup code when prompted</li>
            <li>Complete your account registration</li>
            <li>You&apos;re ready to start selling trailers!</li>
          </ol>
        </div>

        {/* Warning about one-time use */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-center">
          <p className="text-amber-300 text-xs">
            <strong>Important:</strong> This code can only be used once.
            Make sure to complete your signup now.
          </p>
        </div>

        {/* Go to signup button */}
        <Button
          onClick={handleGoToSignup}
          className="w-full bg-[#E96114] hover:bg-[#E96114]/90 text-white h-12 text-base"
        >
          Create My Account
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}
