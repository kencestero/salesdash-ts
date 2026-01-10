"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, Truck, Package, Calculator, Users, FileText } from "lucide-react";
import Link from "next/link";

interface QuickLinkData {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  link: string;
  color: string;
  bgColor: string;
}

const Portfolio = () => {
  const data: QuickLinkData[] = [
    {
      name: "Inventory",
      icon: Package,
      link: "/en/inventory",
      color: "text-[#E96114]",
      bgColor: "bg-[#E96114]/10 hover:bg-[#E96114]/20",
    },
    {
      name: "CRM",
      icon: Users,
      link: "/en/crm/customers",
      color: "text-[#09213C]",
      bgColor: "bg-[#09213C]/10 hover:bg-[#09213C]/20",
    },
    {
      name: "Calculator",
      icon: Calculator,
      link: "/en/finance/compare",
      color: "text-green-600",
      bgColor: "bg-green-500/10 hover:bg-green-500/20",
    },
    {
      name: "Credit Apps",
      icon: FileText,
      link: "/en/credit",
      color: "text-purple-600",
      bgColor: "bg-purple-500/10 hover:bg-purple-500/20",
    },
    {
      name: "Dashboard",
      icon: Truck,
      link: "/en/dashboard",
      color: "text-blue-600",
      bgColor: "bg-blue-500/10 hover:bg-blue-500/20",
    },
  ];

  return (
    <Card>
      <CardHeader className="flex-row items-center border-none mb-2">
        <CardTitle className="flex-1">Quick Links</CardTitle>
        <Button
          size="icon"
          className="flex-none bg-default-100 dark:bg-default-50 text-default-500 hover:bg-default-100 rounded h-6 w-6 -mt-1"
        >
          <ExternalLink className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3 items-center">
          {data.map((item, index) => (
            <Link
              key={`portfolio-${index}`}
              href={item.link}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${item.bgColor}`}
            >
              <item.icon className={`h-5 w-5 ${item.color}`} />
              <span className={`text-sm font-medium ${item.color}`}>{item.name}</span>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default Portfolio;
