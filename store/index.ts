import { create } from 'zustand'
import { siteConfig } from "@/config/site";
import { persist, createJSONStorage } from "zustand/middleware";

// URGENT FIX: Clear broken localStorage values that cause dashboard to break
// This runs once on module load to fix users stuck with "module" sidebar type
if (typeof window !== 'undefined') {
  try {
    const sidebarStore = localStorage.getItem('sidebar-store');
    const themeStore = localStorage.getItem('theme-store');

    // Check for broken sidebar type
    if (sidebarStore) {
      const parsed = JSON.parse(sidebarStore);
      if (parsed?.state?.sidebarType === 'module') {
        console.log('[Store Fix] Clearing broken sidebar-store (module type)');
        localStorage.removeItem('sidebar-store');
      }
    }

    // Check for broken layout type
    if (themeStore) {
      const parsed = JSON.parse(themeStore);
      if (parsed?.state?.layout && parsed.state.layout !== 'vertical') {
        console.log('[Store Fix] Clearing broken theme-store (non-vertical layout)');
        localStorage.removeItem('theme-store');
      }
      // Also fix RTL if enabled
      if (parsed?.state?.isRtl === true) {
        console.log('[Store Fix] Clearing broken theme-store (RTL enabled)');
        localStorage.removeItem('theme-store');
      }
    }
  } catch (e) {
    // If parsing fails, clear both stores
    console.log('[Store Fix] Clearing corrupt localStorage stores');
    localStorage.removeItem('sidebar-store');
    localStorage.removeItem('theme-store');
  }
}

interface ThemeStoreState {
  theme: string;
  setTheme: (theme: string) => void;
  radius: number;
  setRadius: (value: number) => void;
  layout: string;
  setLayout: (value: string) => void;
  navbarType: string;
  setNavbarType: (value: string) => void;
  footerType: string;
  setFooterType: (value: string) => void;
  isRtl: boolean;
  setRtl: (value: boolean) => void;
  
}

// LOCKED: Theme store with safe defaults
// Layout is locked to "vertical" - no switching allowed
// RTL is locked to false - prevents sidebar text issues
export const useThemeStore = create<ThemeStoreState>()(
 persist(
      (set) => ({
        theme: siteConfig.theme,
        setTheme: (theme) => set({ theme }), // Allow theme changes (light/dark)
        radius: siteConfig.radius,
        setRadius: (value) => set({ radius: value }),
        layout: "vertical", // LOCKED to vertical
        setLayout: (_value) => {
          // No-op: Layout switching disabled to prevent dashboard breaks
          console.log('[Store] Layout change blocked - locked to vertical');
        },
        navbarType: siteConfig.navbarType,
        setNavbarType: (value) => set({ navbarType: value }),
        footerType: siteConfig.footerType,
        setFooterType: (value) => set({ footerType: value }),
        isRtl: false, // LOCKED to LTR
        setRtl: (_value) => {
          // No-op: RTL switching disabled to prevent sidebar text issues
          console.log('[Store] RTL change blocked - locked to LTR');
        },
      }),
      {
        name: "theme-store",
        storage: createJSONStorage(() => localStorage),
        // Only persist safe values
        partialize: (state) => ({
          theme: state.theme,
          radius: state.radius,
          navbarType: state.navbarType,
          footerType: state.footerType,
        }),
      },
    ),
)



interface SidebarState {
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
  sidebarType: string;
  setSidebarType: (value: string) => void;
  subMenu: boolean;
  setSubmenu: (value: boolean) => void;
  // background image
  sidebarBg: string;
  setSidebarBg: (value: string) => void;
  mobileMenu: boolean;
  setMobileMenu: (value: boolean) => void;
  
}


// LOCKED: Sidebar store with safe defaults
// Sidebar type locked to "popover" - "module" type causes dashboard breaks
export const useSidebar = create<SidebarState>()(
   persist(
      (set) => ({
        collapsed: false,
        setCollapsed: (value) => set({ collapsed: value }),
        sidebarType: "popover", // LOCKED to popover
        setSidebarType: (_value) => {
          // No-op: Sidebar type switching disabled to prevent dashboard breaks
          console.log('[Store] Sidebar type change blocked - locked to popover');
        },
        subMenu: false,
        setSubmenu: (value) => set({ subMenu: value }),
        // background image - locked to Remotive brand
        sidebarBg: siteConfig.sidebarBg,
        setSidebarBg: (_value) => {
          // No-op: Sidebar background switching disabled for brand consistency
          console.log('[Store] Sidebar background change blocked - locked to brand');
        },
        mobileMenu: false,
        setMobileMenu: (value) => set({ mobileMenu: value }),
      }),
      {
        name: "sidebar-store",
        storage: createJSONStorage(() => localStorage),
        // Only persist safe values
        partialize: (state) => ({
          collapsed: state.collapsed,
          subMenu: state.subMenu,
          mobileMenu: state.mobileMenu,
        }),
      },
    ),
)