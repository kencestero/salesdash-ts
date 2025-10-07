"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Phone, Location, CalenderCheck } from "@/components/svg";
import { Session } from "next-auth";

interface UserInfoItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}

interface UserProfile {
  phone?: string;
  city?: string;
  zip?: string;
  role?: string;
}

interface UserInfoProps {
  session: Session | null;
  userProfile: UserProfile | null;
}

const UserInfo = ({ session, userProfile }: UserInfoProps) => {
  const userInfo: UserInfoItem[] = [
    {
      icon: User,
      label: "Full Name",
      value: session?.user?.name || "Not provided"
    },
    {
      icon: Phone,
      label: "Mobile",
      value: userProfile?.phone || "Not provided"
    },
    {
      icon: Location,
      label: "Location",
      value: userProfile?.city ? `${userProfile.city}${userProfile.zip ? ', ' + userProfile.zip : ''}` : "Not provided"
    },
    {
      icon: CalenderCheck,
      label: "Role",
      value: userProfile?.role ? userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1) : "Team Member"
    },
  ]
  return (
    <Card>
      <CardHeader className="border-none mb-0">
        <CardTitle className="text-lg font-medium text-default-800">Information</CardTitle>
      </CardHeader>
      <CardContent className="px-4">
        <p className="text-sm text-default-600 mb-6">
          {session?.user?.email || "Email not available"}
        </p>
        <ul className="space-y-4">
          {
            userInfo.map((item, index) => (
              <li
                key={`user-info-${index}`}
                className="flex items-center"
              >
                <div className="flex-none  2xl:w-56 flex items-center gap-1.5">
                  <span>{<item.icon className="w-4 h-4 text-primary" />}</span>
                  <span className="text-sm font-medium text-default-800">{item.label}:</span>
                </div>
                <div className="flex-1 text-sm text-default-700">{item.value}</div>
              </li>
            ))
          }
        </ul>
      </CardContent>
    </Card>
  );
};

export default UserInfo;
