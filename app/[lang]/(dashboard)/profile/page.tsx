"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { updateUserProfile } from "./actions";
import { useToast } from "@/components/ui/use-toast";
import Image from "next/image";

export default function ProfilePage() {
  const { data: session } = useSession();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    preferredName: "",
    zipCode: "",
    about: "",
  });
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    if (!session?.user?.email) {
      setLoadingProfile(false);
      return;
    }

    fetch("/api/user/profile")
      .then((res) => res.json())
      .then((data) => {
        setUserProfile(data);
        const name = data.name || "";
        const nameParts = name.split(" ");
        setFormData({
          firstName: nameParts[0] || "",
          middleName: nameParts.length > 2 ? nameParts.slice(1, -1).join(" ") : "",
          lastName: nameParts[nameParts.length - 1] || "",
          preferredName: data.profile?.preferredName || "",
          zipCode: data.profile?.zipcode || "",
          about: data.profile?.about || "",
        });
        setLoadingProfile(false);
      })
      .catch((err) => {
        console.error("Failed to fetch profile:", err);
        setLoadingProfile(false);
      });
  }, [session]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast({
        title: "Error",
        description: "First and Last name are required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const fullName = [formData.firstName, formData.middleName, formData.lastName]
      .filter(Boolean)
      .join(" ");
    const result = await updateUserProfile({ ...formData, name: fullName });

    if (result?.success) {
      toast({ title: "Success", description: "Profile updated successfully!" });
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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-muted-foreground">Loading profile...</div>
      </div>
    );
  }

  const managerName = userProfile?.manager?.name || "Not assigned";

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Your Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account information
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-default-100 p-6 rounded-md shadow">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Profile Picture
            </h2>
            <div className="flex flex-col items-center gap-4">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-default-200">
                <Image
                  src="/images/loginsidepic.jpg"
                  alt="Profile"
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Image upload coming soon...
              </p>
            </div>
          </div>

          <div className="bg-default-100 p-6 rounded-md shadow space-y-3">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Quick Info
            </h2>
            <div className="space-y-3">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Rep Code</div>
                <div className="text-sm font-mono text-primary font-semibold">
                  {userProfile?.profile?.repCode || "—"}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Role</div>
                <div className="text-sm text-foreground capitalize">
                  {userProfile?.profile?.role || "—"}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Manager</div>
                <div className="text-sm text-foreground">{managerName}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Status</div>
                <div className="inline-flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-success"></span>
                  <span className="text-sm text-success capitalize">
                    {userProfile?.profile?.accountStatus || "active"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-default-100 p-6 rounded-md shadow space-y-4">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Personal Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  className="w-full rounded-md border border-border bg-default-200 px-4 py-2.5 text-sm text-foreground placeholder-muted-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  value={formData.firstName}
                  onChange={(e) => handleChange("firstName", e.target.value)}
                  placeholder="Enter first name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Middle Name
                </label>
                <input
                  type="text"
                  className="w-full rounded-md border border-border bg-default-200 px-4 py-2.5 text-sm text-foreground placeholder-muted-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  value={formData.middleName}
                  onChange={(e) => handleChange("middleName", e.target.value)}
                  placeholder="Enter middle name (optional)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  className="w-full rounded-md border border-border bg-default-200 px-4 py-2.5 text-sm text-foreground placeholder-muted-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  value={formData.lastName}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                  placeholder="Enter last name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Preferred Name
                </label>
                <input
                  type="text"
                  className="w-full rounded-md border border-border bg-default-200 px-4 py-2.5 text-sm text-foreground placeholder-muted-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  value={formData.preferredName}
                  onChange={(e) => handleChange("preferredName", e.target.value)}
                  placeholder="What should we call you?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Zip Code
                </label>
                <input
                  type="text"
                  className="w-full rounded-md border border-border bg-default-200 px-4 py-2.5 text-sm text-foreground placeholder-muted-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  value={formData.zipCode}
                  onChange={(e) => handleChange("zipCode", e.target.value)}
                  placeholder="Enter zip code"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                About
              </label>
              <textarea
                className="w-full rounded-md border border-border bg-default-200 px-4 py-2.5 text-sm text-foreground placeholder-muted-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all min-h-[100px]"
                value={formData.about}
                onChange={(e) => handleChange("about", e.target.value)}
                placeholder="Keep this professional. Inappropriate content may result in suspension or removal."
              />
            </div>

            <div>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60 transition-all"
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
          </div>

          <div className="bg-default-100 p-6 rounded-md shadow space-y-4">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Account Information
            </h2>

            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:justify-between py-3 border-b border-border gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Email Address
                </span>
                <span className="text-sm text-foreground">
                  {userProfile?.email || "—"}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:justify-between py-3 border-b border-border gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Rep Code
                </span>
                <span className="text-sm font-mono text-primary font-semibold">
                  {userProfile?.profile?.repCode || "—"}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:justify-between py-3 border-b border-border gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Account Role
                </span>
                <span className="text-sm text-foreground capitalize">
                  {userProfile?.profile?.role || "—"}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:justify-between py-3 border-b border-border gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Account Type
                </span>
                <span className="text-sm text-foreground capitalize">
                  {userProfile?.profile?.status || "employee"}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:justify-between py-3 gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Account Status
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-success"></span>
                  <span className="text-sm text-success capitalize">
                    {userProfile?.profile?.accountStatus || "active"}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
