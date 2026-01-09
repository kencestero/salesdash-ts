"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Particles from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { Engine } from "@tsparticles/engine";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Clipboard,
  FileText,
  Target,
  DollarSign,
  Phone,
  Sparkles,
} from "lucide-react";

interface CopyLinkCelebrationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  repCode: string;
}

export function CopyLinkCelebration({
  open,
  onOpenChange,
  repCode,
}: CopyLinkCelebrationProps) {
  const router = useRouter();
  const [showConfetti, setShowConfetti] = useState(false);

  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  useEffect(() => {
    if (open) {
      setShowConfetti(true);
      // Stop confetti after 3 seconds
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleAddToCRM = () => {
    onOpenChange(false);
    // Navigate to CRM customers page with add dialog open
    router.push("/en/crm/customers?action=add");
  };

  const confettiConfig = {
    background: {
      color: { value: "transparent" },
    },
    particles: {
      number: {
        value: 0,
      },
      color: {
        value: ["#E96114", "#2563eb", "#dc2626", "#16a34a", "#ca8a04"],
      },
      shape: {
        type: ["circle", "square"],
      },
      opacity: {
        value: { min: 0, max: 1 },
        animation: {
          enable: true,
          speed: 2,
          startValue: "max",
          destroy: "min",
        },
      },
      size: {
        value: { min: 3, max: 8 },
      },
      move: {
        enable: true,
        speed: { min: 10, max: 20 },
        direction: "none" as const,
        random: true,
        straight: false,
        outModes: {
          default: "destroy" as const,
        },
        gravity: {
          enable: true,
          acceleration: 20,
        },
      },
    },
    emitters: {
      direction: "top" as const,
      rate: {
        quantity: 15,
        delay: 0.05,
      },
      size: {
        width: 100,
        height: 0,
      },
      position: {
        x: 50,
        y: 100,
      },
      life: {
        duration: 0.3,
        count: 3,
      },
    },
  };

  const steps = [
    {
      icon: FileText,
      title: "Submit Customer to CRM",
      description:
        "Add them to Remotive CRM NOW and leave DETAILED notes about your conversation",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      icon: Target,
      title: "Congrats on Stage 3!",
      description:
        "You should now know: What the customer wants/needs, their budget & expectations, timeline and urgency",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      icon: DollarSign,
      title: "Financing Guidance",
      description:
        "ALWAYS mention benefits of conventional financing FIRST. Rent-To-Own should be your LAST alternative. Explain requirements clearly.",
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      icon: Phone,
      title: "Follow-Up is KEY",
      description:
        "Guide them through the credit application process. Answer questions promptly. Be their trusted advisor.",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
  ];

  return (
    <>
      {/* Confetti Overlay */}
      <AnimatePresence>
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none z-[10000]">
            <Particles
              id="celebration-confetti"
              init={particlesInit}
              options={confettiConfig}
            />
          </div>
        )}
      </AnimatePresence>

      {/* Celebration Modal */}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-2 border-[#E96114] text-white max-h-[90vh] overflow-y-auto w-[95vw] max-w-2xl mx-auto p-4 sm:p-6"
        >
          {/* Header */}
          <DialogHeader className="space-y-3">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="flex justify-center"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#E96114] to-[#09213C] blur-xl opacity-50 animate-pulse" />
                <CheckCircle2 className="w-16 h-16 sm:w-20 sm:h-20 text-green-400 relative" />
              </div>
            </motion.div>

            <DialogTitle className="text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-2"
              >
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#E96114] to-[#09213C] bg-clip-text text-transparent">
                  🎉 Great! You Copied the Link! 🎉
                </div>
                <div className="flex items-center justify-center gap-2 text-base sm:text-lg md:text-xl text-green-400">
                  <Clipboard className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span>Link → Clipboard ✅</span>
                </div>
              </motion.div>
            </DialogTitle>
          </DialogHeader>

          {/* Main Content */}
          <div className="space-y-4 sm:space-y-6 py-4 sm:py-6">
            {/* Warning Banner */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-r from-red-500/20 to-orange-500/20 border-2 border-orange-500 rounded-xl p-3 sm:p-4 text-center"
            >
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-orange-400 flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
                <span>IMPORTANT NEXT STEPS</span>
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </motion.div>

            {/* Steps */}
            <div className="space-y-3 sm:space-y-4">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.15 }}
                  className={`flex gap-3 p-3 sm:p-4 rounded-xl border-2 ${step.bgColor} border-opacity-50`}
                >
                  <div className={`flex-shrink-0 ${step.color}`}>
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-800 flex items-center justify-center border-2 border-current">
                      <step.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-base sm:text-lg md:text-xl font-bold ${step.color}`}>
                      {index + 1}. {step.title}
                    </h3>
                    <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Good Luck Banner */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4 }}
              className="bg-gradient-to-r from-green-500/20 to-blue-500/20 border-2 border-green-500 rounded-xl p-4 sm:p-6 text-center"
            >
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-green-400 mb-2">
                🍀 Good Luck! 🍀
              </div>
              <p className="text-sm sm:text-base text-slate-300">
                You're helping customers build their businesses!
              </p>
            </motion.div>
          </div>

          {/* Footer Buttons - Stack on mobile */}
          <DialogFooter className="flex-col gap-3 sm:gap-4">
            <Button
              onClick={() => onOpenChange(false)}
              variant="outline"
              className="w-full border-slate-600 hover:bg-slate-700 text-white text-sm sm:text-base py-3 h-auto whitespace-normal"
            >
              I'll watch the CRM for their submission
            </Button>
            <Button
              onClick={handleAddToCRM}
              className="w-full bg-gradient-to-r from-[#E96114] to-[#09213C] hover:opacity-90 text-white font-bold text-sm sm:text-base py-3 h-auto whitespace-normal"
            >
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
              Add customer to CRM now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
