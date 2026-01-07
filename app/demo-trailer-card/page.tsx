"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import Image from "next/image"

const COLORS = {
  orange: { name: "Orange", hex: "#ee6832", glow: "rgba(238, 104, 50, 0.4)" },
  red: { name: "Red", hex: "#DC2626", glow: "rgba(220, 38, 38, 0.4)" },
  black: { name: "Black", hex: "#1a1a1a", glow: "rgba(26, 26, 26, 0.4)" },
  white: { name: "White", hex: "#f8fafc", glow: "rgba(248, 250, 252, 0.4)" },
  silver: { name: "Silver", hex: "#9ca3af", glow: "rgba(156, 163, 175, 0.4)" },
  blue: { name: "Blue", hex: "#2563eb", glow: "rgba(37, 99, 235, 0.4)" }
}

function FireEffect() {
  return (
    <motion.div
      className="absolute -top-2 -right-2 z-20"
      initial={{ scale: 0, rotate: -45 }}
      animate={{
        scale: [1, 1.1, 1],
        rotate: [-45, -40, -45]
      }}
      exit={{ scale: 0 }}
      transition={{
        duration: 0.5,
        scale: { repeat: Infinity, duration: 2 }
      }}
    >
      <div className="relative">
        <div className="absolute inset-0 blur-xl bg-orange-500 opacity-60 rounded-full" />
        <div className="text-4xl filter drop-shadow-lg">🔥</div>
      </div>
    </motion.div>
  )
}

export default function DemoTrailerCard() {
  const [selectedColor, setSelectedColor] = useState<keyof typeof COLORS>("orange")
  const [isHot, setIsHot] = useState(true)
  const [expanded, setExpanded] = useState(false)

  const color = COLORS[selectedColor]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      {/* Page Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <motion.h1
          className="text-4xl font-bold text-white mb-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Remotive Logistics Trailer Card Demo 🔥
        </motion.h1>
        <p className="text-slate-400">
          Hover, click, and change colors to see the animations!
        </p>
      </div>

      {/* Demo Controls */}
      <div className="max-w-4xl mx-auto mb-8 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsHot(!isHot)}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
          >
            {isHot ? "🔥 Hot Unit (Toggle Off)" : "❄️ Regular Unit (Toggle On)"}
          </button>
          <span className="text-slate-400">
            Hot units show fire animation for trailers added in last 48hrs
          </span>
        </div>
      </div>

      {/* Trailer Card */}
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl overflow-hidden border-2 cursor-pointer"
          style={{ borderColor: color.hex }}
          whileHover={{
            scale: 1.02,
            boxShadow: `0 20px 60px ${color.glow}`,
          }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          onClick={() => setExpanded(!expanded)}
        >
          {/* Fire Badge for Hot Units */}
          <AnimatePresence>
            {isHot && <FireEffect />}
          </AnimatePresence>

          {/* Status Badge */}
          <div className="absolute top-4 left-4 z-10">
            <motion.div
              className="px-4 py-1.5 rounded-full text-sm font-semibold text-white backdrop-blur-sm"
              style={{ backgroundColor: color.hex }}
              whileHover={{ scale: 1.05 }}
            >
              IN STOCK
            </motion.div>
          </div>

          {/* Trailer Image */}
          <div className="relative h-96 overflow-hidden">
            <motion.div
              className="absolute inset-0"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.5 }}
            >
              <div
                className="absolute inset-0 opacity-20"
                style={{ backgroundColor: color.hex }}
              />
              <Image
                src="/images/custom.png"
                alt="Concession Trailer"
                fill
                className="object-contain p-8"
                style={{
                  filter: `drop-shadow(0 10px 30px ${color.glow})`
                }}
              />
            </motion.div>
          </div>

          {/* Card Content */}
          <div className="p-6 space-y-4">
            {/* Title & Price */}
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-bold text-white mb-1">
                  Concession Trailer
                </h3>
                <p className="text-slate-400">8.5×16 SA • {color.name} • Food Service</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold" style={{ color: color.hex }}>
                  $24,999
                </div>
                <div className="text-sm text-slate-400">or $399/mo</div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Size", value: "8.5×16" },
                { label: "Axles", value: "Single" },
                { label: "GVWR", value: "7,000 lbs" }
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  className="bg-slate-700/50 rounded-lg p-3 text-center"
                  whileHover={{
                    backgroundColor: color.hex + "20",
                    scale: 1.05
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="text-xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-slate-400">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Color Picker */}
            <div>
              <p className="text-sm text-slate-400 mb-2">Select Color:</p>
              <div className="flex gap-2">
                {Object.entries(COLORS).map(([key, colorData]) => (
                  <motion.button
                    key={key}
                    className="w-10 h-10 rounded-full border-2 relative"
                    style={{
                      backgroundColor: colorData.hex,
                      borderColor: key === selectedColor ? "#fff" : "transparent"
                    }}
                    whileHover={{ scale: 1.2, y: -4 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedColor(key as keyof typeof COLORS)
                    }}
                  >
                    {key === selectedColor && (
                      <motion.div
                        className="absolute inset-0 rounded-full"
                        layoutId="colorSelector"
                        style={{
                          boxShadow: `0 0 20px ${colorData.glow}`
                        }}
                      />
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Expandable Features */}
            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 border-t border-slate-700 space-y-2">
                    <h4 className="font-semibold text-white mb-2">Features:</h4>
                    {[
                      "Serving window with counter",
                      "Full electrical package",
                      "LED interior lighting",
                      "Stainless steel equipment",
                      "3-compartment sink",
                      "Fire suppression system"
                    ].map((feature, i) => (
                      <motion.div
                        key={i}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center gap-2 text-slate-300"
                      >
                        <div
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: color.hex }}
                        />
                        {feature}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <motion.button
                className="flex-1 py-3 rounded-lg font-semibold text-white"
                style={{ backgroundColor: color.hex }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={(e) => e.stopPropagation()}
              >
                View Details
              </motion.button>
              <motion.button
                className="px-6 py-3 rounded-lg font-semibold border-2 text-white"
                style={{ borderColor: color.hex }}
                whileHover={{
                  scale: 1.02,
                  backgroundColor: color.hex + "20",
                  y: -2
                }}
                whileTap={{ scale: 0.98 }}
                onClick={(e) => e.stopPropagation()}
              >
                Calculate Payment
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Info Footer */}
      <div className="max-w-4xl mx-auto mt-8 text-center text-slate-400">
        <p>Click the card to expand features • Hover for animations • Change colors in real-time</p>
      </div>
    </div>
  )
}
