"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";

export default function ChatThreadList({ onSelect, selected }: any) {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchThreads = () => {
      fetch("/api/chat/threads")
        .then((res) => res.json())
        .then((data) => {
          setThreads(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to load threads:", err);
          setLoading(false);
        });
    };

    // Initial fetch
    fetchThreads();

    // Poll every 3 seconds for thread updates
    const interval = setInterval(fetchThreads, 3000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="border-r border-neutral-800 p-6 text-center text-neutral-500 text-sm">
        Loading conversations...
      </div>
    );
  }

  return (
    <div className="border-r border-neutral-800 overflow-y-auto">
      {threads.map((thread: any) => (
        <div
          key={thread.id}
          className={`p-4 cursor-pointer hover:bg-neutral-900/50 transition-colors border-b border-neutral-800 ${
            selected?.id === thread.id ? "bg-neutral-900/70 border-l-2 border-orange-500" : ""
          }`}
          onClick={() => onSelect(thread)}
        >
          <p className="text-sm font-medium text-white">
            {thread.subject || "(No Subject)"}
          </p>
          <p className="text-xs text-neutral-500">
            {formatDistanceToNow(new Date(thread.updatedAt), { addSuffix: true })}
          </p>
        </div>
      ))}
      {threads.length === 0 && (
        <div className="p-6 text-center text-neutral-500 text-sm">
          No conversations yet
        </div>
      )}
    </div>
  );
}
