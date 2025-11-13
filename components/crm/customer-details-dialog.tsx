"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  User,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  TrendingUp,
  FileText,
  Calendar,
  CheckCircle2,
  Flame,
  Thermometer,
  Snowflake,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CustomerDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    salesRepName: string;
    phone?: string;
    email?: string;
    address?: string;
    city?: string;
    state?: string;
    zipcode?: string;
    source?: string;
    temperature: "hot" | "warm" | "cold" | "dead";
    priority: "urgent" | "high" | "medium" | "low";
    leadScore: number;
    deals?: { value: number; status: string }[];
    activityCount: number;
    notes?: string;
    tags?: string[];
  };
}

export function CustomerDetailsDialog({
  open,
  onOpenChange,
  customer,
}: CustomerDetailsDialogProps) {
  const initials = `${customer.firstName[0]}${customer.lastName[0]}`.toUpperCase();

  const temperatureConfig = {
    hot: { icon: Flame, color: "text-red-600", bg: "bg-red-100", label: "HOT" },
    warm: { icon: Thermometer, color: "text-orange-600", bg: "bg-orange-100", label: "WARM" },
    cold: { icon: Snowflake, color: "text-blue-600", bg: "bg-blue-100", label: "COLD" },
    dead: { icon: User, color: "text-gray-600", bg: "bg-gray-100", label: "DEAD" },
  };

  const tempConfig = temperatureConfig[customer.temperature];
  const TempIcon = tempConfig.icon;

  const totalDealValue = customer.deals?.reduce((sum, deal) => sum + deal.value, 0) || 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-4">
            <Avatar className={`h-16 w-16 ${tempConfig.bg}`}>
              <AvatarFallback className={`text-2xl font-bold ${tempConfig.color}`}>
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">
                {customer.firstName} {customer.lastName}
              </h2>
              <p className="text-sm text-muted-foreground">
                Sales Rep: {customer.salesRepName}
              </p>
            </div>
            <div className="ml-auto flex flex-col items-end gap-2">
              <Badge className={`${tempConfig.bg} ${tempConfig.color}`}>
                <TempIcon className="w-3 h-3 mr-1" />
                {tempConfig.label}
              </Badge>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-primary">{customer.leadScore}</span>
                <span className="text-sm text-muted-foreground">/100</span>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="deals">Deals</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[450px] w-full">
            <TabsContent value="overview" className="space-y-4 p-4">
              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Contact Information
                </h3>
                <div className="grid gap-3">
                  {customer.phone && (
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-md">
                      <Phone className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <a href={`tel:${customer.phone}`} className="font-semibold hover:underline">
                          {customer.phone}
                        </a>
                      </div>
                    </div>
                  )}
                  {customer.email && (
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-md">
                      <Mail className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <a href={`mailto:${customer.email}`} className="font-semibold hover:underline">
                          {customer.email}
                        </a>
                      </div>
                    </div>
                  )}
                  {(customer.address || customer.city) && (
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-md">
                      <MapPin className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="text-sm text-muted-foreground">Address</p>
                        <p className="font-semibold">
                          {customer.address && <>{customer.address}<br /></>}
                          {customer.city}, {customer.state} {customer.zipcode}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Lead Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Lead Information
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-muted rounded-md">
                    <p className="text-sm text-muted-foreground">Source</p>
                    <p className="font-semibold">{customer.source || "Unknown"}</p>
                  </div>
                  <div className="p-3 bg-muted rounded-md">
                    <p className="text-sm text-muted-foreground">Priority</p>
                    <Badge variant="outline" className="mt-1">
                      {customer.priority.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="p-3 bg-muted rounded-md">
                    <p className="text-sm text-muted-foreground">Activities</p>
                    <p className="font-semibold">{customer.activityCount} logged</p>
                  </div>
                  <div className="p-3 bg-muted rounded-md">
                    <p className="text-sm text-muted-foreground">Total Deal Value</p>
                    <p className="font-semibold text-green-600">${totalDealValue.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Tags */}
              {customer.tags && customer.tags.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {customer.tags.map((tag, index) => (
                      <Badge key={index} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="notes" className="p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Customer Notes
                  </h3>
                </div>
                <div className="p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-md">
                  <p className="text-sm whitespace-pre-wrap">
                    {customer.notes || "No notes available for this customer yet."}
                  </p>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Pro Tip:</strong> Call notes are automatically added here after each phone interaction.
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="activity" className="p-4">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Recent Activity ({customer.activityCount})
                </h3>
                <div className="space-y-3">
                  {/* Mock activity items - in production this would come from API */}
                  <div className="flex gap-3 p-3 bg-muted rounded-md">
                    <Phone className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-semibold">Phone Call</p>
                      <p className="text-sm text-muted-foreground">
                        15-minute discussion about trailer options
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">2 days ago</p>
                    </div>
                  </div>
                  <div className="flex gap-3 p-3 bg-muted rounded-md">
                    <Mail className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-semibold">Email Sent</p>
                      <p className="text-sm text-muted-foreground">
                        Sent pricing quote for 8.5x20 enclosed
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">5 days ago</p>
                    </div>
                  </div>
                  <div className="flex gap-3 p-3 bg-muted rounded-md">
                    <CheckCircle2 className="w-5 h-5 text-purple-600 mt-0.5" />
                    <div>
                      <p className="font-semibold">Status Updated</p>
                      <p className="text-sm text-muted-foreground">
                        Moved to Contacted stage
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">1 week ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="deals" className="p-4">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Deals ({customer.deals?.length || 0})
                </h3>
                {customer.deals && customer.deals.length > 0 ? (
                  <div className="space-y-3">
                    {customer.deals.map((deal, index) => (
                      <div key={index} className="p-4 bg-muted rounded-md">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold">Deal #{index + 1}</p>
                            <Badge variant="outline" className="mt-1">
                              {deal.status}
                            </Badge>
                          </div>
                          <p className="text-xl font-bold text-green-600">
                            ${deal.value.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-md">
                      <div className="flex justify-between items-center">
                        <p className="font-semibold">Total Deal Value</p>
                        <p className="text-2xl font-bold text-green-600">
                          ${totalDealValue.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No deals created yet</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
