"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { updateUserName } from "./actions";
import { useToast } from "@/components/ui/use-toast";

export default function ProfilePage() {
  const { data: session } = useSession();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Fetch user profile on mount
  useEffect(() => {
    if (!session?.user?.email) {
      setLoadingProfile(false);
      return;
    }

    fetch("/api/user/profile")
      .then((res) => res.json())
      .then((data) => {
        setUserProfile(data);
        setName(data.name || "");
        setLoadingProfile(false);
      })
      .catch((err) => {
        console.error("Failed to fetch profile:", err);
        setLoadingProfile(false);
      });
  }, [session]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const result = await updateUserName(name.trim());

    if (result?.success) {
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
    } else {
      toast({
        title: "Error",
        description: result?.error || "Something went wrong",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  if (loadingProfile) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-neutral-400">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Your Profile</h1>
        <p className="text-sm text-neutral-400 mt-1">
          Manage your account information
        </p>
      </div>

      {/* Editable Name Field */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-neutral-300">
            Full Name
          </label>
          <input
            type="text"
            className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 placeholder-neutral-500 outline-none focus:border-neutral-500"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your full name"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="inline-flex items-center justify-center rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white ring-1 ring-orange-500/40 hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-4 w-4 animate-spin"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  opacity="0.25"
                />
                <path
                  d="M22 12a10 10 0 0 1-10 10"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                />
              </svg>
              Saving...
            </span>
          ) : (
            "Save Changes"
          )}
        </button>
      </div>

      {/* Read-Only Info */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 space-y-3">
        <h2 className="text-lg font-semibold text-white">Account Information</h2>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between py-2 border-b border-neutral-800">
            <span className="text-neutral-400">Email</span>
            <span className="text-neutral-100">{userProfile?.email || "—"}</span>
          </div>

          <div className="flex justify-between py-2 border-b border-neutral-800">
            <span className="text-neutral-400">Rep Code</span>
            <span className="text-orange-400 font-mono">
              {userProfile?.profile?.repCode || "—"}
            </span>
          </div>

          <div className="flex justify-between py-2 border-b border-neutral-800">
            <span className="text-neutral-400">Role</span>
            <span className="text-neutral-100 capitalize">
              {userProfile?.profile?.role || "—"}
            </span>
          </div>

          <div className="flex justify-between py-2">
            <span className="text-neutral-400">Status</span>
            <span className="text-emerald-400">
              {userProfile?.profile?.accountStatus || "active"}
            </span>
          </div>
        </div>
      </div>

      {/* Optional: Profile Image Upload Placeholder */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
        <h2 className="text-lg font-semibold text-white mb-3">Profile Picture</h2>
        <p className="text-sm text-neutral-400 mb-4">
          Profile image upload coming soon...
        </p>
        <div className="flex items-center justify-center w-24 h-24 rounded-full bg-neutral-800 text-neutral-400 text-2xl font-semibold">
          {name.charAt(0).toUpperCase() || "?"}
        </div>
      </div>
    </div>
  );
}
