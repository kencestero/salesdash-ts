"use client"

import { useCallback, useState } from "react"
import Particles from "@tsparticles/react"
import { loadSlim } from "@tsparticles/slim"
import type { Engine } from "@tsparticles/engine"
import { motion } from "motion/react"

export default function ParticleDemo() {
  const [activeEffect, setActiveEffect] = useState<string>("fire")

  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine)
  }, [])

  const effects = {
    fire: {
      name: "🔥 Fire Effect",
      description: "Perfect for HOT UNITS (1-2 days old)",
      color: "from-orange-600 to-red-600",
      config: {
        background: {
          color: { value: "transparent" }
        },
        particles: {
          number: {
            value: 80,
            density: {
              enable: true
            }
          },
          color: {
            value: ["#ff6b35", "#f7931e", "#fdc830", "#ff4500"]
          },
          shape: {
            type: "circle"
          },
          opacity: {
            value: { min: 0, max: 0.8 },
            animation: {
              enable: true,
              speed: 1,
              sync: false
            }
          },
          size: {
            value: { min: 2, max: 6 },
            animation: {
              enable: true,
              speed: 3,
              sync: false
            }
          },
          move: {
            enable: true,
            speed: { min: 2, max: 4 },
            direction: "top",
            random: true,
            straight: false,
            outModes: {
              default: "destroy",
              bottom: "none"
            }
          }
        },
        emitters: {
          direction: "top",
          rate: {
            quantity: 3,
            delay: 0.1
          },
          size: {
            width: 100,
            height: 10
          },
          position: {
            x: 50,
            y: 100
          }
        }
      }
    },
    confetti: {
      name: "🎊 Confetti Explosion",
      description: "When you CLOSE A DEAL!",
      color: "from-pink-600 to-purple-600",
      config: {
        background: {
          color: { value: "transparent" }
        },
        particles: {
          number: {
            value: 0
          },
          color: {
            value: ["#ee6832", "#2563eb", "#dc2626", "#16a34a", "#ca8a04"]
          },
          shape: {
            type: ["circle", "square"]
          },
          opacity: {
            value: { min: 0, max: 1 },
            animation: {
              enable: true,
              speed: 2,
              startValue: "max",
              destroy: "min"
            }
          },
          size: {
            value: { min: 3, max: 8 }
          },
          move: {
            enable: true,
            speed: { min: 10, max: 20 },
            direction: "none",
            random: true,
            straight: false,
            outModes: {
              default: "destroy"
            },
            gravity: {
              enable: true,
              acceleration: 20
            }
          }
        },
        emitters: {
          direction: "top",
          rate: {
            quantity: 10,
            delay: 0.05
          },
          size: {
            width: 100,
            height: 0
          },
          position: {
            x: 50,
            y: 100
          },
          life: {
            duration: 0.5,
            count: 1
          }
        }
      }
    },
    stars: {
      name: "✨ Sparkle Stars",
      description: "Premium trailers shimmer effect",
      color: "from-yellow-400 to-amber-600",
      config: {
        background: {
          color: { value: "transparent" }
        },
        particles: {
          number: {
            value: 50,
            density: {
              enable: true
            }
          },
          color: {
            value: ["#ffd700", "#ffed4e", "#ffc107", "#ee6832"]
          },
          shape: {
            type: "star",
            options: {
              star: {
                sides: 5
              }
            }
          },
          opacity: {
            value: { min: 0.2, max: 1 },
            animation: {
              enable: true,
              speed: 3,
              sync: false
            }
          },
          size: {
            value: { min: 2, max: 5 },
            animation: {
              enable: true,
              speed: 2,
              sync: false
            }
          },
          move: {
            enable: true,
            speed: 1,
            direction: "none",
            random: true,
            straight: false
          }
        }
      }
    },
    glow: {
      name: "💫 Glowing Aura",
      description: "Subtle glow around cards",
      color: "from-blue-500 to-cyan-500",
      config: {
        background: {
          color: { value: "transparent" }
        },
        particles: {
          number: {
            value: 30,
            density: {
              enable: true
            }
          },
          color: {
            value: ["#ee6832", "#f7931e"]
          },
          shape: {
            type: "circle"
          },
          opacity: {
            value: { min: 0.1, max: 0.5 },
            animation: {
              enable: true,
              speed: 1,
              sync: false
            }
          },
          size: {
            value: { min: 20, max: 40 }
          },
          move: {
            enable: true,
            speed: 0.5,
            direction: "none",
            random: true,
            straight: false
          }
        }
      }
    },
    snow: {
      name: "❄️ Winter Snow",
      description: "Holiday season promo effect",
      color: "from-cyan-400 to-blue-600",
      config: {
        background: {
          color: { value: "transparent" }
        },
        particles: {
          number: {
            value: 100,
            density: {
              enable: true
            }
          },
          color: {
            value: "#ffffff"
          },
          shape: {
            type: "circle"
          },
          opacity: {
            value: { min: 0.3, max: 0.8 }
          },
          size: {
            value: { min: 1, max: 5 }
          },
          move: {
            enable: true,
            speed: { min: 1, max: 3 },
            direction: "bottom",
            random: true,
            straight: false,
            outModes: {
              default: "out",
              bottom: "out",
              top: "none"
            }
          },
          wobble: {
            enable: true,
            distance: 10,
            speed: 10
          }
        }
      }
    },
    bubbles: {
      name: "🫧 Rising Bubbles",
      description: "Fresh inventory vibes",
      color: "from-teal-400 to-emerald-600",
      config: {
        background: {
          color: { value: "transparent" }
        },
        particles: {
          number: {
            value: 40,
            density: {
              enable: true
            }
          },
          color: {
            value: ["#14b8a6", "#10b981", "#06b6d4"]
          },
          shape: {
            type: "circle"
          },
          opacity: {
            value: { min: 0.2, max: 0.6 }
          },
          size: {
            value: { min: 5, max: 15 }
          },
          move: {
            enable: true,
            speed: { min: 1, max: 3 },
            direction: "top",
            random: true,
            straight: false,
            outModes: {
              default: "destroy",
              top: "destroy",
              bottom: "none"
            }
          }
        },
        emitters: {
          direction: "top",
          rate: {
            quantity: 2,
            delay: 0.5
          },
          position: {
            x: 50,
            y: 100
          }
        }
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      {/* Header */}
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-5xl font-bold text-white mb-4">
          🎆 Remotive Logistics Particle Effects Showcase 🎆
        </h1>
        <p className="text-xl text-slate-400">
          Click any effect to see it in action! These can be added to trailer cards.
        </p>
      </motion.div>

      {/* Effect Selector Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto mb-12">
        {Object.entries(effects).map(([key, effect]) => (
          <motion.button
            key={key}
            className={`relative overflow-hidden rounded-2xl p-6 border-2 transition-all ${
              activeEffect === key
                ? "border-orange-500 shadow-lg shadow-orange-500/50"
                : "border-slate-700 hover:border-slate-600"
            }`}
            onClick={() => setActiveEffect(key)}
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${effect.color} opacity-10`} />
            <div className="relative z-10">
              <div className="text-4xl mb-3">{effect.name.split(" ")[0]}</div>
              <h3 className="text-xl font-bold text-white mb-2">
                {effect.name.substring(effect.name.indexOf(" ") + 1)}
              </h3>
              <p className="text-sm text-slate-400">{effect.description}</p>
              {activeEffect === key && (
                <motion.div
                  className="mt-4 px-3 py-1 bg-orange-500 text-white text-sm font-semibold rounded-full inline-block"
                  layoutId="activeIndicator"
                >
                  ACTIVE
                </motion.div>
              )}
            </div>
          </motion.button>
        ))}
      </div>

      {/* Live Preview Box */}
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl overflow-hidden border-4 border-orange-500 shadow-2xl"
          style={{ height: "500px" }}
          key={activeEffect}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* Particle Effect */}
          <Particles
            id={`particles-${activeEffect}`}
            init={particlesInit}
            options={effects[activeEffect as keyof typeof effects].config}
          />

          {/* Preview Content */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <motion.div
                className="text-6xl mb-4"
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                {effects[activeEffect as keyof typeof effects].name.split(" ")[0]}
              </motion.div>
              <h2 className="text-4xl font-bold text-white mb-3">
                {effects[activeEffect as keyof typeof effects].name.substring(
                  effects[activeEffect as keyof typeof effects].name.indexOf(" ") + 1
                )}
              </h2>
              <p className="text-xl text-slate-300">
                {effects[activeEffect as keyof typeof effects].description}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Info Footer */}
      <div className="text-center mt-12 text-slate-400 space-y-2">
        <p className="text-lg">
          These effects can be added to trailer cards, deal celebrations, and more!
        </p>
        <p>
          <span className="font-semibold text-orange-500">Fire 🔥</span> = Best for hot units •
          <span className="font-semibold text-purple-500"> Confetti 🎊</span> = Best for deal closings •
          <span className="font-semibold text-yellow-500"> Stars ✨</span> = Best for premium trailers
        </p>
      </div>
    </div>
  )
}
