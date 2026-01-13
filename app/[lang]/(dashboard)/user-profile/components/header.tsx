"use client";
import { Breadcrumbs, BreadcrumbItem } from "@/components/ui/breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { Home, Truck, Camera, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";
import User from "@/public/images/avatar/user.png";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { Fragment, useState, useEffect, useRef } from "react";
import { Session } from "next-auth";
import { ImageCropDialog } from "@/components/ui/image-crop-dialog";
import { useToast } from "@/components/ui/use-toast";

const MAX_BANNER_SIZE = 3 * 1024 * 1024; // 3MB
const MAX_BANNER_WIDTH = 2560;
const MAX_BANNER_HEIGHT = 1440;

interface UserProfile {
  phone?: string;
  city?: string;
  zip?: string;
  role?: string;
  avatarUrl?: string;
  coverUrl?: string;
}

interface HeaderProps {
  session: Session | null;
  userProfile: UserProfile | null;
}

const Header = ({ session, userProfile }: HeaderProps) => {
  const location = usePathname();
  const { toast } = useToast();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // Fetch avatar and banner from profile API
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/user/profile');
        if (response.ok) {
          const data = await response.json();
          if (data.profile?.avatarUrl) {
            setAvatarUrl(data.profile.avatarUrl);
          }
          if (data.profile?.coverUrl) {
            setBannerUrl(data.profile.coverUrl);
          }
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      }
    };
    fetchProfile();
  }, []);

  // Use real user data or fallback to defaults
  const userName = session?.user?.name || "User";
  const userImage = avatarUrl || session?.user?.image || User;
  const userRole = userProfile?.role || "Sales Representative";

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleBannerSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPG, PNG, WebP)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 3MB)
    if (file.size > MAX_BANNER_SIZE) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 3MB",
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
      formData.append('file', blob, 'banner.jpg');

      const response = await fetch('/api/upload-banner', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      const newBannerUrl = data.url;

      // Update local state
      setBannerUrl(newBannerUrl);

      // Update profile in database
      await fetch('/api/user/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coverUrl: newBannerUrl }),
      });

      toast({
        title: "Banner updated!",
        description: "Your profile banner has been updated successfully",
        variant: "default",
      });
    } catch (error) {
      console.error('Banner upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload banner. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setSelectedImage(null);
    }
  };

  return (
    <Fragment>
      <Breadcrumbs>
        <BreadcrumbItem>
          <Link href="/en/dashboard">
            <Home className="h-4 w-4" />
          </Link>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <Truck className="h-4 w-4 inline mr-1" />
          Sales Hub
        </BreadcrumbItem>
        <BreadcrumbItem>My Profile</BreadcrumbItem>
      </Breadcrumbs>
      <Card className="mt-6 rounded-t-2xl overflow-hidden">
        <CardContent className="p-0">
          {/* Banner section with optional custom image */}
          <div
            className="relative h-[200px] lg:h-[296px] rounded-t-2xl w-full"
            style={{
              background: bannerUrl
                ? undefined
                : "linear-gradient(135deg, #09213C 0%, #0d2d52 50%, #E96114 100%)"
            }}
          >
            {/* Custom banner image */}
            {bannerUrl && (
              <Image
                src={bannerUrl}
                alt="Profile banner"
                fill
                className="object-cover"
                priority
              />
            )}

            {/* Decorative overlay pattern (only shown when no custom banner) */}
            {!bannerUrl && (
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-4 right-4 text-white/20">
                  <Truck className="w-32 h-32 lg:w-48 lg:h-48" />
                </div>
                <div className="absolute bottom-20 left-1/3 text-white/10">
                  <Truck className="w-24 h-24" />
                </div>
              </div>
            )}

            {/* Gradient overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

            {/* Banner upload button - positioned at bottom right */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute bottom-5 right-6 rounded px-5 hidden lg:flex bg-black/30 hover:bg-black/50 text-white backdrop-blur-sm border border-white/30 z-10"
              onClick={() => bannerInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Camera className="w-4 h-4 mr-2" />
              )}
              {uploading ? "Uploading..." : "Change Banner"}
            </Button>
            <input
              ref={bannerInputRef}
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleBannerSelect}
              disabled={uploading}
            />

            {/* User info section */}
            <div className="flex items-center gap-4 absolute ltr:left-10 rtl:right-10 -bottom-2 lg:-bottom-8">
              <div className="relative">
                {typeof userImage === 'string' ? (
                  <Image
                    src={userImage}
                    alt={userName}
                    width={128}
                    height={128}
                    className="h-20 w-20 lg:w-32 lg:h-32 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="h-20 w-20 lg:w-32 lg:h-32 rounded-full bg-[#E96114] border-4 border-white shadow-lg flex items-center justify-center">
                    <span className="text-2xl lg:text-4xl font-bold text-white">
                      {getInitials(userName)}
                    </span>
                  </div>
                )}
                {/* Online indicator */}
                <div className="absolute bottom-1 right-1 lg:bottom-2 lg:right-2 w-4 h-4 lg:w-5 lg:h-5 bg-green-500 rounded-full border-2 border-white" />
              </div>
              <div>
                <div className="text-xl lg:text-2xl font-semibold text-white mb-1 drop-shadow-lg">{userName}</div>
                <div className="text-xs lg:text-sm font-medium text-white/90 pb-1.5 capitalize drop-shadow-md">
                  {userRole} • Remotive Logistics
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap justify-end gap-4 lg:gap-8 pt-7 lg:pt-5 pb-4 px-6">
            {
              [
                {
                  title: "Overview",
                  link: "/en/user-profile"
                },
                {
                  title: "Documents",
                  link: "/en/user-profile/documents"
                },
                {
                  title: "Activity",
                  link: "/en/user-profile/activity"
                },
                {
                  title: "Settings",
                  link: "/en/user-profile/settings"
                },
              ].map((item, index) => (
                <Link
                  key={`user-profile-link-${index}`}
                  href={item.link}
                  className={cn("text-sm font-semibold text-default-500 hover:text-primary relative lg:before:absolute before:-bottom-4 before:left-0 before:w-full lg:before:h-[2px] before:bg-transparent transition-colors", {
                    "text-[#E96114] lg:before:bg-[#E96114]": location === item.link || location === item.link.replace("/en", "")
                  })}
                >{item.title}</Link>
              ))
            }
          </div>

        </CardContent>
      </Card>

      {/* Banner Crop Dialog */}
      <ImageCropDialog
        open={cropDialogOpen}
        onClose={() => {
          setCropDialogOpen(false);
          setSelectedImage(null);
        }}
        imageSrc={selectedImage || ''}
        aspect={16 / 9}
        circularCrop={false}
        maxWidth={MAX_BANNER_WIDTH}
        maxHeight={MAX_BANNER_HEIGHT}
        onCropComplete={handleCropComplete}
        title="Crop Profile Banner"
      />
    </Fragment>
  );
};

export default Header;
