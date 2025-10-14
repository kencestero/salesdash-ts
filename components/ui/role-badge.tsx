import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface RoleBadgeProps {
  role: string;
  size?: "sm" | "md" | "lg" | "xl";
  showTooltip?: boolean;
  className?: string;
}

// Role badge mapping
const ROLE_BADGES = {
  owner: {
    image: "/images/BOSS.webp",
    alt: "Owner Badge",
    tooltip: "Owner - Full System Access",
  },
  director: {
    image: "/images/DIR.webp",
    alt: "Director Badge",
    tooltip: "Director - High-Level Management Access",
  },
  manager: {
    image: "/images/SMG.webp",
    alt: "Sales Manager Badge",
    tooltip: "Sales Manager - Team Management Access",
  },
  salesperson: {
    image: "/images/REP.webp",
    alt: "Sales Representative Badge",
    tooltip: "Sales Representative - Standard Access",
  },
  admin: {
    image: "/images/ADMIN.webp",
    alt: "Admin Badge",
    tooltip: "Administrator - System Administration Access",
  },
};

const SIZE_MAP = {
  sm: 40,
  md: 60,
  lg: 80,
  xl: 120,
};

export function RoleBadge({
  role,
  size = "md",
  showTooltip = true,
  className,
}: RoleBadgeProps) {
  const roleKey = role?.toLowerCase() || "salesperson";
  const badge = ROLE_BADGES[roleKey as keyof typeof ROLE_BADGES] || ROLE_BADGES.salesperson;
  const dimension = SIZE_MAP[size];

  const BadgeImage = (
    <div
      className={cn(
        "relative flex items-center justify-center",
        "transition-transform duration-200 hover:scale-110",
        className
      )}
      style={{ width: dimension, height: dimension }}
    >
      <Image
        src={badge.image}
        alt={badge.alt}
        width={dimension}
        height={dimension}
        className="object-contain drop-shadow-lg"
        priority
      />
    </div>
  );

  if (!showTooltip) {
    return BadgeImage;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{BadgeImage}</TooltipTrigger>
        <TooltipContent className="bg-[#09213C] border-[#E96114] text-white">
          <p className="font-semibold">{badge.tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Compact inline badge for headers/navbars
export function RoleBadgeInline({
  role,
  showLabel = false,
}: {
  role: string;
  showLabel?: boolean;
}) {
  const roleKey = role?.toLowerCase() || "salesperson";
  const badge = ROLE_BADGES[roleKey as keyof typeof ROLE_BADGES] || ROLE_BADGES.salesperson;

  return (
    <div className="flex items-center gap-2">
      <Image
        src={badge.image}
        alt={badge.alt}
        width={32}
        height={32}
        className="object-contain drop-shadow-md"
      />
      {showLabel && (
        <span className="text-sm font-semibold text-foreground">
          {roleKey === "owner" ? "Owner" :
           roleKey === "director" ? "Director" :
           roleKey === "manager" ? "Manager" :
           roleKey === "salesperson" ? "Sales Rep" :
           roleKey === "admin" ? "Admin" : "Member"}
        </span>
      )}
    </div>
  );
}