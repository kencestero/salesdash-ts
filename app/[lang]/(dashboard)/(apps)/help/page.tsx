"use client";

import { useState } from "react";
import { Search } from "lucide-react";

const categories = [
  { id: "request-tool", name: "Request Tool", icon: "🛠️" },
  { id: "crm", name: "CRM & Customers", icon: "👥" },
  { id: "inventory", name: "Inventory", icon: "📦" },
  { id: "finance", name: "Finance Calculator", icon: "💰" },
  { id: "rep-codes", name: "Rep Codes & Tracking", icon: "🏷️" },
  { id: "general", name: "General", icon: "📚" },
];

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white">Help Center</h1>
        <p className="mt-2 text-neutral-400">
          Find answers to common questions and learn how to use SalesDash
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          placeholder="Search for help articles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border border-neutral-700 bg-neutral-900 py-4 pl-12 pr-4 text-neutral-100 placeholder-neutral-500 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
        />
      </div>

      {/* Categories Grid */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-white">Browse by Category</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <button
              key={category.id}
              className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 text-left transition hover:border-orange-500/50 hover:bg-neutral-900"
            >
              <div className="mb-2 text-3xl">{category.icon}</div>
              <h3 className="font-semibold text-white">{category.name}</h3>
              <p className="mt-1 text-sm text-neutral-400">Coming soon...</p>
            </button>
          ))}
        </div>
      </div>

      {/* Popular Articles (Placeholder) */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-white">Popular Articles</h2>
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-8 text-center">
          <p className="text-neutral-400">
            No articles yet. Articles will appear here once they're added by admins.
          </p>
        </div>
      </div>
    </div>
  );
}
