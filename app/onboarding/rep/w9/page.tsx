'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileText, ArrowLeft, Upload, CheckCircle, Loader2, AlertCircle, X } from 'lucide-react';

const ONBOARDING_TOKEN_KEY = 'remotive_onboarding_token';
const ONBOARDING_STATE_KEY = 'remotive_rep_onboarding';

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

export default function RepW9Page() {
  const [mounted, setMounted] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  const [entryToken, setEntryToken] = useState<string | null>(null);
  const [onboardingState, setOnboardingStateLocal] = useState<OnboardingState | null>(null);
  const router = useRouter();

  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    // Check if we have a valid token
    const token = sessionStorage.getItem(ONBOARDING_TOKEN_KEY);
    if (!token) {
      router.push('/onboarding/rep');
      return;
    }
    setEntryToken(token);
    setHasToken(true);

    // Check if previous steps completed
    const state = getOnboardingState();
    if (!state.payplanAccepted) {
      router.push('/onboarding/rep/payplan');
      return;
    }
    if (!state.profileData) {
      router.push('/onboarding/rep/profile');
      return;
    }
    setOnboardingStateLocal(state);
  }, [router]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Please upload a PDF, JPG, or PNG file');
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setUploadError('File size must be less than 10MB');
      return;
    }

    setSelectedFile(file);
    setUploadError(null);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile || !entryToken || !onboardingState?.profileData) {
      setUploadError('Missing required information');
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('entryToken', entryToken);
      formData.append('firstName', onboardingState.profileData.firstName);
      formData.append('lastName', onboardingState.profileData.lastName);
      formData.append('phone', onboardingState.profileData.phone);
      formData.append('state', onboardingState.profileData.state);
      formData.append('w9File', selectedFile);

      const response = await fetch('/api/onboarding/complete', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        // Store signup code in session storage for display
        sessionStorage.setItem('remotive_signup_code', data.signupCode);
        sessionStorage.setItem('remotive_signup_code_expires', data.expiresAt);

        // Clear the entry token as it's now used
        sessionStorage.removeItem(ONBOARDING_TOKEN_KEY);

        router.push('/onboarding/rep/complete');
      } else {
        setUploadError(data.error || 'Failed to complete onboarding');
      }
    } catch (error) {
      console.error('Submission error:', error);
      setUploadError('An error occurred. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleBack = () => {
    router.push('/onboarding/rep/profile');
  };

  if (!mounted || !hasToken) {
    return null;
  }

  return (
    <Card className="max-w-lg w-full bg-white/10 backdrop-blur-md border-white/20 text-white">
      <CardHeader className="text-center border-b border-white/10">
        <div className="mx-auto w-16 h-16 bg-[#E96114]/20 rounded-full flex items-center justify-center mb-4">
          <FileText className="w-8 h-8 text-[#E96114]" />
        </div>
        <CardTitle className="text-2xl">W-9 Tax Form</CardTitle>
        <CardDescription className="text-gray-300">
          Step 3 of 4: Upload your completed W-9 form
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* W-9 Information */}
        <div className="bg-white/5 rounded-lg p-4 text-sm text-gray-300">
          <p className="mb-2">
            <strong className="text-white">Why do we need this?</strong>
          </p>
          <p>
            As an independent contractor (1099), we require your W-9 form for tax reporting purposes.
            This form is kept secure and is only used for IRS compliance.
          </p>
        </div>

        {/* Download W-9 link */}
        <div className="text-center">
          <a
            href="https://www.irs.gov/pub/irs-pdf/fw9.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#E96114] hover:underline text-sm"
          >
            Download blank W-9 form from IRS.gov
          </a>
        </div>

        {/* File Upload Area */}
        <div
          className={`
            border-2 border-dashed rounded-lg p-8 text-center transition-colors
            ${selectedFile
              ? 'border-green-500/50 bg-green-500/10'
              : 'border-white/30 hover:border-[#E96114]/50 hover:bg-white/5'
            }
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileSelect}
            className="hidden"
            id="w9-upload"
          />

          {selectedFile ? (
            <div className="space-y-3">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto" />
              <p className="text-white font-medium">{selectedFile.name}</p>
              <p className="text-sm text-gray-400">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRemoveFile}
                className="border-white/30 text-white hover:bg-white/10"
              >
                <X className="w-4 h-4 mr-2" />
                Remove
              </Button>
            </div>
          ) : (
            <label htmlFor="w9-upload" className="cursor-pointer space-y-3 block">
              <Upload className="w-12 h-12 text-gray-400 mx-auto" />
              <p className="text-gray-300">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-500">
                PDF, JPG, or PNG (max 10MB)
              </p>
            </label>
          )}
        </div>

        {/* Error message */}
        {uploadError && (
          <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-lg">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {uploadError}
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex gap-4 pt-4">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={uploading}
            className="flex-1 border-white/30 text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedFile || uploading}
            className="flex-1 bg-[#E96114] hover:bg-[#E96114]/90 text-white"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                Complete Setup
                <CheckCircle className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
