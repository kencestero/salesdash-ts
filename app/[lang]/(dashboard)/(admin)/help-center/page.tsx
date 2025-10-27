"use client";

import { Plus } from "lucide-react";

export default function AdminHelpCenterPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Help Center Management</h1>
          <p className="text-sm text-neutral-400">
            Create and manage help articles for your team
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white ring-1 ring-orange-500/40 hover:bg-orange-500">
          <Plus className="h-4 w-4" />
          New Article
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4">
          <p className="text-sm text-neutral-400">Total Articles</p>
          <p className="mt-1 text-2xl font-bold text-white">0</p>
        </div>
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4">
          <p className="text-sm text-neutral-400">Published</p>
          <p className="mt-1 text-2xl font-bold text-green-400">0</p>
        </div>
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4">
          <p className="text-sm text-neutral-400">Total Views</p>
          <p className="mt-1 text-2xl font-bold text-blue-400">0</p>
        </div>
      </div>

      {/* Articles List (Placeholder) */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/50">
        <div className="border-b border-neutral-800 p-4">
          <h2 className="font-semibold text-white">Articles</h2>
        </div>
        <div className="p-8 text-center">
          <p className="text-neutral-400">
            No articles yet. Click "New Article" to create your first help article.
          </p>
        </div>
      </div>

      {/* Coming Soon Notice */}
      <div className="rounded-xl border border-orange-500/30 bg-orange-500/10 p-4">
        <h3 className="font-semibold text-orange-400">Shell Created ✅</h3>
        <p className="mt-1 text-sm text-neutral-300">
          This is the help center management shell. Full functionality (create, edit, delete articles) will be added when you're ready to populate content.
        </p>
      </div>
    </div>
  );
}
