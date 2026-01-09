import { useSidebar } from "@/store";
import React from "react";
import Image from "next/image";

function SidebarLogo({ hovered }: { hovered?: boolean; }) {
  const { sidebarType, setCollapsed, collapsed } = useSidebar();
  return (
    <div className="px-4 py-4">
      <div className="flex items-center justify-center">
        <div className="flex items-center gap-x-3">
          {collapsed && !hovered ? (
            // Show just the R icon when collapsed
            <Image
              src="/images/logo/remotive-r.png"
              alt="Remotive"
              width={36}
              height={36}
              priority
              className="drop-shadow-[0_0_8px_rgba(233,97,20,0.5)]"
            />
          ) : (
            // Show full logo when expanded
            <Image
              src="/images/Remotivesaleshublogo.webp"
              alt="Remotive SalesHub"
              width={180}
              height={40}
              priority
              className="drop-shadow-[0_0_8px_rgba(233,97,20,0.3)]"
            />
          )}
        </div>
        {sidebarType === "classic" && (!collapsed || hovered) && (
          <div className="flex-none lg:block hidden">
            <div
              onClick={() => setCollapsed(!collapsed)}
              className={`h-4 w-4 border-[1.5px] border-default-900 dark:border-default-200 rounded-full transition-all duration-150
          ${collapsed
                  ? ""
                  : "ring-2 ring-inset ring-offset-4 ring-default-900 bg-default-900 dark:ring-offset-default-300"}
          `}
            ></div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SidebarLogo;
