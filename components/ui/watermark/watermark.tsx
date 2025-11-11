"use client";

import React from "react";

export interface WatermarkProps {
  text?: string;
  textColor?: string;
  textSize?: number;
  opacity?: number;
  rotate?: number;
  children?: React.ReactNode;
}

export default function Watermark({
  text = "WATERMARK",
  textColor = "#000000",
  textSize = 16,
  opacity = 0.1,
  rotate = -45,
  children,
}: WatermarkProps) {
  const watermarkStyle: React.CSSProperties = {
    position: "relative",
    width: "100%",
    height: "100%",
  };

  const overlayStyle: React.CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: "none",
    backgroundImage: `repeating-linear-gradient(
      ${rotate}deg,
      transparent,
      transparent 200px,
      ${textColor}${Math.round(opacity * 255).toString(16).padStart(2, "0")} 200px,
      ${textColor}${Math.round(opacity * 255).toString(16).padStart(2, "0")} 201px
    )`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: `${textSize}px`,
    color: textColor,
    opacity: opacity,
    transform: `rotate(${rotate}deg)`,
    userSelect: "none",
  };

  return (
    <div style={watermarkStyle}>
      {children}
      <div style={overlayStyle}>
        <span>{text}</span>
      </div>
    </div>
  );
}
