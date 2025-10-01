"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export default function JoinPage() {
  const [code, setCode] = useState("");
  const [pending, start] = useTransition();
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    start(async () => {
      const res = await fetch("/api/join/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (res.ok) {
        router.replace("/en/dashboard");
      } else {
        setErr("Invalid code. Try again.");
      }
    });
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-sm">
        <h1 className="mb-4 text-xl font-semibold">Enter Company Code</h1>

        <form onSubmit={onSubmit} className="space-y-3">
          <input
            className="w-full rounded-md border bg-background px-3 py-2"
            placeholder="Company code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          {err ? <p className="text-sm text-red-500">{err}</p> : null}
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-md bg-[#E96114] py-2 text-white hover:opacity-90 disabled:opacity-60"
          >
            {pending ? "Checking…" : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
