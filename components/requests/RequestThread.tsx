"use client";

import ReplyBox from "./ReplyBox";

export default function RequestThread({ request }: { request: any }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="space-y-2">
          <div className="text-sm text-neutral-400">Request ID: {request.id}</div>
          <div className="flex gap-2 text-xs">
            <span className="px-2 py-1 rounded-md bg-neutral-800 text-neutral-300">
              {request.manufacturer}
            </span>
            <span className="px-2 py-1 rounded-md bg-neutral-800 text-neutral-300">
              {request.purpose}
            </span>
            <span
              className={`px-2 py-1 rounded-md ${
                request.status === "SENT"
                  ? "bg-emerald-900/30 text-emerald-400"
                  : request.status === "FAILED"
                  ? "bg-red-900/30 text-red-400"
                  : "bg-amber-900/30 text-amber-400"
              }`}
            >
              {request.status}
            </span>
          </div>
        </div>

        <div className="bg-neutral-900/50 p-4 rounded-lg border border-neutral-800">
          <div className="text-xs text-neutral-400 mb-2">
            From: {request.fullName} ({request.email})
          </div>
          <div className="text-sm text-neutral-100 whitespace-pre-wrap">
            {request.message}
          </div>
        </div>

        {/* Placeholder for reply thread */}
        {request.replies?.map((msg: any) => (
          <div
            key={msg.id}
            className="bg-neutral-950 p-4 border border-neutral-800 rounded-lg"
          >
            <div className="text-xs text-neutral-400 mb-2">From: {msg.from}</div>
            <div className="text-sm text-neutral-100">{msg.body}</div>
          </div>
        ))}
      </div>

      <div className="border-t border-neutral-800 p-4 bg-neutral-900/30">
        <ReplyBox requestId={request.id} />
      </div>
    </div>
  );
}
