"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { DEFAULT_LANG } from "@/lib/i18n";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const error = searchParams.get("error");
  const details = searchParams.get("details");
  const [countdown, setCountdown] = useState(300); // 5 minutes in seconds
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

  // Error messages
  const getErrorMessage = () => {
    switch (error) {
      case "missing_token":
        return "Verification link is invalid. Please check your email or request a new verification link.";
      case "invalid_token":
        return "This verification link is invalid or has already been used. Please request a new verification link.";
      case "expired_token":
        return "This verification link has expired. Please request a new verification link below.";
      case "verification_failed":
        return "Verification failed due to a server error. Please try again or contact support.";
      default:
        return null;
    }
  };

  const errorMessage = getErrorMessage();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleResend = async () => {
    if (!email) return;

    setResending(true);

    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        alert(data.message || "Verification email sent!");
        setCountdown(300);
        setCanResend(false);
      } else {
        alert(data.message || "Failed to resend email");
      }
    } catch (error) {
      alert("Failed to resend verification email");
    } finally {
      setResending(false);
    }
  };

  const handleOpenEmail = () => {
    // Try to open default email client
    window.location.href = "mailto:";
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-[#0a0a0a]">
      <div className="max-w-md w-full">
        {/* Remotive Logistics Card */}
        <div className="bg-[#1a1a1a]/90 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-white/10">
          {/* Header with Logo */}
          <div className="px-8 py-6 text-center border-b border-white/10">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Image
                src="/images/logo/remotive-r.png"
                alt="Remotive"
                width={40}
                height={40}
                className="w-10 h-10"
              />
              <span className="text-2xl font-bold text-white">Remotive Logistics</span>
            </div>
            <p className="text-sm text-[#E94235]">Fast. Simple. Remote</p>
          </div>

          {/* Content */}
          <div className="px-8 py-10 text-center">
            {errorMessage ? (
              <>
                {/* Error State */}
                <h2 className="text-3xl font-bold text-red-500 mb-4">
                  Verification Error
                </h2>
                <p className="text-base text-gray-300 leading-relaxed mb-6">
                  {errorMessage}
                </p>
                {details && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6 text-left">
                    <p className="font-semibold text-sm mb-1">Technical Details:</p>
                    <p className="text-xs font-mono break-all">{decodeURIComponent(details)}</p>
                  </div>
                )}

                {/* Resend Button for errors */}
                {email && (
                  <button
                    onClick={handleResend}
                    disabled={resending}
                    className="w-full bg-[#E94235] hover:bg-[#D63A2E] text-white text-lg font-semibold py-4 rounded-xl transition-all hover:scale-[1.02] disabled:opacity-50"
                  >
                    {resending ? "Sending..." : "Resend Verification Email"}
                  </button>
                )}
              </>
            ) : (
              <>
                {/* Normal State - Waiting for verification */}
                <h2 className="text-3xl font-bold text-white mb-4">
                  Verify Your Email!
                </h2>
                <p className="text-base text-gray-400 leading-relaxed mb-8">
                  We sent you a verification link via email. Please click it to verify your email
                  address. If you don&apos;t see the email, please check your SPAM folder.
                </p>

                {/* Countdown */}
                <div className="text-6xl font-bold text-white mb-6 font-mono tracking-wider">
                  {formatTime(countdown)}
                </div>

                {/* Open Email Button */}
                <Button
                  onClick={handleOpenEmail}
                  className="w-full bg-[#E94235] hover:bg-[#D63A2E] text-white text-lg font-semibold py-6 rounded-xl mb-6 transition-all hover:scale-[1.02]"
                >
                  Open email
                </Button>

                {/* Resend Button */}
                {canResend ? (
                  <button
                    onClick={handleResend}
                    disabled={resending}
                    className="text-[#E94235] font-semibold text-base hover:underline disabled:opacity-50"
                  >
                    {resending ? "Sending..." : "Resend email verification"}
                  </button>
                ) : (
                  <p className="text-gray-500 font-medium text-base">
                    Resend email verification
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        {/* Email sent to */}
        {email && (
          <p className="text-center text-gray-400 mt-6">
            Verification email sent to: <a href={`mailto:${email}`} className="text-[#E94235] underline">{email}</a>
          </p>
        )}

        {/* Back to login */}
        <div className="text-center mt-6">
          <a
            href={`/${DEFAULT_LANG}/auth/login`}
            className="text-[#E94235] hover:underline font-semibold"
          >
            Back to Login
          </a>
        </div>
      </div>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center p-6 bg-[#0a0a0a]">
        <div className="max-w-md w-full">
          <div className="bg-[#1a1a1a]/90 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-white/10">
            <div className="px-8 py-6 text-center border-b border-white/10">
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="w-10 h-10 bg-[#E94235]/20 rounded-lg animate-pulse" />
                <span className="text-2xl font-bold text-white">Remotive Logistics</span>
              </div>
              <p className="text-sm text-[#E94235]">Fast. Simple. Remote</p>
            </div>
            <div className="px-8 py-10 text-center">
              <h2 className="text-3xl font-bold text-white mb-4">
                Loading...
              </h2>
            </div>
          </div>
        </div>
      </main>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
