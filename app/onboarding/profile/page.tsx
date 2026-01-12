'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { User, ArrowRight, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

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

export default function OnboardingProfilePage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [state, setState] = useState('');
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const onboardingState = getOnboardingState();

    // Check if payplan was accepted
    if (!onboardingState.payplanAccepted) {
      router.push('/onboarding/payplan');
      return;
    }

    // Check if profile already completed
    if (onboardingState.profileCompleted && onboardingState.profileData) {
      router.push('/onboarding/invite');
      return;
    }

    // Pre-fill if there's existing data
    if (onboardingState.profileData) {
      setFirstName(onboardingState.profileData.firstName || '');
      setLastName(onboardingState.profileData.lastName || '');
      setPhone(onboardingState.profileData.phone || '');
      setState(onboardingState.profileData.state || '');
    }
  }, [router]);

  const formatPhone = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');

    // Format as (XXX) XXX-XXXX
    if (digits.length <= 3) {
      return digits;
    } else if (digits.length <= 6) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    } else {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value));
  };

  const handleContinue = () => {
    // Validate
    if (!firstName.trim()) {
      toast.error('Please enter your first name');
      return;
    }
    if (!lastName.trim()) {
      toast.error('Please enter your last name');
      return;
    }
    if (!phone.trim() || phone.replace(/\D/g, '').length < 10) {
      toast.error('Please enter a valid phone number');
      return;
    }
    if (!state) {
      toast.error('Please select your state');
      return;
    }

    const onboardingState = getOnboardingState();
    setOnboardingState({
      ...onboardingState,
      profileCompleted: true,
      profileData: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        state,
      },
    });

    router.push('/onboarding/invite');
  };

  const handleBack = () => {
    router.push('/onboarding/payplan');
  };

  if (!mounted) {
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
          Step 2 of 3: Tell us a bit about yourself
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-5">
        {/* Name fields */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-gray-200">
              First Name
            </Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="John"
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-[#E96114]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-gray-200">
              Last Name
            </Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Doe"
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-[#E96114]"
            />
          </div>
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-gray-200">
            Phone Number
          </Label>
          <Input
            id="phone"
            type="tel"
            value={phone}
            onChange={handlePhoneChange}
            placeholder="(555) 555-5555"
            maxLength={14}
            className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-[#E96114]"
          />
        </div>

        {/* State */}
        <div className="space-y-2">
          <Label htmlFor="state" className="text-gray-200">
            State
          </Label>
          <Select value={state} onValueChange={setState}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white focus:border-[#E96114]">
              <SelectValue placeholder="Select your state" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {US_STATES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

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
