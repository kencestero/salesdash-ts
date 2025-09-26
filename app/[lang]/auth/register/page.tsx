"use client";
import { useState } from "react";

export default function RegisterPage() {
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr("");
    const r = await fetch("/api/join/verify", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    if (r.ok) {
      // After cookie set, send them to Google sign-in
      window.location.href = "/api/auth/signin/google?callbackUrl=/en/dashboard";
    } else {
      setErr("Invalid or expired code. Ask your manager for today's code.");
    }
  }

  return (
    <div className="p-8 max-w-sm mx-auto">
      <h1 className="text-xl font-semibold">Enter Join Code</h1>
      <form onSubmit={submit} className="mt-4 space-y-3">
        <input value={code} onChange={e=>setCode(e.target.value)}
               placeholder="6-digit code" className="w-full px-3 py-2 rounded bg-black/20 border" />
        {err && <p className="text-sm text-red-500">{err}</p>}
        <button className="px-4 py-2 rounded bg-orange-600 text-white">Continue</button>
      </form>
    </div>
  );
}