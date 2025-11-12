import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, TrendingUp, Clock, DollarSign } from "lucide-react";

export default function LeadScoringPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Lead Scoring System</h1>
        <p className="text-muted-foreground mt-2">
          Understand how lead quality scores are calculated
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>How Lead Scoring Works</CardTitle>
          <CardDescription>
            Our intelligent scoring system evaluates leads based on multiple factors
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-600" />
              Scoring Criteria
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Contact Information</span>
                  <Badge>+20 points</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Complete email and phone number
                </p>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Recent Activity</span>
                  <Badge>+30 points</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Contacted within last 7 days
                </p>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Credit Application</span>
                  <Badge>+25 points</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Submitted finance application
                </p>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Engagement</span>
                  <Badge>+25 points</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Multiple interactions logged
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Lead Temperature
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded">
                <span className="font-medium">Hot (80-100)</span>
                <span className="text-sm text-muted-foreground">Ready to close</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded">
                <span className="font-medium">Warm (50-79)</span>
                <span className="text-sm text-muted-foreground">Engaged and interested</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded">
                <span className="font-medium">Cold (0-49)</span>
                <span className="text-sm text-muted-foreground">Needs nurturing</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Best Practices</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <Clock className="w-4 h-4 mt-0.5 text-primary" />
                <span>Contact hot leads within 24 hours for best conversion</span>
              </li>
              <li className="flex items-start gap-2">
                <DollarSign className="w-4 h-4 mt-0.5 text-primary" />
                <span>Focus on leads with finance applications first</span>
              </li>
              <li className="flex items-start gap-2">
                <Star className="w-4 h-4 mt-0.5 text-primary" />
                <span>Regular updates improve lead scores over time</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
