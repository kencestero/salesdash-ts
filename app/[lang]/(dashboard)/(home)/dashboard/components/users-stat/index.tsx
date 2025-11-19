"use client"
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Icon } from "@iconify/react";
import UsersDataChart from "./users-data-chart";
import UsersDataTable from "./users-data-table";

interface Users {
  id: number;
  country: string;
  count: string;
}

interface DailyUsersData {
  count: number;
  percentageChange: number;
  trend: "up" | "down" | "same";
  yesterdayCount: number;
}

const UsersStat = () => {
  const [dailyUsers, setDailyUsers] = useState<DailyUsersData>({
    count: 0,
    percentageChange: 0,
    trend: "same",
    yesterdayCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDailyUsers();
  }, []);

  const fetchDailyUsers = async () => {
    try {
      const response = await fetch("/api/analytics/daily-users");
      if (response.ok) {
        const data = await response.json();
        setDailyUsers(data);
      }
    } catch (error) {
      console.error("Failed to fetch daily users:", error);
    } finally {
      setLoading(false);
    }
  };

  const usersData:Users[] = [
    {
      id: 1,
      country: "Bangladesh",
      count: "05",
    },
    {
      id: 2,
      country: "India",
      count: "06",
    },
    {
      id: 3,
      country: "Pakistan",
      count: "06",
    },
    {
      id: 4,
      country: "Australia",
      count: "10",
    },
    {
      id: 5,
      country: "America",
      count: "08",
    },
  ];
  return (
    <Card>
      <CardHeader className="border-none pb-0 mb-5">
        <div className="flex items-center gap-1">
          <div className="flex-1">
            <div className="text-xl font-semibold text-default-900"> Daily Users </div>
            <span className="text-xs text-default-600 ml-1">Logged in Today</span>
          </div>
          <div className="flex-none flex items-center gap-1">
            {loading ? (
              <span className="text-4xl font-semibold text-primary">...</span>
            ) : (
              <>
                <span className="text-4xl font-semibold text-primary">{dailyUsers.count}</span>
                {dailyUsers.trend !== "same" && (
                  <span className={`text-2xl ${dailyUsers.trend === "up" ? "text-success" : "text-destructive"}`}>
                    <Icon
                      icon={
                        dailyUsers.trend === "up"
                          ? "heroicons:arrow-trending-up-16-solid"
                          : "heroicons:arrow-trending-down-16-solid"
                      }
                    />
                  </span>
                )}
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-0">
        <p className="text-xs font-medium text-default-800">User Per Minutes</p>
        <UsersDataChart />
        <UsersDataTable
          users={usersData}
        />
      </CardContent>
    </Card>
  );
};

export default UsersStat;