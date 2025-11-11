"use client";

import { useState } from "react";
import ChatThreadList from "./ChatThreadList";
import ChatThreadView from "./ChatThreadView";

export default function ChatDashboard() {
  const [selectedThread, setSelectedThread] = useState(null);

  return (
    <div className="grid grid-cols-3 h-[calc(100vh-200px)]">
      <ChatThreadList onSelect={setSelectedThread} selected={selectedThread} />
      <div className="col-span-2 bg-neutral-950">
        {selectedThread ? (
          <ChatThreadView thread={selectedThread} />
        ) : (
          <div className="p-6 text-neutral-400">Select a conversation</div>
        )}
      </div>
    </div>
  );
}
