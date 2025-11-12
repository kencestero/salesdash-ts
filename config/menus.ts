import { Search, Zap, Star, RefreshCw, Calculator, GraduationCap } from "lucide-react";
import {
  Application,
  Chart,
  Components,
  DashBoard,
  Stacks2,
  Map,
  Grid,
  Files,
  Graph,
  ClipBoard,
  Cart,
  Envelope,
  Messages,
  Monitor,
  ListFill,
  Calendar,
  Flag,
  Book,
  Note,
  ClipBoard2,
  Note2,
  Note3,
  BarLeft,
  BarTop,
  ChartBar,
  PretentionChartLine,
  PretentionChartLine2,
  Google,
  Pointer,
  Map2,
  MenuBar,
  Icons,
  ChartArea,
  Building,
  Building2,
  Sheild,
  Error,
  Diamond,
  Heroicon,
  LucideIcon,
  CustomIcon,
  Mail,
  Sheild as Shield,
  Users,
} from "@/components/svg";


export interface MenuItemProps {
  title: string;
  icon: any;
  href?: string;
  child?: MenuItemProps[];
  megaMenu?: MenuItemProps[];
  multi_menu? : MenuItemProps[]
  nested?: MenuItemProps[]
  isHeader?: boolean;
  disabled?: boolean;
  onClick: () => void;


}

export const menusConfig = {
  mainNav: [
    {
      title: "Dashboard",
      icon: DashBoard,
      child: [
        {
          title: "Analytics",
          href: "/dashboard",
          icon: Graph,
        },
      ],
    },
    {
      title: "Application",
      icon: Application,
      child: [
        {
          title: "chat",
          icon: Messages,
          href: "/chat",
        },
        {
          title: "Messages",
          icon: Messages,
          href: "/messages",
        },
        {
          title: "email",
          icon: Envelope,
          href: "/email",
        },
        {
          title: "kanban",
          icon: Monitor,
          href: "/kanban",
        },
        {
          title: "todo",
          icon: ListFill,
          href: "/todo",
        },
        {
          title: "projects",
          icon: ClipBoard,
          href: "/projects",
        },
        {
          title: "calendar",
          icon: Calendar,
          href: "/calendar",
        },
      ],
    },
  ],

  sidebarNav: {
    modern: [
      {
        title: "Dashboard",
        icon: DashBoard,
        href: "/dashboard",
      },
      {
        title: "CRM",
        icon: ChartBar,
        child: [
          {
            title: "CRM Dashboard",
            icon: ChartBar,
            href: "/crm/dashboard",
          },
          {
            title: "Pipeline Board",
            icon: ClipBoard,
            href: "/crm/pipeline",
          },
          {
            title: "Duplicate Manager",
            icon: Users,
            href: "/crm/duplicates",
          },
          {
            title: "Advanced Search",
            icon: Search,
            href: "/crm/search",
          },
          {
            title: "Bulk Actions",
            icon: Stacks2,
            href: "/crm/bulk-actions",
          },
          {
            title: "Quick Actions",
            icon: Zap,
            href: "/crm/quick-actions",
          },
          {
            title: "Lead Scoring",
            icon: Star,
            href: "/crm/lead-scoring",
          },
          {
            title: "Automated Follow-ups",
            icon: Calendar,
            href: "/crm/follow-ups",
          },
          {
            title: "Google Sheets Sync",
            icon: RefreshCw,
            href: "/crm/sheets-sync",
          },
        ],
      },
      {
        title: "SALESTOOLS",
        icon: Calculator,
        child: [
          {
            title: "Live Inventory",
            icon: Cart,
            href: "/inventory",
          },
          {
            title: "Finance Calculator",
            icon: Calculator,
            href: "/finance/compare",
          },
          {
            title: "Credit Application",
            icon: Files,
            href: "/credit",
          },
        ],
      },
      {
        title: "APPLICATION",
        icon: Application,
        child: [
          {
            title: "User Management",
            icon: Users,
            href: "/user-management",
          },
          {
            title: "Chat",
            icon: Messages,
            href: "/chat",
          },
          {
            title: "Calendar",
            icon: Calendar,
            href: "/calendar",
          },
        ],
      },
      {
        title: "Maps",
        icon: Map,
        href: "/map-unovis-advance",
      },
      {
        title: "ANALYTICS",
        icon: GraduationCap,
        child: [
          {
            title: "MJ Sales Academy (Coming Soon)",
            icon: GraduationCap,
            href: "#",
            disabled: true,
          },
        ],
      },
    ],
    classic: [
      {
        title: "MENU",
        isHeader: true,
      },
      {
        title: "Dashboard",
        icon: DashBoard,
        href: "/dashboard",
      },
      {
        title: "CRM",
        isHeader: true,
      },
      {
        title: "CRM Dashboard",
        icon: ChartBar,
        href: "/crm/dashboard",
      },
      {
        title: "Pipeline Board",
        icon: ClipBoard,
        href: "/crm/pipeline",
      },
      {
        title: "Duplicate Manager",
        icon: Users,
        href: "/crm/duplicates",
      },
      {
        title: "Advanced Search",
        icon: Search,
        href: "/crm/search",
      },
      {
        title: "Bulk Actions",
        icon: Stacks2,
        href: "/crm/bulk-actions",
      },
      {
        title: "Quick Actions",
        icon: Zap,
        href: "/crm/quick-actions",
      },
      {
        title: "Lead Scoring",
        icon: Star,
        href: "/crm/lead-scoring",
      },
      {
        title: "Automated Follow-ups",
        icon: Calendar,
        href: "/crm/follow-ups",
      },
      {
        title: "Google Sheets Sync",
        icon: RefreshCw,
        href: "/crm/sheets-sync",
      },
      {
        title: "SALESTOOLS",
        isHeader: true,
      },
      {
        title: "Live Inventory",
        icon: Cart,
        href: "/inventory",
      },
      {
        title: "Finance Calculator",
        icon: Calculator,
        href: "/finance/compare",
      },
      {
        title: "Credit Application",
        icon: Files,
        href: "/credit",
      },
      {
        title: "APPLICATION",
        isHeader: true,
      },
      {
        title: "User Management",
        icon: Users,
        href: "/user-management",
      },
      {
        title: "Chat",
        icon: Messages,
        href: "/chat",
      },
      {
        title: "Calendar",
        icon: Calendar,
        href: "/calendar",
      },
      {
        title: "PAGES",
        isHeader: true,
      },
      {
        title: "Maps",
        icon: Map,
        href: "/map-unovis-advance",
      },
      {
        title: "ANALYTICS",
        isHeader: true,
      },
      {
        title: "MJ Sales Academy (Coming Soon)",
        icon: GraduationCap,
        href: "#",
        disabled: true,
      },
    ],
  },
};

export type ModernNavType = (typeof menusConfig.sidebarNav.modern)[number];
export type ClassicNavType = (typeof menusConfig.sidebarNav.classic)[number];
export type MainNavType = (typeof menusConfig.mainNav)[number];
