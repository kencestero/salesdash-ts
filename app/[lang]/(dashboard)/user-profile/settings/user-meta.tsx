"use client"
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icon } from "@iconify/react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { RoleBadge } from "@/components/ui/role-badge";

const UserMeta = () => {
  const { data: session, update } = useSession();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPG, PNG, GIF, WebP)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploading(true);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to API
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload-avatar', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();

      // Update session with new avatar URL
      await update({
        ...session,
        user: {
          ...session?.user,
          image: data.url,
        },
      });

      toast({
        title: "Avatar updated!",
        description: "Your profile picture has been updated successfully",
        variant: "default",
      });
    } catch (error) {
      console.error('Avatar upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload avatar. Please try again.",
        variant: "destructive",
      });
      setPreviewUrl(null);
    } finally {
      setUploading(false);
    }
  };

  const avatarUrl = previewUrl || session?.user?.image || '/images/avatar/avatar-3.jpg';
  const userName = session?.user?.name || "User";
  const userRole = (session?.user as any)?.role || "salesperson";

  return (
    <Card>
      <CardContent className="p-6 flex flex-col items-center">
        <div className="w-[124px] h-[124px] relative rounded-full">
          <Image
            src={avatarUrl}
            alt="avatar"
            width={124}
            height={124}
            className="w-full h-full object-cover rounded-full"
            priority={true}
          />
          <Button asChild
            size="icon"
            className="h-8 w-8 rounded-full cursor-pointer absolute bottom-0 right-0"
            disabled={uploading}
          >
            <Label
              htmlFor="avatar"
              className={uploading ? "cursor-wait opacity-50" : "cursor-pointer"}
            >
              {uploading ? (
                <Icon className="w-5 h-5 text-primary-foreground animate-spin" icon="heroicons:arrow-path" />
              ) : (
                <Icon className="w-5 h-5 text-primary-foreground" icon="heroicons:pencil-square" />
              )}
            </Label>
          </Button>
          <Input
            type="file"
            className="hidden"
            id="avatar"
            accept="image/*"
            onChange={handleAvatarChange}
            disabled={uploading}
          />
        </div>
        <div className="mt-4 text-xl font-semibold text-default-900">{userName}</div>

        {/* Beautiful Role Badge */}
        <div className="mt-4">
          <RoleBadge role={userRole} size="lg" showTooltip={true} />
        </div>
      </CardContent>
    </Card>
  );
};

export default UserMeta;