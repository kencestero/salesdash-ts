"use client"
import React, { useEffect, useState } from "react"
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import Header from "./components/header";
import SettingsHeader from "./components/settings-header"

interface UserProfile {
  phone?: string;
  city?: string;
  zip?: string;
  role?: string;
}

const ProfileLayout = ({ children }: { children: React.ReactNode }) => {
  const location = usePathname();
  const { data: session } = useSession();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (session?.user?.email) {
      // Fetch user profile data
      fetch(`/api/user/profile`)
        .then(res => res.json())
        .then(data => setUserProfile(data))
        .catch(err => console.error("Error fetching profile:", err));
    }
  }, [session?.user?.email]);

  if (location === "/user-profile/settings") {
    return <React.Fragment>
      <SettingsHeader session={session} userProfile={userProfile} />
      <div className="mt-6">
        {children}
      </div>
    </React.Fragment>
  }

  return (
    <React.Fragment>
      <Header session={session} userProfile={userProfile} />
      {children}
    </React.Fragment>
  );

};

export default ProfileLayout;