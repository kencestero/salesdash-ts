'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, ArrowRight, ArrowLeft } from 'lucide-react';

const ONBOARDING_TOKEN_KEY = 'remotive_onboarding_token';
const ONBOARDING_STATE_KEY = 'remotive_rep_onboarding';

const US_STATES = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' },
];

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

export default function RepProfilePage() {
  const [mounted, setMounted] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  const router = useRouter();

  // Form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [state, setState] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setMounted(true);
    // Check if we have a valid token
    const token = sessionStorage.getItem(ONBOARDING_TOKEN_KEY);
    if (!token) {
      router.push('/onboarding/rep');
      return;
    }
    setHasToken(true);

    // Check if payplan was accepted
    const onboardingState = getOnboardingState();
    if (!onboardingState.payplanAccepted) {
      router.push('/onboarding/rep/payplan');
      return;
    }

    // Pre-fill if data exists
    if (onboardingState.profileData) {
      setFirstName(onboardingState.profileData.firstName || '');
      setLastName(onboardingState.profileData.lastName || '');
      setPhone(onboardingState.profileData.phone || '');
      setState(onboardingState.profileData.state || '');
    }
  }, [router]);

  const formatPhone = (value: string) => {
    // Strip non-digits
    const digits = value.replace(/\D/g, '');
    // Format as (XXX) XXX-XXXX
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setPhone(formatted);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (phone.replace(/\D/g, '').length < 10) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }
    if (!state) {
      newErrors.state = 'Please select your state';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (!validate()) return;

    const onboardingState = getOnboardingState();
    setOnboardingState({
      ...onboardingState,
      profileData: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone,
        state,
      },
    });

    router.push('/onboarding/rep/w9');
  };

  const handleBack = () => {
    router.push('/onboarding/rep/payplan');
  };

  if (!mounted || !hasToken) {
    return null;
  }

  return (
    <Card className="max-w-lg w-full bg-white/10 backdrop-blur-md border-white/20 text-white">
      <CardHeader className="text-center border-b border-white/10">
        <div className="mx-auto w-16 h-16 bg-[#E96114]/20 rounded-full flex items-center justify-center mb-4">
          <User className="w-8 h-8 text-[#E96114]" />
        </div>
        <CardTitle className="text-2xl">Your Information</CardTitle>
        <CardDescription className="text-gray-300">
          Step 2 of 4: Tell us a little about yourself
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* First Name */}
        <div className="space-y-2">
          <Label htmlFor="firstName" className="text-gray-200">
            First Name <span className="text-red-400">*</span>
          </Label>
          <Input
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Enter your first name"
            className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
          />
          {errors.firstName && (
            <p className="text-sm text-red-400">{errors.firstName}</p>
          )}
        </div>

        {/* Last Name */}
        <div className="space-y-2">
          <Label htmlFor="lastName" className="text-gray-200">
            Last Name <span className="text-red-400">*</span>
          </Label>
          <Input
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Enter your last name"
            className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
          />
          {errors.lastName && (
            <p className="text-sm text-red-400">{errors.lastName}</p>
          )}
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-gray-200">
            Phone Number <span className="text-red-400">*</span>
          </Label>
          <Input
            id="phone"
            value={phone}
            onChange={handlePhoneChange}
            placeholder="(555) 123-4567"
            className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
          />
          {errors.phone && (
            <p className="text-sm text-red-400">{errors.phone}</p>
          )}
        </div>

        {/* State */}
        <div className="space-y-2">
          <Label htmlFor="state" className="text-gray-200">
            State <span className="text-red-400">*</span>
          </Label>
          <Select value={state} onValueChange={setState}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <SelectValue placeholder="Select your state" />
            </SelectTrigger>
            <SelectContent className="bg-[#0a1628] border-white/20 max-h-[300px]">
              {US_STATES.map((s) => (
                <SelectItem
                  key={s.value}
                  value={s.value}
                  className="text-white hover:bg-white/10"
                >
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.state && (
            <p className="text-sm text-red-400">{errors.state}</p>
          )}
        </div>

        {/* Navigation buttons */}
        <div className="flex gap-4 pt-4">
          <Button
            variant="outline"
            onClick={handleBack}
            className="flex-1 border-white/30 text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button
            onClick={handleContinue}
            className="flex-1 bg-[#E96114] hover:bg-[#E96114]/90 text-white"
          >
            Continue
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
