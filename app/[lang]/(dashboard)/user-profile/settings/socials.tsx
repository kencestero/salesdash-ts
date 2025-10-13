"use client"
import Image, { StaticImageData } from "next/image";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import githubImage from "@/public/images/social/github-circle.png"
import dribble from "@/public/images/social/dribble-1.png"
import behance from "@/public/images/social/behance-1.png"
import pinterest from "@/public/images/social/pinterest-circle.png"
import web from "@/public/images/social/web.png"
import { X } from "lucide-react";
const Socials = () => {
  interface socialItem {
    id: number;
    name: string;
    image: StaticImageData;
    link: string;
  }
  // Empty socials - users can add their own portfolio links
  const socials: socialItem[] = []
  return (
    <Card>
      <CardHeader className="border-none mb-0">
        <CardTitle className="text-lg font-medium text-default-800">Portfolio</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 overflow-auto">
          {socials.length === 0 ? (
            <div className="text-center py-8 text-default-500">
              <p className="text-sm">No portfolio links added yet</p>
              <p className="text-xs mt-1">Add your social media and portfolio URLs here</p>
            </div>
          ) : (
            socials.map((item, index) => (
              <div className="flex items-center gap-4" key={`social-item-${index}`}>
                <Image src={item.image} alt={item.name} width={36} height={36} className="flex-none" priority={true} />
                <div className="flex-1 flex items-center gap-2 bg-default-100 dark:bg-default-50 py-2.5 px-3 rounded">
                  <span className="flex-1 text-sm text-default-600">{item.link}</span>
                  <X className="flex-none w-3.5 h-3.5 text-default-600" />
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
};

export default Socials;