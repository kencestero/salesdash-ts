"use client";

import { formatDistanceToNow } from "date-fns";
import ReplyBox from "./ReplyBox";

export default function RequestThread({ request }: { request: any }) {
  // Helper function to get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "SENT":
        return "bg-emerald-900/30 text-emerald-400 border border-emerald-500/30";
      case "FAILED":
        return "bg-red-900/30 text-red-400 border border-red-500/30";
      case "PENDING":
        return "bg-amber-900/30 text-amber-400 border border-amber-500/30";
      default:
        return "bg-neutral-800 text-neutral-400 border border-neutral-700";
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Header Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm text-neutral-400">
              Request ID: <span className="text-neutral-300 font-mono">{request.id.slice(0, 8)}</span>
            </div>
            <div className="text-xs text-neutral-500">
              {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 rounded-lg bg-neutral-800 text-neutral-300 text-xs border border-neutral-700">
              {request.manufacturer}
            </span>
            <span className="px-3 py-1 rounded-lg bg-neutral-800 text-neutral-300 text-xs border border-neutral-700">
              {request.purpose}
            </span>
            <span className={`px-3 py-1 rounded-lg text-xs font-medium ${getStatusColor(request.status)}`}>
              {request.status}
            </span>
            {request.repCode && (
              <span className="px-3 py-1 rounded-lg bg-orange-900/20 text-orange-400 text-xs border border-orange-500/30">
                {request.repCode}
              </span>
            )}
          </div>
        </div>

        {/* Original Request Message */}
        <div className="bg-neutral-900/50 p-4 rounded-lg border border-neutral-800">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-sm font-medium text-white">{request.fullName}</div>
              <div className="text-xs text-neutral-400">{request.email}</div>
            </div>
            <div className="text-xs text-neutral-500">
              {new Date(request.createdAt).toLocaleString()}
            </div>
          </div>
          <div className="text-sm text-neutral-100 whitespace-pre-wrap leading-relaxed">
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
