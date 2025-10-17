"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import ProfileProgress from './overview/profile-progress';
import UserInfo from './overview/user-info';
import RepCodeInfo from './overview/rep-code-info';
import Portfolio from './overview/portfolio';
import Skills from './overview/skills';
import Connections from "./overview/connections"
import Teams from "./overview/teams"
import About from "./overview/about"
import RecentActivity from "./overview/recent-activity"
import Projects from './overview/projects';

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
        .then(data => setUserProfile(data))
        .catch(err => console.error("Error fetching profile:", err));
    }
  }, [session?.user?.email]);

  return (
    <div className="pt-6 grid grid-cols-12 gap-6">
      <div className="col-span-12 lg:col-span-4 space-y-6">
        <ProfileProgress />
        <UserInfo session={session} userProfile={userProfile} />
        <RepCodeInfo userProfile={userProfile} />
        <Portfolio />
        <Skills />
        <Connections />
        <Teams />
      </div>
      <div className="col-span-12 lg:col-span-8 space-y-6">
        <About session={session} userProfile={userProfile} />
        <RecentActivity />
        <Projects />
      </div>
    </div>
  );
};

export default Overview;