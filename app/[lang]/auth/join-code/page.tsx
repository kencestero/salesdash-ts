import { todayCode } from "@/lib/joinCode";

export default function JoinCodePage() {
  // Optionally gate this page for managers later
  return (
    <main className="mx-auto max-w-sm p-6">
      <h1 className="text-xl font-semibold mb-2">Today&apos;s Join Code</h1>
      <div className="text-3xl font-mono">{todayCode()}</div>
      <p className="text-sm mt-3 opacity-70">Rotates daily (NY time).</p>
    </main>
  );
}