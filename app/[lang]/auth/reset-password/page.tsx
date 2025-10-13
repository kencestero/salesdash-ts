"use client";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { SiteLogo } from "@/components/svg";

const schema = z.object({
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const ResetPasswordPage = () => {
  const [isPending, startTransition] = React.useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    mode: "all",
  });

  // Verify token on mount
  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      toast.error("Invalid reset link");
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await fetch('/api/auth/verify-reset-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        if (response.ok) {
          setTokenValid(true);
        } else {
          setTokenValid(false);
          toast.error("Reset link has expired or is invalid");
        }
      } catch (error) {
        setTokenValid(false);
        toast.error("Failed to verify reset link");
      }
    };

    verifyToken();
  }, [token]);

  const onSubmit = (data: any) => {
    if (!token) {
      toast.error("Invalid reset token");
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token,
            password: data.password,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to reset password');
        }

        toast.success("Password reset successfully! Redirecting to login...");
        setTimeout(() => {
          router.push("/auth/login");
        }, 2000);
      } catch (error: any) {
        console.error('Reset password error:', error);
        toast.error(error.message || "Failed to reset password. Please try again.");
      }
    });
  };

  if (tokenValid === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (tokenValid === false) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <SiteLogo className="h-10 w-10 mx-auto mb-6 text-primary" />
          <div className="text-center">
            <h1 className="text-2xl font-bold text-default-900 mb-2">Invalid Reset Link</h1>
            <p className="text-default-600 mb-6">
              This password reset link has expired or is invalid.
            </p>
            <Link href="/auth/forgot">
              <Button>Request New Link</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Link href="/dashboard" className="inline-block mb-6">
          <SiteLogo className="h-10 w-10 text-primary" />
        </Link>
        <div className="text-3xl font-bold text-default-900 mb-2">
          Reset Your Password
        </div>
        <div className="text-base text-default-600 mb-6">
          Enter your new password below
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="password" className="mb-2 font-medium text-default-600">
              New Password
            </Label>
            <div className="relative">
              <Input
                disabled={isPending}
                {...register("password")}
                type={showPassword ? "text" : "password"}
                id="password"
                className={cn("pr-12", {
                  "border-destructive": errors.password,
                })}
                size="lg"
              />
              <button
                className="absolute top-1/2 -translate-y-1/2 right-4 text-default-400"
                onClick={() => setShowPassword(!showPassword)}
                type="button"
              >
                {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && (
              <div className="text-destructive mt-2 text-sm">{errors.password.message as string}</div>
            )}
          </div>

          <div>
            <Label htmlFor="confirmPassword" className="mb-2 font-medium text-default-600">
              Confirm Password
            </Label>
            <div className="relative">
              <Input
                disabled={isPending}
                {...register("confirmPassword")}
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                className={cn("pr-12", {
                  "border-destructive": errors.confirmPassword,
                })}
                size="lg"
              />
              <button
                className="absolute top-1/2 -translate-y-1/2 right-4 text-default-400"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                type="button"
              >
                {showConfirmPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <div className="text-destructive mt-2 text-sm">{errors.confirmPassword.message as string}</div>
            )}
          </div>

          <Button className="w-full mt-6" size="lg" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? "Resetting..." : "Reset Password"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
