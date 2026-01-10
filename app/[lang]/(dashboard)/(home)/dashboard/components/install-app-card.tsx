"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Smartphone, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallAppCard() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already dismissed this session
    const dismissed = sessionStorage.getItem("install-app-dismissed");
    if (dismissed === "true") {
      setIsDismissed(true);
    }

    // Check if running as installed PWA
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // Check if app was installed
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem("install-app-dismissed", "true");
  };

  // Don't show if already installed, dismissed, or not installable
  if (isInstalled || isDismissed || !isInstallable) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-r from-[#09213C] to-[#0f3a5f] text-white border-0 w-[85%] mx-auto shadow-lg relative overflow-hidden">
      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 p-1 rounded-full hover:bg-white/10 transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4 opacity-70 hover:opacity-100" />
      </button>

      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-6">
          {/* Left: Info */}
          <div className="flex items-center gap-4">
            <div className="bg-white/10 p-2.5 rounded-lg">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <div className="font-semibold text-base">Install SalesHub App</div>
              <div className="text-sm opacity-80">Get quick access from your home screen</div>
            </div>
          </div>

          {/* Right: Install Button */}
          <Button
            size="sm"
            className="bg-[#E96114] hover:bg-[#ff7a2e] text-white h-10 px-5 font-semibold shadow-md"
            onClick={handleInstall}
          >
            <Download className="w-4 h-4 mr-2" />
            Install App
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
