"use client";

import { useEffect, useState } from "react";

export default function ChatThreadList({ onSelect, selected }: any) {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
            {new Date(thread.updatedAt).toLocaleString()}
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
