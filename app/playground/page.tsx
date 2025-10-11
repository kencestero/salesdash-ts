"use client"

import { useState } from "react"
import Image from "next/image"

export default function EffectsPlayground() {
  const [fireStyle, setFireStyle] = useState<string>("orange")
  const [fireSize, setFireSize] = useState<number>(1)
  const [fireSpeed, setFireSpeed] = useState<number>(1)
  const [showFire, setShowFire] = useState<boolean>(true)
  const [cardColor, setCardColor] = useState<string>("orange")
  const [showGlow, setShowGlow] = useState<boolean>(true)

  const colors = {
    orange: { hex: "#ee6832", name: "MJ Orange" },
    red: { hex: "#DC2626", name: "Red" },
    black: { hex: "#1a1a1a", name: "Black" },
    white: { hex: "#f8fafc", name: "White" },
    blue: { hex: "#2563eb", name: "Blue" },
  }

  return (
    <>
      <style jsx global>{`
        .fire-effect {
          position: absolute;
          top: -10px;
          right: -10px;
          width: ${30 * fireSize}px;
          height: ${40 * fireSize}px;
          z-index: 20;
        }

        .fire-effect .flame {
          position: absolute;
          bottom: 0;
          width: ${6 * fireSize}px;
          height: ${6 * fireSize}px;
          background: radial-gradient(circle, ${fireStyle === 'orange' ? '#ee6832' : fireStyle === 'red' ? '#ff4500' : '#ffa500'} 30%, transparent 60%);
          border-radius: 50%;
          animation: rise-flame ${0.8 / fireSpeed}s ease-in infinite;
          opacity: 0;
          filter: blur(${0.5 * fireSize}px);
          mix-blend-mode: screen;
        }

        ${Array.from({ length: 20 }, (_, i) => `
          .fire-effect .flame:nth-child(${i + 1}) {
            left: ${(i * 100) / 20}%;
            animation-delay: ${(Math.random() * 0.8) / fireSpeed}s;
          }
        `).join('\n')}

        @keyframes rise-flame {
          0% { opacity: 0; transform: translateY(0) scale(1); }
          35% { opacity: 1; }
          100% { opacity: 0; transform: translateY(${-40 * fireSize}px) scale(0); }
        }

        .card-glow {
          box-shadow: 0 0 ${30 * fireSize}px ${colors[cardColor as keyof typeof colors].hex}40,
                      0 10px 30px rgba(0, 0, 0, 0.3);
        }
      `}</style>

      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        padding: '40px 20px',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h1 style={{
            fontSize: '48px',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '16px'
          }}>
            🎨 Effects Playground 🎨
          </h1>
          <p style={{ fontSize: '20px', color: '#94a3b8' }}>
            Play around with fire effects and trailer card styles!
          </p>
        </div>

        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr 400px',
          gap: '40px'
        }}>
          {/* Preview Card */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{
              width: '100%',
              maxWidth: '600px',
              background: '#1e293b',
              borderRadius: '24px',
              border: `3px solid ${colors[cardColor as keyof typeof colors].hex}`,
              overflow: 'hidden',
              position: 'relative',
              transition: 'all 0.3s'
            }}
            className={showGlow ? 'card-glow' : ''}
            >
              {/* Fire Effect */}
              {showFire && (
                <div className="fire-effect">
                  {Array.from({ length: 20 }, (_, i) => (
                    <div key={i} className="flame" />
                  ))}
                </div>
              )}

              {/* Hot Badge */}
              <div style={{
                position: 'absolute',
                top: '20px',
                left: '20px',
                padding: '8px 16px',
                background: colors[cardColor as keyof typeof colors].hex,
                color: 'white',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: 'bold',
                zIndex: 10
              }}>
                HOT UNIT 🔥
              </div>

              {/* Trailer Image */}
              <div style={{
                position: 'relative',
                height: '300px',
                background: `linear-gradient(to bottom, transparent, ${colors[cardColor as keyof typeof colors].hex}20)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Image
                  src="/images/custom.png"
                  alt="Trailer"
                  width={400}
                  height={250}
                  style={{
                    objectFit: 'contain',
                    filter: `drop-shadow(0 10px 30px ${colors[cardColor as keyof typeof colors].hex}60)`
                  }}
                />
              </div>

              {/* Card Info */}
              <div style={{ padding: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px' }}>
                  <div>
                    <h3 style={{ color: 'white', fontSize: '24px', marginBottom: '8px' }}>
                      Concession Trailer
                    </h3>
                    <p style={{ color: '#94a3b8' }}>
                      8.5×16 SA • {colors[cardColor as keyof typeof colors].name} • Food Service
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: colors[cardColor as keyof typeof colors].hex }}>
                      $24,999
                    </div>
                    <div style={{ fontSize: '14px', color: '#94a3b8' }}>
                      or $399/mo
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button style={{
                    flex: 1,
                    padding: '16px',
                    background: colors[cardColor as keyof typeof colors].hex,
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}>
                    View Details
                  </button>
                  <button style={{
                    padding: '16px 24px',
                    background: 'transparent',
                    color: colors[cardColor as keyof typeof colors].hex,
                    border: `2px solid ${colors[cardColor as keyof typeof colors].hex}`,
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}>
                    Calculate
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Controls Panel */}
          <div style={{
            background: '#1e293b',
            borderRadius: '24px',
            padding: '30px',
            border: '3px solid #334155',
            height: 'fit-content'
          }}>
            <h2 style={{ color: 'white', fontSize: '24px', marginBottom: '30px' }}>
              🎛️ Controls
            </h2>

            {/* Fire Toggle */}
            <div style={{ marginBottom: '30px' }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={showFire}
                  onChange={(e) => setShowFire(e.target.checked)}
                  style={{ width: '20px', height: '20px', marginRight: '12px', cursor: 'pointer' }}
                />
                <span style={{ color: 'white', fontSize: '18px', fontWeight: 'bold' }}>
                  🔥 Show Fire Effect
                </span>
              </label>
            </div>

            {/* Glow Toggle */}
            <div style={{ marginBottom: '30px', paddingBottom: '30px', borderBottom: '2px solid #334155' }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={showGlow}
                  onChange={(e) => setShowGlow(e.target.checked)}
                  style={{ width: '20px', height: '20px', marginRight: '12px', cursor: 'pointer' }}
                />
                <span style={{ color: 'white', fontSize: '18px', fontWeight: 'bold' }}>
                  ✨ Card Glow Effect
                </span>
              </label>
            </div>

            {/* Fire Style */}
            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', color: '#94a3b8', marginBottom: '12px', fontSize: '14px', fontWeight: 'bold' }}>
                FIRE COLOR
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                {['orange', 'red', 'yellow'].map(style => (
                  <button
                    key={style}
                    onClick={() => setFireStyle(style)}
                    style={{
                      flex: 1,
                      padding: '12px',
                      background: fireStyle === style ? (style === 'orange' ? '#ee6832' : style === 'red' ? '#ff4500' : '#ffa500') : '#0f172a',
                      color: 'white',
                      border: fireStyle === style ? 'none' : '2px solid #334155',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      textTransform: 'capitalize'
                    }}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            {/* Fire Size */}
            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', color: '#94a3b8', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>
                FIRE SIZE: {fireSize.toFixed(1)}x
              </label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={fireSize}
                onChange={(e) => setFireSize(parseFloat(e.target.value))}
                style={{ width: '100%', height: '6px', cursor: 'pointer' }}
              />
            </div>

            {/* Fire Speed */}
            <div style={{ marginBottom: '30px', paddingBottom: '30px', borderBottom: '2px solid #334155' }}>
              <label style={{ display: 'block', color: '#94a3b8', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>
                FIRE SPEED: {fireSpeed.toFixed(1)}x
              </label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={fireSpeed}
                onChange={(e) => setFireSpeed(parseFloat(e.target.value))}
                style={{ width: '100%', height: '6px', cursor: 'pointer' }}
              />
            </div>

            {/* Card Color */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: '#94a3b8', marginBottom: '12px', fontSize: '14px', fontWeight: 'bold' }}>
                CARD THEME COLOR
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {Object.entries(colors).map(([key, color]) => (
                  <button
                    key={key}
                    onClick={() => setCardColor(key)}
                    style={{
                      width: '50px',
                      height: '50px',
                      background: color.hex,
                      border: cardColor === key ? '3px solid white' : '2px solid #334155',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      position: 'relative'
                    }}
                    title={color.name}
                  >
                    {cardColor === key && (
                      <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        color: key === 'white' ? '#000' : '#fff',
                        fontSize: '20px'
                      }}>
                        ✓
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Reset Button */}
            <button
              onClick={() => {
                setFireStyle('orange')
                setFireSize(1)
                setFireSpeed(1)
                setShowFire(true)
                setCardColor('orange')
                setShowGlow(true)
              }}
              style={{
                width: '100%',
                padding: '16px',
                background: '#334155',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                marginTop: '20px'
              }}
            >
              🔄 Reset to Defaults
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
