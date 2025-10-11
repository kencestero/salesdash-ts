"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const fireBadgeVariants = cva(
  "relative inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold shadow-lg",
  {
    variants: {
      variant: {
        mj: "bg-gradient-to-r from-orange-600/30 to-orange-500/20 text-orange-500 border-2 border-orange-500/50 shadow-orange-500/20",
        classic: "bg-gradient-to-r from-red-600/30 to-red-500/20 text-red-500 border-2 border-red-500/50 shadow-red-500/20",
        compact: "bg-gradient-to-r from-orange-600 to-orange-500 text-white border-2 border-orange-400",
      },
      size: {
        sm: "px-2.5 py-1 text-[10px] gap-1.5",
        md: "px-3 py-1.5 text-xs gap-2",
        lg: "px-4 py-2 text-sm gap-2.5",
      },
    },
    defaultVariants: {
      variant: "mj",
      size: "md",
    },
  }
);

export interface FireBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof fireBadgeVariants> {
  daysOld?: number;
  showDays?: boolean;
}

function FireBadge({
  className,
  variant,
  size,
  daysOld = 0,
  showDays = true,
  ...props
}: FireBadgeProps) {
  const fireSize = size === "sm" ? 14 : size === "lg" ? 20 : 16;

  return (
    <div
      className={cn(fireBadgeVariants({ variant, size }), className)}
      {...props}
    >
      {/* Fire Icon Container */}
      <div className="relative flex items-center justify-center" style={{ width: fireSize, height: fireSize }}>
        {/* Animated fire effect */}
        <div className="fire-container">
          <div className="flame flame-1" />
          <div className="flame flame-2" />
          <div className="flame flame-3" />
          <div className="flame flame-4" />
          <div className="flame flame-5" />
        </div>
      </div>

      {/* Text */}
      <span className="relative z-10 font-bold tracking-wide">
        {showDays ? (daysOld === 0 ? "NEW!" : daysOld === 1 ? "1 DAY" : `${daysOld} DAYS`) : "HOT"}
      </span>

      {/* Inline styles for fire animation */}
      <style jsx>{`
        .fire-container {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          filter: drop-shadow(0 0 4px ${variant === "mj" ? "rgba(238, 104, 50, 0.6)" : "rgba(255, 69, 0, 0.6)"});
        }

        .flame {
          position: absolute;
          bottom: 0;
          width: 50%;
          height: 80%;
          background: radial-gradient(
            ellipse at 50% 100%,
            ${variant === "mj" ? "#ff8c42" : "#ff6347"} 0%,
            ${variant === "mj" ? "#ee6832" : "#ff4500"} 30%,
            ${variant === "mj" ? "#d45a1f" : "#dc2626"} 50%,
            transparent 75%
          );
          border-radius: 50% 50% 50% 50% / 70% 70% 30% 30%;
          mix-blend-mode: screen;
        }

        .flame-1 {
          animation: rise-flame 0.6s ease-in-out infinite;
          animation-delay: 0s;
          opacity: 1;
          transform-origin: bottom center;
        }

        .flame-2 {
          animation: rise-flame 0.6s ease-in-out infinite;
          animation-delay: 0.12s;
          opacity: 0.9;
          transform: scale(0.85);
          transform-origin: bottom center;
        }

        .flame-3 {
          animation: rise-flame 0.6s ease-in-out infinite;
          animation-delay: 0.24s;
          opacity: 0.8;
          transform: scale(0.7);
          transform-origin: bottom center;
        }

        .flame-4 {
          animation: flicker-side 0.5s ease-in-out infinite;
          animation-delay: 0.1s;
          opacity: 0.7;
          transform: translateX(-30%) scale(0.6);
          transform-origin: bottom center;
        }

        .flame-5 {
          animation: flicker-side 0.5s ease-in-out infinite;
          animation-delay: 0.3s;
          opacity: 0.7;
          transform: translateX(30%) scale(0.6);
          transform-origin: bottom center;
        }

        @keyframes rise-flame {
          0% {
            transform: translateY(0) scaleY(1) scaleX(1);
            opacity: 1;
          }
          25% {
            transform: translateY(-2px) scaleY(1.15) scaleX(0.95);
            opacity: 1;
          }
          50% {
            transform: translateY(-4px) scaleY(1.25) scaleX(0.9);
            opacity: 0.95;
          }
          75% {
            transform: translateY(-2px) scaleY(1.1) scaleX(0.95);
            opacity: 1;
          }
          100% {
            transform: translateY(0) scaleY(1) scaleX(1);
            opacity: 1;
          }
        }

        @keyframes flicker-side {
          0% {
            opacity: 0.7;
            transform: translateY(0) scale(0.6);
          }
          50% {
            opacity: 0.9;
            transform: translateY(-3px) scale(0.65);
          }
          100% {
            opacity: 0.7;
            transform: translateY(0) scale(0.6);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .flame {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}

export { FireBadge, fireBadgeVariants };
