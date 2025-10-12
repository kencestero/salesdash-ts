"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import styles from "./fire-badge.module.css";

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
        <div className={cn(
          styles.fireContainer,
          variant === "mj" ? styles.fireContainerMj : styles.fireContainerClassic
        )}>
          <div className={cn(
            styles.flame,
            styles.flame1,
            variant === "mj" ? styles.flameMj : styles.flameClassic
          )} />
          <div className={cn(
            styles.flame,
            styles.flame2,
            variant === "mj" ? styles.flameMj : styles.flameClassic
          )} />
          <div className={cn(
            styles.flame,
            styles.flame3,
            variant === "mj" ? styles.flameMj : styles.flameClassic
          )} />
          <div className={cn(
            styles.flame,
            styles.flame4,
            variant === "mj" ? styles.flameMj : styles.flameClassic
          )} />
          <div className={cn(
            styles.flame,
            styles.flame5,
            variant === "mj" ? styles.flameMj : styles.flameClassic
          )} />
        </div>
      </div>

      {/* Text */}
      <span className="relative z-10 font-bold tracking-wide">
        {showDays ? (daysOld === 0 ? "NEW!" : daysOld === 1 ? "1 DAY" : `${daysOld} DAYS`) : "HOT"}
      </span>
    </div>
  );
}

export { FireBadge, fireBadgeVariants };
