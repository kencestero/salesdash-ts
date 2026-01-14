'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { FileText, ArrowLeft, Loader2, CheckCircle, AlertCircle, RotateCcw } from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';

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

function setOnboardingState(state: OnboardingState) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(ONBOARDING_STATE_KEY, JSON.stringify(state));
}

export default function RepW9Page() {
  const [mounted, setMounted] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  const [entryToken, setEntryToken] = useState<string | null>(null);
  const router = useRouter();

  // Form fields
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [taxClassification, setTaxClassification] = useState('individual');
  const [llcClassification, setLlcClassification] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [ssn, setSsn] = useState('');
  const [confirmSsn, setConfirmSsn] = useState('');
  const [certify, setCertify] = useState(false);

  // Signature
  const sigCanvas = useRef<SignatureCanvas>(null);
  const [hasSigned, setHasSigned] = useState(false);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setMounted(true);
    const token = sessionStorage.getItem(ONBOARDING_TOKEN_KEY);
    if (!token) {
      router.push('/onboarding/rep');
      return;
    }
    setEntryToken(token);
    setHasToken(true);

    // Check if payplan was accepted
    const state = getOnboardingState();
    if (!state.payplanAccepted) {
      router.push('/onboarding/rep/payplan');
      return;
    }

    // If W-9 already completed, go to signup
    if (state.w9Completed && state.signupCode) {
      router.push('/onboarding/rep/signup');
      return;
    }

    // Pre-fill from existing data if available
    if (state.w9Data) {
      setName(state.w9Data.name || '');
      setBusinessName(state.w9Data.businessName || '');
      setTaxClassification(state.w9Data.taxClassification || 'individual');
      setAddress(state.w9Data.address || '');
      setCity(state.w9Data.city || '');
      setState(state.w9Data.state || '');
      setZip(state.w9Data.zip || '');
    }
  }, [router]);

  const formatSSN = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 3) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5, 9)}`;
  };

  const handleSsnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSsn(formatSSN(e.target.value));
  };

  const handleConfirmSsnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmSsn(formatSSN(e.target.value));
  };

  const formatZip = (value: string) => {
    const digits = value.replace(/\D/g, '');
    return digits.slice(0, 5);
  };

  const handleZipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setZip(formatZip(e.target.value));
  };

  const clearSignature = () => {
    sigCanvas.current?.clear();
    setHasSigned(false);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
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

    const ssnDigits = ssn.replace(/\D/g, '');
    if (!ssnDigits || ssnDigits.length !== 9) {
      newErrors.ssn = 'Valid 9-digit SSN is required';
    }

    if (ssn !== confirmSsn) {
      newErrors.confirmSsn = 'SSN does not match';
    }

    if (taxClassification === 'llc' && !llcClassification) {
      newErrors.llcClassification = 'LLC tax classification is required';
    }

    if (!certify) {
      newErrors.certify = 'You must certify the information is correct';
    }

    if (sigCanvas.current?.isEmpty()) {
      newErrors.signature = 'Signature is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      setError('Please fill in all required fields');
      return;
    }

    if (!entryToken) {
      setError('Session expired. Please start over.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const signatureDataUrl = sigCanvas.current?.toDataURL() || '';

      const response = await fetch('/api/onboarding/generate-w9', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entryToken,
          name: name.trim(),
          businessName: businessName.trim() || undefined,
          taxClassification: taxClassification === 'llc' ? `llc-${llcClassification}` : taxClassification,
          address: address.trim(),
          city: city.trim(),
          state,
          zip,
          ssn: ssn.replace(/\D/g, ''), // Send only digits
          signature: signatureDataUrl,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Update onboarding state
        const currentState = getOnboardingState();
        setOnboardingState({
          ...currentState,
          w9Data: {
            name: name.trim(),
            businessName: businessName.trim() || undefined,
            taxClassification,
            address: address.trim(),
            city: city.trim(),
            state,
            zip,
          },
          w9Completed: true,
          signupCode: data.signupCode,
          signupCodeExpires: data.expiresAt,
        });

        // Navigate to signup
        router.push('/onboarding/rep/signup');
      } else {
        setError(data.error || 'Failed to submit W-9');
      }
    } catch (err) {
      console.error('Submission error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    router.push('/onboarding/rep/payplan');
  };

  if (!mounted || !hasToken) {
    return null;
  }

  return (
    <div className="min-h-screen text-white overflow-x-hidden relative">
      {/* Background Image - Fixed to viewport */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: "url('/images/payplan-bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center top",
        }}
      >
        <div className="absolute inset-0 bg-black/70" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-3xl mx-auto px-6 py-12">
        {/* Header */}
        <header className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-[#E96114]/20 rounded-full flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-[#E96114]" />
          </div>
          <p className="text-orange-500 text-sm font-bold uppercase tracking-[0.3em] mb-2">Step 2 of 3</p>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2">W-9 Tax Form</h1>
          <p className="text-white/60">Request for Taxpayer Identification Number</p>
        </header>

        {/* Form */}
        <div className="bg-[#0a1628] border border-white/10 rounded-2xl p-6 md:p-8 space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label className="text-white">
              Name (as shown on your income tax return) <span className="text-red-400">*</span>
            </Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full legal name"
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            />
            {errors.name && <p className="text-sm text-red-400">{errors.name}</p>}
          </div>

          {/* Business Name (optional) */}
          <div className="space-y-2">
            <Label className="text-white">
              Business name/disregarded entity name (if different from above)
            </Label>
            <Input
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Optional"
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            />
          </div>

          {/* Tax Classification */}
          <div className="space-y-3">
            <Label className="text-white">
              Federal tax classification <span className="text-red-400">*</span>
            </Label>
            <RadioGroup value={taxClassification} onValueChange={setTaxClassification} className="space-y-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="individual" id="individual" className="border-white/50 text-orange-500" />
                <Label htmlFor="individual" className="text-white/80 cursor-pointer">Individual/sole proprietor or single-member LLC</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="c-corp" id="c-corp" className="border-white/50 text-orange-500" />
                <Label htmlFor="c-corp" className="text-white/80 cursor-pointer">C Corporation</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="s-corp" id="s-corp" className="border-white/50 text-orange-500" />
                <Label htmlFor="s-corp" className="text-white/80 cursor-pointer">S Corporation</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="partnership" id="partnership" className="border-white/50 text-orange-500" />
                <Label htmlFor="partnership" className="text-white/80 cursor-pointer">Partnership</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="trust" id="trust" className="border-white/50 text-orange-500" />
                <Label htmlFor="trust" className="text-white/80 cursor-pointer">Trust/estate</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="llc" id="llc" className="border-white/50 text-orange-500" />
                <Label htmlFor="llc" className="text-white/80 cursor-pointer">Limited liability company (LLC)</Label>
              </div>
            </RadioGroup>

            {/* LLC Classification */}
            {taxClassification === 'llc' && (
              <div className="ml-6 space-y-2">
                <Label className="text-white/70 text-sm">Enter the tax classification (C=C corporation, S=S corporation, P=Partnership)</Label>
                <Select value={llcClassification} onValueChange={setLlcClassification}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white w-48">
                    <SelectValue placeholder="Select classification" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0a1628] border-white/20">
                    <SelectItem value="C" className="text-white hover:bg-white/10">C - C Corporation</SelectItem>
                    <SelectItem value="S" className="text-white hover:bg-white/10">S - S Corporation</SelectItem>
                    <SelectItem value="P" className="text-white hover:bg-white/10">P - Partnership</SelectItem>
                  </SelectContent>
                </Select>
                {errors.llcClassification && <p className="text-sm text-red-400">{errors.llcClassification}</p>}
              </div>
            )}
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label className="text-white">
              Address (number, street, and apt. or suite no.) <span className="text-red-400">*</span>
            </Label>
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

          {/* SSN */}
          <div className="bg-[#0d1d33] rounded-xl p-4 space-y-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-400" />
              <p className="text-white/80 text-sm">Your SSN is only used to complete the W-9 PDF and is never stored in our database.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white">Social Security Number (SSN) <span className="text-red-400">*</span></Label>
                <Input
                  type="password"
                  value={ssn}
                  onChange={handleSsnChange}
                  placeholder="XXX-XX-XXXX"
                  maxLength={11}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 font-mono"
                />
                {errors.ssn && <p className="text-sm text-red-400">{errors.ssn}</p>}
              </div>
              <div className="space-y-2">
                <Label className="text-white">Confirm SSN <span className="text-red-400">*</span></Label>
                <Input
                  type="password"
                  value={confirmSsn}
                  onChange={handleConfirmSsnChange}
                  placeholder="XXX-XX-XXXX"
                  maxLength={11}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 font-mono"
                />
                {errors.confirmSsn && <p className="text-sm text-red-400">{errors.confirmSsn}</p>}
              </div>
            </div>
          </div>

          {/* Certification */}
          <div className="bg-[#1a1510] border border-orange-500/30 rounded-xl p-4 space-y-3">
            <h3 className="text-white font-semibold">Certification</h3>
            <p className="text-white/70 text-sm">
              Under penalties of perjury, I certify that:
            </p>
            <ul className="text-white/60 text-sm space-y-1 ml-4 list-disc">
              <li>The number shown on this form is my correct taxpayer identification number, and</li>
              <li>I am not subject to backup withholding because: (a) I am exempt from backup withholding, or (b) I have not been notified by the IRS that I am subject to backup withholding, and</li>
              <li>I am a U.S. citizen or other U.S. person, and</li>
              <li>The FATCA code(s) entered on this form (if any) indicating that I am exempt from FATCA reporting is correct.</li>
            </ul>
            <div className="flex items-start space-x-3 pt-2">
              <Checkbox
                id="certify"
                checked={certify}
                onCheckedChange={(checked) => setCertify(checked as boolean)}
                className="mt-0.5 border-white/50 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
              />
              <Label htmlFor="certify" className="text-white/80 text-sm cursor-pointer leading-tight">
                I certify that all information provided above is true and correct to the best of my knowledge.
              </Label>
            </div>
            {errors.certify && <p className="text-sm text-red-400">{errors.certify}</p>}
          </div>

          {/* Signature */}
          <div className="space-y-3">
            <Label className="text-white">
              Signature <span className="text-red-400">*</span>
            </Label>
            <div className="relative border-2 border-dashed border-white/30 rounded-lg bg-white overflow-hidden">
              <SignatureCanvas
                ref={sigCanvas}
                canvasProps={{
                  className: 'w-full h-48 cursor-crosshair',
                }}
                backgroundColor="rgb(255, 255, 255)"
                penColor="rgb(0, 0, 0)"
                onEnd={() => setHasSigned(true)}
              />
              <div className="absolute bottom-2 right-2 text-xs text-gray-400 pointer-events-none">
                Sign above
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={clearSignature}
              className="w-full border-white/30 text-white hover:bg-white/10"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Clear Signature
            </Button>
            {errors.signature && <p className="text-sm text-red-400">{errors.signature}</p>}
            <p className="text-xs text-white/50 text-center">
              Draw your signature using your mouse, trackpad, or touch screen
            </p>
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
              type="button"
              variant="outline"
              onClick={() => router.push('/onboarding/rep/payplan')}
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
                  Submitting...
                </>
              ) : (
                <>
                  Sign & Submit
                  <CheckCircle className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>

        <footer className="mt-8 text-center">
          <p className="text-white/30 text-sm">Your W-9 will be securely uploaded to our records.</p>
        </footer>
      </div>
    </div>
  );
}
