"use client"
import { UserSign, Mail2 } from '@/components/svg';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icon } from '@iconify/react';
import { Session } from "next-auth";

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
  return (
    <Card>
      <CardHeader className="flex-row justify-between items-center mb-3 border-none">
        <CardTitle className="text-lg font-medium text-default-800">About</CardTitle>
        <Button
          size="icon"
          className="w-6 h-6 bg-default-100 dark:bg-default-50 text-default-500 hover:bg-default-100"
        >
          <Icon icon="heroicons:ellipsis-vertical" className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-default-600 mb-3">
          Hi I&apos;m {session?.user?.name || 'there'}, welcome to my profile!
          I&apos;m part of the Remotive Logistics sales team, working to provide the best trailer solutions for our customers.
          As a {userProfile?.role || 'team member'}, I focus on delivering exceptional service and building lasting relationships.
        </div>
        <div className="text-sm text-default-600">
          You always want to make sure that your fonts work well together and try to limit the number of fonts you use to three or less.
          Experiment and play around with the fonts that you&apos;re working with reputable font websites.
          This may be the most commonly encountered tip I received from the designers I spoke with.
          They highly encourage that you use different fonts in one design, but do not over-exaggerate and go overboard.
        </div>
        <div className='mt-6 flex flex-wrap items-center gap-6 2xl:gap-16'>
          {
            [
              {
                title: "Role",
                position: userProfile?.role ? userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1) : "Team Member",
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
                  <item.icon className='w-6 h-6 text-default-600' />
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
