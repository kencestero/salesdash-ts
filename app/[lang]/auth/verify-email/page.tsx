"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { DEFAULT_LANG } from "@/lib/i18n";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const [countdown, setCountdown] = useState(120); // 2 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleResend = async () => {
    setResending(true);
    // TODO: Call API to resend verification email
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setResending(false);
    setCountdown(120);
    setCanResend(false);
  };

  const handleOpenEmail = () => {
    // Try to open default email client
    window.location.href = "mailto:";
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-primary/20 to-primary/5">
      <div className="max-w-md w-full">
        {/* Card with MJ SalesDash branding */}
        <div className="bg-gradient-to-b from-[#1a3a52] to-[#0d1f2d] rounded-3xl shadow-2xl overflow-hidden border-4 border-[#1a3a52]">
          {/* Header */}
          <div className="bg-[#1a3a52] text-[#f5a623] px-8 py-6 text-center">
            <h1 className="text-3xl font-bold">MJ SalesDash</h1>
          </div>

          {/* Content */}
          <div className="bg-[#f5a623] px-8 py-10 text-center">
            <h2 className="text-4xl font-bold text-[#0d1f2d] mb-4">
              Verify Your Email!
            </h2>
            <p className="text-lg text-[#0d1f2d] leading-relaxed mb-6">
              We sent you a verification link via email. Please click it to verify your email
              address. If you don&apos;t see the email, please check your SPAM folder.
            </p>

            {/* Open Email Button */}
            <Button
              onClick={handleOpenEmail}
              className="w-full bg-[#1a3a52] hover:bg-[#0d1f2d] text-white text-xl font-semibold py-8 rounded-2xl mb-6 transition-all hover:scale-105"
            >
              Open email
            </Button>

            {/* Countdown */}
            <div className="text-6xl font-bold text-[#0d1f2d] mb-3">
              {formatTime(countdown)}
            </div>

            {/* Resend Button */}
            {canResend ? (
              <button
                onClick={handleResend}
                disabled={resending}
                className="text-[#0d1f2d] font-semibold text-lg underline hover:no-underline disabled:opacity-50"
              >
                {resending ? "Sending..." : "Resend email verification"}
              </button>
            ) : (
              <p className="text-[#0d1f2d] font-semibold text-lg">
                Resend email verification
              </p>
            )}
          </div>
        </div>

        {/* Email sent to */}
        {email && (
          <p className="text-center text-default-600 mt-4">
            Verification email sent to: <span className="font-semibold">{email}</span>
          </p>
        )}

        {/* Back to login */}
        <div className="text-center mt-6">
          <a
            href={`/${DEFAULT_LANG}/auth/login`}
            className="text-primary hover:underline font-semibold"
          >
            Back to Login
          </a>
        </div>
      </div>
    </main>
  );
}
