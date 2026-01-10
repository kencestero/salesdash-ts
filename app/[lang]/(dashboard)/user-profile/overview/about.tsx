"use client"
import { UserSign, Mail2 } from '@/components/svg';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icon } from '@iconify/react';
import { Session } from "next-auth";
import { Truck, Target, Award } from "lucide-react";

interface UserProfile {
  phone?: string;
  city?: string;
  zip?: string;
  role?: string;
}

interface AboutProps {
  session: Session | null;
  userProfile: UserProfile | null;
}

const About = ({ session, userProfile }: AboutProps) => {
  const roleDescriptions: Record<string, string> = {
    owner: "leading the Remotive Logistics team and driving our mission to deliver quality cargo trailers to customers nationwide.",
    director: "overseeing sales operations and ensuring our team delivers exceptional trailer solutions to every customer.",
    manager: "guiding our sales representatives to success and helping customers find their perfect cargo trailer match.",
    salesperson: "connecting customers with the right trailer solutions, from enclosed cargo trailers to utility trailers.",
  };

  const currentRole = userProfile?.role?.toLowerCase() || "salesperson";
  const roleDescription = roleDescriptions[currentRole] || roleDescriptions.salesperson;

  return (
    <Card>
      <CardHeader className="flex-row justify-between items-center mb-3 border-none">
        <CardTitle className="text-lg font-medium text-default-800">About Me</CardTitle>
        <Button
          size="icon"
          className="w-6 h-6 bg-default-100 dark:bg-default-50 text-default-500 hover:bg-default-100"
        >
          <Icon icon="heroicons:ellipsis-vertical" className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-default-600 mb-3">
          Hi, I&apos;m {session?.user?.name?.split(' ')[0] || 'there'}! Welcome to my profile.
          I&apos;m part of the Remotive Logistics sales team, {roleDescription}
        </div>
        <div className="text-sm text-default-600">
          Specializing in <span className="font-medium text-[#E96114]">Diamond Cargo</span>, <span className="font-medium text-[#E96114]">Quality Cargo</span>, and <span className="font-medium text-[#E96114]">Panther Cargo</span> trailers,
          I help businesses and individuals find the perfect enclosed cargo trailer, utility trailer, or specialty trailer for their needs.
          Whether you&apos;re hauling equipment, starting a mobile business, or need reliable transportation solutions, I&apos;m here to help!
        </div>

        {/* Quick Stats */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-[#E96114]/10 rounded-lg">
            <Truck className="w-6 h-6 mx-auto text-[#E96114] mb-1" />
            <div className="text-xs text-default-500">Specialties</div>
            <div className="text-sm font-semibold text-default-800">Cargo Trailers</div>
          </div>
          <div className="text-center p-3 bg-[#09213C]/10 rounded-lg">
            <Target className="w-6 h-6 mx-auto text-[#09213C] mb-1" />
            <div className="text-xs text-default-500">Focus</div>
            <div className="text-sm font-semibold text-default-800">Customer Service</div>
          </div>
          <div className="text-center p-3 bg-green-500/10 rounded-lg">
            <Award className="w-6 h-6 mx-auto text-green-600 mb-1" />
            <div className="text-xs text-default-500">Commitment</div>
            <div className="text-sm font-semibold text-default-800">Quality First</div>
          </div>
        </div>

        <div className='mt-6 flex flex-wrap items-center gap-6 2xl:gap-16'>
          {
            [
              {
                title: "Role",
                position: userProfile?.role ? userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1) : "Sales Representative",
                icon: UserSign
              },
              {
                title: "Email",
                position: session?.user?.email || "Not available",
                icon: Mail2
              }
            ].map((item, index) => (
              <div key={`about-${index}`} className='flex items-center gap-2'>
                <div>
                  <item.icon className='w-6 h-6 text-[#E96114]' />
                </div>
                <div>
                  <div className='text-xs text-default-500 font-normal mb-1'>{item.title}:</div>
                  <div className='text-sm font-medium text-default-700'>{item.position}</div>
                </div>
              </div>
            ))
          }
        </div>
      </CardContent>
    </Card>
  );
};

export default About;
