"use client";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { WelcomeHelpDialog } from "@/components/dashboard/WelcomeHelpDialog";

const ProfileInfo = () => {
  const { data: session } = useSession();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(false);

  // Fetch user's uploaded avatar from profile
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

    if (session?.user) {
      fetchAvatar();
    }
  }, [session]);

  // Get initials from name (first 2 letters)
  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Use uploaded avatar if available, otherwise fall back to OAuth image
  const displayAvatar = avatarUrl || session?.user?.image || undefined;

  return (
    <>
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="cursor-pointer">
        <div className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage
              src={displayAvatar}
              alt={session?.user?.name ?? "User"}
              className="object-cover"
            />
            <AvatarFallback className="bg-[#E96114] text-white font-semibold">
              {getInitials(session?.user?.name)}
            </AvatarFallback>
          </Avatar>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 p-0" align="end">
        <DropdownMenuLabel className="flex gap-2 items-center mb-1 p-3">
          <Avatar className="h-9 w-9">
            <AvatarImage
              src={displayAvatar}
              alt={session?.user?.name ?? "User"}
              className="object-cover"
            />
            <AvatarFallback className="bg-[#E96114] text-white font-semibold">
              {getInitials(session?.user?.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="text-sm font-medium text-default-800 capitalize">
              {session?.user?.name ?? "User"}
            </div>
            {session?.user?.email && (
              <div className="text-xs text-default-600 truncate max-w-[150px]">
                {session.user.email}
              </div>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuGroup>
          {[
            {
              name: "profile",
              icon: "heroicons:user",
              href:"/profile"
            },
            {
              name: "Page Access",
              icon: "heroicons:shield-check",
              href:"/user-management"
            },
            {
              name: "Secret Code Instructions",
              icon: "heroicons:key",
              href:"/secret-code-instructions"
            },
            {
              name: "Welcome Help",
              icon: "heroicons:sparkles",
              href: "#",
              onClick: () => setShowWelcomeDialog(true)
            },
          ].map((item, index) => (
            item.onClick ? (
              <DropdownMenuItem
                key={`info-menu-${index}`}
                onSelect={item.onClick}
                className="flex items-center gap-2 text-sm font-medium text-default-600 capitalize px-3 py-1.5 dark:hover:bg-background cursor-pointer"
              >
                <Icon icon={item.icon} className="w-4 h-4" />
                {item.name}
              </DropdownMenuItem>
            ) : (
              <Link
                href={item.href}
                key={`info-menu-${index}`}
                className="cursor-pointer"
              >
                <DropdownMenuItem className="flex items-center gap-2 text-sm font-medium text-default-600 capitalize px-3 py-1.5 dark:hover:bg-background cursor-pointer">
                  <Icon icon={item.icon} className="w-4 h-4" />
                  {item.name}
                </DropdownMenuItem>
              </Link>
            )
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <Link href="/dashboard" className="cursor-pointer">
            <DropdownMenuItem className="flex items-center gap-2 text-sm font-medium text-default-600 capitalize px-3 py-1.5 dark:hover:bg-background cursor-pointer">
              <Icon icon="heroicons:user-group" className="w-4 h-4" />
              team
            </DropdownMenuItem>
          </Link>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="flex items-center gap-2 text-sm font-medium text-default-600 capitalize px-3 py-1.5 dark:hover:bg-background">
              <Icon icon="heroicons:user-plus" className="w-4 h-4" />
              Invite user
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                {[
                  {
                    name: "email",
                  },
                  {
                    name: "message",
                  },
                  {
                    name: "facebook",
                  },
                ].map((item, index) => (
                  <Link
                    href="/dashboard"
                    key={`message-sub-${index}`}
                    className="cursor-pointer"
                  >
                    <DropdownMenuItem className="text-sm font-medium text-default-600 capitalize px-3 py-1.5 dark:hover:bg-background cursor-pointer">
                      {item.name}
                    </DropdownMenuItem>
                  </Link>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          <Link href="/dashboard">
            <DropdownMenuItem className="flex items-center gap-2 text-sm font-medium text-default-600 capitalize px-3 py-1.5 dark:hover:bg-background cursor-pointer">
              <Icon icon="heroicons:variable" className="w-4 h-4" />
              Github
            </DropdownMenuItem>
          </Link>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="flex items-center gap-2 text-sm font-medium text-default-600 capitalize px-3 py-1.5 dark:hover:bg-background cursor-pointer">
              <Icon icon="heroicons:phone" className="w-4 h-4" />
              Support
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                {[
                  {
                    name: "portal",
                  },
                  {
                    name: "slack",
                  },
                  {
                    name: "whatsapp",
                  },
                ].map((item, index) => (
                  <Link href="/dashboard" key={`message-sub-${index}`}>
                    <DropdownMenuItem className="text-sm font-medium text-default-600 capitalize px-3 py-1.5 dark:hover:bg-background cursor-pointer">
                      {item.name}
                    </DropdownMenuItem>
                  </Link>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="mb-0 dark:bg-background" />
        <DropdownMenuItem
          onSelect={() => signOut()}
          className="flex items-center gap-2 text-sm font-medium text-default-600 capitalize my-1 px-3 dark:hover:bg-background cursor-pointer"
        >
          <Icon icon="heroicons:power" className="w-4 h-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>

    {/* Welcome Help Dialog */}
    <WelcomeHelpDialog
      open={showWelcomeDialog}
      onOpenChange={setShowWelcomeDialog}
      manualTrigger
    />
    </>
  );
};
export default ProfileInfo;
