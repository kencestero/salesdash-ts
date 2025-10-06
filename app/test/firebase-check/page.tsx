"use client";

import { useEffect, useState } from "react";
import { app } from "@/lib/firebase";

export default function FirebaseCheckPage() {
  const [projectId, setProjectId] = useState<string>("");

  useEffect(() => {
    // Confirm Firebase connection
    if (app?.options?.projectId) {
      console.log("Firebase connected to:", app.options.projectId);
      setProjectId(app.options.projectId);
    } else {
      console.error("Firebase not connected. Check .env variables.");
      setProjectId("⚠️ Not connected");
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0B132B] text-white">
      <h1 className="text-3xl font-bold mb-4">🔥 Firebase Connection Test</h1>
      <div className="bg-[#1C2541] px-6 py-4 rounded-xl shadow-md">
        <p className="text-lg">
          <span className="font-semibold text-[#E96114]">Project ID:</span>{" "}
          {projectId || "Loading..."}
        </p>
      </div>
      <p className="mt-6 text-gray-400 text-sm">
        (Open DevTools → Console to see the log output)
      </p>
    </div>
  );
}
