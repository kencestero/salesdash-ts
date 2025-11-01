"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DEFAULT_LANG } from "@/lib/i18n";

export default function RegisterPage() {
  const [code, setCode] = useState("");
  const [codeValidated, setCodeValidated] = useState(false);
  const [validatingCode, setValidatingCode] = useState(false);
  const [validatedRole, setValidatedRole] = useState<string>("");
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
  const [managerId, setManagerId] = useState("");
  const [isFreelancer, setIsFreelancer] = useState(false);
  const [managers, setManagers] = useState<Array<{ id: string; name: string; role: string }>>([]);
  const [loadingManagers, setLoadingManagers] = useState(false);

  // Hardcoded fallback manager list
  const fallbackManagers = [
    { id: "fallback-1", name: "Brian Jonczy", role: "manager" },
    { id: "fallback-2", name: "Nathan Wiese", role: "manager" },
    { id: "fallback-3", name: "Conrad Centeno", role: "manager" },
    { id: "fallback-4", name: "Calvin M", role: "manager" },
    { id: "fallback-5", name: "Max Butler", role: "manager" },
    { id: "fallback-6", name: "Tony Ross", role: "manager" },
  ];

  // Fetch available managers dynamically and combine with fallback
  useEffect(() => {
    async function fetchManagers() {
      setLoadingManagers(true);
      try {
        const res = await fetch("/api/managers/available");
        if (res.ok) {
          const data = await res.json();
          const dynamicManagers = data.managers || [];
          const combined = [...dynamicManagers, ...fallbackManagers];
          const unique = combined.filter((manager, index, self) =>
            index === self.findIndex(m =>
              m.name.toLowerCase().trim() === manager.name.toLowerCase().trim()
            )
          );
          setManagers(unique);
        } else {
          setManagers(fallbackManagers);
        }
      } catch (error) {
        console.error("Error fetching managers:", error);
        setManagers(fallbackManagers);
      } finally {
        setLoadingManagers(false);
      }
    }
    fetchManagers();
  }, []);

  const stars = useMemo(() => {
    return Array.from({ length: 45 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: Math.random() * 3 + 1,
      delay: Math.random() * 3
    }));
  }, []);

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
      const data = await r.json();
      setCodeValidated(true);
      setValidatedRole(data.role || "salesperson");
      setErr("");
    } else {
      const j = await r.json().catch(() => ({}));
      if (j?.attemptsRemaining !== undefined && j.attemptsRemaining > 0) {
        setErr(`${j?.message || "Invalid or expired code."} (${j.attemptsRemaining} attempts remaining)`);
      } else if (r.status === 429) {
        setErr(j?.message || "Too many failed attempts. Please try again later.");
      } else {
        setErr(j?.message || "Invalid or expired code.");
      }
    }
  }

  function handleFormClick() {
    if (!codeValidated) {
      setShowArrow(true);
      setTimeout(() => setShowArrow(false), 3000);
    }
  }

  async function handleEmailPasswordSignup(e: React.FormEvent) {
    e.preventDefault();

    if (!codeValidated) {
      handleFormClick();
      return;
    }

    if (!firstName || !lastName || !phone || !zipcode || !email || !password || !confirmPassword) {
      setErr("Please fill all required fields");
      return;
    }

    // Managers and owners don't need to select a manager
    const isManagerOrOwner = validatedRole === "manager" || validatedRole === "owner";

    if (!isManagerOrOwner && !isFreelancer && !managerId) {
      setErr("Please select your manager or check the Freelancer option");
      return;
    }

    if (password !== confirmPassword) {
      setErr("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setErr("Password must be at least 6 characters");
      return;
    }

    if (!acceptedTerms) {
      setErr("You must accept the Terms and Conditions to continue");
      return;
    }

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
        managerId: isFreelancer ? null : managerId,
        status: isFreelancer ? "freelancer" : "employee",
      }),
    });

    if (res.ok) {
      window.location.href = `/${DEFAULT_LANG}/auth/verify-email?email=${encodeURIComponent(email)}`;
    } else {
      const data = await res.json().catch(() => ({}));
      setErr(data?.message || "Failed to create account");
    }
  }

  const togglePasswordType = () => {
    setPasswordType(passwordType === "password" ? "text" : "password");
  };

  const toggleConfirmPasswordType = () => {
    setConfirmPasswordType(confirmPasswordType === "password" ? "text" : "password");
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      <style jsx>{`
        @keyframes aurora {
          0%, 100% { opacity: 0.5; transform: translateY(0) scale(1); }
          50% { opacity: 0.8; transform: translateY(-20px) scale(1.1); }
        }
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes rainbow {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
      `}</style>

      {/* Background Image */}
      <Image
        src="/images/final_increased_login_bg.jpg"
        alt="Starry Background"
        fill
        className="object-cover opacity-70"
        priority
        quality={90}
      />

      {/* Aurora Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px]" style={{ animation: 'aurora 8s ease-in-out infinite' }} />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px]" style={{ animation: 'aurora 10s ease-in-out infinite 2s' }} />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px]" style={{ animation: 'aurora 12s ease-in-out infinite 4s' }} />
      </div>

      {/* Rotating Gradient Overlay */}
      <div className="absolute inset-0 opacity-30 pointer-events-none" style={{
        background: 'conic-gradient(from 0deg at 50% 50%, transparent 0deg, rgba(233, 97, 20, 0.1) 90deg, transparent 180deg, rgba(59, 130, 246, 0.1) 270deg, transparent 360deg)',
        animation: 'rotate 20s linear infinite'
      }} />

      {/* Twinkling Stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {stars.map(star => (
          <div
            key={star.id}
            className="absolute bg-white rounded-full"
            style={{
              left: star.left,
              top: star.top,
              width: `${star.size}px`,
              height: `${star.size}px`,
              animation: `twinkle ${2 + Math.random() * 2}s ease-in-out infinite ${star.delay}s`
            }}
          />
        ))}
      </div>

      {/* MJ Logo - Fixed at top */}
      <div className="fixed top-12 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
        <div className="w-32 h-32 relative drop-shadow-2xl">
          <Image
            src="/images/DASH_LOGO_EYE_IN_THE_SKY.webp"
            alt="MJ SalesDash Logo"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-20 min-h-screen flex items-center justify-center p-6 pt-48">
        <div className="mx-auto max-w-2xl w-full bg-black/40 backdrop-blur-[25px] rounded-3xl p-8 shadow-2xl border border-white/20">
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

          {/* Path Selection */}
          {codeValidated && !signupPath && (
            <div className="space-y-4">
              <p className="text-white/90 text-center mb-6">Choose how you'd like to sign up:</p>

              <Button
                onClick={() => setSignupPath("social")}
                className="w-full bg-white/20 hover:bg-white/30 text-white border border-white/40 py-6 text-lg flex items-center justify-center gap-3"
              >
                <Icon icon="heroicons:user-group" className="w-6 h-6" />
                Sign up with Social Account (Quick)
              </Button>

              <Button
                onClick={() => setSignupPath("email")}
                variant="outline"
                className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/30 py-6 text-lg flex items-center justify-center gap-3"
              >
                <Icon icon="heroicons:envelope" className="w-6 h-6" />
                Sign up with Email & Password
              </Button>
            </div>
          )}

          {/* Social Path - Short Form */}
          {codeValidated && signupPath === "social" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Quick Signup</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSignupPath(null)}
                  className="text-white/70 hover:text-white"
                >
                  ← Back
                </Button>
              </div>

              {/* Basic Info */}
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
                  <Label className="text-white font-semibold mb-2 block">Zipcode *</Label>
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

              {/* Freelancer Checkbox */}
              <div className="flex items-start gap-3 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/20">
                <input
                  type="checkbox"
                  id="freelancer-check-social"
                  checked={isFreelancer}
                  onChange={(e) => {
                    setIsFreelancer(e.target.checked);
                    if (e.target.checked) setManagerId("Kenneth Cestero");
                  }}
                  className="mt-1 w-5 h-5 rounded border-white/30 text-primary focus:ring-2 focus:ring-primary cursor-pointer"
                />
                <label htmlFor="freelancer-check-social" className="text-sm text-white/90 cursor-pointer flex items-center gap-2">
                  <span className="font-black text-lg animate-pulse" style={{
                    background: 'linear-gradient(90deg, #ef4444 0%, #f59e0b 20%, #10b981 40%, #3b82f6 60%, #8b5cf6 80%, #ef4444 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    backgroundSize: '200% auto',
                    animation: 'rainbow 3s linear infinite'
                  }}>
                    I DON'T KNOW YET
                  </span>
                  <span className="text-white/70 text-xs">(We'll help you find the right manager)</span>
                </label>
              </div>

              {/* Manager Selection - Hidden for managers and owners */}
              {!isFreelancer && validatedRole !== "manager" && validatedRole !== "owner" && (
                <div>
                  <Label className="text-white font-semibold mb-2 block">Select Your Manager *</Label>
                  <select
                    value={managerId}
                    onChange={(e) => setManagerId(e.target.value)}
                    className="w-full bg-white/90 backdrop-blur-sm border-0 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-primary focus:outline-none disabled:opacity-50"
                    required={!isFreelancer}
                    disabled={loadingManagers}
                  >
                    {loadingManagers ? (
                      <option value="">Loading managers...</option>
                    ) : managers.length === 0 ? (
                      <option value="">No managers available</option>
                    ) : (
                      <>
                        <option value="">-- Select a Manager --</option>
                        {managers.map((manager) => (
                          <option key={manager.id} value={manager.id}>
                            {manager.name}
                          </option>
                        ))}
                      </>
                    )}
                  </select>
                  <p className="text-xs text-white/60 mt-1">
                    Your assigned manager will oversee your sales and provide support
                  </p>
                </div>
              )}

              {/* Terms */}
              <div className="flex items-start gap-3 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/20">
                <input
                  type="checkbox"
                  id="terms-social"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1 w-5 h-5 rounded border-white/30 text-primary focus:ring-2 focus:ring-primary cursor-pointer"
                  required
                />
                <label htmlFor="terms-social" className="text-sm text-white/90 cursor-pointer">
                  I accept the{" "}
                  <a
                    href={`/${DEFAULT_LANG}/auth/terms`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-foreground font-semibold underline hover:no-underline"
                  >
                    Terms and Conditions
                  </a>
                </label>
              </div>
            </div>
          )}

          {/* Email/Password Signup Form */}
          {codeValidated && (
            <form onSubmit={handleEmailPasswordSignup} className="space-y-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Create Account</h2>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSignupPath(null)}
                  className="text-white/70 hover:text-white"
                >
                  ← Back
                </Button>
              </div>

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
                  <Label className="text-white font-semibold mb-2 block">Zipcode *</Label>
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

              {/* Freelancer Checkbox */}
              <div className="flex items-start gap-3 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/20">
                <input
                  type="checkbox"
                  id="freelancer-check"
                  checked={isFreelancer}
                  onChange={(e) => {
                    setIsFreelancer(e.target.checked);
                    if (e.target.checked) setManagerId("Kenneth Cestero");
                  }}
                  className="mt-1 w-5 h-5 rounded border-white/30 text-primary focus:ring-2 focus:ring-primary cursor-pointer"
                />
                <label htmlFor="freelancer-check" className="text-sm text-white/90 cursor-pointer flex items-center gap-2">
                  <span className="font-black text-lg animate-pulse" style={{
                    background: 'linear-gradient(90deg, #ef4444 0%, #f59e0b 20%, #10b981 40%, #3b82f6 60%, #8b5cf6 80%, #ef4444 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    backgroundSize: '200% auto',
                    animation: 'rainbow 3s linear infinite'
                  }}>
                    I DON'T KNOW YET
                  </span>
                  <span className="text-white/70 text-xs">(We'll help you find the right manager)</span>
                </label>
              </div>

              {/* Manager Selection - Hidden for managers and owners */}
              {!isFreelancer && validatedRole !== "manager" && validatedRole !== "owner" && (
                <div>
                  <Label className="text-white font-semibold mb-2 block">Select Your Manager *</Label>
                  <select
                    value={managerId}
                    onChange={(e) => setManagerId(e.target.value)}
                    className="w-full bg-white/90 backdrop-blur-sm border-0 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-primary focus:outline-none disabled:opacity-50"
                    required={!isFreelancer}
                    disabled={loadingManagers}
                  >
                    {loadingManagers ? (
                      <option value="">Loading managers...</option>
                    ) : managers.length === 0 ? (
                      <option value="">No managers available</option>
                    ) : (
                      <>
                        <option value="">-- Select a Manager --</option>
                        {managers.map((manager) => (
                          <option key={manager.id} value={manager.id}>
                            {manager.name}
                          </option>
                        ))}
                      </>
                    )}
                  </select>
                  <p className="text-xs text-white/60 mt-1">
                    Your assigned manager will oversee your sales and provide support
                  </p>
                </div>
              )}

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
                <Label className="text-white font-semibold mb-2 block">Password *</Label>
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
                  id="terms-email"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1 w-5 h-5 rounded border-white/30 text-primary focus:ring-2 focus:ring-primary cursor-pointer"
                  required
                />
                <label htmlFor="terms-email" className="text-sm text-white/90 cursor-pointer">
                  I accept the{" "}
                  <a
                    href={`/${DEFAULT_LANG}/auth/terms`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-foreground font-semibold underline hover:no-underline"
                  >
                    Terms and Conditions
                  </a>
                </label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={!acceptedTerms}
                className="w-full bg-primary/90 hover:bg-primary text-primary-foreground rounded-xl py-6 font-semibold text-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Account
              </Button>
            </form>
          )}

          {/* Already have account */}
          <div className="mt-6 text-center text-white/80">
            Already have an account?{" "}
            <a href={`/${DEFAULT_LANG}/auth/login`} className="text-primary-foreground font-semibold hover:underline">
              Sign In
            </a>
          </div>
        </div>
      </div>

      {/* Brand Logos Footer */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-6">
        <Image src="/images/diamondcargoorangeloco.png" alt="Diamond Cargo" width={80} height={40} className="object-contain opacity-70 hover:opacity-100 transition-opacity" />
        <Image src="/images/pantherorange.png" alt="Panther Cargo" width={80} height={40} className="object-contain opacity-70 hover:opacity-100 transition-opacity" />
        <Image src="/images/qualitylogoorange.png" alt="Quality Cargo" width={80} height={40} className="object-contain opacity-70 hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );
}
