"use client";
import React from "react";
import { useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import { AppTopbar } from "@/components/layout/AppTopbar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { cn } from "@/lib/utils";
import { useSidebar, useThemeStore } from "@/store";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, usePathname } from "next/navigation";
import Footer from "@/components/partials/footer";
import { useMediaQuery } from "@/hooks/use-media-query";
import ThemeCustomize from "@/components/partials/customizer/theme-customizer";
import MobileSidebar from "@/components/partials/sidebar/mobile-sidebar";
import HeaderSearch from "@/components/header-search";
import { useMounted } from "@/hooks/use-mounted";
import LayoutLoader from "@/components/layout-loader";
import { PasskeyPrompt } from "@/components/passkey-prompt";

function SessionTimeout() {
  const { data: session } = useSession();
  const [showWarning, setShowWarning] = React.useState(false);

  useEffect(() => {
    if (!session) return;

    let inactivityTimeout: NodeJS.Timeout;
    let warningTimeout: NodeJS.Timeout;

    const INACTIVITY_TIME = 20 * 60 * 1000; // 20 minutes until warning
    const WARNING_TIME = 7 * 60 * 1000; // 7 minutes to respond to warning

    const resetTimer = () => {
      clearTimeout(inactivityTimeout);
      clearTimeout(warningTimeout);
      setShowWarning(false);

      inactivityTimeout = setTimeout(() => {
        // Show warning dialog
        setShowWarning(true);

        // Start countdown to auto-logout
        warningTimeout = setTimeout(() => {
          signOut({ callbackUrl: '/en/auth/login' });
        }, WARNING_TIME);
      }, INACTIVITY_TIME);
    };

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => document.addEventListener(event, resetTimer));

    resetTimer();

    return () => {
      clearTimeout(inactivityTimeout);
      clearTimeout(warningTimeout);
      events.forEach(event => document.removeEventListener(event, resetTimer));
    };
  }, [session]);

  const handleStayActive = () => {
    setShowWarning(false);
    // Trigger a fake event to reset timer
    document.dispatchEvent(new Event('mousedown'));
  };

  const handleLogout = () => {
    signOut({ callbackUrl: '/en/auth/login' });
  };

  if (!showWarning) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
      <div className="mx-4 w-full max-w-md rounded-lg bg-background p-6 shadow-lg">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-warning/10">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Are you still active?</h3>
            <p className="text-sm text-muted-foreground">You will be logged out for inactivity.</p>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <button
            onClick={handleStayActive}
            className="w-full rounded-md bg-primary px-4 py-2.5 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Yes, still working
          </button>
          <button
            onClick={handleLogout}
            className="w-full rounded-md border border-input bg-background px-4 py-2.5 font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            No, log me out
          </button>
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          You will be automatically logged out in 7 minutes if no action is taken.
        </p>
      </div>
    </div>
  );
}

