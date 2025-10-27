"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { getMyRequestLogs } from "@/lib/api";
import RequestThread from "./RequestThread";

export default function RequestInbox() {
  const [requests, setRequests] = useState([]);
  const [selected, setSelected] = useState(null);

  // Fetch requests initially and set up polling
  useEffect(() => {
    const fetchRequests = () => {
      getMyRequestLogs().then(setRequests);
    };

    // Initial fetch
    fetchRequests();

    // Poll every 3 seconds for updates
    const interval = setInterval(fetchRequests, 3000);

    return () => clearInterval(interval);
  }, []);

  // Helper function to get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "SENT":
        return "bg-emerald-900/30 text-emerald-400 border-emerald-500/30";
      case "FAILED":
        return "bg-red-900/30 text-red-400 border-red-500/30";
      case "PENDING":
        return "bg-amber-900/30 text-amber-400 border-amber-500/30";
      default:
        return "bg-neutral-800 text-neutral-400 border-neutral-700";
    }
  };

  return (
    <div className="grid grid-cols-3 h-[calc(100vh-200px)]">
      <div className="border-r border-neutral-800 overflow-y-auto">
        {requests.map((req: any) => (
          <div
            key={req.id}
            className={`p-4 cursor-pointer hover:bg-neutral-900/50 transition-colors border-b border-neutral-800 ${
              selected?.id === req.id ? "bg-neutral-900/70 border-l-2 border-orange-500" : ""
            }`}
            onClick={() => setSelected(req)}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <p className="text-sm font-medium text-white flex-1">{req.purpose}</p>
              <span
                className={`text-xs px-2 py-0.5 rounded-md border ${getStatusColor(
                  req.status
                )}`}
              >
                {req.status}
              </span>
            </div>
            <p className="text-xs text-neutral-400 mb-1">{req.manufacturer}</p>
            <p className="text-xs text-neutral-500">
              {formatDistanceToNow(new Date(req.createdAt), { addSuffix: true })}
            </p>
          </div>
        ))}
        {requests.length === 0 && (
          <div className="p-6 text-center text-neutral-500 text-sm">
            No requests yet
          </div>
        )}
      </div>
      <div className="col-span-2 bg-neutral-950">
        {selected ? (
          <RequestThread request={selected} />
        ) : (
          <div className="p-6 text-neutral-400">Select a request to view</div>
        )}
      </div>
    </div>
  );
}
