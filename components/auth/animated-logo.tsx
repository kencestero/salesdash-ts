"use client";

import { motion } from "framer-motion";
import Image from "next/image";

// Animation variants for SVG path drawing
const draw = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: (custom: number) => {
    const delay = custom * 0.3;
    return {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { delay, type: "spring", duration: 1.5, bounce: 0 },
        opacity: { delay, duration: 0.01 },
      },
    };
  },
};

// Logo fade-in animation
const logoFadeIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      delay: 2,
      duration: 0.8,
      ease: "easeOut",
    },
  },
};

export function AnimatedLogo() {
  return (
    <div className="relative flex items-center justify-center w-full max-w-2xl mx-auto">
      {/* Animated SVG Background */}
      <motion.svg
        width="600"
        height="400"
        viewBox="0 0 600 400"
        initial="hidden"
        animate="visible"
        className="absolute inset-0 w-full h-auto"
      >
        {/* Top Left Circle - Orange */}
        <motion.circle
          cx="100"
          cy="80"
          r="50"
          stroke="#ff6b35"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          variants={draw}
          custom={0}
        />

        {/* Top Right Square - Green */}
        <motion.rect
          width="100"
          height="100"
          x="450"
          y="30"
          rx="15"
          stroke="#10b981"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          variants={draw}
          custom={1}
        />

        {/* Center Left X - Blue */}
        <motion.line
          x1="80"
          y1="180"
          x2="140"
          y2="240"
          stroke="#3b82f6"
          strokeWidth="6"
          strokeLinecap="round"
          variants={draw}
          custom={2}
        />
        <motion.line
          x1="140"
          y1="180"
          x2="80"
          y2="240"
          stroke="#3b82f6"
          strokeWidth="6"
          strokeLinecap="round"
          variants={draw}
          custom={2.3}
        />

        {/* Center Right Circle - Orange */}
        <motion.circle
          cx="500"
          cy="210"
          r="50"
          stroke="#ff6b35"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          variants={draw}
          custom={2.5}
        />

        {/* Bottom Left Square - Green */}
        <motion.rect
          width="100"
          height="100"
          x="50"
          y="280"
          rx="15"
          stroke="#10b981"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          variants={draw}
          custom={3}
        />

        {/* Bottom Right X - Blue */}
        <motion.line
          x1="460"
          y1="300"
          x2="520"
          y2="360"
          stroke="#3b82f6"
          strokeWidth="6"
          strokeLinecap="round"
          variants={draw}
          custom={3.5}
        />
        <motion.line
          x1="520"
          y1="300"
          x2="460"
          y2="360"
          stroke="#3b82f6"
          strokeWidth="6"
          strokeLinecap="round"
          variants={draw}
          custom={3.8}
        />

        {/* Cargo Trailer Shape - Center Top */}
        <motion.path
          d="M 250 60 L 350 60 L 360 80 L 360 120 L 240 120 L 240 80 Z"
          stroke="#f59e0b"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={draw}
          custom={1.5}
        />

        {/* Calculator Shape - Center Bottom */}
        <motion.rect
          width="80"
          height="100"
          x="260"
          y="250"
          rx="10"
          stroke="#8b5cf6"
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
          variants={draw}
          custom={4}
        />
        {/* Calculator buttons */}
        <motion.line
          x1="275"
          y1="270"
          x2="325"
          y2="270"
          stroke="#8b5cf6"
          strokeWidth="3"
          strokeLinecap="round"
          variants={draw}
          custom={4.2}
        />
        <motion.circle
          cx="280"
          cy="295"
          r="5"
          stroke="#8b5cf6"
          strokeWidth="2"
          fill="none"
          variants={draw}
          custom={4.3}
        />
        <motion.circle
          cx="300"
          cy="295"
          r="5"
          stroke="#8b5cf6"
          strokeWidth="2"
          fill="none"
          variants={draw}
          custom={4.4}
        />
        <motion.circle
          cx="320"
          cy="295"
          r="5"
          stroke="#8b5cf6"
          strokeWidth="2"
          fill="none"
          variants={draw}
          custom={4.5}
        />

        {/* Connecting lines between shapes */}
        <motion.line
          x1="150"
          y1="80"
          x2="250"
          y2="80"
          stroke="#94a3b8"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="5,5"
          variants={draw}
          custom={1}
        />
        <motion.line
          x1="350"
          y1="80"
          x2="450"
          y2="80"
          stroke="#94a3b8"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="5,5"
          variants={draw}
          custom={1.8}
        />
      </motion.svg>

      {/* Logo - Fades in after animations */}
      <motion.div
        className="relative z-10 bg-background/80 backdrop-blur-sm rounded-2xl p-8 shadow-2xl"
        variants={logoFadeIn}
        initial="hidden"
        animate="visible"
      >
        <Image
          src="/images/logo.png"
          alt="SalesDash"
          width={300}
          height={100}
          className="w-auto h-20 object-contain"
          priority
        />
      </motion.div>
    </div>
  );
}
