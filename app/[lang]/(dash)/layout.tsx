import type { Metadata } from "next";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { AppTopbar } from "@/components/layout/AppTopbar";

export const metadata: Metadata = {
  title: "MJ SalesDash - New Layout",
};

type Props = {
  children: React.ReactNode;
  params: { lang: string };
};

export default function NewDashLayout({ children, params }: Props) {
  const { lang } = params;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] min-h-screen">
      <aside className="hidden lg:block border-r border-neutral-800 bg-neutral-900/60 backdrop-blur">
        <AppSidebar lang={lang} />
      </aside>
      <div className="flex min-h-screen flex-col">
        <AppTopbar lang={lang} />
        <main className="flex-1 p-4 lg:p-6 bg-neutral-950 text-neutral-100">{children}</main>
      </div>
    </div>
  );
}
