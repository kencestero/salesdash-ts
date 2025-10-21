'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui/use-toast';

export default function CompleteSignupPage() {
  const [joinCode, setJoinCode] = useState('');
  const [validating, setValidating] = useState(false);
  const router = useRouter();

  async function handleValidate() {
    setValidating(true);

    try {
      const res = await fetch('/api/auth/complete-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ joinCode })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast({
          title: 'Success',
          description: 'Signup complete! Redirecting to dashboard...',
        });

        // Redirect to dashboard
        setTimeout(() => {
          router.push('/dashboard');
          router.refresh();
        }, 1000);
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Invalid join code',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setValidating(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Complete Your Signup</CardTitle>
          <CardDescription>
            You need a join code to access MJ Cargo SalesDash. Get one from your manager.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="joinCode">Join Code</Label>
              <Input
                id="joinCode"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="Enter your join code"
                className="uppercase"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && joinCode && !validating) {
                    handleValidate();
                  }
                }}
              />
            </div>

            <Button
              onClick={handleValidate}
              disabled={validating || !joinCode}
              className="w-full"
            >
              {validating ? 'Validating...' : 'Complete Signup'}
            </Button>

            <div className="text-sm text-muted-foreground text-center">
              <p>Test codes for development:</p>
              <p className="font-mono mt-1">OWNER1 | MGR001 | REP001</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
