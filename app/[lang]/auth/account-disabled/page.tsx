'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { signOut } from 'next-auth/react';
import { AlertTriangle, Phone, Mail, LogOut } from 'lucide-react';

export default function AccountDisabledPage() {
  const [accountStatus, setAccountStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkStatus() {
      try {
        const res = await fetch('/api/auth/check-status');
        const data = await res.json();
        setAccountStatus(data.accountStatus);
      } catch (error) {
        console.error('Failed to check status:', error);
      } finally {
        setLoading(false);
      }
    }
    checkStatus();
  }, []);

  const handleLogout = () => {
    signOut({ callbackUrl: '/en/login' });
  };

  // Get message based on account status
  const getDisabledMessage = () => {
    if (accountStatus === 'disabled_declined_payplan') {
      return 'Your account has been disabled because the pay plan was declined.';
    }
    if (accountStatus === 'disabled_inactivity_hold') {
      return 'Your account has been placed on hold due to inactivity.';
    }
    if (accountStatus === 'disabled_admin') {
      return 'Your account has been disabled by an administrator.';
    }
    if (accountStatus === 'banned') {
      return 'Your account has been banned.';
    }
    return 'Your account has been disabled.';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full border-red-500/20">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <CardTitle className="text-2xl text-red-500">Account Disabled</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-muted-foreground">
              {getDisabledMessage()}
            </p>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <p className="text-sm font-medium text-center">
              To regain access, please contact:
            </p>
            <div className="flex items-center justify-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-primary" />
              <a
                href="mailto:ken@remotivelogistics.com"
                className="text-primary hover:underline"
              >
                ken@remotivelogistics.com
              </a>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-primary" />
              <a
                href="tel:1-866-REMOTIV"
                className="text-primary hover:underline"
              >
                1-866-REMOTIV
              </a>
            </div>
          </div>

          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
