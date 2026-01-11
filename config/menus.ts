import { DollarSign, TrendingUp } from "lucide-react";
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
          title: "task",
          icon: ListFill,
          href: "/task",
        },
        {
          title: "calendar",
          icon: Calendar,
          href: "/calendar",
        },
      ],
    },
    {
      title: "Components",
      icon: Components,
      megaMenu: [
        {
          title: "Base Ui",
          icon: Flag,
          child: [
            {
              title: "accordion",
              icon: "heroicons:information-circle",
              href: "/accordion",
            },
            {
              title: "alert",
              icon: "heroicons:information-circle",
              href: "/alert",
            },
            {
              title: "avatar",
              icon: "heroicons:information-circle",
              href: "/avatar",
            },
            {
              title: "badge",
              icon: "heroicons:cube",
              href: "/badge",
            },
            {
              title: "breadcrumb",
              icon: "heroicons:cube",
              href: "/breadcrumb",
            },
            {
              title: "Button",
              icon: "heroicons:cube",
              href: "/button",
            },

            {
              title: "Card",
              icon: "heroicons:cube",
              href: "/card",
            },
            {
              title: "carousel",
              icon: "heroicons:information-circle",
              href: "/carousel",
            },
            {
              title: "color",
              icon: "heroicons:information-circle",
              href: "/color",
            },
            {
              title: "combobox",
              icon: "heroicons:cube",
              href: "/combobox",
            },
            {
              title: "command",
              icon: "heroicons:cube",
              href: "/command",
            },
            {
              title: "Dropdown",
              icon: "heroicons:cube",
              href: "/dropdown",
            },
            {
              title: "Dialog",
              icon: "heroicons:cube",
              href: "/dialog",
            },
            {
              title: "kbd",
              icon: "heroicons:information-circle",
              href: "/kbd",
            },
            {
              title: "pagination",
              icon: "heroicons:cube",
              href: "/pagination",
            },
            {
              title: "popover",
              icon: "heroicons:information-circle",
              href: "/popover",
            },
            {
              title: "progress",
              icon: "heroicons:information-circle",
              href: "/progress",
            },
            {
              title: "sheet",
              icon: "heroicons:cube",
              href: "/sheet",
            },
            {
              title: "skeleton",
              icon: "heroicons:cube",
              href: "/skeleton",
            },
            {
              title: "tabs",
              icon: "heroicons:cube",
              href: "/tabs",
            },
            {
              title: "toast",
              icon: "heroicons:information-circle",
              href: "/toast",
            },
            {
              title: "tooltip",
              icon: "heroicons:information-circle",
              href: "/tooltip",
            },
            {
              title: "typography",
              icon: "heroicons:information-circle",
              href: "/typography",
            },
          ],
        },
        {
          title: "Advanced Ui",
          icon: Book,
          child: [
            {
              title: "affix",
              icon: "heroicons:cube",
              href: "/affix",
            },
            {
              title: "calender",
              icon: "heroicons:information-circle",
              href: "/calendar-page",
            },
            {
              title: "steps",
              icon: "heroicons:information-circle",
              href: "/steps",
            },
            {
              title: "timeline",
              icon: "heroicons:cube",
              href: "/timeline",
            },
            {
              title: "tour",
              icon: "heroicons:cube",
              href: "/tour",
            },
            {
              title: "tree",
              icon: "heroicons:information-circle",
              href: "/tree",
            },
            {
              title: "watermark",
              icon: "heroicons:cube",
              href: "/watermark",
            },
          ],
        },
      ],
    },

    {
      title: "Forms",
      icon: Stacks2,
      megaMenu: [
        {
          title: "Form Elements",
          icon: Note,
          child: [
            {
              title: "checkbox",
              href: "/checkbox",
            },
            {
              title: "file uploader",
              href: "/file-uploader",
            },
            {
              title: "input",
              href: "/input",
            },
            {
              title: "input-group",
              href: "/input2",
            },
            {
              title: "input-mask",
              href: "/input-mask",
            },
            {
              title: "radio",
              href: "/radio",
            },
            {
              title: "Range Slider",
              href: "/slider",
            },
            {
              title: "rating",
              href: "/rating",
            },
            {
              title: "Select",
              href: "/form-select",
            },
            {
              title: "React Select",
              href: "/react-select",
            },
            {
              title: "switch",
              href: "/switch",
            },
            {
              title: "textarea",
              href: "/textarea",
            },
            {
              title: "Form Wizard",
              href: "/form-wizard",
            },
            {
              title: "Form Layout",
              href: "/form-layout",
            },
            {
              title: "Use Controller",
              href: "/validation-controller",
            },
            {
              title: "Use Form",
              href: "/validation-useform",
            },
          ],
        },
      ],
    },
    {
      title: "Pages",
      icon: Files,
      megaMenu: [
        {
          title: "Invoice",
          icon: Files,
          child: [
            {
              title: "create Invoice",
              href: "/create-invoice",
            },
            {
              title: "invoice-details",
              href: "/invoice-details",
            },
            {
              title: "invoice-list",
              href: "/invoice-list",
            },
          ],
        },
        {
          title: "Email Template",
          icon: Mail,
          child: [
            {
              title: "Advanced",
              href: "/reactemail-welcome-advanced",
            },
            {
              title: "Basic",
              href: "/reactemail-basic-welcome",
            },

            {
              title: "Reset Password 1",
              href: "/react-email/auth/reset-password-1",
            },
            {
              title: "Reset Password 2",
              href: "/react-email/auth/reset-password-2",
            },
            {
              title: "Verify Email",
              href: "/react-email/auth/verify-email",
            },
            {
              title: "Verify Otp",
              href: "/react-email/auth/verify-otp",
            },

            {
              title: "Shop",
              href: "/react-email/ecommerce/shop",
            },
            {
              title: "Shopping Cart",
              href: "/react-email/ecommerce/shopping-cart",
            },
            {
              title: "Corporate",
              href: "/react-email/corporate",
            },
            {
              title: "Agency",
              href: "/react-email/agency",
            },
            {
              title: "Blog",
              href: "/react-email/blog",
            },
            {
              title: "Photography",
              href: "/react-email/photography",
            },
          ],
        },
      ],
    },
    {
      title: "Tables",
      icon: Grid,
      child: [
        {
          title: "Simple Table",
          href: "/simple-table",
          icon: BarLeft,
        },
        {
          title: "tailwindui table",
          href: "/tailwindui-table",
          icon: BarLeft,
        },
        {
          title: "Data Table",
          href: "/data-table",
          icon: BarTop,
        },
      ],
    },
    {
      title: "Diagram",
      icon: Chart,
      child: [
        {
          title: "Overview",
          href: "/diagram/reactflow/overview",
          icon: "heroicons:information-circle",
        },
        {
          title: "Organization Tree",
          href: "/diagram/reactflow/organization-tree",
          icon: "heroicons:information-circle",
        },
        {
          title: "Update Node",
          href: "/diagram/reactflow/updating",
          icon: "heroicons:information-circle",
        },
        {
          title: "Add Node",
          href: "/diagram/reactflow/add-node",
          icon: "heroicons:information-circle",
        },
        {
          title: "Horizontal Flow",
          href: "/diagram/reactflow/horizontal-flow",
          icon: "heroicons:information-circle",
        },
        {
          title: "Dagree Tree",
          href: "/diagram/reactflow/dagree-tree",
          icon: "heroicons:information-circle",
        },
        {
          title: "Download Diagram",
          href: "/diagram/reactflow/download-diagram",
          icon: "heroicons:information-circle",
        },
        {
          title: "With Minimap",
          href: "/diagram/reactflow/with-minimap",
          icon: "heroicons:information-circle",
        },
        {
          title: "With Background",
          href: "/diagram/reactflow/with-background",
          icon: "heroicons:information-circle",
        },
        {
          title: "Panel Position",
          href: "/diagram/reactflow/panel-position",
          icon: "heroicons:information-circle",
        },
      ],
    },
    {
      title: "Chart",
      icon: ChartArea,
      megaMenu: [
        {
          title: "Apex Chart",
          icon: ChartBar,
          child: [
            {
              title: "Line",
              href: "/charts-appex-line",
              icon: "heroicons:information-circle",
            },
            {
              title: "Area",
              href: "/charts-appex-area",
              icon: "heroicons:information-circle",
            },
            {
              title: "Column",
              href: "/charts-appex-column",
              icon: "heroicons:information-circle",
            },
            {
              title: "Bar",
              href: "/charts-appex-bar",
              icon: "heroicons:information-circle",
            },
            {
              title: "Combo/Mixed",
              href: "/charts-appex-combo",
              icon: "heroicons:information-circle",
            },
            {
              title: "Range Area",
              href: "/charts-appex-range",
              icon: "heroicons:information-circle",
            },
            {
              title: "Timeline",
              href: "/charts-appex-timeline",
              icon: "heroicons:information-circle",
            },
            {
              title: "Funnel",
              href: "/charts-appex-funnel",
              icon: "heroicons:information-circle",
            },
            {
              title: "Candle Stick",
              href: "/charts-appex-candlestick",
              icon: "heroicons:information-circle",
            },
            {
              title: "Boxplot",
              href: "/charts-appex-boxplot",
              icon: "heroicons:information-circle",
            },
            {
              title: "Pie",
              href: "/charts-appex-pie",
              icon: "heroicons:information-circle",
            },
            {
              title: "Radar",
              href: "/charts-appex-radar",
              icon: "heroicons:information-circle",
            },
            {
              title: "Polar Area",
              href: "/charts-appex-polararea",
              icon: "heroicons:information-circle",
            },
            {
              title: "Radial Bars",
              href: "/charts-appex-radialbars",
              icon: "heroicons:information-circle",
            },
            {
              title: "Bubble",
              href: "/charts-appex-bubble",
              icon: "heroicons:information-circle",
            },
            {
              title: "Scatter",
              href: "/charts-appex-scatter",
              icon: "heroicons:information-circle",
            },
            {
              title: "Heatmap",
              href: "/charts-appex-heatmap",
              icon: "heroicons:information-circle",
            },
            {
              title: "Treemap",
              href: "/charts-appex-treemap",
              icon: "heroicons:information-circle",
            },
          ],
        },
        {
          title: "Re Chart",
          icon: PretentionChartLine,
          child: [
            {
              title: "Line",
              href: "/charts-rechart-line",
              icon: "heroicons:information-circle",
            },
            {
              title: "Area",
              href: "/charts-rechart-area",
              icon: "heroicons:information-circle",
            },
            {
              title: "Bar",
              href: "/charts-rechart-bar",
              icon: "heroicons:information-circle",
            },
            {
              title: "Scatter",
              href: "/charts-rechart-scatter",
              icon: "heroicons:information-circle",
            },
            {
              title: "Composed",
              href: "/charts-rechart-composed",
              icon: "heroicons:information-circle",
            },
            {
              title: "Pie",
              href: "/charts-rechart-pie",
              icon: "heroicons:information-circle",
            },
            {
              title: "Radar",
              href: "/charts-rechart-radar",
              icon: "heroicons:information-circle",
            },
            {
              title: "Radial Bar",
              href: "/charts-rechart-radialbar",
              icon: "heroicons:information-circle",
            },
            {
              title: "Tree Map",
              href: "/charts-rechart-treemap",
              icon: "heroicons:information-circle",
            },
          ],
        },
        {
          title: "chart js",
          icon: PretentionChartLine2,
          child: [
            {
              title: "Bar",
              href: "/charts-chartjs-bar",
              icon: "heroicons:information-circle",
            },
            {
              title: "Line",
              href: "/charts-chartjs-line",
              icon: "heroicons:information-circle",
            },
            {
              title: "Area",
              href: "/charts-chartjs-area",
              icon: "heroicons:information-circle",
            },
            {
              title: "Other",
              href: "/charts-chartjs-other",
              icon: "heroicons:information-circle",
            },
            {
              title: "Scales",
              href: "/charts-chartjs-scales",
              icon: "heroicons:information-circle",
            },
            {
              title: "Scale Options",
              href: "/charts-chartjs-scaleoptions",
              icon: "heroicons:information-circle",
            },
            {
              title: "Legend",
              href: "/charts-chartjs-legend",
              icon: "heroicons:information-circle",
            },
            {
              title: "Title",
              href: "/charts-chartjs-title",
              icon: "heroicons:information-circle",
            },
            {
              title: "Tooltip",
              href: "/charts-chartjs-tooltip",
              icon: "heroicons:information-circle",
            },
            {
              title: "Scriptable Options",
              href: "/charts-chartjs-scriptable",
              icon: "heroicons:information-circle",
            },
            {
              title: "Animations",
              href: "/charts-chartjs-animations",
              icon: "heroicons:information-circle",
            },
          ],
        },
        {
          title: "unovis",
          icon: PretentionChartLine,
          child: [
            {
              title: "Line",
              href: "/charts-unovis-line",
              icon: "heroicons:information-circle",
            },
            {
              title: "Bar",
              href: "/charts-unovis-bar",
              icon: "heroicons:information-circle",
            },
            {
              title: "Area",
              href: "/charts-unovis-area",
              icon: "heroicons:information-circle",
            },
            {
              title: "Scatter",
              href: "/charts-unovis-scatter",
              icon: "heroicons:information-circle",
            },
          ],
        },
      ],
    },
    {
      title: "Maps",
      icon: Map,
      child: [
        {
          title: "Vector",
          icon: Pointer,
          href: "/maps-vector",
        },
        {
          title: "React Leaflet",
          icon: Map2,
          href: "/map-react-leaflet",
        },

        {
          title: "Leaflet Map",
          icon: ChartBar,
          href: "/map-unovis-leaflet",
        },
        {
          title: "Leaflet Flow",
          icon: ChartArea,
          href: "/map-unovis-flow",
        },
        {
          title: "Leaflet Advance",
          icon: Graph,
          href: "/map-unovis-advance",
        },
      ],
    },
    {
      title: "Icons",
      icon: Icons,
      child: [
        {
          title: "Hero Icons",
          icon: Heroicon,
          href: "/icons-iconify",
        },
        {
          title: "Lucide Icons",
          icon: LucideIcon,
          href: "/icons-lucide",
        },
        {
          title: "Custom Icons",
          icon: CustomIcon,
          href: "/icons-custom",
        },
      ],
    },
  ],
  sidebarNav: {
    modern: [
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
        title: "Sales Tools",
        icon: Cart,
        child: [
          {
            title: "Academy",
            icon: Book,
            href: "/sales-tools/academy",
          },
          {
            title: "Live Inventory",
            icon: Stacks2,
            href: "/inventory",
          },
          {
            title: "Links",
            icon: MenuBar,
            href: "/sales-tools/links",
          },
          {
            title: "Manufacturers",
            icon: Building,
            href: "/sales-tools/manufacturers",
          },
          {
            title: "Request Form",
            icon: ClipBoard,
            href: "/sales-tools/request",
          },
          {
            title: "Request Inbox",
            icon: Envelope,
            href: "/sales-tools/requests/inbox",
          },
          {
            title: "My Documents",
            icon: Files,
            href: "/contractor-docs",
          },
        ],
      },
      {
        title: "Application",
        icon: Application,
        child: [
          {
            title: "Manager Access",
            icon: Shield,
            href: "/manager",
          },
          {
            title: "Team Requests",
            icon: ClipBoard,
            href: "/manager/requests",
          },
          {
            title: "User Management",
            icon: Users,
            href: "/user-management",
          },
          {
            title: "Contractor Docs",
            icon: Files,
            href: "/admin/contractor-docs",
          },
          {
            title: "Team Progression",
            icon: TrendingUp,
            href: "/progression",
          },
          {
            title: "Photo Request",
            icon: Mail,
            href: "/request-photos",
          },
          {
            title: "chat",
            icon: Messages,
            href: "/chat",
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
            title: "task",
            icon: ListFill,
            href: "/task",
          },
          {
            title: "calendar",
            icon: Calendar,
            href: "/calendar",
          },
        ],
      },
      {
        title: "Components",
        icon: Components,
        child: [
          {
            title: "Base Ui",
            icon: Flag,
            nested: [
              {
                title: "accordion",
                icon: "heroicons:information-circle",
                href: "/accordion",
              },
              {
                title: "alert",
                icon: "heroicons:information-circle",
                href: "/alert",
              },
              {
                title: "avatar",
                icon: "heroicons:information-circle",
                href: "/avatar",
              },
              {
                title: "badge",
                icon: "heroicons:cube",
                href: "/badge",
              },
              {
                title: "breadcrumb",
                icon: "heroicons:cube",
                href: "/breadcrumb",
              },
              {
                title: "Button",
                icon: "heroicons:cube",
                href: "/button",
              },
              {
                title: "Card",
                icon: "heroicons:cube",
                href: "/card",
              },
              {
                title: "carousel",
                icon: "heroicons:information-circle",
                href: "/carousel",
              },
              {
                title: "color",
                icon: "heroicons:information-circle",
                href: "/color",
              },
              {
                title: "combobox",
                icon: "heroicons:cube",
                href: "/combobox",
              },
              {
                title: "command",
                icon: "heroicons:cube",
                href: "/command",
              },
              {
                title: "Dropdown",
                icon: "heroicons:cube",
                href: "/dropdown",
              },
              {
                title: "Dialog",
                icon: "heroicons:cube",
                href: "/dialog",
              },
              {
                title: "kbd",
                icon: "heroicons:information-circle",
                href: "/kbd",
              },
              {
                title: "pagination",
                icon: "heroicons:cube",
                href: "/pagination",
              },
              {
                title: "popover",
                icon: "heroicons:information-circle",
                href: "/popover",
              },
              {
                title: "progress",
                icon: "heroicons:information-circle",
                href: "/progress",
              },
              {
                title: "sheet",
                icon: "heroicons:cube",
                href: "/sheet",
              },
              {
                title: "skeleton",
                icon: "heroicons:cube",
                href: "/skeleton",
              },
              {
                title: "tabs",
                icon: "heroicons:cube",
                href: "/tabs",
              },
              {
                title: "toast",
                icon: "heroicons:information-circle",
                href: "/toast",
              },
              {
                title: "tooltip",
                icon: "heroicons:information-circle",
                href: "/tooltip",
              },
              {
                title: "typography",
                icon: "heroicons:information-circle",
                href: "/typography",
              },
            ],
          },
          {
            title: "Advanced Ui",
            icon: Book,
            nested: [
              {
                title: "affix",
                icon: "heroicons:cube",
                href: "/affix",
              },
              {
                title: "calendar",
                icon: "heroicons:cube",
                href: "/calendar-page",
              },
              {
                title: "steps",
                icon: "heroicons:information-circle",
                href: "/steps",
              },
              {
                title: "timeline",
                icon: "heroicons:cube",
                href: "/timeline",
              },
              {
                title: "tour",
                icon: "heroicons:cube",
                href: "/tour",
              },
              {
                title: "tree",
                icon: "heroicons:information-circle",
                href: "/tree",
              },
              {
                title: "watermark",
                icon: "heroicons:cube",
                href: "/watermark",
              },
            ],
          },
        ],
      },
      {
        title: "Forms",
        icon: Stacks2,
        child: [
          {
            title: "Form Elements",
            icon: Note,
            nested: [
              {
                title: "checkbox",
                href: "/checkbox",
              },
              {
                title: "file uploader",
                href: "/file-uploader",
              },
              {
                title: "input",
                href: "/input",
              },
              {
                title: "input-group",
                href: "/input2",
              },

              {
                title: "input-mask",
                href: "/input-mask",
              },
              {
                title: "radio",
                href: "/radio",
              },
              {
                title: "Range Slider",
                href: "/slider",
              },
              {
                title: "rating",
                href: "/rating",
              },
              {
                title: "select",
                child: [
                  {
                    title: "Select",
                    href: "/form-select",
                  },
                  {
                    title: "React Select",
                    href: "/react-select",
                  },
                ],
              },
              {
                title: "switch",
                href: "/switch",
              },
              {
                title: "textarea",
                href: "/textarea",
              },
            ],
          },
          {
            title: "Form Layout",
            icon: ClipBoard2,
            href: "/form-layout",
          },
          {
            title: "Form validation",
            icon: Note2,
            nested: [
              {
                title: "Use Controller",
                href: "/validation-controller",
              },
              {
                title: "Use Form",
                href: "/validation-useform",
              },
            ],
          },
          {
            title: "Form Wizard",
            icon: Note3,
            href: "/form-wizard",
          },
        ],
      },
      {
        title: "Pages",
        icon: Files,
        child: [
          {
            title: "Invoice",
            icon: Files,
            nested: [
              {
                title: "Create Invoice",
                href: "/create-invoice",
              },
              {
                title: "Invoice Details",
                href: "/invoice-details",
              },
              {
                title: "Invoice List",
                href: "/invoice-list",
              },
            ],
          },
          {
            title: "Email Template",
            icon: Mail,
            nested: [
              {
                title: "welcome",
                child: [
                  {
                    title: "Advanced",
                    href: "/react-email",
                  },
                  {
                    title: "Basic",
                    href: "/react-email/basic-welcome",
                  },
                ],
              },
              {
                title: "Authentication",
                child: [
                  {
                    title: "Reset Password 1",
                    href: "/react-email/auth",
                  },
                  {
                    title: "Reset Password 2",
                    href: "/react-email/auth/reset-password-2",
                  },
                  {
                    title: "Verify Email",
                    href: "/react-email/auth/verify-email",
                  },
                  {
                    title: "Verify Otp",
                    href: "/react-email/auth/verify-otp",
                  },
                ],
              },
              {
                title: "Ecommerce",
                child: [
                  {
                    title: "Shop",
                    href: "/react-email/ecommerce-shop",
                  },
                  {
                    title: "Shopping Cart",
                    href: "/react-email/ecommerce-cart",
                  },
                ],
              },
              {
                title: "Corporate",
                href: "/react-email/corporate",
              },
              {
                title: "Agency",
                href: "/react-email/agency",
              },
              {
                title: "Blog",
                href: "/react-email/blog",
              },
              {
                title: "Photography",
                href: "/react-email/photography",
              },
            ],
          },
        ],
      },

      {
        title: "Tables",
        icon: Grid,
        child: [
          {
            title: "Simple Table",
            href: "/simple-table",
            icon: BarLeft,
          },
          {
            title: "tailwindui table",
            href: "/tailwindui-table",
            icon: BarLeft,
          },
          {
            title: "Data Table",
            href: "/data-table",
            icon: BarTop,
          },
        ],
      },

      {
        title: "Diagram",
        icon: Chart,
        child: [
          {
            title: "React Flow",
            icon: ChartBar,
            nested: [
              {
                title: "Overview",
                href: "/diagram-overview",
              },
              {
                title: "Organization Tree",
                href: "/organization-diagram",
              },
              {
                title: "Update Node",
                href: "/diagram-updating",
              },
              {
                title: "Add Node",
                href: "/diagram-add-node",
              },
              {
                title: "Horizontal Flow",
                href: "/horizontal-diagram",
              },
              {
                title: "Dagree Tree",
                href: "/diagram-dagree-tree",
              },
              {
                title: "Download Diagram",
                href: "/download-diagram",
              },
              {
                title: "With Minimap",
                href: "/diagram-with-minimap",
              },
              {
                title: "With Background",
                href: "/diagram-with-background",
              },
              {
                title: "Panel Position",
                href: "/diagram-panel-position",
              },
            ],
          },
        ],
      },
      {
        title: "Chart",
        icon: ChartArea,
        child: [
          {
            title: "Apex Chart",
            icon: ChartBar,
            nested: [
              {
                title: "Line",
                href: "/charts-appex-line",
                icon: "heroicons:information-circle",
              },
              {
                title: "Area",
                href: "/charts-appex-area",
                icon: "heroicons:information-circle",
              },
              {
                title: "Column",
                href: "/charts-appex-column",
                icon: "heroicons:information-circle",
              },
              {
                title: "Bar",
                href: "/charts-appex-bar",
                icon: "heroicons:information-circle",
              },
              {
                title: "Combo/Mixed",
                href: "/charts-appex-combo",
                icon: "heroicons:information-circle",
              },
              {
                title: "Range Area",
                href: "/charts-appex-range",
                icon: "heroicons:information-circle",
              },
              {
                title: "Timeline",
                href: "/charts-appex-timeline",
                icon: "heroicons:information-circle",
              },
              {
                title: "Funnel",
                href: "/charts-appex-funnel",
                icon: "heroicons:information-circle",
              },
              {
                title: "Candle Stick",
                href: "/charts-appex-candlestick",
                icon: "heroicons:information-circle",
              },
              {
                title: "Boxplot",
                href: "/charts-appex-boxplot",
                icon: "heroicons:information-circle",
              },
              {
                title: "Pie",
                href: "/charts-appex-pie",
                icon: "heroicons:information-circle",
              },
              {
                title: "Radar",
                href: "/charts-appex-radar",
                icon: "heroicons:information-circle",
              },
              {
                title: "Polar Area",
                href: "/charts-appex-polararea",
                icon: "heroicons:information-circle",
              },
              {
                title: "Radial Bars",
                href: "/charts-appex-radialbars",
                icon: "heroicons:information-circle",
              },
              {
                title: "Bubble",
                href: "/charts-appex-bubble",
                icon: "heroicons:information-circle",
              },
              {
                title: "Scatter",
                href: "/charts-appex-scatter",
                icon: "heroicons:information-circle",
              },
              {
                title: "Heatmap",
                href: "/charts-appex-heatmap",
                icon: "heroicons:information-circle",
              },
              {
                title: "Treemap",
                href: "/charts-appex-treemap",
                icon: "heroicons:information-circle",
              },
            ],
          },
          {
            title: "Re Chart",
            icon: PretentionChartLine,
            nested: [
              {
                title: "Line",
                href: "/charts-rechart-line",
                icon: "heroicons:information-circle",
              },
              {
                title: "Area",
                href: "/charts-rechart-area",
                icon: "heroicons:information-circle",
              },
              {
                title: "Bar",
                href: "/charts-rechart-bar",
                icon: "heroicons:information-circle",
              },
              {
                title: "Scatter",
                href: "/charts-rechart-scatter",
                icon: "heroicons:information-circle",
              },
              {
                title: "Composed",
                href: "/charts-rechart-composed",
                icon: "heroicons:information-circle",
              },
              {
                title: "Pie",
                href: "/charts-rechart-pie",
                icon: "heroicons:information-circle",
              },
              {
                title: "Radar",
                href: "/charts-rechart-radar",
                icon: "heroicons:information-circle",
              },
              {
                title: "Radial Bar",
                href: "/charts-rechart-radialbar",
                icon: "heroicons:information-circle",
              },
              {
                title: "Tree Map",
                href: "/charts-rechart-treemap",
                icon: "heroicons:information-circle",
              },
            ],
          },
          {
            title: "chart js",
            icon: PretentionChartLine2,
            nested: [
              {
                title: "Bar",
                href: "/charts-chartjs-bar",
                icon: "heroicons:information-circle",
              },
              {
                title: "Line",
                href: "/charts-chartjs-line",
                icon: "heroicons:information-circle",
              },
              {
                title: "Area",
                href: "/charts-chartjs-area",
                icon: "heroicons:information-circle",
              },
              {
                title: "Other",
                href: "/charts-chartjs-other",
                icon: "heroicons:information-circle",
              },
              {
                title: "Scales",
                href: "/charts-chartjs-scales",
                icon: "heroicons:information-circle",
              },
              {
                title: "Scale Options",
                href: "/charts-chartjs-scaleoptions",
                icon: "heroicons:information-circle",
              },
              {
                title: "Legend",
                href: "/charts-chartjs-legend",
                icon: "heroicons:information-circle",
              },
              {
                title: "Title",
                href: "/charts-chartjs-title",
                icon: "heroicons:information-circle",
              },
              {
                title: "Tooltip",
                href: "/charts-chartjs-tooltip",
                icon: "heroicons:information-circle",
              },
              {
                title: "Scriptable Options",
                href: "/charts-chartjs-scriptable",
                icon: "heroicons:information-circle",
              },
              {
                title: "Animations",
                href: "/charts-chartjs-animations",
                icon: "heroicons:information-circle",
              },
            ],
          },
          {
            title: "unovis",
            icon: PretentionChartLine,
            nested: [
              {
                title: "Line",
                href: "/charts-unovis-line",
                icon: "heroicons:information-circle",
              },
              {
                title: "Bar",
                href: "/charts-unovis-bar",
                icon: "heroicons:information-circle",
              },
              {
                title: "Area",
                href: "/charts-unovis-area",
                icon: "heroicons:information-circle",
              },
              {
                title: "Scatter",
                href: "/charts-unovis-scatter",
                icon: "heroicons:information-circle",
              },
            ],
          },
        ],
      },
      {
        title: "Maps",
        icon: Map,
        child: [
          {
            title: "Vector",
            icon: Pointer,
            href: "/maps-vector",
          },
          {
            title: "React Leaflet",
            icon: Map2,
            href: "/map-react-leaflet",
          },
          {
            title: "Unovis Map",
            icon: Map,
            nested: [
              {
                title: "Leaflet Map",
                href: "/map-unovis-leaflet",
              },
              {
                title: "Leaflet Flow",
                href: "/map-unovis-flow",
              },
              {
                title: "Leaflet Advance",
                href: "/map-unovis-advance",
              },
            ],
          },
        ],
      },
      {
        title: "Icons",
        icon: Icons,
        child: [
          {
            title: "Hero Icons",
            icon: Heroicon,
            href: "/icons-iconify",
          },
          {
            title: "Lucide Icons",
            icon: LucideIcon,
            href: "/icons-lucide",
          },
          {
            title: "Custom Icons",
            icon: CustomIcon,
            href: "/icons-custom",
          },
        ],
      },
      {
        title: "Multi Level",
        icon: MenuBar,
        child: [
          {
            title: "Level 1.1",
            icon: Building,
            href: "#",
          },
          {
            title: "Level 2",
            icon: Building2,
            nested: [
              {
                title: "Level-2.1",
                href: "#",
              },
              {
                title: "Level 2.2",
                href: "#",
              },
              {
                title: "Level 3",
                child: [
                  {
                    title: "Level 3.1",
                    href: "#",
                  },
                  {
                    title: "Level 3.2",
                    href: "#",
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
    classic: [
      {
        isHeader: true,
        title: "menu",
      },
      {
        title: "Dashboard",
        icon: DashBoard,
        href: "/dashboard",


        child: [
          {
            title: "Analytics",
            href: "/dashboard",
            icon: Graph,
          },
        ],
      },
      {
        isHeader: true,
        title: "Sales Tools",
      },
      {
        title: "Live Inventory",
        icon: Stacks2,
        href: "/inventory",
      },
      {
        title: "Finance Calculator",
        icon: ChartBar,
        href: "/finance/compare",
      },
      {
        title: "Credit Applications",
        icon: ClipBoard,
        href: "/credit",
      },
      {
        title: "Customers (CRM)",
        icon: Users,
        href: "/crm/customers",
      },
      {
        title: "Messages",
        icon: Messages,
        href: "/crm/messages",
      },
      {
        title: "Sales Report",
        icon: ChartBar,
        href: "/reports/sales",
      },
      {
        title: "Request Info",
        icon: Mail,
        href: "/request-info",
      },
      {
        title: "My Documents",
        icon: Files,
        href: "/contractor-docs",
      },
      {
        isHeader: true,
        title: "Application",
      },
      {
        title: "User Management",
        icon: Users,
        href: "/user-management",
      },
      {
        title: "Contractor Docs",
        icon: Files,
        href: "/admin/contractor-docs",
      },
      {
        title: "Audit Log",
        icon: ClipBoard,
        href: "/audit-log",
      },
      {
        title: "chat",
        icon: Messages,
        href: "/chat",
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
        title: "task",
        icon: ListFill,
        href: "/task",
      },
      {
        title: "calendar",
        icon: Calendar,
        href: "/calendar",
      },


      {
        isHeader: true,
        title: "Pages",
      },
      {
        title: "Invoice",
        icon: Files,
        href: "#",

        child: [
          {
            title: "Create Invoice",
            href: "/create-invoice",
          },
          {
            title: "Invoice Details",
            href: "/invoice-details",
          },
          {
            title: "Invoice List",
            href: "/invoice-list",
          },
        ],
      },
      {
        title: "Email Template",
        icon: Mail,
        child: [
          {
            title: "Welcome",
            multi_menu: [
              {
                title: "Advanced",
                href: "/react-email/welcome/advanced",
              },
              {
                title: "Basic",
                href: "/react-email/welcome/basic",
              },
            ],
          },
          {
            title: "Authentication",
            multi_menu: [
              {
                title: "Reset Password 1",
                href: "/react-email/auth/reset-password-1",
              },
              {
                title: "Reset Password 2",
                href: "/react-email/auth/reset-password-2",
              },
              {
                title: "Verify Email",
                href: "/react-email/auth/verify-email",
              },
              {
                title: "Verify Otp",
                href: "/react-email/auth/verify-otp",
              },
            ],
          },
          {
            title: "Ecommerce",
            multi_menu: [
              {
                title: "Shop",
                href: "/react-email/ecommerce/shop",
              },
              {
                title: "Shopping Cart",
                href: "/react-email/ecommerce/shopping-cart",
              },
            ],
          },
          {
            title: "Corporate",
            href: "/react-email/corporate",
          },
          {
            title: "Agency",
            href: "/react-email/agency",
          },
          {
            title: "Blog",
            href: "/react-email/blog",
          },
          {
            title: "Photography",
            href: "/react-email/photography",
          },
        ],
      },
      {
        isHeader: true,
        title: "Elements",
      },
      {
        title: "Components",
        icon: Components,
        href: "#",
        child: [
          {
            title: "Base Ui",
            icon: Flag,
            multi_menu: [
              {
                title: "accordion",
                icon: "heroicons:information-circle",
                href: "/accordion",
              },
              {
                title: "alert",
                icon: "heroicons:information-circle",
                href: "/alert",
              },
              {
                title: "avatar",
                icon: "heroicons:information-circle",
                href: "/avatar",
              },
              {
                title: "badge",
                icon: "heroicons:cube",
                href: "/badge",
              },
              {
                title: "breadcrumb",
                icon: "heroicons:cube",
                href: "/breadcrumb",
              },
              {
                title: "Button",
                icon: "heroicons:cube",
                href: "/button",
              },
              {
                title: "Card",
                icon: "heroicons:cube",
                href: "/card",
              },
              {
                title: "carousel",
                icon: "heroicons:information-circle",
                href: "/carousel",
              },
              {
                title: "color",
                icon: "heroicons:information-circle",
                href: "/color",
              },
              {
                title: "combobox",
                icon: "heroicons:cube",
                href: "/combobox",
              },
              {
                title: "command",
                icon: "heroicons:cube",
                href: "/command",
              },
              {
                title: "Dropdown",
                icon: "heroicons:cube",
                href: "/dropdown",
              },
              {
                title: "Dialog",
                icon: "heroicons:cube",
                href: "/dialog",
              },
              {
                title: "kbd",
                icon: "heroicons:information-circle",
                href: "/kbd",
              },
              {
                title: "pagination",
                icon: "heroicons:cube",
                href: "/pagination",
              },
              {
                title: "popover",
                icon: "heroicons:information-circle",
                href: "/popover",
              },
              {
                title: "progress",
                icon: "heroicons:information-circle",
                href: "/progress",
              },
              {
                title: "sheet",
                icon: "heroicons:cube",
                href: "/sheet",
              },
              {
                title: "skeleton",
                icon: "heroicons:cube",
                href: "/skeleton",
              },
              {
                title: "tabs",
                icon: "heroicons:cube",
                href: "/tabs",
              },
              {
                title: "toast",
                icon: "heroicons:information-circle",
                href: "/toast",
              },
              {
                title: "tooltip",
                icon: "heroicons:information-circle",
                href: "/tooltip",
              },
              {
                title: "typography",
                icon: "heroicons:information-circle",
                href: "/typography",
              },
            ],
          },
          {
            title: "Advanced Ui",
            icon: Book,
            multi_menu: [
              {
                title: "affix",
                icon: "heroicons:cube",
                href: "/affix",
              },
              {
                title: "calendar",
                icon: "heroicons:cube",
                href: "/calendar-page",
              },
              {
                title: "steps",
                icon: "heroicons:information-circle",
                href: "/steps",
              },
              {
                title: "timeline",
                icon: "heroicons:cube",
                href: "/timeline",
              },
              {
                title: "tour",
                icon: "heroicons:cube",
                href: "/tour",
              },
              {
                title: "tree",
                icon: "heroicons:information-circle",
                href: "/tree",
              },
              {
                title: "watermark",
                icon: "heroicons:cube",
                href: "/watermark",
              },
            ],
          },
        ],
      },
      {
        title: "Forms",
        icon: Stacks2,
        child: [
          {
            title: "checkbox",
            href: "/checkbox",
          },
          {
            title: "file uploader",
            href: "/file-uploader",
          },
          {
            title: "input",
            href: "/input",
          },
          {
            title: "input-group",
            href: "/input2",
          },

          {
            title: "input-mask",
            href: "/input-mask",
          },
          {
            title: "radio",
            href: "/radio",
          },
          {
            title: "Range Slider",
            href: "/slider",
          },
          {
            title: "rating",
            href: "/rating",
          },
          {
            title: "select",
            multi_menu: [
              {
                title: "Select",
                href: "/form-select",
              },
              {
                title: "React Select",
                href: "/react-select",
              },
            ],
          },
          {
            title: "switch",
            href: "/switch",
          },
          {
            title: "textarea",
            href: "/textarea",
          },
          {
            title: "Form Layout",
            icon: ClipBoard2,
            href: "/form-layout",
          },
          {
            title: "Form validation",
            icon: Note2,
            multi_menu: [
              {
                title: "Use Controller",
                href: "/validation-controller",
              },
              {
                title: "Use Form",
                href: "/validation-useform",
              },
            ],
          },
          {
            title: "Form Wizard",
            icon: Note3,
            href: "/form-wizard",
          },
        ],
      },
      {
        title: "Table",
        icon: Grid,
        child: [
          {
            title: "Simple Table",
            href: "/simple-table",
            icon: BarLeft,
          },
          {
            title: "tailwindui table",
            href: "/tailwindui-table",
            icon: BarLeft,
          },
          {
            title: "Data Table",
            href: "/data-table",
            icon: BarTop,
          },
        ],
      },
      {
        title: "Diagram",
        icon: Chart,
        child: [
          {
            title: "Overview",
            href: "/diagram-overview",
          },
          {
            title: "Organization Tree",
            href: "/organization-diagram",
          },
          {
            title: "Update Node",
            href: "/diagram-updating",
          },
          {
            title: "Add Node",
            href: "/diagram-add-node",
          },
          {
            title: "Horizontal Flow",
            href: "/horizontal-diagram",
          },
          {
            title: "Dagree Tree",
            href: "/diagram-dagree-tree",
          },
          {
            title: "Download Diagram",
            href: "/download-diagram",
          },
          {
            title: "With Minimap",
            href: "/diagram-with-minimap",
          },
          {
            title: "With Background",
            href: "/diagram-with-background",
          },
          {
            title: "Panel Position",
            href: "/diagram-panel-position",
          },
        ],
      },
      {
        title: "Chart",
        icon: ChartArea,
        child: [
          {
            title: "Apex Chart",
            icon: ChartBar,
            multi_menu: [
              {
                title: "Line",
                href: "/charts-appex-line",
                icon: "heroicons:information-circle",
              },
              {
                title: "Area",
                href: "/charts-appex-area",
                icon: "heroicons:information-circle",
              },
              {
                title: "Column",
                href: "/charts-appex-column",
                icon: "heroicons:information-circle",
              },
              {
                title: "Bar",
                href: "/charts-appex-bar",
                icon: "heroicons:information-circle",
              },
              {
                title: "Combo/Mixed",
                href: "/charts-appex-combo",
                icon: "heroicons:information-circle",
              },
              {
                title: "Range Area",
                href: "/charts-appex-range",
                icon: "heroicons:information-circle",
              },
              {
                title: "Timeline",
                href: "/charts-appex-timeline",
                icon: "heroicons:information-circle",
              },
              {
                title: "Funnel",
                href: "/charts-appex-funnel",
                icon: "heroicons:information-circle",
              },
              {
                title: "Candle Stick",
                href: "/charts-appex-candlestick",
                icon: "heroicons:information-circle",
              },
              {
                title: "Boxplot",
                href: "/charts-appex-boxplot",
                icon: "heroicons:information-circle",
              },
              {
                title: "Pie",
                href: "/charts-appex-pie",
                icon: "heroicons:information-circle",
              },
              {
                title: "Radar",
                href: "/charts-appex-radar",
                icon: "heroicons:information-circle",
              },
              {
                title: "Polar Area",
                href: "/charts-appex-polararea",
                icon: "heroicons:information-circle",
              },
              {
                title: "Radial Bars",
                href: "/charts-appex-radialbars",
                icon: "heroicons:information-circle",
              },
              {
                title: "Bubble",
                href: "/charts-appex-bubble",
                icon: "heroicons:information-circle",
              },
              {
                title: "Scatter",
                href: "/charts-appex-scatter",
                icon: "heroicons:information-circle",
              },
              {
                title: "Heatmap",
                href: "/charts-appex-heatmap",
                icon: "heroicons:information-circle",
              },
              {
                title: "Treemap",
                href: "/charts-appex-treemap",
                icon: "heroicons:information-circle",
              },
            ],
          },
          {
            title: "Re Chart",
            icon: PretentionChartLine,
            multi_menu: [
              {
                title: "Line",
                href: "/charts-rechart-line",
                icon: "heroicons:information-circle",
              },
              {
                title: "Area",
                href: "/charts-rechart-area",
                icon: "heroicons:information-circle",
              },
              {
                title: "Bar",
                href: "/charts-rechart-bar",
                icon: "heroicons:information-circle",
              },
              {
                title: "Scatter",
                href: "/charts-rechart-scatter",
                icon: "heroicons:information-circle",
              },
              {
                title: "Composed",
                href: "/charts-rechart-composed",
                icon: "heroicons:information-circle",
              },
              {
                title: "Pie",
                href: "/charts-rechart-pie",
                icon: "heroicons:information-circle",
              },
              {
                title: "Radar",
                href: "/charts-rechart-radar",
                icon: "heroicons:information-circle",
              },
              {
                title: "Radial Bar",
                href: "/charts-rechart-radialbar",
                icon: "heroicons:information-circle",
              },
              {
                title: "Tree Map",
                href: "/charts-rechart-treemap",
                icon: "heroicons:information-circle",
              },
            ],
          },
          {
            title: "Chart js",
            icon: PretentionChartLine2,
            multi_menu: [
              {
                title: "Bar",
                href: "/charts-chartjs-bar",
                icon: "heroicons:information-circle",
              },
              {
                title: "Line",
                href: "/charts-chartjs-line",
                icon: "heroicons:information-circle",
              },
              {
                title: "Area",
                href: "/charts-chartjs-area",
                icon: "heroicons:information-circle",
              },
              {
                title: "Other",
                href: "/charts-chartjs-other",
                icon: "heroicons:information-circle",
              },
              {
                title: "Scales",
                href: "/charts-chartjs-scales",
                icon: "heroicons:information-circle",
              },
              {
                title: "Scale Options",
                href: "/charts-chartjs-scaleoptions",
                icon: "heroicons:information-circle",
              },
              {
                title: "Legend",
                href: "/charts-chartjs-legend",
                icon: "heroicons:information-circle",
              },
              {
                title: "Title",
                href: "/charts-chartjs-title",
                icon: "heroicons:information-circle",
              },
              {
                title: "Tooltip",
                href: "/charts-chartjs-tooltip",
                icon: "heroicons:information-circle",
              },
              {
                title: "Scriptable Options",
                href: "/charts-chartjs-scriptable",
                icon: "heroicons:information-circle",
              },
              {
                title: "Animations",
                href: "/charts-chartjs-animations",
                icon: "heroicons:information-circle",
              },
            ],
          },
          {
            title: "Unovis",
            icon: PretentionChartLine,
            multi_menu: [
              {
                title: "Line",
                href: "/charts-unovis-line",
                icon: "heroicons:information-circle",
              },
              {
                title: "Bar",
                href: "/charts-unovis-bar",
                icon: "heroicons:information-circle",
              },
              {
                title: "Area",
                href: "/charts-unovis-area",
                icon: "heroicons:information-circle",
              },
              {
                title: "Scatter",
                href: "/charts-unovis-scatter",
                icon: "heroicons:information-circle",
              },
            ],
          },
        ],
      },
      {
        title: "Maps",
        icon: Map,
        child: [
          {
            title: "Vector",
            icon: Pointer,
            href: "/maps-vector",
          },
          {
            title: "React Leaflet",
            icon: Map2,
            href: "/map-react-leaflet",
          },
          {
            title: "Unovis Map",
            icon: Map,
            multi_menu: [
              {
                title: "Leaflet Map",
                href: "/map-unovis-leaflet",
              },
              {
                title: "Leaflet Flow",
                href: "/map-unovis-flow",
              },
              {
                title: "Leaflet Advance",
                href: "/map-unovis-advance",
              },
            ],
          },
        ],
      },
      {
        title: "Icons",
        icon: Icons,
        child: [
          {
            title: "Hero Icons",
            icon: Heroicon,
            href: "/icons-iconify",
          },
          {
            title: "Lucide Icons",
            icon: LucideIcon,
            href: "/icons-lucide",
          },
          {
            title: "Custom Icons",
            icon: CustomIcon,
            href: "/icons-custom",
          },
        ],
      },
      {
        title: "Multi Level",
        icon: MenuBar,
        child: [
          {
            title: "Level 1.1",
            href: "#",
          },
          {
            title: "Level 2",
            multi_menu: [
              {
                title: "Level 2.1",
                href: "#",
              },
              {
                title: "Level 2.2",
                href: "#",
              },
            ],
          },
        ],
      },
    ],
  },
};


export type ModernNavType = (typeof menusConfig.sidebarNav.modern)[number]
export type ClassicNavType = (typeof menusConfig.sidebarNav.classic)[number]
export type MainNavType = (typeof menusConfig.mainNav)[number]