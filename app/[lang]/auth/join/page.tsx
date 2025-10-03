"use client";
import { useState } from "react";
import Image from "next/image";

export default function RegisterPage() {
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    const r = await fetch("/api/join/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    if (r.ok) {
      // cookie join_ok is now set; kick to Google sign-in
      window.location.href = "/api/auth/signin/google?callbackUrl=/en/dashboard";
    } else {
      const j = await r.json().catch(() => ({}));
      setErr(j?.message || "Invalid code.");
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <Image
        src="/images/trailerbgimg.png"
        alt="Cargo Trailer Interior"
        fill
        className="object-cover"
        quality={75}
        priority
      />
      <div className="absolute inset-0 bg-black/20 z-10" />
      <div className="relative z-20 mx-auto max-w-sm w-full bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
        <h1 className="text-2xl font-semibold mb-6 text-white text-center">Enter Join Code</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="ABC123"
            className="w-full bg-white/90 backdrop-blur-sm border-0 rounded-xl px-4 py-3 text-center text-lg font-mono tracking-wider focus:ring-2 focus:ring-primary focus:outline-none"
          />
          {err && <p className="text-red-300 text-sm text-center bg-red-500/20 backdrop-blur-sm rounded-lg py-2 px-3">{err}</p>}
          <button className="w-full bg-primary/90 hover:bg-primary text-primary-foreground rounded-xl px-4 py-3 font-semibold transition-all hover:scale-105">
            Continue
          </button>
        </form>
      </div>
    </main>
  );
}