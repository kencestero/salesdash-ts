"use client";

import { useEffect, useState } from "react";
import { getMyRequestLogs } from "@/lib/api";
import RequestThread from "./RequestThread";

export default function RequestInbox() {
  const [requests, setRequests] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    getMyRequestLogs().then(setRequests);
  }, []);

  return (
    <div className="grid grid-cols-3 h-[calc(100vh-200px)]">
      <div className="border-r border-neutral-800 overflow-y-auto">
        {requests.map((req: any) => (
          <div
            key={req.id}
            className={`p-4 cursor-pointer hover:bg-neutral-900/50 transition-colors ${
              selected?.id === req.id ? "bg-neutral-900/70 border-l-2 border-orange-500" : ""
            }`}
            onClick={() => setSelected(req)}
          >
            <p className="text-sm font-medium text-white">{req.purpose}</p>
            <p className="text-xs text-neutral-400">{req.manufacturer}</p>
            <p className="text-xs text-neutral-500">
              {new Date(req.createdAt).toLocaleDateString()}
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
