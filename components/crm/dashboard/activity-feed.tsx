"use client";

/**
 * Activity Feed Widget
 * Shows recent team activities
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, Mail, MessageSquare, FileText, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Activity {
  id: string;
  type: string;
  subject: string;
  description: string | null;
  customerName: string;
  createdAt: Date;
}

interface ActivityFeedProps {
  activities: Activity[];
}

const activityIcons = {
  call: Phone,
  email: Mail,
  meeting: MessageSquare,
  note: FileText,
  task: Clock,
};

const activityColors = {
  call: "bg-blue-500",
  email: "bg-purple-500",
  meeting: "bg-green-500",
  note: "bg-gray-500",
  task: "bg-orange-500",
};

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 max-h-[500px] overflow-y-auto">
        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No recent activity
          </p>
        ) : (
          activities.map((activity) => {
            const Icon =
              activityIcons[activity.type as keyof typeof activityIcons] || FileText;
            const iconBg =
              activityColors[activity.type as keyof typeof activityColors] ||
              "bg-gray-500";

            return (
              <div key={activity.id} className="flex gap-3">
                {/* Icon */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full ${iconBg} flex items-center justify-center`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{activity.subject}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {activity.customerName}
                  </p>
                  {activity.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {activity.description}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(activity.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>

                {/* Type Badge */}
                <Badge variant="outline" className="text-xs flex-shrink-0">
                  {activity.type}
                </Badge>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
