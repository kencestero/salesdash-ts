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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
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
import { EmailComposerDialog } from "@/components/crm/email-composer-dialog";
import { EmailViewerDialog } from "@/components/crm/email-viewer-dialog";
import { LeadStatusManager } from "@/components/crm/lead-status-manager";

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  street?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  companyName?: string;
  businessType?: string;
  source?: string;
  assignedTo?: string;
  salesRepName?: string | null;      // Sales Rep from Google Sheets
  assignedToName?: string | null;    // Manager from Google Sheets
  status: string;
  tags: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
  lastContactedAt?: string;
  // New fields
  trailerSize?: string;
  trailerType?: string;
  financingType?: string;
  stockNumber?: string;
  isFactoryOrder?: boolean;
  dateApplied?: string;
  assignedManager?: string;
  // Lead Status Manager fields
  temperature?: string;
  linkSentStatus?: string;
  approvalStatus?: string;
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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showCallOutcomeDialog, setShowCallOutcomeDialog] = useState(false);
  const [callOutcome, setCallOutcome] = useState<'left_voice' | 'spoke_to_customer' | 'no_voicemail'>('spoke_to_customer');
  const [callOutcomeNotes, setCallOutcomeNotes] = useState("");
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showEmailViewer, setShowEmailViewer] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<any>(null);

  // Edit mode form state
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    companyName: "",
    businessType: "",
    source: "",
    trailerSize: "",
    trailerType: "",
    financingType: "",
    stockNumber: "",
  });
  const [isSaving, setIsSaving] = useState(false);

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
      // Don't set notes from customer data - keep textarea empty for new notes only

      // Initialize edit form with customer data
      setEditForm({
        firstName: data.customer.firstName || "",
        lastName: data.customer.lastName || "",
        email: data.customer.email || "",
        phone: data.customer.phone || "",
        street: data.customer.street || "",
        city: data.customer.city || "",
        state: data.customer.state || "",
        zipcode: data.customer.zipcode || "",
        companyName: data.customer.companyName || "",
        businessType: data.customer.businessType || "",
        source: data.customer.source || "",
        trailerSize: data.customer.trailerSize || "",
        trailerType: data.customer.trailerType || "",
        financingType: data.customer.financingType || "",
        stockNumber: data.customer.stockNumber || "",
      });
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

  const handleViewEmail = async (emailId: string) => {
    try {
      const response = await fetch(`/api/crm/emails/${emailId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch email");
      }

      const data = await response.json();
      setSelectedEmail(data.email);
      setShowEmailViewer(true);
    } catch (error) {
      console.error("Error fetching email:", error);
      toast({
        title: "Error",
        description: "Failed to load email details",
        variant: "destructive",
      });
    }
  };

  const handleSaveCustomer = async () => {
    if (!customer) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/crm/customers/${customer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) {
        throw new Error("Failed to update customer");
      }

      toast({
        title: "Success",
        description: "Customer updated successfully",
      });

      setIsEditing(false);
      fetchCustomer(); // Refresh customer data
    } catch (error) {
      console.error("Error updating customer:", error);
      toast({
        title: "Error",
        description: "Failed to update customer",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset form to original customer data
    if (customer) {
      setEditForm({
        firstName: customer.firstName || "",
        lastName: customer.lastName || "",
        email: customer.email || "",
        phone: customer.phone || "",
        street: customer.street || "",
        city: customer.city || "",
        state: customer.state || "",
        zipcode: customer.zipcode || "",
        companyName: customer.companyName || "",
        businessType: customer.businessType || "",
        source: customer.source || "",
        trailerSize: customer.trailerSize || "",
        trailerType: customer.trailerType || "",
        financingType: customer.financingType || "",
        stockNumber: customer.stockNumber || "",
      });
    }
  };

  const handleSaveNotes = async () => {
    if (!customer) return;
    if (!notes || !notes.trim()) {
      toast({
        title: "Error",
        description: "Please enter some notes before saving",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`/api/crm/customers/${customer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });

      if (!response.ok) {
        throw new Error("Failed to update notes");
      }

      // Log activity for notes update with actual note content
      await fetch('/api/crm/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: customer.id,
          type: 'note',
          subject: 'Notes Added',
          description: notes, // Show the actual notes content
        }),
      });

      toast({
        title: "Success",
        description: "Notes saved and added to Activity Timeline",
      });
      setNotes(''); // Clear the notes field after saving
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

  const handleLogCallOutcome = async () => {
    if (!customer) return;

    try {
      // Map outcome to readable text
      const outcomeText = {
        'left_voice': 'Left Voicemail',
        'spoke_to_customer': 'Spoke to Customer',
        'no_voicemail': 'Unable to Leave Voicemail'
      }[callOutcome];

      // Build description with outcome and notes
      let description = `${outcomeText}`;
      if (callOutcomeNotes.trim()) {
        description += ` - ${callOutcomeNotes}`;
      }

      // Log the call activity
      await fetch('/api/crm/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: customer.id,
          type: 'call',
          subject: `Phone Call: ${outcomeText}`,
          description: description,
        }),
      });

      toast({
        title: "Success",
        description: "Call logged successfully",
      });

      // Reset and close dialog
      setCallOutcome('spoke_to_customer');
      setCallOutcomeNotes('');
      setShowCallOutcomeDialog(false);
      fetchCustomer();
    } catch (error) {
      console.error("Error logging call:", error);
      toast({
        title: "Error",
        description: "Failed to log call",
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

  const handleDeleteCustomer = async () => {
    if (!customer) return;

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/crm/customers/${customer.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete customer");
      }

      toast({
        title: "Success",
        description: "Customer deleted successfully",
      });

      router.push("/en/crm/customers");
    } catch (error) {
      console.error("Error deleting customer:", error);
      toast({
        title: "Error",
        description: "Failed to delete customer",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
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
          {isEditing ? (
            <>
              <Button
                onClick={handleSaveCustomer}
                disabled={isSaving}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                variant="outline"
                onClick={handleCancelEdit}
                disabled={isSaving}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => setIsEditing(true)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="outline"
                className="text-destructive"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </>
          )}
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

      {/* 3-Column Layout: Customer Details + Lead Status + Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Customer Details (takes 1 column) */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Customer Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Contact Information */}
            {isEditing ? (
              <div className="space-y-4 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                <p className="text-sm font-semibold text-blue-900">Edit Mode Active</p>

                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={editForm.firstName}
                      onChange={(e) => setEditForm({...editForm, firstName: e.target.value})}
                      placeholder="First name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={editForm.lastName}
                      onChange={(e) => setEditForm({...editForm, lastName: e.target.value})}
                      placeholder="Last name"
                    />
                  </div>
                </div>

                {/* Email & Phone */}
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                    placeholder="(555) 123-4567"
                  />
                </div>

                {/* Company */}
                <div>
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={editForm.companyName}
                    onChange={(e) => setEditForm({...editForm, companyName: e.target.value})}
                    placeholder="Company name (optional)"
                  />
                </div>

                {/* Address Fields */}
                <div>
                  <Label htmlFor="street">Street Address</Label>
                  <Input
                    id="street"
                    value={editForm.street}
                    onChange={(e) => setEditForm({...editForm, street: e.target.value})}
                    placeholder="123 Main St"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={editForm.city}
                      onChange={(e) => setEditForm({...editForm, city: e.target.value})}
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={editForm.state}
                      onChange={(e) => setEditForm({...editForm, state: e.target.value})}
                      placeholder="TX"
                    />
                  </div>
                  <div>
                    <Label htmlFor="zipcode">Zip</Label>
                    <Input
                      id="zipcode"
                      value={editForm.zipcode}
                      onChange={(e) => setEditForm({...editForm, zipcode: e.target.value})}
                      placeholder="77001"
                    />
                  </div>
                </div>

                {/* Business Details */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="businessType">Business Type</Label>
                    <Input
                      id="businessType"
                      value={editForm.businessType}
                      onChange={(e) => setEditForm({...editForm, businessType: e.target.value})}
                      placeholder="Individual"
                    />
                  </div>
                  <div>
                    <Label htmlFor="source">Source</Label>
                    <Input
                      id="source"
                      value={editForm.source}
                      onChange={(e) => setEditForm({...editForm, source: e.target.value})}
                      placeholder="referral"
                    />
                  </div>
                </div>

                {/* Trailer Details */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="trailerSize">Trailer Size</Label>
                    <Input
                      id="trailerSize"
                      value={editForm.trailerSize}
                      onChange={(e) => setEditForm({...editForm, trailerSize: e.target.value})}
                      placeholder="6x12"
                    />
                  </div>
                  <div>
                    <Label htmlFor="trailerType">Trailer Type</Label>
                    <Input
                      id="trailerType"
                      value={editForm.trailerType}
                      onChange={(e) => setEditForm({...editForm, trailerType: e.target.value})}
                      placeholder="Enclosed"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="financingType">Financing Type</Label>
                    <Input
                      id="financingType"
                      value={editForm.financingType}
                      onChange={(e) => setEditForm({...editForm, financingType: e.target.value})}
                      placeholder="Cash"
                    />
                  </div>
                  <div>
                    <Label htmlFor="stockNumber">Stock Number</Label>
                    <Input
                      id="stockNumber"
                      value={editForm.stockNumber}
                      onChange={(e) => setEditForm({...editForm, stockNumber: e.target.value})}
                      placeholder="Stock #"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {customer.email && !customer.email.includes('@placeholder.com') && (
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

                {customer.phone && !customer.phone.includes('@placeholder.com') && (
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
                )}

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
            )}

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

              {customer.salesRepName && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Sales Rep</span>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {customer.salesRepName}
                  </Badge>
                </div>
              )}

              {customer.assignedToName && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Manager</span>
                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                    {customer.assignedToName}
                  </Badge>
                </div>
              )}

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

              {customer.dateApplied && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Applied Date</span>
                  <span className="text-sm font-medium">{formatDate(customer.dateApplied)}</span>
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

              {leadAge && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Lead Age</span>
                  <span className="text-sm font-medium">{leadAge} old</span>
                </div>
              )}

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

        {/* Middle Column - Lead Status Management (takes 1 column) */}
        <div className="lg:col-span-1">
          <LeadStatusManager
            customerId={customer.id}
            currentTemperature={customer.temperature}
            currentLinkStatus={customer.linkSentStatus}
            currentApprovalStatus={customer.approvalStatus}
            userRole="owner" // TODO: Get from session
            onUpdate={fetchCustomer}
          />
        </div>

        {/* Right Column - Actions (takes 1 column) */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              className="w-full justify-start"
              variant="outline"
              disabled={!customer.phone}
              onClick={() => {
                if (!customer.phone) {
                  toast({
                    title: "❌ No Phone Number",
                    description: "This customer doesn't have a phone number on file",
                    variant: "destructive",
                  });
                  return;
                }

                // Open phone dialer first
                if (typeof window !== 'undefined' && customer.phone) {
                  window.open(`tel:${customer.phone}`, '_self');
                }

                // Then open the outcome dialog
                setShowCallOutcomeDialog(true);
              }}
            >
              <Phone className="w-4 h-4 mr-2" />
              Call Customer
            </Button>
            <Button
              className="w-full justify-start"
              variant="outline"
              disabled={!customer.email}
              onClick={() => setShowEmailDialog(true)}
            >
              <Mail className="w-4 h-4 mr-2" />
              Send Email
            </Button>
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={async () => {
                // Actually create a quote!
                try {
                  const response = await fetch('/api/crm/quote', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      customerId: customer.id,
                      trailerType: customer.trailerType || 'Standard Enclosed',
                      trailerSize: customer.trailerSize || '6x12',
                      price: 5000,
                      notes: `Quote for ${customer.firstName} ${customer.lastName}`
                    }),
                  });
                  
                  if (response.ok) {
                    const data = await response.json();
                    toast({
                      title: "📋 Quote Created",
                      description: `Quote #${data.quoteNumber} created successfully`,
                    });
                    
                    // Also log the activity
                    await fetch('/api/crm/activities', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        customerId: customer.id,
                        type: 'quote',
                        subject: 'Quote Created',
                        description: `Quote #${data.quoteNumber} created`,
                      }),
                    });
                    fetchCustomer();
                  }
                } catch (error) {
                  toast({
                    title: "❌ Quote Failed",
                    description: "Failed to create quote",
                    variant: "destructive",
                  });
                }
              }}
            >
              <FileText className="w-4 h-4 mr-2" />
              Create Quote
            </Button>
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={() => router.push("/en/credit-applications")}
            >
              <FileText className="w-4 h-4 mr-2" />
              View Applications
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Activity Timeline - Full History (Non-Erasable) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-600" />
            Activity Timeline
            <Badge variant="outline" className="ml-auto">
              {customer._count.activities} Total
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {customer.activities && customer.activities.length > 0 ? (
            <div className="space-y-4">
              {customer.activities.map((activity: any) => {
                // Dynamic icon based on activity type
                const getActivityIcon = (type: string) => {
                  switch (type.toLowerCase()) {
                    case 'call':
                      return { icon: Phone, bg: 'bg-blue-100', color: 'text-blue-600' };
                    case 'email':
                      return { icon: Mail, bg: 'bg-green-100', color: 'text-green-600' };
                    case 'meeting':
                      return { icon: Calendar, bg: 'bg-purple-100', color: 'text-purple-600' };
                    case 'note':
                      return { icon: FileText, bg: 'bg-yellow-100', color: 'text-yellow-600' };
                    default:
                      return { icon: Activity, bg: 'bg-gray-100', color: 'text-gray-600' };
                  }
                };

                const { icon: Icon, bg, color } = getActivityIcon(activity.type);

                const isEmailActivity = activity.type === 'email' && activity.emailId;

                return (
                  <div
                    key={activity.id}
                    className={`flex items-start gap-4 pb-4 border-b last:border-0 ${
                      isEmailActivity ? 'cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors' : ''
                    }`}
                    onClick={() => {
                      if (isEmailActivity) {
                        handleViewEmail(activity.emailId);
                      }
                    }}
                  >
                    <div className={`p-3 ${bg} rounded-lg`}>
                      <Icon className={`w-5 h-5 ${color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold">{activity.subject}</p>
                        <Badge variant="outline" className="text-xs capitalize">
                          {activity.type}
                        </Badge>
                        {isEmailActivity && (
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                            Click to View Email
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {activity.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(activity.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Activity className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No activity yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Start logging calls, emails, and notes to build a complete history
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes Section - Full Width */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-orange-600" />
            Add New Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Add notes about this customer... (e.g., preferences, special requests, follow-up actions)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={8}
            className="mb-3"
          />
          <p className="text-xs text-muted-foreground mb-3">
            Notes will be added to the Activity Timeline above. Previous notes are visible in the timeline.
          </p>
          <Button onClick={handleSaveNotes} className="bg-orange-500 hover:bg-orange-600">
            <FileText className="w-4 h-4 mr-2" />
            Save Notes
          </Button>
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

      {/* Call Outcome Dialog */}
      <Dialog open={showCallOutcomeDialog} onOpenChange={setShowCallOutcomeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Call Outcome</DialogTitle>
            <DialogDescription>
              How did the call with {customer.firstName} {customer.lastName} go?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <RadioGroup value={callOutcome} onValueChange={(value: any) => setCallOutcome(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="spoke_to_customer" id="spoke" />
                <Label htmlFor="spoke" className="cursor-pointer">Spoke to Customer</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="left_voice" id="voicemail" />
                <Label htmlFor="voicemail" className="cursor-pointer">Left Voicemail</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no_voicemail" id="no-vm" />
                <Label htmlFor="no-vm" className="cursor-pointer">Unable to Leave Voicemail</Label>
              </div>
            </RadioGroup>
            <Textarea
              placeholder="Add notes about the call (optional)..."
              value={callOutcomeNotes}
              onChange={(e) => setCallOutcomeNotes(e.target.value)}
              rows={4}
              className="w-full mt-3"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCallOutcomeDialog(false);
                setCallOutcome('spoke_to_customer');
                setCallOutcomeNotes('');
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleLogCallOutcome}>
              Log Call
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Customer</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {customer.firstName} {customer.lastName}? This action cannot be undone and will remove all associated data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteCustomer}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Customer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Email Composer Dialog */}
      {customer && (
        <EmailComposerDialog
          open={showEmailDialog}
          onOpenChange={setShowEmailDialog}
          customer={{
            id: customer.id,
            firstName: customer.firstName,
            lastName: customer.lastName,
            email: customer.email,
            companyName: customer.companyName,
            phone: customer.phone,
          }}
        />
      )}

      {/* Email Viewer Dialog */}
      <EmailViewerDialog
        open={showEmailViewer}
        onOpenChange={setShowEmailViewer}
        emailData={selectedEmail}
      />
    </div>
  );
}
