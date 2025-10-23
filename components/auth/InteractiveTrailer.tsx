"use client";
import { motion } from "motion/react";
import { useState } from "react";

export default function InteractiveTrailer() {
  const [isExploded, setIsExploded] = useState(false);
  return (
    <div className="flex items-center justify-center h-full cursor-pointer" onClick={() => { setIsExploded(true); setTimeout(() => setIsExploded(false), 1500); }}>
      <svg viewBox="0 0 400 200" className="w-full max-w-md">
        <motion.rect x="100" y="60" width="220" height="80" fill="none" stroke="white" strokeWidth="3" rx="8" initial={{ pathLength: 0 }} animate={{ pathLength: 1, x: isExploded ? -50 : 0, y: isExploded ? -30 : 0 }} transition={{ pathLength: { duration: 2 }, default: { type: "spring" } }} whileHover={{ scale: 1.05 }} />
        <motion.circle cx="150" cy="150" r="18" fill="none" stroke="white" strokeWidth="3" initial={{ pathLength: 0, scale: 0 }} animate={{ pathLength: 1, scale: 1, x: isExploded ? -70 : 0, y: isExploded ? 50 : 0 }} transition={{ delay: 0.8, type: "spring" }} />
        <motion.circle cx="270" cy="150" r="18" fill="none" stroke="white" strokeWidth="3" initial={{ pathLength: 0, scale: 0 }} animate={{ pathLength: 1, scale: 1, x: isExploded ? 70 : 0, y: isExploded ? 50 : 0 }} transition={{ delay: 0.9, type: "spring" }} />
      </svg>
    </div>
  );
}
