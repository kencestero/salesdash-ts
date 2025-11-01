"use client";

import React, { useState, useEffect, useMemo, useRef, useTransition } from 'react';
import Image from 'next/image';
import { signIn } from "next-auth/react";
import { DEFAULT_LANG } from "@/lib/i18n";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [eyeDirection, setEyeDirection] = useState('center');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isPending, startTransition] = useTransition();
  const logoRef = useRef<HTMLDivElement>(null);
  const [shootingStars, setShootingStars] = useState<Array<{ id: number; startX: string; startY: string; endX: string; endY: string }>>([]);

  const starPositions = useMemo(() => {
    return [...Array(52)].map(() => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      width: `${Math.random() * 1.5 + 0.5}px`,
      height: `${Math.random() * 1.5 + 0.5}px`,
      animationDelay: `${Math.random() * 4}s`,
    }));
  }, []);

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

    const handleMouseMove = (e: MouseEvent) => {
      if (logoRef.current) {
        const rect = logoRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const dx = e.clientX - centerX;
        const dy = e.clientY - centerY;
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 50) {
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

    // Logo stays fixed - no mouse tracking movement
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Shooting star effect - random stars every 5-7 seconds
  useEffect(() => {
    let starIdCounter = 0;

    const createShootingStar = () => {
      const fromLeft = Math.random() > 0.5;
      const startX = fromLeft ? `${Math.random() * 30}%` : `${70 + Math.random() * 30}%`;
      const startY = `${Math.random() * 20}%`;
      const endX = fromLeft ? `${70 + Math.random() * 30}%` : `${Math.random() * 30}%`;
      const endY = `${80 + Math.random() * 20}%`;

      const newStar = {
        id: starIdCounter++,
        startX,
        startY,
        endX,
        endY,
      };

      setShootingStars(prev => [...prev, newStar]);

      // Remove star after animation completes (2s total)
      setTimeout(() => {
        setShootingStars(prev => prev.filter(s => s.id !== newStar.id));
      }, 2000);
    };

    const scheduleNextStar = () => {
      const delay = 5000 + Math.random() * 2000; // 5-7 seconds
      return setTimeout(() => {
        createShootingStar();
        nextStarTimeout = scheduleNextStar();
      }, delay);
    };

    let nextStarTimeout = scheduleNextStar();

    return () => {
      clearTimeout(nextStarTimeout);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    startTransition(async () => {
      const response = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (response?.ok) {
        window.location.assign(`/${DEFAULT_LANG}/dashboard`);
      } else if (response?.error) {
        setLoginError(response.error);
      }
    });
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

        @keyframes shootingStar {
          0% {
            transform: translate(0, 0);
            opacity: 0;
          }
          15% {
            opacity: 1;
          }
          85% {
            opacity: 1;
          }
          100% {
            transform: translate(var(--translate-x), var(--translate-y));
            opacity: 0;
          }
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

        .shooting-star {
          position: absolute;
          width: 2px;
          height: 2px;
          background: white;
          border-radius: 50%;
          box-shadow: 0 0 10px 2px rgba(255, 255, 255, 0.8);
          animation: shootingStar 2s ease-out forwards;
        }

        .shooting-star::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 60px;
          height: 1px;
          background: linear-gradient(90deg, white, transparent);
          transform: translateX(-100%);
        }

        .rotating {
          animation: rotate 15s linear infinite;
        }
      `}</style>

      {/* Background Image */}
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

        {starPositions.map((star, i) => (
          <div key={i} className="star" style={star} />
        ))}

        {shootingStars.map((star) => {
          const translateX = `calc(${star.endX} - ${star.startX})`;
          const translateY = `calc(${star.endY} - ${star.startY})`;

          return (
            <div
              key={star.id}
              className="shooting-star"
              style={{
                left: star.startX,
                top: star.startY,
                // @ts-ignore - CSS custom properties
                '--translate-x': translateX,
                '--translate-y': translateY,
              }}
            />
          );
        })}
      </div>

      {/* Floating AI Eyeball Logo */}
      <div
        ref={logoRef}
        className="absolute top-8 left-1/2 -translate-x-1/2 z-50 will-change-transform"
        style={{ transition: 'none' }}
      >
        <div className="relative w-[180px] h-[180px]">
          <div className="absolute inset-5 rounded-full bg-gradient-radial from-orange-500/20 to-transparent blur-xl" />

          <svg className="rotating absolute inset-0 w-full h-full" viewBox="0 0 180 180">
            <defs>
              <path id="circle" d="M 90,90 m -70,0 a 70,70 0 1,1 140,0 a 70,70 0 1,1 -140,0" />
            </defs>
            <text className="text-[11px] font-light tracking-[0.3em] fill-white/90 uppercase">
              <textPath href="#circle">MJ SALESDASH AI • MJ SALESDASH AI • MJ SALESDASH AI •</textPath>
            </text>
          </svg>

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
                    disabled={isPending}
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
                    disabled={isPending}
                  />
                </div>

                {loginError && (
                  <div className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-lg py-2 px-3">
                    {loginError}
                  </div>
                )}

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
                  disabled={isPending}
                  className="w-full text-black font-semibold py-4 px-6 rounded-xl bg-gradient-to-br from-amber-300 to-orange-500 shadow-[0_4px_20px_rgba(251,191,36,0.4)] text-sm uppercase tracking-wider border-none cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(251,191,36,0.6)] active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? 'Signing In...' : 'Continue'}
                </button>

                {/* Google OAuth Button */}
                <button
                  type="button"
                  onClick={() => signIn("google", { callbackUrl: `/${DEFAULT_LANG}/dashboard` })}
                  disabled={isPending}
                  className="w-full text-white font-semibold py-4 px-6 rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm text-sm uppercase tracking-wider cursor-pointer transition-all hover:bg-white/20 hover:border-white/30 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#ffffff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#ffffff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#ffffff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#ffffff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Sign in with Google
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-white/50 text-xs">
                  Don't have an account?{' '}
                  <a href={`/${DEFAULT_LANG}/auth/join`} className="text-orange-500/90 hover:text-orange-400 transition-colors font-semibold">
                    Sign Up
                  </a>
                </p>
              </div>

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
                  © 2024 MJ Cargo Sales • Enterprise CRM Platform
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
