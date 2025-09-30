import { useSidebar } from "@/store";
import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";

function SidebarLogo({ hovered }: { hovered?: boolean; }) {
  const { sidebarType, setCollapsed, collapsed } = useSidebar();
  return (
    <div className="px-4 py-4 ">
      <div className=" flex items-center">
        <div className="flex flex-1 items-center gap-x-3  ">
          <Image src="/logo.svg" alt="MJ Cargo" width={32} height={32} priority />
          {(!collapsed || hovered) && (
            <div className="flex-1  text-xl text-primary  font-semibold">
              SalesDash
            </div>
          )}
        </div>
        {sidebarType === "classic" && (!collapsed || hovered) && (
          <div className="flex-none lg:block hidden">
            <div
              onClick={() => setCollapsed(!collapsed)}
              className={`h-4 w-4 border-[1.5px] border-default-900 dark:border-default-200 rounded-full transition-all duration-150
          ${collapsed
                  ? ""
                  : "ring-2 ring-inset ring-offset-4 ring-default-900  bg-default-900  dark:ring-offset-default-300"}
          `}
            ></div>
          </div>
        )}
      </div>
      {/* Google sign-in button - removed broken icon line */}
      <Button 
        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
        className="w-full bg-[#E96114] hover:bg-[#d4530e] text-white py-2 rounded-md mt-2"
      >
        Continue with Google
      </Button>
    </div>
  );
}

export default SidebarLogo;
