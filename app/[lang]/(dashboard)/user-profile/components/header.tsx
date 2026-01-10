"use client";
import { Breadcrumbs, BreadcrumbItem } from "@/components/ui/breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { Home, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";
import User from "@/public/images/avatar/user.png";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { Fragment, useState, useEffect } from "react";
import { Session } from "next-auth";

interface UserProfile {
  phone?: string;
  city?: string;
  zip?: string;
  role?: string;
  avatarUrl?: string;
}

interface HeaderProps {
  session: Session | null;
  userProfile: UserProfile | null;
}

const Header = ({ session, userProfile }: HeaderProps) => {
  const location = usePathname();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Fetch avatar from profile API
  useEffect(() => {
    const fetchAvatar = async () => {
      try {
        const response = await fetch('/api/user/profile');
        if (response.ok) {
          const data = await response.json();
          if (data.profile?.avatarUrl) {
            setAvatarUrl(data.profile.avatarUrl);
          }
        }
      } catch (error) {
        console.error('Failed to fetch profile avatar:', error);
      }
    };
    fetchAvatar();
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
          {/* Trailer-themed gradient header */}
          <div
            className="relative h-[200px] lg:h-[296px] rounded-t-2xl w-full bg-gradient-to-br from-[#09213C] via-[#0d2d52] to-[#E96114]"
          >
            {/* Decorative overlay pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-4 right-4 text-white/20">
                <Truck className="w-32 h-32 lg:w-48 lg:h-48" />
              </div>
              <div className="absolute bottom-20 left-1/3 text-white/10">
                <Truck className="w-24 h-24" />
              </div>
            </div>

            {/* Gradient overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

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
            <Button asChild className="absolute bottom-5 ltr:right-6 rtl:left-6 rounded px-5 hidden lg:flex bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30" size="sm">
              <Link href="/en/user-profile/settings">
                <Icon className="w-4 h-4 ltr:mr-1 rtl:ml-1" icon="heroicons:pencil-square" />
                Edit Profile
              </Link>
            </Button>
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
    </Fragment>
  );
};

export default Header;
