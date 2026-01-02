"use client";

import React, { useState, Suspense } from 'react';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { Icon } from "@iconify/react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams?.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordType, setPasswordType] = useState('password');
  const [confirmPasswordType, setConfirmPasswordType] = useState('password');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const togglePasswordType = () => {
    setPasswordType(passwordType === 'password' ? 'text' : 'password');
  };

  const toggleConfirmPasswordType = () => {
    setConfirmPasswordType(confirmPasswordType === 'password' ? 'text' : 'password');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/en/auth/login');
      }, 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
        @keyframes pulse-success {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .pulse-success {
          animation: pulse-success 2s ease-in-out infinite;
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

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a1628]/60 via-[#0a1628]/40 to-[#0a1628]/70 z-[1]" />

      {/* Main Content */}
      <div className="relative z-10 h-full flex items-center justify-center py-8">
        <div className="w-full max-w-md px-6">
          <div className="rounded-2xl p-8 relative overflow-hidden backdrop-blur-xl bg-white/10 border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
            {/* R Logo with Glow */}
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

            {!success ? (
              <>
                <div className="text-center mb-6">
                  <h3 className="text-white text-xl font-semibold tracking-wide uppercase mb-2">
                    Create New Password
                  </h3>
                  <p className="text-white/50 text-sm">
                    Enter a strong password to secure your account
                  </p>
                </div>

                {!token && (
                  <div className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-lg py-3 px-4 mb-4">
                    Invalid or missing reset token. Please request a new password reset link.
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* New Password */}
                  <div>
                    <label className="text-white/70 text-xs font-medium tracking-wide block mb-2">
                      New Password *
                    </label>
                    <div className="relative">
                      <input
                        type={passwordType}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-lg px-4 py-3 text-white bg-black/30 border border-white/10 outline-none transition-all placeholder:text-white/30 focus:border-[#E96614] focus:ring-1 focus:ring-[#E96614]/50 focus:bg-black/40 pr-10"
                        placeholder="Minimum 8 characters"
                        required
                        autoFocus
                        minLength={8}
                        disabled={loading || !token}
                      />
                      <div
                        className="absolute top-1/2 -translate-y-1/2 right-3 cursor-pointer"
                        onClick={togglePasswordType}
                      >
                        {passwordType === 'password' ? (
                          <Icon icon="heroicons:eye" className="w-5 h-5 text-white/40 hover:text-white/60" />
                        ) : (
                          <Icon icon="heroicons:eye-slash" className="w-5 h-5 text-white/40 hover:text-white/60" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="text-white/70 text-xs font-medium tracking-wide block mb-2">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <input
                        type={confirmPasswordType}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full rounded-lg px-4 py-3 text-white bg-black/30 border border-white/10 outline-none transition-all placeholder:text-white/30 focus:border-[#E96614] focus:ring-1 focus:ring-[#E96614]/50 focus:bg-black/40 pr-10"
                        placeholder="Re-enter your password"
                        required
                        minLength={8}
                        disabled={loading || !token}
                      />
                      <div
                        className="absolute top-1/2 -translate-y-1/2 right-3 cursor-pointer"
                        onClick={toggleConfirmPasswordType}
                      >
                        {confirmPasswordType === 'password' ? (
                          <Icon icon="heroicons:eye" className="w-5 h-5 text-white/40 hover:text-white/60" />
                        ) : (
                          <Icon icon="heroicons:eye-slash" className="w-5 h-5 text-white/40 hover:text-white/60" />
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

                  {error && (
                    <div className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-lg py-3 px-4">
                      {error}
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading || !token}
                    className="w-full text-white font-semibold py-3.5 px-6 rounded-lg bg-gradient-to-b from-[#ff3a3a] via-[#cc2020] to-[#8a1010] shadow-[0_4px_20px_rgba(255,58,58,0.4),inset_0_1px_0_rgba(255,255,255,0.2),inset_0_-2px_4px_rgba(0,0,0,0.3)] text-sm tracking-wide border border-[#ff4444]/30 cursor-pointer transition-all hover:shadow-[0_6px_30px_rgba(255,58,58,0.6),inset_0_1px_0_rgba(255,255,255,0.25),inset_0_-2px_4px_rgba(0,0,0,0.4)] hover:brightness-110 active:scale-[0.98] active:shadow-[0_2px_10px_rgba(255,58,58,0.4),inset_0_2px_4px_rgba(0,0,0,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Resetting Password...' : 'Reset Password'}
                  </button>
                </form>

                {/* Back to Login */}
                <div className="mt-5 text-center">
                  <p className="text-white/40 text-xs">
                    Remember your password?{" "}
                    <a href="/en/auth/login" className="text-[#E96614] hover:text-[#ff7a3d] transition-colors font-medium">
                      Sign In
                    </a>
                  </p>
                </div>
              </>
            ) : (
              /* Success State */
              <div className="text-center py-4">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-b from-[#22c55e] to-[#16a34a] flex items-center justify-center pulse-success shadow-[0_4px_20px_rgba(34,197,94,0.4)]">
                  <Icon icon="heroicons:check" className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-white text-xl font-semibold mb-3">
                  Password Reset Successful!
                </h3>
                <p className="text-white/70 text-sm mb-2">
                  Your password has been updated successfully.
                </p>
                <p className="text-white/50 text-xs">
                  Redirecting to login page...
                </p>
              </div>
            )}

            {/* Footer */}
            <div className="mt-6 pt-5 border-t border-white/10 text-center">
              <p className="text-white/25 text-xs">
                © 2025 Remotive Logistics • Haverstraw, NY
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center">
        <div className="text-white/60 text-sm">Loading...</div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
