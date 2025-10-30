"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { UploadButton } from "@uploadthing/react";
import { getProfile, updateProfile, type ProfileData } from "@/app/(profile)/actions";
import type { OurFileRouter } from "@/app/api/uploadthing/core";
import { toast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<ProfileData & { email?: string }>({});
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
  const [previewCover, setPreviewCover] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/en/auth/login");
    }

    if (status === "authenticated") {
      loadProfile();
    }
  }, [status, router]);

  const loadProfile = async () => {
    try {
      const data = await getProfile();
      setProfile(data);
      setPreviewAvatar(data.avatarUrl || null);
      setPreviewCover(data.coverUrl || null);
    } catch (error) {
      console.error("Failed to load profile:", error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({
        firstName: profile.firstName,
        lastName: profile.lastName,
        preferredName: profile.preferredName,
        phone: profile.phone,
        zipcode: profile.zipcode,
        city: profile.city,
        about: profile.about,
        ...(previewAvatar && { avatarUrl: previewAvatar }),
        ...(previewCover && { coverUrl: previewCover }),
      });

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading || status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Cover Image */}
        <Card className="rounded-2xl overflow-hidden">
          <div className="relative h-48 bg-gradient-to-r from-primary/20 to-primary/10">
            {previewCover && (
              <img
                src={previewCover}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute bottom-4 right-4">
              <UploadButton<OurFileRouter, "coverUploader">
                endpoint="coverUploader"
                onClientUploadComplete={(res) => {
                  if (res?.[0]?.url) {
                    setPreviewCover(res[0].url);
                    toast({
                      title: "Success",
                      description: "Cover image uploaded! Click Save to apply.",
                    });
                  }
                }}
                onUploadError={(error: Error) => {
                  toast({
                    title: "Upload failed",
                    description: error.message,
                    variant: "destructive",
                  });
                }}
                className="ut-button:bg-primary ut-button:text-primary-foreground ut-button:ut-uploading:bg-primary/50"
              />
            </div>
          </div>

          {/* Avatar */}
          <div className="relative px-6 -mt-16">
            <div className="relative w-32 h-32 rounded-full border-4 border-background bg-muted overflow-hidden">
              {previewAvatar ? (
                <img
                  src={previewAvatar}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-4xl font-bold text-muted-foreground">
                  {profile.firstName?.[0] || profile.email?.[0] || "?"}
                </div>
              )}
            </div>
            <div className="absolute left-28 top-20">
              <UploadButton<OurFileRouter, "avatarUploader">
                endpoint="avatarUploader"
                onClientUploadComplete={(res) => {
                  if (res?.[0]?.url) {
                    setPreviewAvatar(res[0].url);
                    toast({
                      title: "Success",
                      description: "Avatar uploaded! Click Save to apply.",
                    });
                  }
                }}
                onUploadError={(error: Error) => {
                  toast({
                    title: "Upload failed",
                    description: error.message,
                    variant: "destructive",
                  });
                }}
                className="ut-button:bg-primary ut-button:text-primary-foreground ut-button:ut-uploading:bg-primary/50 ut-button:text-xs ut-button:py-1 ut-button:px-3"
              />
            </div>
          </div>

          <CardContent className="pt-16 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">First Name</label>
                <Input
                  value={profile.firstName || ""}
                  onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                  placeholder="Enter first name"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Last Name</label>
                <Input
                  value={profile.lastName || ""}
                  onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                  placeholder="Enter last name"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Preferred Name</label>
                <Input
                  value={profile.preferredName || ""}
                  onChange={(e) => setProfile({ ...profile, preferredName: e.target.value })}
                  placeholder="Nickname or preferred name"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Phone</label>
                <Input
                  value={profile.phone || ""}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  placeholder="(555) 123-4567"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Zipcode</label>
                <Input
                  value={profile.zipcode || ""}
                  onChange={(e) => setProfile({ ...profile, zipcode: e.target.value })}
                  placeholder="12345"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">City</label>
                <Input
                  value={profile.city || ""}
                  onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                  placeholder="Enter city"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">About</label>
              <textarea
                value={profile.about || ""}
                onChange={(e) => setProfile({ ...profile, about: e.target.value })}
                placeholder="Tell us about yourself..."
                className="w-full min-h-[120px] rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>

            <div className="flex justify-end gap-4">
              <Button
                variant="outline"
                onClick={() => router.back()}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Profile"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Email Display */}
        <Card className="rounded-2xl">
          <CardHeader>
            <h3 className="text-lg font-semibold">Account Information</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <div className="text-sm">{profile.email}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
