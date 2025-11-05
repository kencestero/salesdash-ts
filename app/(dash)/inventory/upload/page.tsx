"use client";
import { useState } from "react";

export default function InventoryUploadPage() {
  const [res,setRes] = useState<any>(null);
  const [busy,setBusy] = useState(false);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setBusy(true);
    setRes(null);

    try {
      const arrayBuf = await f.arrayBuffer();
      const b64 = Buffer.from(arrayBuf).toString("base64");

      const r = await fetch("/api/inventory/import", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ fileBase64: b64, filename: f.name }),
      });

      const j = await r.json();
      setRes(j);
    } catch (error: any) {
      setRes({ ok: false, error: error.message || "Upload failed" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="p-6 space-y-4 max-w-2xl">
      <h1 className="text-2xl font-semibold">Inventory Import (Excel)</h1>
      <p className="text-sm text-gray-600">Upload Diamond Cargo or Quality Cargo Excel files to import trailers.</p>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={onFile}
          disabled={busy}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-primary file:text-white
            hover:file:bg-primary/90
            disabled:opacity-50 disabled:cursor-not-allowed"
        />
        {busy && <p className="mt-4 text-sm text-gray-500 animate-pulse">Uploading and processing...</p>}
      </div>

      {res && (
        <div className={`p-4 rounded-lg ${res.ok ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <h2 className={`text-lg font-semibold mb-2 ${res.ok ? 'text-green-800' : 'text-red-800'}`}>
            {res.ok ? '✅ Import Successful' : '❌ Import Failed'}
          </h2>
          <pre className="text-xs overflow-auto">{JSON.stringify(res, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
