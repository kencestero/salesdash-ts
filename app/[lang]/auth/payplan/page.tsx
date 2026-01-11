'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { toast } from 'sonner';
import { FileText, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

// Payplan content - can be moved to a separate file or fetched from CMS
const PAYPLAN_CONTENT = `
## Remotive Logistics Sales Rep Payplan

### Effective Date: January 11, 2026

### 1. Commission Structure

As an independent sales representative for Remotive Logistics, you will earn commissions based on the following structure:

**Standard Commission Rates:**
- Enclosed Trailers: 3% of sale price
- Utility Trailers: 2.5% of sale price
- Dump Trailers: 2.5% of sale price
- Specialty/Custom Orders: 3.5% of sale price

### 2. Payment Terms

- Commissions are paid on the 15th and last day of each month
- Minimum payout threshold: $100
- Direct deposit required

### 3. Lead Assignment

- Leads are assigned on a rotating basis within your territory
- You have 24 hours to make initial contact with assigned leads
- Leads not contacted within 48 hours may be reassigned
- Your "Response Time" metric affects lead priority

### 4. Performance Requirements

**Minimum Monthly Requirements:**
- Contact all assigned leads within 48 hours
- Maintain a minimum of 2 sales per month after probationary period
- Complete all required training modules
- Attend weekly team calls when scheduled

### 5. Territory & Exclusivity

- Territories are not exclusive
- Cross-territory sales are permitted but may affect lead routing
- Factory orders ship to customer location regardless of territory

### 6. Independent Contractor Status

You acknowledge that you are an independent contractor, not an employee. You are responsible for:
- Your own taxes (1099 will be provided)
- Your own insurance
- Your own equipment and workspace
- Compliance with all applicable laws

### 7. Confidentiality

You agree to keep all customer information, pricing, and company data confidential. Violation of this clause may result in immediate termination.

### 8. Termination

Either party may terminate this agreement at any time with written notice. Upon termination:
- All pending commissions will be paid within 30 days
- CRM access will be revoked immediately
- All company materials must be returned

### 9. Acceptance

By clicking "Accept" below, you acknowledge that you have read, understood, and agree to all terms outlined in this payplan.
`;

export default function PayplanPage() {
  const [acknowledged, setAcknowledged] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [declining, setDeclining] = useState(false);
  const [showDeclineDialog, setShowDeclineDialog] = useState(false);
  const router = useRouter();

  const handleAccept = async () => {
    if (!acknowledged) {
      toast.error('Please check the box to acknowledge the payplan');
      return;
    }

    setAccepting(true);
    try {
      const res = await fetch('/api/auth/accept-payplan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ acknowledged: true }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success('Payplan accepted! Redirecting to dashboard...');
        setTimeout(() => {
          router.push('/en/dashboard');
          router.refresh();
        }, 1500);
      } else {
        toast.error(data.error || 'Failed to accept payplan');
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setAccepting(false);
    }
  };

  const handleDecline = async () => {
    setDeclining(true);
    try {
      const res = await fetch('/api/auth/decline-payplan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.error('Payplan declined. Your account has been disabled.');
        // Sign out the user
        setTimeout(() => {
          signOut({ callbackUrl: '/en/auth/account-disabled' });
        }, 2000);
      } else {
        toast.error(data.error || 'Failed to process decline');
        setShowDeclineDialog(false);
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
      setShowDeclineDialog(false);
    } finally {
      setDeclining(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-3xl w-full">
        <CardHeader className="text-center border-b">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Remotive Logistics Sales Rep Payplan</CardTitle>
          <CardDescription>
            Please review and accept the payplan to continue using SalesHub
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {/* Scrollable payplan content */}
          <div className="bg-muted/30 rounded-lg p-6 max-h-[400px] overflow-y-auto prose prose-sm dark:prose-invert prose-headings:text-foreground prose-p:text-muted-foreground">
            <div
              dangerouslySetInnerHTML={{
                __html: PAYPLAN_CONTENT.replace(/\n/g, '<br>').replace(
                  /## (.*)/g,
                  '<h2 class="text-xl font-bold mt-4 mb-2">$1</h2>'
                ).replace(
                  /### (.*)/g,
                  '<h3 class="text-lg font-semibold mt-3 mb-1">$1</h3>'
                ).replace(
                  /\*\*(.*?)\*\*/g,
                  '<strong>$1</strong>'
                ).replace(
                  /- (.*?)(<br>|$)/g,
                  '<li class="ml-4">$1</li>$2'
                ),
              }}
            />
          </div>

          {/* Acknowledgment checkbox */}
          <div className="flex items-start space-x-3 p-4 bg-muted/50 rounded-lg">
            <Checkbox
              id="acknowledge"
              checked={acknowledged}
              onCheckedChange={(checked) => setAcknowledged(checked as boolean)}
              className="mt-0.5"
            />
            <Label
              htmlFor="acknowledge"
              className="text-sm font-medium leading-tight cursor-pointer"
            >
              I have read and agree to the Remotive Logistics Sales Rep Payplan
            </Label>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleAccept}
              disabled={!acknowledged || accepting || declining}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {accepting ? (
                'Accepting...'
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Accept Payplan
                </>
              )}
            </Button>
            <Button
              onClick={() => setShowDeclineDialog(true)}
              disabled={accepting || declining}
              variant="outline"
              className="flex-1 border-red-500/50 text-red-500 hover:bg-red-500/10"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Decline
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Decline confirmation dialog */}
      <AlertDialog open={showDeclineDialog} onOpenChange={setShowDeclineDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="mx-auto w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mb-2">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <AlertDialogTitle className="text-center">Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Declining disables your SalesHub access. You will not receive leads or be able to sell under Remotive Logistics until a pay plan is accepted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-2">
            <AlertDialogCancel disabled={declining}>Go Back</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDecline}
              disabled={declining}
              className="bg-red-600 hover:bg-red-700"
            >
              {declining ? 'Processing...' : 'Yes, Decline'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
