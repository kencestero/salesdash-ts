'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { FileText, CheckCircle, ArrowRight, AlertCircle } from 'lucide-react';

const ONBOARDING_TOKEN_KEY = 'remotive_onboarding_token';
const ONBOARDING_STATE_KEY = 'remotive_rep_onboarding';

// New profit-based payplan content
const PAYPLAN_CONTENT = `
## Remotive Logistics LLC — Sales Rep Pay Plan (Launch Phase)

### Effective Date: January 2026
**Version:** REP-PAYPLAN-LAUNCH-v1

### 1) Classification

Sales Reps operate as independent sales representatives (1099). This is a commission-based role.

### 2) Commission Structure (Launch Phase)

**Standard Commission:** 20% of Commissionable Gross Profit (GP)

**Minimum Deal Requirement:** A deal must produce at least $2,000 in gross profit to qualify for commission and bonuses.

**Commissionable Gross Profit (GP) is calculated as:**
- Sale Price
- minus Trailer Cost
- minus Delivery / transport costs (if paid by the company)
- minus any other direct deal costs or discounts that reduce the trailer's profit

(All costs must be recorded in SalesHub for the final GP calculation)

### 3) When Commission Is Earned

Commission is earned only on deals that are:
- Funded/paid (cash cleared or lender funding confirmed), and
- Recorded correctly in SalesHub, and
- Meet the $2,000 minimum gross profit requirement.

### 4) Payout Schedule (Weekly)

Commissions are paid weekly on Fridays based on funding time:
- Deals funded before the weekly cutoff are paid that Friday.
- If a deal is funded on Thursday after 1:00 PM (ET) or later, it will be paid the following Friday.
- If funded on Wednesday (or earlier), it will be paid that Friday.

Cutoff times may be adjusted and published inside SalesHub.

### 5) Unit Bonus Program (Monthly)

In addition to commissions, Sales Reps may earn unit bonuses based on the number of funded and delivered deals within the month. Bonuses are paid on the SECOND Friday of the following month.

**Bonus tiers:**
- 5–8 units: +$100 per trailer
- 9–12 units: +$125 per trailer
- 13–15 units: +$150 per trailer
- 16+ units: +$175 per trailer

**Bonus eligibility rules:**
- Only deals that meet the $2,000 minimum gross profit requirement count toward unit bonuses.
- Deals must be funded and delivered to count (unless explicitly approved otherwise in writing).

### 6) Payment Method

Commissions/bonuses will be paid using the company's chosen method at the time (ACH, direct deposit, etc.). Payment methods may change as we scale.

### 7) Updates & Launch Phase Note

This "Launch Phase" pay plan is designed for the startup stage while staffing and operations are being built out. The company may update pay plan terms in the future. Any material changes will be published in writing with a new version number.

### Acceptance

By clicking "Accept & Continue" below, you acknowledge that you have read, understood, and agree to all terms outlined in this pay plan.
`;

interface OnboardingState {
  payplanAccepted: boolean;
  payplanAcceptedAt?: string;
  profileData?: {
    firstName: string;
    lastName: string;
    phone: string;
    state: string;
  };
}

function getOnboardingState(): OnboardingState {
  if (typeof window === 'undefined') {
    return { payplanAccepted: false };
  }
  try {
    const stored = sessionStorage.getItem(ONBOARDING_STATE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to parse onboarding state:', e);
  }
  return { payplanAccepted: false };
}

function setOnboardingState(state: OnboardingState) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(ONBOARDING_STATE_KEY, JSON.stringify(state));
}

export default function RepPayplanPage() {
  const [acknowledged, setAcknowledged] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    // Check if we have a valid token
    const token = sessionStorage.getItem(ONBOARDING_TOKEN_KEY);
    if (!token) {
      // No token - redirect to entry page
      router.push('/onboarding/rep');
      return;
    }
    setHasToken(true);

    // Check if payplan already accepted
    const state = getOnboardingState();
    if (state.payplanAccepted) {
      router.push('/onboarding/rep/profile');
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

    router.push('/onboarding/rep/profile');
  };

  if (!mounted || !hasToken) {
    return null;
  }

  return (
    <Card className="max-w-3xl w-full bg-white/10 backdrop-blur-md border-white/20 text-white">
      <CardHeader className="text-center border-b border-white/10">
        <div className="mx-auto w-16 h-16 bg-[#E96114]/20 rounded-full flex items-center justify-center mb-4">
          <FileText className="w-8 h-8 text-[#E96114]" />
        </div>
        <CardTitle className="text-2xl">Sales Rep Pay Plan</CardTitle>
        <CardDescription className="text-gray-300">
          Step 1 of 4: Review and accept the pay plan to continue
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
            I have read and agree to the Remotive Logistics Sales Rep Pay Plan
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
