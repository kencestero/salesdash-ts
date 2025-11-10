"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { DEFAULT_LANG } from "@/lib/i18n";

export default function ProfileRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace(`/${DEFAULT_LANG}/user-profile`);
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-muted-foreground">Redirecting to profile...</p>
    </div>
  );
}