const DashBoardLayoutProvider = ({ children, trans }: { children: React.ReactNode, trans: any }) => {
  const { collapsed, sidebarType, setCollapsed, subMenu } = useSidebar();
  const [open, setOpen] = React.useState(false);
  const { layout } = useThemeStore();
  const location = usePathname();
  const isMobile = useMediaQuery("(min-width: 768px)");
  const mounted = useMounted();
  if (!mounted) {
    return <LayoutLoader />;
  }
  if (layout === "semibox") {
    return (
      <>
        <SessionTimeout />
        <PasskeyPrompt />
        <AppTopbar handleOpenSearch={() => setOpen(true)} trans={trans} />
        <AppSidebar trans={trans} />

        <div
          className={cn("content-wrapper transition-all duration-150 ", {
            "ltr:xl:ml-[72px] rtl:xl:mr-[72px]": collapsed,
            "ltr:xl:ml-[272px] rtl:xl:mr-[272px]": !collapsed,
          })}
        >
          <div
            className={cn(
              "pt-6 pb-8 px-4  page-min-height-semibox ",

            )}
          >
            <div className="semibox-content-wrapper ">
              <LayoutWrapper
                isMobile={isMobile}
                setOpen={setOpen}
                open={open}
                location={location}
                trans={trans}
              >
                {children}
              </LayoutWrapper>
            </div>
          </div>
        </div>
        <Footer handleOpenSearch={() => setOpen(true)} />
        <ThemeCustomize />
      </>
    );
  }
  if (layout === "horizontal") {
    return (
      <>
        <SessionTimeout />
        <PasskeyPrompt />
        <AppTopbar handleOpenSearch={() => setOpen(true)} trans={trans} />

        <div className={cn("content-wrapper transition-all duration-150 ")}>
          <div
            className={cn(
              "  pt-6 px-6 pb-8  page-min-height-horizontal ",
              {}
            )}
          >
            <LayoutWrapper
              isMobile={isMobile}
              setOpen={setOpen}
              open={open}
              location={location}
              trans={trans}
            >
              {children}
            </LayoutWrapper>
          </div>
        </div>
        <Footer handleOpenSearch={() => setOpen(true)} />
        <ThemeCustomize />
      </>
    );
  }

  if (sidebarType !== "module") {
    return (
      <>
        <SessionTimeout />
        <PasskeyPrompt />
        <AppTopbar handleOpenSearch={() => setOpen(true)} trans={trans} />
        <AppSidebar trans={trans} />

        <div
          className={cn("content-wrapper transition-all duration-150 ", {
            "ltr:xl:ml-[248px] rtl:xl:mr-[248px] ": !collapsed,
            "ltr:xl:ml-[72px] rtl:xl:mr-[72px]": collapsed,
          })}
        >
          <div
            className={cn(
              "  pt-6 px-6 pb-8  page-min-height ",
              {}
            )}
          >
            <LayoutWrapper
              isMobile={isMobile}
              setOpen={setOpen}
              open={open}
              location={location}
              trans={trans}
            >
              {children}
            </LayoutWrapper>
          </div>
        </div>
        <Footer handleOpenSearch={() => setOpen(true)} />
        <ThemeCustomize />
      </>
    );
  }
  return (
    <>
      <SessionTimeout />
        <PasskeyPrompt />
      <AppTopbar handleOpenSearch={() => setOpen(true)} trans={trans} />
      <Sidebar trans={trans} />

      <div
        className={cn("content-wrapper transition-all duration-150 ", {
          "ltr:xl:ml-[300px] rtl:xl:mr-[300px]": !collapsed,
          "ltr:xl:ml-[72px] rtl:xl:mr-[72px]": collapsed,
        })}
      >
        <div
          className={cn(
            " layout-padding px-6 pt-6  page-min-height ",

          )}
        >
          <LayoutWrapper
            isMobile={isMobile}
            setOpen={setOpen}
            open={open}
            location={location}
            trans={trans}
          >
            {children}
          </LayoutWrapper>
        </div>
      </div>
      <Footer handleOpenSearch={() => setOpen(true)} />
      {isMobile && <ThemeCustomize />}
    </>
  );
};

export default DashBoardLayoutProvider;

const LayoutWrapper = ({ children, isMobile, setOpen, open, location, trans }: { children: React.ReactNode, isMobile: boolean, setOpen: any, open: boolean, location: any, trans: any }) => {
  return (
    <>
      <motion.div
        key={location}
        initial="pageInitial"
        animate="pageAnimate"
        exit="pageExit"
        variants={{
          pageInitial: {
            opacity: 0,
            y: 50,
          },
          pageAnimate: {
            opacity: 1,
            y: 0,
          },
          pageExit: {
            opacity: 0,
            y: -50,
          },
        }}
        transition={{
          type: "tween",
          ease: "easeInOut",
          duration: 0.5,
        }}
      >
        <main>{children}</main>
      </motion.div>

      <MobileSidebar trans={trans} className="left-[300px]" />
      <HeaderSearch open={open} setOpen={setOpen} />
    </>
  );
};
