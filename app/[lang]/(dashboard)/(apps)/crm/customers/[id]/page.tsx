"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Building2,
  Calendar,
  Tag,
  Edit,
  Trash2,
  Plus,
  FileText,
  DollarSign,
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import Link from "next/link";

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  companyName?: string;
  businessType?: string;
  source?: string;
  assignedTo?: string;
  status: string;
  tags: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
  lastContactedAt?: string;
  // New fields
  trailerSize?: string;
  financingType?: string;
  stockNumber?: string;
  isFactoryOrder?: boolean;
  appliedDate?: string;
  assignedManager?: string;
  _count: {
    deals: number;
    activities: number;
    creditApps: number;
    quotes: number;
  };
  deals: any[];
  activities: any[];
  creditApps: any[];
  quotes: any[];
}

// Status badge colors matching the DashTail purple/blue theme
const statusColors: Record<string, string> = {
  lead: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  contacted: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
  qualified: "bg-purple-100 text-purple-800 hover:bg-purple-100",
  negotiating: "bg-orange-100 text-orange-800 hover:bg-orange-100",
  won: "bg-green-100 text-green-800 hover:bg-green-100",
  lost: "bg-red-100 text-red-800 hover:bg-red-100",
  applied: "bg-indigo-100 text-indigo-800 hover:bg-indigo-100",
};

const statusIcons: Record<string, any> = {
  lead: AlertCircle,
  contacted: Clock,
  qualified: CheckCircle2,
  negotiating: TrendingUp,
  won: CheckCircle2,
  lost: XCircle,
  applied: FileText,
};

