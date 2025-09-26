"use client";
import { useState } from "react";

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
    <main className="mx-auto max-w-sm p-6">
      <h1 className="text-xl font-semibold mb-4">Enter Join Code</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="ABC123"
          className="w-full border rounded-lg px-3 py-2"
        />
        {err && <p className="text-red-600 text-sm">{err}</p>}
        <button className="w-full rounded-lg px-3 py-2 border">Continue</button>
      </form>
    </main>
  );
}