"use client";

import { useEffect, useState } from "react";

export default function ChatMessageList({ threadId }: { threadId: string }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/chat/messages?threadId=${threadId}`)
      .then((res) => res.json())
      .then((data) => {
        setMessages(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load messages:", err);
        setLoading(false);
      });
  }, [threadId]);

  if (loading) {
    return (
      <div className="p-4 text-center text-neutral-500 text-sm">
        Loading messages...
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3">
      {messages.map((msg: any) => (
        <div
          key={msg.id}
          className="bg-neutral-900/50 p-3 rounded-lg border border-neutral-800"
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-orange-400">
              {msg.sender?.name || "Unknown"}
            </span>
            <span className="text-xs text-neutral-500">
              {new Date(msg.createdAt).toLocaleString()}
            </span>
          </div>
          <div className="text-sm text-neutral-100 whitespace-pre-wrap">
            {msg.body}
          </div>
        </div>
      ))}
      {messages.length === 0 && (
        <div className="p-6 text-center text-neutral-500 text-sm">
          No messages yet
        </div>
      )}
    </div>
  );
}
