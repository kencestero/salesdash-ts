"use client";
import { useState } from "react";
import Image from "next/image";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "next-auth/react";
import { DEFAULT_LANG } from "@/lib/i18n";
import googleIcon from "@/public/images/auth/google.png";
import GithubIcon from "@/public/images/auth/github.png";
import facebook from "@/public/images/auth/facebook.png";
import twitter from "@/public/images/auth/twitter.png";

export default function RegisterPage() {
  const [code, setCode] = useState("");
  const [codeValidated, setCodeValidated] = useState(false);
  const [validatingCode, setValidatingCode] = useState(false);
  const [err, setErr] = useState("");
  const [showArrow, setShowArrow] = useState(false);

  // Form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [zipcode, setZipcode] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordType, setPasswordType] = useState("password");
  const [confirmPasswordType, setConfirmPasswordType] = useState("password");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  async function validateCode() {
    if (!code.trim()) {
      setErr("Please enter a secret code");
      return;
    }

    setValidatingCode(true);
    setErr("");

    const r = await fetch("/api/join/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });

    setValidatingCode(false);

    if (r.ok) {
      setCodeValidated(true);
      setErr("");
    } else {
      const j = await r.json().catch(() => ({}));
      setErr(j?.message || "Invalid or expired code.");
    }
  }

  function handleFormClick() {
    if (!codeValidated) {
      setShowArrow(true);
      setTimeout(() => setShowArrow(false), 3000);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!codeValidated) {
      handleFormClick();
      return;
    }

    // Validate required fields
    if (!firstName || !lastName || !phone || !zipcode || !email || !password || !confirmPassword) {
      setErr("Please fill all required fields");
      return;
    }

    // Validate password match
    if (password !== confirmPassword) {
      setErr("Passwords do not match");
      return;
    }

    // Validate password length
    if (password.length < 6) {
      setErr("Password must be at least 6 characters");
      return;
    }

    // Validate terms acceptance
    if (!acceptedTerms) {
      setErr("You must accept the Terms and Conditions to continue");
      return;
    }

    // Create account with email/password
    const res = await fetch("/api/join/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName,
        lastName,
        phone,
        zipcode,
        email,
        password,
      }),
    });

    if (res.ok) {
      // Successfully created account - redirect to login
      window.location.href = `/${DEFAULT_LANG}/auth/login?registered=true`;
    } else {
      const data = await res.json().catch(() => ({}));
      setErr(data?.message || "Failed to create account");
    }
  }

  async function handleGoogleSignUp() {
    if (!codeValidated) {
      handleFormClick();
      return;
    }

    // Even with Google, we need basic info filled
    if (!firstName || !lastName || !phone || !zipcode) {
      setErr("Please fill required fields (name, phone, zipcode) before signing up with Google");
      return;
    }

    // Store the data in cookies before OAuth (so server can access it)
    document.cookie = `signup_firstName=${encodeURIComponent(firstName)}; path=/; max-age=900`; // 15 min
    document.cookie = `signup_lastName=${encodeURIComponent(lastName)}; path=/; max-age=900`;
    document.cookie = `signup_phone=${encodeURIComponent(phone)}; path=/; max-age=900`;
    document.cookie = `signup_zipcode=${encodeURIComponent(zipcode)}; path=/; max-age=900`;

    // Also store in sessionStorage as backup
    sessionStorage.setItem("signup_data", JSON.stringify({ firstName, lastName, phone, zipcode }));

    // Proceed with Google OAuth
    signIn("google", {
      callbackUrl: `/${DEFAULT_LANG}/dashboard`,
    });
  }

  const togglePasswordType = () => {
    setPasswordType(passwordType === "password" ? "text" : "password");
  };

  const toggleConfirmPasswordType = () => {
    setConfirmPasswordType(confirmPasswordType === "password" ? "text" : "password");
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <Image
        src="/images/trailerbgimg.webp"
        alt="Cargo Trailer Interior"
        fill
        className="object-cover"
        quality={75}
        priority
      />
      <div className="absolute inset-0 bg-black/30 z-10" />

      <div className="relative z-20 mx-auto max-w-2xl w-full bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
        <h1 className="text-3xl font-bold mb-2 text-white text-center">Join MJ Cargo Sales Team</h1>
        <p className="text-white/80 text-center mb-8">Enter your secret code to get started</p>

        {/* Secret Code Section */}
        <div className="mb-8 relative">
          <Label className="text-white font-semibold mb-2 block">Secret Code *</Label>
          <div className="flex gap-3">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="ENTER CODE"
              disabled={codeValidated}
              className="flex-1 bg-white/90 backdrop-blur-sm border-0 rounded-xl px-4 py-3 text-center text-lg font-mono tracking-wider focus:ring-2 focus:ring-primary focus:outline-none disabled:opacity-50 disabled:bg-green-100 text-orange-600 placeholder:text-gray-400"
            />
            {!codeValidated && (
              <Button
                onClick={validateCode}
                disabled={validatingCode}
                className="bg-primary/90 hover:bg-primary px-6"
              >
                {validatingCode ? "Validating..." : "Validate"}
              </Button>
            )}
            {codeValidated && (
              <div className="flex items-center gap-2 bg-green-500/20 backdrop-blur-sm px-4 rounded-xl">
                <Icon icon="heroicons:check-circle" className="text-green-400 w-6 h-6" />
                <span className="text-green-300 font-semibold">Verified</span>
              </div>
            )}
          </div>
          {err && <p className="text-red-300 text-sm mt-2 bg-red-500/20 backdrop-blur-sm rounded-lg py-2 px-3">{err}</p>}

          {/* Arrow pointing up */}
          {showArrow && !codeValidated && (
            <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 text-center animate-bounce z-50">
              <Icon icon="heroicons:arrow-up" className="text-yellow-400 w-12 h-12 mx-auto mb-2" />
              <p className="text-yellow-300 font-bold text-lg bg-yellow-500/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                Enter Secret Code First!
              </p>
            </div>
          )}
        </div>

        {/* Application Form */}
        <form onSubmit={handleSubmit} className="space-y-5 relative">
          {/* Overlay when code not validated */}
          {!codeValidated && (
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-[2px] rounded-2xl z-30 cursor-not-allowed"
              onClick={handleFormClick}
            />
          )}

          <div className={`space-y-5 ${!codeValidated ? 'opacity-50 pointer-events-none' : ''}`}>
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white font-semibold mb-2 block">First Name *</Label>
                <Input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John"
                  className="bg-white/90 backdrop-blur-sm border-0"
                  required
                />
              </div>
              <div>
                <Label className="text-white font-semibold mb-2 block">Last Name *</Label>
                <Input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  className="bg-white/90 backdrop-blur-sm border-0"
                  required
                />
              </div>
            </div>

            {/* Phone and Zipcode */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white font-semibold mb-2 block">Phone Number *</Label>
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="bg-white/90 backdrop-blur-sm border-0"
                  required
                />
              </div>
              <div>
                <Label className="text-white font-semibold mb-2 block">Zipcode Residence *</Label>
                <Input
                  type="text"
                  value={zipcode}
                  onChange={(e) => setZipcode(e.target.value)}
                  placeholder="12345"
                  maxLength={5}
                  pattern="[0-9]{5}"
                  className="bg-white/90 backdrop-blur-sm border-0"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <Label className="text-white font-semibold mb-2 block">Email Address *</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                className="bg-white/90 backdrop-blur-sm border-0"
                required
              />
            </div>

            {/* Password */}
            <div>
              <Label className="text-white font-semibold mb-2 block">New Password *</Label>
              <div className="relative">
                <Input
                  type={passwordType}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-white/90 backdrop-blur-sm border-0 pr-10"
                  required
                  minLength={6}
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 right-3 cursor-pointer"
                  onClick={togglePasswordType}
                >
                  {passwordType === "password" ? (
                    <Icon icon="heroicons:eye" className="w-5 h-5 text-default-400" />
                  ) : (
                    <Icon icon="heroicons:eye-slash" className="w-5 h-5 text-default-400" />
                  )}
                </div>
              </div>
              <p className="text-xs text-white/60 mt-1">Must be at least 6 characters</p>
            </div>

            {/* Confirm Password */}
            <div>
              <Label className="text-white font-semibold mb-2 block">Confirm Password *</Label>
              <div className="relative">
                <Input
                  type={confirmPasswordType}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-white/90 backdrop-blur-sm border-0 pr-10"
                  required
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 right-3 cursor-pointer"
                  onClick={toggleConfirmPasswordType}
                >
                  {confirmPasswordType === "password" ? (
                    <Icon icon="heroicons:eye" className="w-5 h-5 text-default-400" />
                  ) : (
                    <Icon icon="heroicons:eye-slash" className="w-5 h-5 text-default-400" />
                  )}
                </div>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-red-300 mt-1">Passwords must match</p>
              )}
              {confirmPassword && password === confirmPassword && (
                <p className="text-xs text-green-300 mt-1">✓ Passwords match</p>
              )}
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start gap-3 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/20">
              <input
                type="checkbox"
                id="terms"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-white/30 text-primary focus:ring-2 focus:ring-primary cursor-pointer"
                required
              />
              <label htmlFor="terms" className="text-sm text-white/90 cursor-pointer">
                I accept the{" "}
                <a
                  href={`/${DEFAULT_LANG}/auth/terms`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-foreground font-semibold underline hover:no-underline"
                >
                  Terms and Conditions
                </a>{" "}
                and acknowledge that I am an independent contractor, not an employee. I agree to protect customer confidential information and comply with all data privacy laws.
              </label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={!acceptedTerms}
              className="w-full bg-primary/90 hover:bg-primary text-primary-foreground rounded-xl py-6 font-semibold text-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Account & Verify Email
            </Button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white/10 backdrop-blur-sm text-white rounded-full">Or sign up with</span>
              </div>
            </div>

            {/* OAuth Buttons */}
            <div className="flex justify-center gap-4">
              <Button
                type="button"
                size="icon"
                variant="outline"
                className="rounded-full border-white/30 bg-white/10 hover:bg-white/20 w-12 h-12"
                onClick={handleGoogleSignUp}
              >
                <Image src={googleIcon} alt="google" className="w-5 h-5" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="outline"
                className="rounded-full border-white/30 bg-white/10 hover:bg-white/20 w-12 h-12"
                onClick={() => {
                  if (!codeValidated) {
                    handleFormClick();
                  } else {
                    signIn("github", { callbackUrl: `/${DEFAULT_LANG}/dashboard` });
                  }
                }}
              >
                <Image src={GithubIcon} alt="github" className="w-5 h-5" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="outline"
                className="rounded-full border-white/30 bg-white/10 hover:bg-white/20 w-12 h-12"
                onClick={handleFormClick}
              >
                <Image src={facebook} alt="facebook" className="w-5 h-5" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="outline"
                className="rounded-full border-white/30 bg-white/10 hover:bg-white/20 w-12 h-12"
                onClick={handleFormClick}
              >
                <Image src={twitter} alt="twitter" className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </form>

        {/* Already have account */}
        <div className="mt-6 text-center text-white/80">
          Already have an account?{" "}
          <a href={`/${DEFAULT_LANG}/auth/login`} className="text-primary-foreground font-semibold hover:underline">
            Sign In
          </a>
        </div>
      </div>
    </main>
  );
}
