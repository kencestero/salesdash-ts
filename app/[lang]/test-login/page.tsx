"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Image from 'next/image';

export default function TestLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [eyeDirection, setEyeDirection] = useState('center'); // Which eye image to show
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');
  const logoRef = useRef<HTMLDivElement>(null);

  // Spring physics for smooth cursor following (Motion.dev style)
  const targetPos = useRef({ x: 0, y: 0 });
  const currentPos = useRef({ x: 0, y: 0 });

  const starPositions = useMemo(() => {
    return [...Array(45)].map(() => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      width: `${Math.random() * 1.5 + 0.5}px`,
      height: `${Math.random() * 1.5 + 0.5}px`,
      animationDelay: `${Math.random() * 4}s`,
    }));
  }, []);

  // Map eye direction to image filename
  const getEyeImage = () => {
    switch(eyeDirection) {
      case 'left': return '/images/left_side_side.webp';
      case 'right': return '/images/right side.webp';
      case 'up': return '/images/looking_up.webp';
      case 'down': return '/images/looking_down.webp';
      default: return '/images/DASH_LOGO_EYE_IN_THE_SKY.webp';
    }
  };

  useEffect(() => {
    setTimeout(() => setShowForm(true), 200);

    // Mouse tracking with spring physics + eyeball direction detection
    const handleMouseMove = (e: MouseEvent) => {
      // Ball follows smoothly
      targetPos.current = {
        x: (e.clientX - window.innerWidth / 2) * 0.05,
        y: (e.clientY - 150) * 0.05
      };

      // Calculate angle from logo center to mouse for eye direction
      if (logoRef.current) {
        const rect = logoRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const dx = e.clientX - centerX;
        const dy = e.clientY - centerY;
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Only change eye direction if mouse is far enough away
        if (distance > 50) {
          // Determine direction based on angle
          if (angle > -45 && angle <= 45) {
            setEyeDirection('right');
          } else if (angle > 45 && angle <= 135) {
            setEyeDirection('down');
          } else if (angle > 135 || angle <= -135) {
            setEyeDirection('left');
          } else {
            setEyeDirection('up');
          }
        } else {
          setEyeDirection('center');
        }
      }
    };

    // Spring animation loop for ball movement
    let animationId: number;
    const animate = () => {
      currentPos.current.x += (targetPos.current.x - currentPos.current.x) * 0.1;
      currentPos.current.y += (targetPos.current.y - currentPos.current.y) * 0.1;

      if (logoRef.current) {
        logoRef.current.style.transform = `translate(calc(-50% + ${currentPos.current.x}px), ${currentPos.current.y}px)`;
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Login functionality will be connected to NextAuth - Email: ' + email);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setResetError('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send reset email');
      }

      setResetSent(true);
    } catch (err: any) {
      setResetError(err.message);
    } finally {
      setResetLoading(false);
    }
  };

  const closeForgotPasswordModal = () => {
    setShowForgotPassword(false);
    setResetEmail('');
    setResetSent(false);
    setResetError('');
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      <style jsx>{`
        @keyframes aurora {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.3; }
          50% { transform: translate(20px, -20px) scale(1.05); opacity: 0.5; }
        }

        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }

        .aurora {
          position: absolute;
          border-radius: 50%;
          mix-blend-mode: screen;
          animation: aurora 15s ease-in-out infinite;
          filter: blur(80px);
        }

        .star {
          position: absolute;
          background: white;
          border-radius: 50%;
          animation: twinkle 4s ease-in-out infinite;
        }

        .rotating {
          animation: rotate 15s linear infinite;
        }
      `}</style>

      {/* Background Image - Your Starry Trailer */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/final_increased_login_bg.jpg"
          alt="Starry Night Trailer"
          fill
          className="object-cover object-[75%_center]"
          priority
          quality={85}
        />
      </div>

      {/* Dark overlay for form readability */}
      <div className="absolute inset-0 bg-black/30 z-[1]" />

      {/* Aurora Effects */}
      <div className="absolute inset-0 z-[2] pointer-events-none">
        <div className="aurora" style={{
          width: '600px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(251, 146, 60, 0.15) 0%, transparent 70%)',
          top: '-10%',
          left: '-10%'
        }}></div>
        <div className="aurora" style={{
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(253, 186, 116, 0.1) 0%, transparent 70%)',
          bottom: '-10%',
          right: '-10%',
          animationDelay: '7s'
        }}></div>

        {/* Subtle twinkling stars */}
        {starPositions.map((star, i) => (
          <div key={i} className="star" style={star} />
        ))}
      </div>

      {/* Floating AI Eyeball Logo with Spring Motion */}
      <div
        ref={logoRef}
        className="fixed top-8 left-1/2 -translate-x-1/2 z-50 will-change-transform"
        style={{ transition: 'none' }}
      >
        <div className="relative w-[180px] h-[180px]">
          {/* Logo glow */}
          <div className="absolute inset-5 rounded-full bg-gradient-radial from-orange-500/20 to-transparent blur-xl" />

          {/* Rotating text */}
          <svg className="rotating absolute inset-0 w-full h-full" viewBox="0 0 180 180">
            <defs>
              <path id="circle" d="M 90,90 m -70,0 a 70,70 0 1,1 140,0 a 70,70 0 1,1 -140,0" />
            </defs>
            <text className="text-[11px] font-light tracking-[0.3em] fill-white/90 uppercase">
              <textPath href="#circle">Remotive SalesHub AI • Remotive SalesHub AI • Remotive SalesHub AI •</textPath>
            </text>
          </svg>

          {/* AI Eyeball - Pupil swaps based on cursor position */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-24 h-24">
              <Image
                src={getEyeImage()}
                alt="MJ AI Eye"
                width={96}
                height={96}
                className="transition-opacity duration-200"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Login Form */}
      <div className="relative z-10 flex min-h-screen items-center justify-center pt-32">
        <div className="w-full max-w-[28rem] px-6">
          <div
            className={`transition-all duration-700 ${
              showForm ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}
          >
            <div className="rounded-3xl p-10 relative overflow-hidden backdrop-blur-[25px] backdrop-saturate-150 bg-black/40 border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.6),0_0_40px_rgba(251,146,60,0.7)]">

              <div className="text-center mb-8">
                <h3 className="text-white/95 text-2xl font-light mb-3 drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
                  Welcome Back
                </h3>
                <p className="text-white/60 text-sm">
                  Access your SalesDash account to manage leads and close deals
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div>
                  <label className="text-white/60 text-xs font-light tracking-wider uppercase block mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl px-5 py-4 text-white bg-black/20 border border-white/10 backdrop-blur-sm text-sm outline-none transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.3),inset_0_-1px_2px_rgba(255,255,255,0.05)] focus:border-orange-500/60 focus:shadow-[0_0_20px_rgba(251,146,60,0.2),inset_0_2px_6px_rgba(0,0,0,0.4)] focus:bg-black/30"
                    placeholder="your@email.com"
                    required
                    autoFocus
                  />
                </div>

                <div>
                  <label className="text-white/60 text-xs font-light tracking-wider uppercase block mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl px-5 py-4 text-white bg-black/20 border border-white/10 backdrop-blur-sm text-sm outline-none transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.3),inset_0_-1px_2px_rgba(255,255,255,0.05)] focus:border-orange-500/60 focus:shadow-[0_0_20px_rgba(251,146,60,0.2),inset_0_2px_6px_rgba(0,0,0,0.4)] focus:bg-black/30"
                    placeholder="••••••••"
                    required
                  />
                </div>

                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-white/50 text-xs hover:text-orange-500/90 transition-colors"
                  >
                    Forgot your password?
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full text-black font-semibold py-4 px-6 rounded-xl bg-gradient-to-br from-amber-300 to-orange-500 shadow-[0_4px_20px_rgba(251,191,36,0.4)] text-sm uppercase tracking-wider border-none cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(251,191,36,0.6)] active:translate-y-0"
                >
                  Continue
                </button>
              </form>

              <div className="mt-8 text-center">
                <a
                  href="mailto:noreply@mjsalesdash.com"
                  className="text-white/50 text-xs uppercase tracking-wider hover:text-orange-500/90 transition-colors"
                >
                  Need assistance?
                </a>
              </div>

              <div className="mt-10 pt-8 border-t border-white/10">
                <div className="flex items-center justify-center gap-8 mb-4">
                  <a href="https://www.diamondcargomfg.com/" target="_blank" rel="noopener noreferrer" className="transition-all hover:scale-105 hover:brightness-110">
                    <Image src="/images/diamondcargoorangeloco.png" alt="Diamond Cargo" width={120} height={56} className="h-14 w-auto object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]" />
                  </a>
                  <a href="https://panthercargo.llc/" target="_blank" rel="noopener noreferrer" className="transition-all hover:scale-105 hover:brightness-110">
                    <Image src="/images/pantherorange.png" alt="Panther Cargo" width={120} height={56} className="h-14 w-auto object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]" />
                  </a>
                  <a href="https://qualitycargo.llc/" target="_blank" rel="noopener noreferrer" className="transition-all hover:scale-105 hover:brightness-110">
                    <Image src="/images/qualitylogoorange.png" alt="Quality Cargo" width={120} height={56} className="h-14 w-auto object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]" />
                  </a>
                </div>
                <p className="text-white/30 text-xs text-center">
                  © 2024 Remotive Logistics Sales • Enterprise CRM Platform
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={closeForgotPasswordModal}>
          <div
            className="w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="rounded-3xl p-8 relative overflow-hidden backdrop-blur-[25px] backdrop-saturate-150 bg-black/40 border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.6),0_0_40px_rgba(251,146,60,0.7)]">
              {!resetSent ? (
                <>
                  <div className="text-center mb-6">
                    <h3 className="text-white/95 text-2xl font-light mb-2">
                      Reset Password
                    </h3>
                    <p className="text-white/60 text-sm">
                      Enter your email and we'll send you a reset link
                    </p>
                  </div>

                  <form onSubmit={handleForgotPassword} className="flex flex-col gap-5">
                    <div>
                      <label className="text-white/60 text-xs font-light tracking-wider uppercase block mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        className="w-full rounded-xl px-5 py-4 text-white bg-black/20 border border-white/10 backdrop-blur-sm text-sm outline-none transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.3),inset_0_-1px_2px_rgba(255,255,255,0.05)] focus:border-orange-500/60 focus:shadow-[0_0_20px_rgba(251,146,60,0.2),inset_0_2px_6px_rgba(0,0,0,0.4)] focus:bg-black/30"
                        placeholder="your@email.com"
                        required
                        autoFocus
                      />
                    </div>

                    {resetError && (
                      <div className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-lg py-2 px-3">
                        {resetError}
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={closeForgotPasswordModal}
                        className="flex-1 text-white/70 font-semibold py-3 px-6 rounded-xl bg-white/5 border border-white/10 text-sm uppercase tracking-wider cursor-pointer transition-all hover:bg-white/10 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={resetLoading}
                        className="flex-1 text-black font-semibold py-3 px-6 rounded-xl bg-gradient-to-br from-amber-300 to-orange-500 shadow-[0_4px_20px_rgba(251,191,36,0.4)] text-sm uppercase tracking-wider border-none cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(251,191,36,0.6)] active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {resetLoading ? 'Sending...' : 'Send Reset Link'}
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <>
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-300 to-orange-500 flex items-center justify-center">
                      <svg className="w-8 h-8 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-white/95 text-2xl font-light mb-2">
                      Check Your Email
                    </h3>
                    <p className="text-white/60 text-sm mb-6">
                      We've sent a password reset link to<br />
                      <span className="text-white/90 font-medium">{resetEmail}</span>
                    </p>
                    <p className="text-white/50 text-xs mb-6">
                      The link will expire in 1 hour for security.
                    </p>
                    <button
                      onClick={closeForgotPasswordModal}
                      className="w-full text-black font-semibold py-3 px-6 rounded-xl bg-gradient-to-br from-amber-300 to-orange-500 shadow-[0_4px_20px_rgba(251,191,36,0.4)] text-sm uppercase tracking-wider border-none cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(251,191,36,0.6)] active:translate-y-0"
                    >
                      Close
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
