"use client";

import React, { useState, useEffect, useMemo, useRef, Suspense } from 'react';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams?.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [eyeDirection, setEyeDirection] = useState('center');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const logoRef = useRef<HTMLDivElement>(null);

  // Spring physics for smooth cursor following
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
    if (!token) {
      setError('Invalid or missing reset token');
      return;
    }

    setTimeout(() => setShowForm(true), 200);

    const handleMouseMove = (e: MouseEvent) => {
      targetPos.current = {
        x: (e.clientX - window.innerWidth / 2) * 0.05,
        y: (e.clientY - 150) * 0.05
      };

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
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/en/auth/login');
      }, 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
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

        .pulse-success {
          animation: pulse 2s ease-in-out infinite;
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
      </div>

      {/* Floating AI Eyeball Logo */}
      <div
        ref={logoRef}
        className="fixed top-8 left-1/2 -translate-x-1/2 z-50 will-change-transform"
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

      {/* Reset Password Form */}
      <div className="relative z-10 flex min-h-screen items-center justify-center pt-32">
        <div className="w-full max-w-[28rem] px-6">
          <div
            className={`transition-all duration-700 ${
              showForm ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}
          >
            <div className="rounded-3xl p-10 relative overflow-hidden backdrop-blur-[25px] backdrop-saturate-150 bg-black/40 border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.6),0_0_40px_rgba(251,146,60,0.7)]">

              {!success ? (
                <>
                  <div className="text-center mb-8">
                    <h3 className="text-white/95 text-2xl font-light mb-3 drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
                      Create New Password
                    </h3>
                    <p className="text-white/60 text-sm">
                      Enter a strong password to secure your account
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div>
                      <label className="text-white/60 text-xs font-light tracking-wider uppercase block mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-xl px-5 py-4 text-white bg-black/20 border border-white/10 backdrop-blur-sm text-sm outline-none transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.3),inset_0_-1px_2px_rgba(255,255,255,0.05)] focus:border-orange-500/60 focus:shadow-[0_0_20px_rgba(251,146,60,0.2),inset_0_2px_6px_rgba(0,0,0,0.4)] focus:bg-black/30"
                        placeholder="Minimum 8 characters"
                        required
                        autoFocus
                        minLength={8}
                        disabled={loading || !token}
                      />
                    </div>

                    <div>
                      <label className="text-white/60 text-xs font-light tracking-wider uppercase block mb-2">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full rounded-xl px-5 py-4 text-white bg-black/20 border border-white/10 backdrop-blur-sm text-sm outline-none transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.3),inset_0_-1px_2px_rgba(255,255,255,0.05)] focus:border-orange-500/60 focus:shadow-[0_0_20px_rgba(251,146,60,0.2),inset_0_2px_6px_rgba(0,0,0,0.4)] focus:bg-black/30"
                        placeholder="Re-enter your password"
                        required
                        minLength={8}
                        disabled={loading || !token}
                      />
                    </div>

                    {error && (
                      <div className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-lg py-3 px-4">
                        {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading || !token}
                      className="w-full text-black font-semibold py-4 px-6 rounded-xl bg-gradient-to-br from-amber-300 to-orange-500 shadow-[0_4px_20px_rgba(251,191,36,0.4)] text-sm uppercase tracking-wider border-none cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(251,191,36,0.6)] active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Resetting Password...' : 'Reset Password'}
                    </button>
                  </form>

                  <div className="mt-6 text-center">
                    <button
                      onClick={() => router.push('/en/auth/login')}
                      className="text-white/50 text-xs uppercase tracking-wider hover:text-orange-500/90 transition-colors"
                    >
                      Back to Login
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-300 to-orange-500 flex items-center justify-center pulse-success">
                    <svg className="w-10 h-10 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-white/95 text-2xl font-light mb-3">
                    Password Reset Successful!
                  </h3>
                  <p className="text-white/70 text-sm mb-2">
                    Your password has been updated successfully.
                  </p>
                  <p className="text-white/50 text-xs">
                    Redirecting to login page...
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white/60 text-sm">Loading...</div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
