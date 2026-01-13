"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import ProfileProgress from './overview/profile-progress';
import UserInfo from './overview/user-info';
import About from "./overview/about";
import Friends from "./overview/friends";
import TeamCard from "./overview/team-card";
import BadgesCard from "./overview/badges-card";
import MonthlyGoal from "./overview/monthly-goal";
import RecruitmentTools from "./overview/recruitment-tools";

interface UserProfile {
  phone?: string;
  city?: string;
  zip?: string;
  role?: string;
}

const Overview = () => {
  const { data: session } = useSession();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (session?.user?.email) {
      fetch(`/api/user/profile`)
        .then(res => res.json())
        .then(data => {
          // API returns { user: {...}, profile: {...} }
          setUserProfile(data.profile || data);
        })
        .catch(err => console.error("Error fetching profile:", err));
    }
  }, [session?.user?.email]);

  return (
    <div className="pt-6 grid grid-cols-12 gap-6">
      {/* Left Column */}
      <div className="col-span-12 lg:col-span-4 space-y-6">
        <ProfileProgress />
        <UserInfo session={session} userProfile={userProfile} />
        <MonthlyGoal />
        <BadgesCard />
      </div>

      {/* Right Column */}
      <div className="col-span-12 lg:col-span-8 space-y-6">
        <About session={session} userProfile={userProfile} />
        <RecruitmentTools userRole={userProfile?.role} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Friends />
          <TeamCard />
        </div>
      </div>
    </div>
  );
};

export default Overview;