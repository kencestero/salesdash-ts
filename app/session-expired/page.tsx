"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function SessionExpiredPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#09213C] text-white px-4">
      {/* Logo */}
      <div className="mb-8">
        <Image
          src="/images/logo/remotive-logo.png"
          alt="Remotive Logistics"
          width={200}
          height={60}
          className="object-contain"
          priority
        />
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-white/10 backdrop-blur-sm rounded-xl p-8 text-center shadow-2xl border border-white/20">
        {/* Clock Icon */}
        <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-[#E96114]/20 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-[#E96114]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold mb-2">Session Expired</h1>

        {/* Description */}
        <p className="text-gray-300 mb-8">
          You were logged out due to inactivity. Please sign in again to continue.
        </p>

        {/* Login Button */}
        <Link
          href="/en/auth/login"
          className="inline-flex items-center justify-center w-full px-6 py-3 text-base font-medium text-white bg-[#E96114] rounded-lg hover:bg-[#E96114]/90 transition-colors duration-200"
        >
          Sign In Again
        </Link>

        {/* Help Text */}
        <p className="mt-6 text-sm text-gray-400">
          Need help?{" "}
          <a
            href="mailto:support@remotivelogistics.com"
            className="text-[#E96114] hover:underline"
          >
            Contact Support
          </a>
        </p>
      </div>

      {/* Footer */}
      <p className="mt-8 text-sm text-gray-500">
        &copy; {new Date().getFullYear()} Remotive Logistics. All rights reserved.
      </p>
    </div>
  );
}