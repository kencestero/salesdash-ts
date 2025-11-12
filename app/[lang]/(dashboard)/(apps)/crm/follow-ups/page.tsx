import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, Calendar, Mail, Clock } from "lucide-react";

export default function FollowUpsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Automated Follow-ups</h1>
        <p className="text-muted-foreground mt-2">
          Learn about automated customer engagement workflows
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Follow-up Automation System</CardTitle>
          <CardDescription>
            Our system automatically manages customer follow-ups to ensure no lead falls through the cracks
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Automated Triggers
            </h3>
            <div className="space-y-3">
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Stale Lead Detection</span>
                  <Badge>Every 24 hours</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Identifies leads not contacted in 7+ days and creates follow-up tasks
                </p>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Daily Digest</span>
                  <Badge>8:00 AM Daily</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Email summary of pending tasks, hot leads, and overdue follow-ups
                </p>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Application Follow-up</span>
                  <Badge>Immediate</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Auto-creates task when customer submits credit application
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Bell className="w-5 h-5 text-orange-600" />
              Notification Types
            </h3>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="p-3 border rounded flex items-start gap-3">
                <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <div className="font-medium">Email Notifications</div>
                  <p className="text-sm text-muted-foreground">Daily summaries and alerts</p>
                </div>
              </div>

              <div className="p-3 border rounded flex items-start gap-3">
                <Bell className="w-5 h-5 text-orange-600 mt-0.5" />
                <div>
                  <div className="font-medium">In-App Notifications</div>
                  <p className="text-sm text-muted-foreground">Real-time dashboard alerts</p>
                </div>
              </div>

              <div className="p-3 border rounded flex items-start gap-3">
                <Calendar className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <div className="font-medium">Calendar Events</div>
                  <p className="text-sm text-muted-foreground">Scheduled reminders</p>
                </div>
              </div>

              <div className="p-3 border rounded flex items-start gap-3">
                <Clock className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <div className="font-medium">Task Assignments</div>
                  <p className="text-sm text-muted-foreground">Auto-assigned to reps</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Customization Options</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Contact your manager or system administrator to customize:
            </p>
            <ul className="space-y-2 text-sm list-disc list-inside">
              <li>Follow-up timing intervals</li>
              <li>Notification preferences</li>
              <li>Stale lead definitions</li>
              <li>Task assignment rules</li>
              <li>Email template content</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
