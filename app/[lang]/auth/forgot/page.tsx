"use client";
import { useState, Suspense } from "react";
import Image from "next/image";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { DEFAULT_LANG } from "@/lib/i18n";

function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send reset email");

      setSent(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex overflow-hidden w-full">
      {/* Left side - Same as login page */}
      <div className="basis-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 w-full relative hidden xl:flex overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/auth/line.png')] opacity-10"></div>
        <Image
          src="/images/mjenterprises.webp"
          alt="MJ Enterprises"
          width={1200}
          height={1200}
          className="w-full h-full object-cover"
          priority
        />
      </div>

      {/* Right side - Forgot password form */}
      <div className="min-h-screen basis-full md:basis-1/2 w-full px-4 py-5 flex justify-center items-center overflow-y-auto">
        <div className="w-full max-w-[480px] mx-auto">
          <Link href={`/${DEFAULT_LANG}/auth/login`} className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-6">
            <Icon icon="heroicons:arrow-left" className="w-5 h-5" />
            Back to Login
          </Link>

          <div className="2xl:text-3xl text-2xl font-bold text-default-900 mb-2">
            Reset Your Password 🔐
          </div>
          <div className="2xl:text-lg text-base text-default-600 mb-8">
            Enter your email and we'll send you a reset link
          </div>

          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label htmlFor="email" className="mb-2 font-medium text-default-600">
                  Email Address
                </Label>
                <Input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  required
                  disabled={loading}
                  className="w-full"
                  size="xl"
                />
              </div>

              {error && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <p className="text-destructive text-sm">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Icon icon="heroicons:arrow-path" className="w-5 h-5 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Icon icon="heroicons:paper-airplane" className="w-5 h-5 mr-2" />
                    Send Reset Link
                  </>
                )}
              </Button>
            </form>
          ) : (
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon icon="heroicons:check-circle" className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-default-900 mb-2">Check Your Email! 📧</h3>
              <p className="text-default-600 mb-4">
                If an account exists with <strong>{email}</strong>, you'll receive a password reset link shortly.
              </p>
              <p className="text-sm text-default-500">
                The link will expire in <strong>1 hour</strong> for security.
              </p>
              <div className="mt-6 pt-6 border-t border-default-200">
                <p className="text-sm text-default-600 mb-3">Didn't receive the email?</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSent(false);
                    setEmail("");
                    setError("");
                  }}
                >
                  Try Again
                </Button>
              </div>
            </div>
          )}

          <div className="mt-6 text-center text-sm text-default-500">
            Remember your password?{" "}
            <Link href={`/${DEFAULT_LANG}/auth/login`} className="text-primary font-semibold hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ForgotPasswordForm />
    </Suspense>
  );
}
