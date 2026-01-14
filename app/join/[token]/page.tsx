'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const ONBOARDING_TOKEN_KEY = 'remotive_onboarding_token';

export default function JoinPage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;

  const [status, setStatus] = useState<'loading' | 'valid' | 'invalid' | 'expired' | 'used'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setStatus('invalid');
        setErrorMessage('No entry token provided. Please use a valid onboarding link.');
        return;
      }

      try {
        const response = await fetch('/api/onboarding/validate-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (data.valid) {
          // Store token in sessionStorage for the flow
          sessionStorage.setItem(ONBOARDING_TOKEN_KEY, token);
          setStatus('valid');
          // Redirect to payplan step
          router.push('/onboarding/rep/payplan');
        } else if (response.status === 410) {
          // Gone - either used or expired
          if (data.error?.includes('expired')) {
            setStatus('expired');
            setErrorMessage('This onboarding link has expired. Please request a new link.');
          } else {
            setStatus('used');
            setErrorMessage('This onboarding link has already been used.');
          }
        } else {
          setStatus('invalid');
          setErrorMessage(data.error || 'Invalid onboarding link.');
        }
      } catch (error) {
        console.error('Token validation error:', error);
        setStatus('invalid');
        setErrorMessage('Failed to validate onboarding link. Please try again.');
      }
    };

    validateToken();
  }, [token, router]);

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundImage: "url('/images/payplan-bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/60" />

      <div className="relative z-10">
        {(status === 'loading' || status === 'valid') ? (
          <Card className="max-w-md w-full bg-white/10 backdrop-blur-md border-white/20 text-white">
            <CardContent className="pt-12 pb-12 flex flex-col items-center">
              <Loader2 className="w-12 h-12 animate-spin text-[#E96114] mb-4" />
              <p className="text-lg">Validating your onboarding link...</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="max-w-md w-full bg-white/10 backdrop-blur-md border-white/20 text-white">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
              <CardTitle className="text-2xl">
                {status === 'expired' && 'Link Expired'}
                {status === 'used' && 'Link Already Used'}
                {status === 'invalid' && 'Invalid Link'}
              </CardTitle>
              <CardDescription className="text-gray-300">
                {errorMessage}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-gray-400 mb-6">
                If you believe this is an error, please contact the person who sent you this link.
              </p>
              <Button
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10"
                onClick={() => window.location.href = 'https://remotivelogistics.com'}
              >
                Return to Website
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
