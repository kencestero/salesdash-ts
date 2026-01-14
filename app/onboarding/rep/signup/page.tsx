'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, ArrowLeft, Loader2, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';

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
  w9Data?: {
    name: string;
    businessName?: string;
    taxClassification: string;
    address: string;
    city: string;
    state: string;
    zip: string;
  };
  w9Completed?: boolean;
  signupCode?: string;
  signupCodeExpires?: string;
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

export default function RepSignupPage() {
  const [mounted, setMounted] = useState(false);
  const [hasValidState, setHasValidState] = useState(false);
  const [signupCode, setSignupCode] = useState<string | null>(null);
  const router = useRouter();

  // Form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setMounted(true);

    // Check onboarding state
    const onboardingState = getOnboardingState();

    // Must have completed payplan
    if (!onboardingState.payplanAccepted) {
      router.push('/onboarding/rep/payplan');
      return;
    }

    // Must have completed W-9 and have signup code
    if (!onboardingState.w9Completed || !onboardingState.signupCode) {
      router.push('/onboarding/rep/w9');
      return;
    }

    // Check if signup code expired
    if (onboardingState.signupCodeExpires) {
      const expires = new Date(onboardingState.signupCodeExpires);
      if (new Date() > expires) {
        setError('Your signup code has expired. Please contact the company owner to get a new onboarding link.');
        return;
      }
    }

    setSignupCode(onboardingState.signupCode);
    setHasValidState(true);

    // Pre-fill from W-9 data
    if (onboardingState.w9Data) {
      // Parse name into first/last
      const nameParts = (onboardingState.w9Data.name || '').trim().split(/\s+/);
      if (nameParts.length > 0) {
        setFirstName(nameParts[0]);
      }
      if (nameParts.length > 1) {
        setLastName(nameParts.slice(1).join(' '));
      }

      // Pre-fill address
      setAddress(onboardingState.w9Data.address || '');
      setCity(onboardingState.w9Data.city || '');
      setState(onboardingState.w9Data.state || '');
      setZip(onboardingState.w9Data.zip || '');
    }
  }, [router]);

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value));
  };

  const formatZip = (value: string) => {
    const digits = value.replace(/\D/g, '');
    return digits.slice(0, 5);
  };

  const handleZipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setZip(formatZip(e.target.value));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    const phoneDigits = phone.replace(/\D/g, '');
    if (!phoneDigits || phoneDigits.length < 10) {
      newErrors.phone = 'Valid 10-digit phone number is required';
    }

    if (!address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!state) {
      newErrors.state = 'State is required';
    }

    if (!zip || zip.length < 5) {
      newErrors.zip = 'Valid ZIP code is required';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      setError('Please fill in all required fields correctly');
      return;
    }

    if (!signupCode) {
      setError('Session expired. Please start over.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/onboarding/complete-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          signupCode,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.replace(/\D/g, ''),
          address: address.trim(),
          city: city.trim(),
          state,
          zipcode: zip,
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Clear onboarding state
        sessionStorage.removeItem(ONBOARDING_TOKEN_KEY);
        sessionStorage.removeItem(ONBOARDING_STATE_KEY);

        // Redirect to verify email page
        router.push(`/en/auth/verify-email?email=${encodeURIComponent(email)}`);
      } else {
        setError(data.error || 'Failed to create account');
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    router.push('/onboarding/rep/w9');
  };

  if (!mounted) {
    return null;
  }

  // Show error state if signup code expired or invalid
  if (error && !hasValidState) {
    return (
      <div className="min-h-screen text-white overflow-x-hidden relative">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: "url('/images/payplan-bg.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center top",
            minHeight: "100%",
          }}
        >
          <div className="absolute inset-0 bg-black/70" style={{ minHeight: "100%" }} />
        </div>

        <div className="relative z-10 max-w-lg mx-auto px-6 py-12">
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Session Expired</h2>
            <p className="text-white/70 mb-6">{error}</p>
            <Button
              onClick={() => window.location.href = 'mailto:kcestero@remotivelogistics.com'}
              className="bg-[#E96114] hover:bg-[#E96114]/90 text-white"
            >
              Contact Owner
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!hasValidState) {
    return null;
  }

  return (
    <div className="min-h-screen text-white overflow-x-hidden relative">
      {/* Background Image - Covers full page */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('/images/payplan-bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center top",
          minHeight: "100%",
        }}
      >
        <div className="absolute inset-0 bg-black/70" style={{ minHeight: "100%" }} />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-2xl mx-auto px-6 py-12">
        {/* Header */}
        <header className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-[#E96114]/20 rounded-full flex items-center justify-center mb-4">
            <UserPlus className="w-8 h-8 text-[#E96114]" />
          </div>
          <p className="text-orange-500 text-sm font-bold uppercase tracking-[0.3em] mb-2">Step 3 of 3</p>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2">Create Your Account</h1>
          <p className="text-white/60">Final step to join Remotive Logistics</p>
        </header>

        {/* Info Box */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-6">
          <p className="text-white/80 text-sm">
            Please enter your full legal information below. This information is required to set up your SalesHub profile and for company recordkeeping and contractor payment/tax reporting.
          </p>
        </div>

        {/* Form */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 md:p-8 space-y-6">
          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white">Full First Name <span className="text-red-400">*</span></Label>
              <Input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="John"
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              />
              {errors.firstName && <p className="text-sm text-red-400">{errors.firstName}</p>}
            </div>
            <div className="space-y-2">
              <Label className="text-white">Full Last Name <span className="text-red-400">*</span></Label>
              <Input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              />
              {errors.lastName && <p className="text-sm text-red-400">{errors.lastName}</p>}
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label className="text-white">Phone Number <span className="text-red-400">*</span></Label>
            <Input
              value={phone}
              onChange={handlePhoneChange}
              placeholder="(555) 123-4567"
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            />
            {errors.phone && <p className="text-sm text-red-400">{errors.phone}</p>}
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label className="text-white">Full Address <span className="text-red-400">*</span></Label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="123 Main St, Apt 4B"
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            />
            {errors.address && <p className="text-sm text-red-400">{errors.address}</p>}
          </div>

          {/* City, State, ZIP */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-white">City <span className="text-red-400">*</span></Label>
              <Input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City"
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              />
              {errors.city && <p className="text-sm text-red-400">{errors.city}</p>}
            </div>
            <div className="space-y-2">
              <Label className="text-white">State <span className="text-red-400">*</span></Label>
              <Select value={state} onValueChange={setState}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent className="bg-[#0a1628] border-white/20 max-h-[300px]">
                  {US_STATES.map((s) => (
                    <SelectItem key={s.value} value={s.value} className="text-white hover:bg-white/10">
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.state && <p className="text-sm text-red-400">{errors.state}</p>}
            </div>
            <div className="space-y-2">
              <Label className="text-white">ZIP Code <span className="text-red-400">*</span></Label>
              <Input
                value={zip}
                onChange={handleZipChange}
                placeholder="12345"
                maxLength={5}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              />
              {errors.zip && <p className="text-sm text-red-400">{errors.zip}</p>}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-white/10 pt-6">
            <h3 className="text-white font-semibold mb-4">Account Credentials</h3>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label className="text-white">Email Address <span className="text-red-400">*</span></Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john.doe@example.com"
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            />
            <p className="text-xs text-white/50">This will be your login email for SalesHub</p>
            {errors.email && <p className="text-sm text-red-400">{errors.email}</p>}
          </div>

          {/* Password Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white">Password <span className="text-red-400">*</span></Label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-sm text-red-400">{errors.password}</p>}
            </div>
            <div className="space-y-2">
              <Label className="text-white">Confirm Password <span className="text-red-400">*</span></Label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-sm text-red-400">{errors.confirmPassword}</p>}
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-lg">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={submitting}
              className="flex-1 border-white/30 text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 bg-[#E96114] hover:bg-[#E96114]/90 text-white"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
                  <CheckCircle className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>

        <footer className="mt-8 text-center">
          <p className="text-white/30 text-sm">You will receive a verification email after signing up.</p>
        </footer>
      </div>
    </div>
  );
}
