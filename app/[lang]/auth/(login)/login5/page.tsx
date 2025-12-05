"use client";

import React, { useState, useEffect, useTransition } from 'react';
import Image from 'next/image';
import { Icon } from "@iconify/react";
import { signIn } from "next-auth/react";
import { DEFAULT_LANG } from "@/lib/i18n";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordType, setPasswordType] = useState('password');
  const [showForm, setShowForm] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setTimeout(() => setShowForm(true), 200);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    startTransition(async () => {
      const response = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (response?.ok) {
        window.location.assign(`/${DEFAULT_LANG}/dashboard`);
      } else if (response?.error) {
        setLoginError(response.error);
      }
    });
  };

  const togglePasswordType = () => {
    setPasswordType(passwordType === "password" ? "text" : "password");
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setResetError('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send reset email');
      }

      setResetSent(true);
    } catch (err: any) {
      setResetError(err.message);
    } finally {
      setResetLoading(false);
    }
  };

  const closeForgotPasswordModal = () => {
    setShowForgotPassword(false);
    setResetEmail('');
    setResetSent(false);
    setResetError('');
  };

  return (
    <div className="h-screen w-screen fixed inset-0 overflow-auto bg-[#0a1628]">
      <style jsx>{`
        @keyframes subtle-glow {
          0%, 100% { filter: drop-shadow(0 0 15px rgba(255, 60, 20, 0.5)); }
          50% { filter: drop-shadow(0 0 25px rgba(255, 60, 20, 0.65)); }
        }

        .logo-glow {
          animation: subtle-glow 8s ease-in-out infinite;
        }
      `}</style>

      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/remotive-bg.webp"
          alt="Remotive Dashboard"
          fill
          className="object-cover"
          priority
          quality={90}
        />
      </div>

      {/* Dark gradient overlay - reduced opacity for more vibrant background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a1628]/60 via-[#0a1628]/40 to-[#0a1628]/70 z-[1]" />

      {/* Login Form */}
      <div className="relative z-10 h-full flex items-center justify-center py-8">
        <div className="w-full max-w-[42rem] px-6">
          <div
            className={`transition-all duration-700 ${
              showForm ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            {/* Glassmorphism Card - Horizontal Layout */}
            <div className="rounded-2xl p-8 relative overflow-hidden backdrop-blur-xl bg-white/10 border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">

              {/* R Logo with Glow - Static, 18% larger */}
              <div className="flex justify-center mb-6">
                <Image
                  src="/images/logo/remotive-r.png"
                  alt="Remotive"
                  width={95}
                  height={95}
                  className="logo-glow"
                  priority
                />
              </div>

              <div className="text-center mb-6">
                <h3 className="text-white text-xl font-semibold tracking-wide uppercase mb-2">
                  Welcome to Remotive SalesHub
                </h3>
                <p className="text-white/50 text-sm">
                  Your Home Base for Peak-Performance Selling
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {/* Horizontal layout for email and password */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-white/70 text-xs font-medium tracking-wide block mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-lg px-4 py-3 text-white bg-black/30 border border-white/10 text-sm outline-none transition-all placeholder:text-white/30 focus:border-[#E96614] focus:ring-1 focus:ring-[#E96614]/50 focus:bg-black/40"
                      placeholder="your@email.com"
                      required
                      autoFocus
                      disabled={isPending}
                    />
                  </div>

                  <div>
                    <label className="text-white/70 text-xs font-medium tracking-wide block mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={passwordType}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-lg px-4 py-3 pr-12 text-white bg-black/30 border border-white/10 text-sm outline-none transition-all placeholder:text-white/30 focus:border-[#E96614] focus:ring-1 focus:ring-[#E96614]/50 focus:bg-black/40"
                        placeholder="••••••••"
                        required
                        disabled={isPending}
                      />
                      <button
                        type="button"
                        onClick={togglePasswordType}
                        className="absolute top-1/2 -translate-y-1/2 right-3 text-white/40 hover:text-white/70 transition-colors"
                      >
                        {passwordType === "password" ? (
                          <Icon icon="heroicons:eye" className="w-5 h-5" />
                        ) : (
                          <Icon icon="heroicons:eye-slash" className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {loginError && (
                  <div className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-lg py-2 px-3">
                    {loginError}
                  </div>
                )}


                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-white/50 text-xs hover:text-[#E96614] transition-colors"
                  >
                    Forgot your password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full text-white font-semibold py-3.5 px-6 rounded-lg bg-gradient-to-b from-[#ff3a3a] via-[#cc2020] to-[#8a1010] shadow-[0_4px_20px_rgba(255,58,58,0.4),inset_0_1px_0_rgba(255,255,255,0.2),inset_0_-2px_4px_rgba(0,0,0,0.3)] text-sm tracking-wide border border-[#ff4444]/30 cursor-pointer transition-all hover:shadow-[0_6px_30px_rgba(255,58,58,0.6),inset_0_1px_0_rgba(255,255,255,0.25),inset_0_-2px_4px_rgba(0,0,0,0.4)] hover:brightness-110 active:scale-[0.98] active:shadow-[0_2px_10px_rgba(255,58,58,0.4),inset_0_2px_4px_rgba(0,0,0,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? 'Signing In...' : 'Sign In'}
                </button>

              </form>

              <div className="mt-5 text-center">
                <p className="text-white/40 text-xs">
                  Don't have an account?{' '}
                  <a href={`/${DEFAULT_LANG}/auth/join`} className="text-[#E96614] hover:text-[#ff7a3d] transition-colors font-medium">
                    Sign Up
                  </a>
                </p>
              </div>

              <div className="mt-6 pt-5 border-t border-white/10 text-center">
                <p className="text-white/25 text-xs">
                  © 2025 Remotive Logistics • Haverstraw, NY
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={closeForgotPasswordModal}>
          <div
            className="w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="rounded-2xl p-8 relative overflow-hidden backdrop-blur-xl bg-white/10 border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
              {!resetSent ? (
                <>
                  <div className="text-center mb-6">
                    <h3 className="text-white text-xl font-semibold mb-2">
                      Reset Password
                    </h3>
                    <p className="text-white/50 text-sm">
                      Enter your email and we'll send you a reset link
                    </p>
                  </div>

                  <form onSubmit={handleForgotPassword} className="flex flex-col gap-4">
                    <div>
                      <label className="text-white/70 text-xs font-medium tracking-wide block mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        className="w-full rounded-lg px-4 py-3 text-white bg-black/30 border border-white/10 text-sm outline-none transition-all placeholder:text-white/30 focus:border-[#E96614] focus:ring-1 focus:ring-[#E96614]/50 focus:bg-black/40"
                        placeholder="your@email.com"
                        required
                        autoFocus
                      />
                    </div>

                    {resetError && (
                      <div className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-lg py-2 px-3">
                        {resetError}
                      </div>
                    )}

                    <div className="flex gap-3 mt-2">
                      <button
                        type="button"
                        onClick={closeForgotPasswordModal}
                        className="flex-1 text-white/70 font-medium py-3 px-6 rounded-lg bg-white/5 border border-white/10 text-sm cursor-pointer transition-all hover:bg-white/10 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={resetLoading}
                        className="flex-1 text-white font-semibold py-3 px-6 rounded-lg bg-gradient-to-r from-[#E96614] to-[#ff7a3d] shadow-[0_4px_20px_rgba(233,97,20,0.4)] text-sm border-none cursor-pointer transition-all hover:shadow-[0_6px_30px_rgba(233,97,20,0.6)] hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {resetLoading ? 'Sending...' : 'Send Link'}
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <>
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-[#E96614] to-[#ff7a3d] flex items-center justify-center">
                      <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-white text-xl font-semibold mb-2">
                      Check Your Email
                    </h3>
                    <p className="text-white/50 text-sm mb-6">
                      We've sent a password reset link to<br />
                      <span className="text-white font-medium">{resetEmail}</span>
                    </p>
                    <p className="text-white/40 text-xs mb-6">
                      The link will expire in 1 hour for security.
                    </p>
                    <button
                      onClick={closeForgotPasswordModal}
                      className="w-full text-white font-semibold py-3 px-6 rounded-lg bg-gradient-to-r from-[#E96614] to-[#ff7a3d] shadow-[0_4px_20px_rgba(233,97,20,0.4)] text-sm border-none cursor-pointer transition-all hover:shadow-[0_6px_30px_rgba(233,97,20,0.6)] hover:brightness-110 active:scale-[0.98]"
                    >
                      Close
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
