'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { FileText, CheckCircle, ArrowRight } from 'lucide-react';

// Payplan content
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

By clicking "Continue" below, you acknowledge that you have read, understood, and agree to all terms outlined in this payplan.
`;

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

function setOnboardingState(state: OnboardingState) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(state));
}

export default function OnboardingPayplanPage() {
  const [acknowledged, setAcknowledged] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    // Check if already accepted
    const state = getOnboardingState();
    if (state.payplanAccepted) {
      router.push('/onboarding/profile');
    }
  }, [router]);

  const handleContinue = () => {
    if (!acknowledged) return;

    const state = getOnboardingState();
    setOnboardingState({
      ...state,
      payplanAccepted: true,
      payplanAcceptedAt: new Date().toISOString(),
    });

    router.push('/onboarding/profile');
  };

  if (!mounted) {
    return null;
  }

  return (
    <Card className="max-w-3xl w-full bg-white/10 backdrop-blur-md border-white/20 text-white">
      <CardHeader className="text-center border-b border-white/10">
        <div className="mx-auto w-16 h-16 bg-[#E96114]/20 rounded-full flex items-center justify-center mb-4">
          <FileText className="w-8 h-8 text-[#E96114]" />
        </div>
        <CardTitle className="text-2xl">Sales Rep Payplan</CardTitle>
        <CardDescription className="text-gray-300">
          Step 1 of 3: Review and accept the payplan to continue
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* Scrollable payplan content */}
        <div className="bg-white/5 rounded-lg p-6 max-h-[350px] overflow-y-auto text-gray-200">
          <div
            dangerouslySetInnerHTML={{
              __html: PAYPLAN_CONTENT.replace(/\n/g, '<br>').replace(
                /## (.*)/g,
                '<h2 class="text-xl font-bold mt-4 mb-2 text-white">$1</h2>'
              ).replace(
                /### (.*)/g,
                '<h3 class="text-lg font-semibold mt-3 mb-1 text-gray-100">$1</h3>'
              ).replace(
                /\*\*(.*?)\*\*/g,
                '<strong class="text-white">$1</strong>'
              ).replace(
                /- (.*?)(<br>|$)/g,
                '<li class="ml-4 text-gray-300">$1</li>$2'
              ),
            }}
          />
        </div>

        {/* Acknowledgment checkbox */}
        <div className="flex items-start space-x-3 p-4 bg-white/5 rounded-lg">
          <Checkbox
            id="acknowledge"
            checked={acknowledged}
            onCheckedChange={(checked) => setAcknowledged(checked as boolean)}
            className="mt-0.5 border-white/50 data-[state=checked]:bg-[#E96114] data-[state=checked]:border-[#E96114]"
          />
          <Label
            htmlFor="acknowledge"
            className="text-sm font-medium leading-tight cursor-pointer text-gray-200"
          >
            I have read and agree to the Remotive Logistics Sales Rep Payplan
          </Label>
        </div>

        {/* Continue button */}
        <Button
          onClick={handleContinue}
          disabled={!acknowledged}
          className="w-full bg-[#E96114] hover:bg-[#E96114]/90 text-white h-12 text-base"
        >
          <CheckCircle className="w-5 h-5 mr-2" />
          Accept & Continue
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}
