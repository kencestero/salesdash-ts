"use client";

import { useEffect } from "react";

export function LogDashboardVisitOnMount() {
  useEffect(() => {
    // Log visit once per session (browser tab)
    const sessionKey = "dashboard_visit_logged_" + new Date().toISOString().slice(0, 10);

    // Check if already logged this session today
    if (typeof window !== "undefined" && sessionStorage.getItem(sessionKey)) {
      return;
    }

    // Log the visit
    fetch("/api/analytics/dashboard", {
      method: "POST",
    })
      .then(() => {
        if (typeof window !== "undefined") {
          sessionStorage.setItem(sessionKey, "1");
        }
      })
      .catch((error) => {
        console.error("Failed to log dashboard visit:", error);
      });
  }, []);

  return null; // This component doesn't render anything
}
