"use client"

export default function FireAnimationShowcase() {
  return (
    <>
      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        /* Style 1: Classic Rising Fire */
        .fire-classic {
          position: relative;
          width: 60px;
          height: 80px;
          margin: 20px auto;
        }

        .fire-classic .flame {
          position: absolute;
          bottom: 0;
          width: 12px;
          height: 12px;
          background: radial-gradient(circle, #ff4500 20%, transparent 70%);
          border-radius: 50%;
          animation: rise 1s ease-in infinite;
          opacity: 0;
          filter: blur(1px);
          mix-blend-mode: screen;
        }

        ${Array.from({ length: 30 }, (_, i) => `
          .fire-classic .flame:nth-child(${i + 1}) {
            left: ${(i * 100) / 30}%;
            animation-delay: ${Math.random()}s;
          }
        `).join('\n')}

        @keyframes rise {
          0% { opacity: 0; transform: translateY(0) scale(1); }
          25% { opacity: 1; }
          100% { opacity: 0; transform: translateY(-80px) scale(0); }
        }

        /* Style 2: MJ Orange Fire */
        .fire-orange {
          position: relative;
          width: 50px;
          height: 70px;
          margin: 20px auto;
        }

        .fire-orange .flame {
          position: absolute;
          bottom: 0;
          width: 10px;
          height: 10px;
          background: radial-gradient(circle, #ee6832 25%, transparent 65%);
          border-radius: 50%;
          animation: rise-orange 1.2s ease-in infinite;
          opacity: 0;
          filter: blur(0.8px);
          mix-blend-mode: screen;
        }

        ${Array.from({ length: 25 }, (_, i) => `
          .fire-orange .flame:nth-child(${i + 1}) {
            left: ${(i * 100) / 25}%;
            animation-delay: ${Math.random() * 1.2}s;
          }
        `).join('\n')}

        @keyframes rise-orange {
          0% { opacity: 0; transform: translateY(0) scale(1); }
          30% { opacity: 1; }
          100% { opacity: 0; transform: translateY(-70px) scale(0); }
        }

        /* Style 3: Compact Badge Fire */
        .fire-badge {
          position: relative;
          width: 30px;
          height: 40px;
          margin: 10px auto;
        }

        .fire-badge .flame {
          position: absolute;
          bottom: 0;
          width: 6px;
          height: 6px;
          background: radial-gradient(circle, #ff6b35 30%, transparent 60%);
          border-radius: 50%;
          animation: rise-badge 0.8s ease-in infinite;
          opacity: 0;
          filter: blur(0.5px);
          mix-blend-mode: screen;
        }

        ${Array.from({ length: 20 }, (_, i) => `
          .fire-badge .flame:nth-child(${i + 1}) {
            left: ${(i * 100) / 20}%;
            animation-delay: ${Math.random() * 0.8}s;
          }
        `).join('\n')}

        @keyframes rise-badge {
          0% { opacity: 0; transform: translateY(0) scale(1); }
          35% { opacity: 1; }
          100% { opacity: 0; transform: translateY(-40px) scale(0); }
        }

        /* Style 4: Flickering Flame */
        .fire-flicker {
          position: relative;
          width: 40px;
          height: 60px;
          margin: 20px auto;
        }

        .fire-flicker .core {
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 20px;
          height: 40px;
          background: linear-gradient(to top, #ff4500, #ffa500, transparent);
          border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
          animation: flicker 0.15s infinite alternate;
          filter: blur(2px);
        }

        .fire-flicker .glow {
          position: absolute;
          bottom: -5px;
          left: 50%;
          transform: translateX(-50%);
          width: 35px;
          height: 35px;
          background: radial-gradient(circle, #ff6b35 0%, transparent 70%);
          border-radius: 50%;
          opacity: 0.8;
          animation: pulse 0.5s ease-in-out infinite alternate;
        }

        @keyframes flicker {
          0% { transform: translateX(-50%) scale(1, 1); }
          100% { transform: translateX(-50%) scale(1.05, 0.95); }
        }

        @keyframes pulse {
          0% { opacity: 0.6; transform: translateX(-50%) scale(1); }
          100% { opacity: 0.9; transform: translateX(-50%) scale(1.1); }
        }
      `}</style>

      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        padding: '60px 20px',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
          <h1 style={{
            fontSize: '56px',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '20px'
          }}>
            🔥 Pure CSS Fire Animations 🔥
          </h1>
          <p style={{ fontSize: '24px', color: '#94a3b8' }}>
            Choose the perfect fire effect for your hot units!
          </p>
        </div>

        {/* Fire Demos Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '40px',
          maxWidth: '1400px',
          margin: '0 auto 80px'
        }}>
          {/* Classic Fire */}
          <div style={{
            background: '#1e293b',
            borderRadius: '24px',
            padding: '40px',
            border: '3px solid #334155',
            textAlign: 'center'
          }}>
            <h2 style={{ color: 'white', fontSize: '28px', marginBottom: '12px' }}>
              Classic Fire
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '16px', marginBottom: '30px' }}>
              Red/orange rising flames
            </p>

            <div className="fire-classic">
              {Array.from({ length: 30 }, (_, i) => (
                <div key={i} className="flame" />
              ))}
            </div>

            <div style={{
              marginTop: '30px',
              padding: '16px',
              background: 'rgba(239, 68, 68, 0.1)',
              borderRadius: '12px',
              border: '2px solid #ef4444'
            }}>
              <div style={{ color: '#ef4444', fontWeight: 'bold', marginBottom: '6px' }}>
                Best For:
              </div>
              <div style={{ color: '#cbd5e1', fontSize: '14px' }}>
                Large "HOT DEAL" banners
              </div>
            </div>
          </div>

          {/* MJ Orange */}
          <div style={{
            background: '#1e293b',
            borderRadius: '24px',
            padding: '40px',
            border: '3px solid #ee6832',
            textAlign: 'center',
            boxShadow: '0 0 30px rgba(238, 104, 50, 0.3)'
          }}>
            <h2 style={{ color: 'white', fontSize: '28px', marginBottom: '12px' }}>
              MJ Orange 🧡
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '16px', marginBottom: '30px' }}>
              Branded MJ Cargo color
            </p>

            <div className="fire-orange">
              {Array.from({ length: 25 }, (_, i) => (
                <div key={i} className="flame" />
              ))}
            </div>

            <div style={{
              marginTop: '30px',
              padding: '16px',
              background: 'rgba(238, 104, 50, 0.1)',
              borderRadius: '12px',
              border: '2px solid #ee6832'
            }}>
              <div style={{ color: '#ee6832', fontWeight: 'bold', marginBottom: '6px' }}>
                ⭐ RECOMMENDED
              </div>
              <div style={{ color: '#cbd5e1', fontSize: '14px' }}>
                Trailer cards (1-2 days old)
              </div>
            </div>
          </div>

          {/* Compact Badge */}
          <div style={{
            background: '#1e293b',
            borderRadius: '24px',
            padding: '40px',
            border: '3px solid #334155',
            textAlign: 'center'
          }}>
            <h2 style={{ color: 'white', fontSize: '28px', marginBottom: '12px' }}>
              Compact Badge
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '16px', marginBottom: '30px' }}>
              Small corner badge
            </p>

            <div className="fire-badge">
              {Array.from({ length: 20 }, (_, i) => (
                <div key={i} className="flame" />
              ))}
            </div>

            <div style={{
              marginTop: '30px',
              padding: '16px',
              background: 'rgba(251, 191, 36, 0.1)',
              borderRadius: '12px',
              border: '2px solid #fbbf24'
            }}>
              <div style={{ color: '#fbbf24', fontWeight: 'bold', marginBottom: '6px' }}>
                Best For:
              </div>
              <div style={{ color: '#cbd5e1', fontSize: '14px' }}>
                Top-right corner badges
              </div>
            </div>
          </div>

          {/* Flickering */}
          <div style={{
            background: '#1e293b',
            borderRadius: '24px',
            padding: '40px',
            border: '3px solid #334155',
            textAlign: 'center'
          }}>
            <h2 style={{ color: 'white', fontSize: '28px', marginBottom: '12px' }}>
              Flickering Flame
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '16px', marginBottom: '30px' }}>
              Realistic candle effect
            </p>

            <div className="fire-flicker">
              <div className="glow" />
              <div className="core" />
            </div>

            <div style={{
              marginTop: '30px',
              padding: '16px',
              background: 'rgba(168, 85, 247, 0.1)',
              borderRadius: '12px',
              border: '2px solid #a855f7'
            }}>
              <div style={{ color: '#a855f7', fontWeight: 'bold', marginBottom: '6px' }}>
                Best For:
              </div>
              <div style={{ color: '#cbd5e1', fontSize: '14px' }}>
                Subtle attention-grabber
              </div>
            </div>
          </div>
        </div>

        {/* Implementation Section */}
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          background: '#1e293b',
          borderRadius: '24px',
          padding: '50px',
          border: '3px solid #334155'
        }}>
          <h2 style={{ color: 'white', fontSize: '36px', marginBottom: '24px' }}>
            Ready to Use on Your Trailer Cards
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
            marginBottom: '40px'
          }}>
            <div style={{
              background: 'rgba(34, 197, 94, 0.1)',
              padding: '24px',
              borderRadius: '16px',
              border: '2px solid #22c55e'
            }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>✅</div>
              <div style={{ color: '#22c55e', fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
                Zero Dependencies
              </div>
              <div style={{ color: '#cbd5e1', fontSize: '14px' }}>
                Pure CSS, no libraries needed
              </div>
            </div>

            <div style={{
              background: 'rgba(34, 197, 94, 0.1)',
              padding: '24px',
              borderRadius: '16px',
              border: '2px solid #22c55e'
            }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>⚡</div>
              <div style={{ color: '#22c55e', fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
                Lightning Fast
              </div>
              <div style={{ color: '#cbd5e1', fontSize: '14px' }}>
                GPU-accelerated animations
              </div>
            </div>

            <div style={{
              background: 'rgba(34, 197, 94, 0.1)',
              padding: '24px',
              borderRadius: '16px',
              border: '2px solid #22c55e'
            }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>🎨</div>
              <div style={{ color: '#22c55e', fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
                Easy to Customize
              </div>
              <div style={{ color: '#cbd5e1', fontSize: '14px' }}>
                Change colors, size, speed
              </div>
            </div>
          </div>

          <div style={{
            background: '#0f172a',
            padding: '30px',
            borderRadius: '16px',
            color: '#94a3b8',
            fontSize: '14px',
            lineHeight: '1.8'
          }}>
            <div style={{ color: '#ee6832', fontWeight: 'bold', marginBottom: '12px', fontSize: '16px' }}>
              💡 Pro Tip:
            </div>
            <p>
              Use the <strong style={{ color: 'white' }}>MJ Orange</strong> fire on any trailer card where the unit arrived in the last 48 hours.
              It grabs attention instantly and matches your branding perfectly!
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
