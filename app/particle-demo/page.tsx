"use client"

import { useCallback, useState } from "react"
import Particles from "@tsparticles/react"
import { loadSlim } from "@tsparticles/slim"
import type { Engine } from "@tsparticles/engine"

export default function ParticleDemo() {
  const [activeEffect, setActiveEffect] = useState<string>("fire")

  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine)
  }, [])

  const effects: Record<string, any> = {
    fire: {
      name: "🔥 Fire Effect",
      description: "Perfect for HOT UNITS (1-2 days old)",
      bgColor: "linear-gradient(135deg, #ff6b35 0%, #dc2626 100%)",
      config: {
        background: { color: { value: "transparent" } },
        particles: {
          number: { value: 80, density: { enable: true } },
          color: { value: ["#ff6b35", "#f7931e", "#fdc830", "#ff4500"] },
          shape: { type: "circle" },
          opacity: {
            value: { min: 0, max: 0.8 },
            animation: { enable: true, speed: 1, sync: false }
          },
          size: {
            value: { min: 2, max: 6 },
            animation: { enable: true, speed: 3, sync: false }
          },
          move: {
            enable: true,
            speed: { min: 2, max: 4 },
            direction: "top",
            random: true,
            straight: false,
            outModes: { default: "destroy", bottom: "none" }
          }
        },
        emitters: {
          direction: "top",
          rate: { quantity: 3, delay: 0.1 },
          size: { width: 100, height: 10 },
          position: { x: 50, y: 100 }
        }
      }
    },
    confetti: {
      name: "🎊 Confetti",
      description: "When you CLOSE A DEAL!",
      bgColor: "linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)",
      config: {
        background: { color: { value: "transparent" } },
        particles: {
          number: { value: 0 },
          color: { value: ["#ee6832", "#2563eb", "#dc2626", "#16a34a", "#ca8a04"] },
          shape: { type: ["circle", "square"] },
          opacity: {
            value: { min: 0, max: 1 },
            animation: { enable: true, speed: 2, startValue: "max", destroy: "min" }
          },
          size: { value: { min: 3, max: 8 } },
          move: {
            enable: true,
            speed: { min: 10, max: 20 },
            direction: "none",
            random: true,
            straight: false,
            outModes: { default: "destroy" },
            gravity: { enable: true, acceleration: 20 }
          }
        },
        emitters: {
          direction: "top",
          rate: { quantity: 10, delay: 0.05 },
          size: { width: 100, height: 0 },
          position: { x: 50, y: 100 },
          life: { duration: 0.5, count: 1 }
        }
      }
    },
    stars: {
      name: "✨ Stars",
      description: "Premium trailers shimmer",
      bgColor: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
      config: {
        background: { color: { value: "transparent" } },
        particles: {
          number: { value: 50, density: { enable: true } },
          color: { value: ["#ffd700", "#ffed4e", "#ffc107", "#ee6832"] },
          shape: { type: "star", options: { star: { sides: 5 } } },
          opacity: {
            value: { min: 0.2, max: 1 },
            animation: { enable: true, speed: 3, sync: false }
          },
          size: {
            value: { min: 2, max: 5 },
            animation: { enable: true, speed: 2, sync: false }
          },
          move: { enable: true, speed: 1, direction: "none", random: true, straight: false }
        }
      }
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
      padding: "40px 20px",
      fontFamily: "system-ui, -apple-system, sans-serif"
    }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "60px" }}>
        <h1 style={{
          fontSize: "48px",
          fontWeight: "bold",
          color: "white",
          marginBottom: "16px"
        }}>
          🎆 Remotive Logistics Particle Effects 🎆
        </h1>
        <p style={{ fontSize: "20px", color: "#94a3b8" }}>
          Click any effect to see it in action!
        </p>
      </div>

      {/* Effect Buttons */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: "20px",
        maxWidth: "1200px",
        margin: "0 auto 60px"
      }}>
        {Object.entries(effects).map(([key, effect]) => (
          <button
            key={key}
            onClick={() => setActiveEffect(key)}
            style={{
              padding: "24px",
              borderRadius: "16px",
              border: key === activeEffect ? "3px solid #ee6832" : "2px solid #334155",
              background: key === activeEffect ? "rgba(238, 104, 50, 0.1)" : "#1e293b",
              color: "white",
              cursor: "pointer",
              transition: "all 0.2s",
              boxShadow: key === activeEffect ? "0 0 30px rgba(238, 104, 50, 0.3)" : "none"
            }}
          >
            <div style={{ fontSize: "36px", marginBottom: "12px" }}>
              {effect.name.split(" ")[0]}
            </div>
            <h3 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "8px" }}>
              {effect.name.substring(effect.name.indexOf(" ") + 1)}
            </h3>
            <p style={{ fontSize: "14px", color: "#94a3b8" }}>
              {effect.description}
            </p>
            {key === activeEffect && (
              <div style={{
                marginTop: "12px",
                padding: "6px 16px",
                background: "#ee6832",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: "bold",
                display: "inline-block"
              }}>
                ACTIVE
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Live Preview */}
      <div style={{
        maxWidth: "1000px",
        margin: "0 auto",
        position: "relative",
        height: "500px",
        borderRadius: "24px",
        border: "4px solid #ee6832",
        background: "#0f172a",
        boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        overflow: "hidden"
      }}>
        <Particles
          id={`particles-${activeEffect}`}
          init={particlesInit}
          options={effects[activeEffect].config}
        />

        {/* Center Text */}
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center",
          pointerEvents: "none",
          zIndex: 10
        }}>
          <div style={{ fontSize: "72px", marginBottom: "16px" }}>
            {effects[activeEffect].name.split(" ")[0]}
          </div>
          <h2 style={{ fontSize: "36px", fontWeight: "bold", color: "white", marginBottom: "12px" }}>
            {effects[activeEffect].name.substring(effects[activeEffect].name.indexOf(" ") + 1)}
          </h2>
          <p style={{ fontSize: "20px", color: "#94a3b8" }}>
            {effects[activeEffect].description}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        textAlign: "center",
        marginTop: "60px",
        color: "#94a3b8",
        fontSize: "16px"
      }}>
        <p style={{ marginBottom: "12px" }}>
          These effects can be added to trailer cards, deal celebrations, and more!
        </p>
        <p>
          <span style={{ color: "#ff6b35", fontWeight: "bold" }}>Fire 🔥</span> = Hot units  •
          <span style={{ color: "#ec4899", fontWeight: "bold" }}> Confetti 🎊</span> = Deal closings  •
          <span style={{ color: "#fbbf24", fontWeight: "bold" }}> Stars ✨</span> = Premium trailers
        </p>
      </div>
    </div>
  )
}
