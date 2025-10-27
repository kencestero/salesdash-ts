"use client";

import ChatMessageList from "./ChatMessageList";
import ChatInputBox from "./ChatInputBox";

export default function ChatThreadView({ thread }: { thread: any }) {
  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-neutral-800 p-4 bg-neutral-900/30">
        <h2 className="text-lg font-semibold text-white">
          {thread.subject || "(No Subject)"}
        </h2>
        <p className="text-xs text-neutral-500">
          {thread.participants?.length || 0} participant(s)
        </p>
      </div>
      <div className="flex-1 overflow-y-auto">
        <ChatMessageList threadId={thread.id} />
      </div>
      <div className="border-t border-neutral-800 p-4 bg-neutral-900/30">
        <ChatInputBox threadId={thread.id} />
      </div>
    </div>
  );
}
