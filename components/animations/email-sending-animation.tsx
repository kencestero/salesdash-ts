"use client";

import React, { useState, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";

interface EmailSendingAnimationProps {
  isVisible?: boolean;
  onComplete?: () => void;
}

export const EmailSendingAnimation = ({
  isVisible = true,
  onComplete,
}: EmailSendingAnimationProps) => {
  const [key, setKey] = useState(0);
  const letterControls = useAnimation();
  const truckControls = useAnimation();

  const runAnimation = async () => {
    // Reset positions
    letterControls.set({
      x: 0,
      y: -100,
      opacity: 0,
      rotate: -10,
      scale: 1,
    });
    truckControls.set({ x: 300 });

    // 1. Truck drives in from RIGHT to LEFT, stops ahead of letter drop zone
    await truckControls.start({
      x: -50,
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 80,
        duration: 1.2,
      },
    });

    // Small bounce when truck stops
    await truckControls.start({
      x: -45,
      transition: { type: "spring", damping: 15, stiffness: 300, duration: 0.2 },
    });
    await truckControls.start({
      x: -50,
      transition: { type: "spring", damping: 20, stiffness: 200, duration: 0.3 },
    });

    // 2. Letter appears and drops down
    await letterControls.start({
      y: 50,
      opacity: 1,
      rotate: 5,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 60,
        duration: 0.8,
      },
    });

    // 3. Letter SWINGS in a curve - right to left arc into trailer
    await letterControls.start({
      x: -80,
      y: 120,
      rotate: -15,
      scale: 0.7,
      transition: {
        type: "spring",
        damping: 8,
        stiffness: 40,
        duration: 1.2,
      },
    });

    // 4. Letter enters trailer (disappears)
    await letterControls.start({
      x: -100,
      y: 140,
      opacity: 0,
      rotate: -20,
      scale: 0.4,
      transition: {
        type: "spring",
        damping: 15,
        stiffness: 100,
        duration: 0.4,
      },
    });

    // 5. Truck bounces from impact
    await truckControls.start({
      x: -40,
      transition: { type: "spring", damping: 10, stiffness: 400, duration: 0.15 },
    });

    // 6. Truck speeds off to the LEFT
    await truckControls.start({
      x: -600,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 50,
        duration: 1,
      },
    });

    if (onComplete) {
      onComplete();
    }
  };

  useEffect(() => {
    if (isVisible) {
      setKey((prev) => prev + 1);
      runAnimation();
    }
  }, [isVisible]);

  if (!isVisible) return null;

  // Base64 images embedded
  const letterImg =
    "data:image/png;base64,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2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych6wAAP7/8T+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
  const truckImg =
    "data:image/png;base64,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5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2ThQAP7/8T+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* 25% darker + 60% blurred background */}
      <div className="absolute inset-0 bg-black/25 backdrop-blur-[60px]" />

      {/* Animation container - 300x175px (50% of original 600x350px) */}
      <div key={key} className="relative w-[300px] h-[175px] overflow-hidden">
        {/* Imaginary Road */}
        <div className="absolute bottom-4 left-0 right-0 h-0.5 border-t-2 border-dashed border-gray-400" />

        {/* Letter - drops from top center, swings into trailer */}
        <motion.img
          src={letterImg}
          alt="Email"
          className="absolute w-8 h-10 object-contain"
          style={{ left: "50%", marginLeft: "-16px" }}
          animate={letterControls}
          initial={{ x: 0, y: -100, opacity: 0, rotate: -10 }}
        />

        {/* Truck and Trailer - comes from RIGHT */}
        <motion.img
          src={truckImg}
          alt="Truck"
          className="absolute bottom-6 h-12 object-contain"
          style={{ left: "50%", marginLeft: "-60px" }}
          animate={truckControls}
          initial={{ x: 300 }}
        />
      </div>
    </div>
  );
};
