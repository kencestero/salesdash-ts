"use client"
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icon } from "@iconify/react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { RoleBadge } from "@/components/ui/role-badge";
import { ImageCropDialog } from "@/components/ui/image-crop-dialog";

const MAX_AVATAR_SIZE = 2 * 1024 * 1024; // 2MB
const MAX_AVATAR_DIMENSION = 1920; // 1920px max

const UserMeta = () => {
  const { data: session, update } = useSession();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>('/images/avatar/avatar-3.jpg');
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>("salesperson");

  // Fetch profile data on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/user/profile');
        if (response.ok) {
          const data = await response.json();
          if (data.profile?.avatarUrl) {
            setAvatarUrl(data.profile.avatarUrl);
          } else if (data.user?.image) {
            setAvatarUrl(data.user.image);
          } else if (session?.user?.image) {
            setAvatarUrl(session.user.image);
          }
          if (data.profile?.role) {
            setUserRole(data.profile.role);
          }
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      }
    };
    fetchProfile();
  }, [session?.user?.image]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    // Validate file size (max 2MB)
    if (file.size > MAX_AVATAR_SIZE) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 2MB",
        variant: "destructive",
      });
      return;
    }

    // Create data URL for cropping
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result as string);
      setCropDialogOpen(true);
    };
    reader.readAsDataURL(file);

    // Reset input
    e.target.value = '';
  };

  const handleCropComplete = async (blob: Blob) => {
    setCropDialogOpen(false);
    setUploading(true);

    try {
      // Create FormData with the cropped image
      const formData = new FormData();
      formData.append('file', blob, 'avatar.jpg');

      const response = await fetch('/api/upload-avatar', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      const newAvatarUrl = data.url;

      // Update local state
      setAvatarUrl(newAvatarUrl);

      // Update profile in database
      await fetch('/api/user/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatarUrl: newAvatarUrl }),
      });

      // Update session with new avatar URL
      await update({
        ...session,
        user: {
          ...session?.user,
          image: newAvatarUrl,
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
    } finally {
      setUploading(false);
      setSelectedImage(null);
    }
  };

  const userName = session?.user?.name || "User";

  return (
    <>
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
              onChange={handleFileSelect}
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

      {/* Image Crop Dialog */}
      <ImageCropDialog
        open={cropDialogOpen}
        onClose={() => {
          setCropDialogOpen(false);
          setSelectedImage(null);
        }}
        imageSrc={selectedImage || ''}
        aspect={1}
        circularCrop={true}
        maxWidth={MAX_AVATAR_DIMENSION}
        maxHeight={MAX_AVATAR_DIMENSION}
        onCropComplete={handleCropComplete}
        title="Crop Profile Picture"
      />
    </>
  );
};

export default UserMeta;