export default function CustomerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState("");
  const [leadAge, setLeadAge] = useState("");
  const [showLogCallDialog, setShowLogCallDialog] = useState(false);
  const [callNotes, setCallNotes] = useState("");

  // Fetch customer data
  useEffect(() => {
    if (params.id) {
      fetchCustomer();
    }
  }, [params.id]);

  const fetchCustomer = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/crm/customers/${params.id}`);

      if (!response.ok) {
        throw new Error("Failed to fetch customer");
      }

      const data = await response.json();
      setCustomer(data.customer);
      setNotes(data.customer.notes || "");
    } catch (error) {
      console.error("Error fetching customer:", error);
      toast({
        title: "Error",
        description: "Failed to load customer data",
        variant: "destructive",
      });
      router.push("/en/crm/customers");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!customer) return;

    try {
      const response = await fetch(`/api/crm/customers/${customer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });

      if (!response.ok) {
        throw new Error("Failed to update notes");
      }

      toast({
        title: "Success",
        description: "Notes updated successfully",
      });
      fetchCustomer();
    } catch (error) {
      console.error("Error updating notes:", error);
      toast({
        title: "Error",
        description: "Failed to update notes",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Never";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const calculateLeadAge = () => {
    if (!customer?.createdAt) return;

    const created = new Date(customer.createdAt);
    const now = new Date();
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffDays > 0) {
      setLeadAge(`${diffDays} day${diffDays > 1 ? 's' : ''}`);
    } else if (diffHours > 0) {
      setLeadAge(`${diffHours} hour${diffHours > 1 ? 's' : ''}`);
    } else {
      setLeadAge(`${diffMins} minute${diffMins > 1 ? 's' : ''}`);
    }
  };

  // Update lead age every minute
  useEffect(() => {
    if (customer) {
      calculateLeadAge();
      const interval = setInterval(calculateLeadAge, 60000);
      return () => clearInterval(interval);
    }
  }, [customer]);

  const handleLogCall = async () => {
    if (!customer || !callNotes.trim()) {
      toast({
        title: "Error",
        description: "Please enter call notes",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch('/api/crm/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: customer.id,
          type: 'call',
          subject: 'Phone Call',
          description: callNotes,
        }),
      });

      if (!response.ok) throw new Error('Failed to log call');

      toast({
        title: "Success",
        description: "Call logged successfully",
      });

      setShowLogCallDialog(false);
      setCallNotes("");
      fetchCustomer(); // Refresh to show new activity
    } catch (error) {
      console.error('Error logging call:', error);
      toast({
        title: "Error",
        description: "Failed to log call",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Customer not found</h2>
          <Button onClick={() => router.push("/en/crm/customers")} className="mt-4">
            Back to Customers
          </Button>
        </div>
      </div>
    );
  }

  const StatusIcon = statusIcons[customer.status.toLowerCase()] || AlertCircle;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push("/en/crm/customers")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-default-900">
                {customer.firstName} {customer.lastName}
              </h1>
              <Badge className={statusColors[customer.status.toLowerCase()]}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {customer.status}
              </Badge>
              {leadAge && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  <Clock className="w-3 h-3 mr-1" />
                  Lead Age: {leadAge}
                </Badge>
              )}
            </div>
            {customer.companyName && (
              <p className="text-default-600 mt-1 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                {customer.companyName}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsEditing(!isEditing)}
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline" className="text-destructive">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Deals</p>
                <p className="text-2xl font-bold">{customer._count.deals}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Activity className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Activities</p>
                <p className="text-2xl font-bold">{customer._count.activities}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <FileText className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Credit Apps</p>
                <p className="text-2xl font-bold">{customer._count.creditApps}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileText className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Quotes</p>
                <p className="text-2xl font-bold">{customer._count.quotes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Customer Details */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Contact Information */}
            <div className="space-y-3">
              {!customer.email.includes('@placeholder.com') && (
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-muted-foreground mt-1" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Email</p>
                    <a
                      href={`mailto:${customer.email}`}
                      className="text-sm font-medium hover:text-primary"
                    >
                      {customer.email}
                    </a>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-muted-foreground mt-1" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <a
                    href={`tel:${customer.phone}`}
                    className="text-sm font-medium hover:text-primary"
                  >
                    {customer.phone}
                  </a>
                </div>
              </div>

              {(customer.street || customer.city || customer.state) && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-1" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="text-sm font-medium">
                      {customer.street && <>{customer.street}<br /></>}
                      {customer.city && customer.state
                        ? `${customer.city}, ${customer.state} ${customer.zipcode || ""}`
                        : customer.city || customer.state}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Business Type</span>
                <span className="text-sm font-medium">
                  {customer.businessType || "Individual"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Source</span>
                <span className="text-sm font-medium">
                  {customer.source || "Unknown"}
                </span>
              </div>

              {customer.trailerSize && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Trailer Size</span>
                  <span className="text-sm font-medium">{customer.trailerSize}</span>
                </div>
              )}

              {customer.financingType && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Financing Type</span>
                  <span className="text-sm font-medium capitalize">{customer.financingType}</span>
                </div>
              )}

              {customer.stockNumber && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Stock Number</span>
                  <span className="text-sm font-medium">{customer.stockNumber}</span>
                </div>
              )}

              {customer.isFactoryOrder && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Order Type</span>
                  <Badge variant="outline" className="bg-purple-50 text-purple-700">
                    Factory Order
                  </Badge>
                </div>
              )}

              {customer.appliedDate && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Applied Date</span>
                  <span className="text-sm font-medium">{formatDate(customer.appliedDate)}</span>
                </div>
              )}

              {customer.assignedManager && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Assigned Manager</span>
                  <span className="text-sm font-medium">{customer.assignedManager}</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Created</span>
                <span className="text-sm font-medium">
                  {formatDate(customer.createdAt)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Last Contacted</span>
                <span className="text-sm font-medium">
                  {formatDate(customer.lastContactedAt)}
                </span>
              </div>
            </div>

            {customer.tags && customer.tags.length > 0 && (
              <div className="border-t pt-4">
                <p className="text-sm text-muted-foreground mb-2">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {customer.tags.map((tag, idx) => (
                    <Badge key={idx} variant="outline">
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Middle Column - Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Add notes about this customer..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={15}
              className="mb-4"
            />
            <Button onClick={handleSaveNotes} className="w-full">
              Save Notes
            </Button>
          </CardContent>
        </Card>

        {/* Right Column - Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline">
              <Mail className="w-4 h-4 mr-2" />
              Send Email
            </Button>
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={() => setShowLogCallDialog(true)}
            >
              <Phone className="w-4 h-4 mr-2" />
              Log Call
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Meeting
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              Create Quote
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <DollarSign className="w-4 h-4 mr-2" />
              Create Deal
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              Credit Application
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {customer.activities && customer.activities.length > 0 ? (
            <div className="space-y-4">
              {customer.activities.slice(0, 5).map((activity: any) => (
                <div key={activity.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                  <div className="p-2 bg-muted rounded-lg">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.subject}</p>
                    <p className="text-sm text-muted-foreground">
                      {activity.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(activity.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No activity yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Log Call Dialog */}
      <Dialog open={showLogCallDialog} onOpenChange={setShowLogCallDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Phone Call</DialogTitle>
            <DialogDescription>
              Record details about your call with {customer.firstName} {customer.lastName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              placeholder="What did you discuss? Any follow-up needed?"
              value={callNotes}
              onChange={(e) => setCallNotes(e.target.value)}
              rows={6}
              className="w-full"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLogCallDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleLogCall}>
              Log Call
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
