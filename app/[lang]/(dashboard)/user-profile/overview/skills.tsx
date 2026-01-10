"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

const Skills = () => {
  const skills = [
    { name: "Enclosed Trailers", color: "bg-[#E96114]/10 text-[#E96114]" },
    { name: "Utility Trailers", color: "bg-[#09213C]/10 text-[#09213C]" },
    { name: "Customer Service", color: "bg-green-500/10 text-green-600" },
    { name: "Finance Options", color: "bg-purple-500/10 text-purple-600" },
    { name: "Cargo Solutions", color: "bg-blue-500/10 text-blue-600" },
    { name: "Diamond Cargo", color: "bg-[#E96114]/10 text-[#E96114]" },
    { name: "Quality Cargo", color: "bg-amber-500/10 text-amber-600" },
    { name: "Panther Cargo", color: "bg-slate-500/10 text-slate-600" },
    { name: "RTO Financing", color: "bg-pink-500/10 text-pink-600" },
    { name: "Conventional Loans", color: "bg-cyan-500/10 text-cyan-600" },
  ];

  return (
    <Card>
      <CardHeader className="flex-row items-center border-none mb-2">
        <CardTitle className="flex-1">Expertise</CardTitle>
        <Button
          size="icon"
          className="flex-none bg-default-100 dark:bg-default-50 text-default-500 hover:bg-default-100 rounded h-6 w-6 -mt-1"
        >
          <Sparkles className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 items-center">
          {skills.map((item, index) => (
            <Badge
              key={`skill-${index}`}
              className={`text-xs font-medium ${item.color} hover:opacity-80 transition-opacity`}
            >
              {item.name}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default Skills;
