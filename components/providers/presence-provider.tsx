"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";

export function PresenceProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  useEffect(() => {
    // Only send heartbeat if user is authenticated
    if (status !== "authenticated" || !session?.user) {
      return;
    }

    // Send initial heartbeat immediately
    const sendHeartbeat = async () => {
      try {
        await fetch("/api/user/heartbeat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });
      } catch (error) {
        console.error("Failed to send heartbeat:", error);
      }
    };

    // Send initial heartbeat
    sendHeartbeat();

    // Set up interval to send heartbeat every 30 seconds
    const intervalId = setInterval(() => {
      sendHeartbeat();
    }, 30000); // 30 seconds

    // Cleanup interval on unmount
    return () => {
      clearInterval(intervalId);
    };
  }, [session, status]);

  return <>{children}</>;
}
