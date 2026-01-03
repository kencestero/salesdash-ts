"use client";

import { useState, useEffect } from "react";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";

interface Salesperson {
  id: string;
  name: string;
  email: string;
  role: string;
  repCode: string | null;
  managerId: string | null;
  managerName: string | null;
}

interface AddCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddCustomerDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddCustomerDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const [salespeople, setSalespeople] = useState<Salesperson[]>([]);
  const [loadingSalespeople, setLoadingSalespeople] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    companyName: "",
    businessType: "individual",
    source: "remotive-website",
    status: "lead",
    notes: "",
    salesRepName: "",
    assignedToName: "",
    assignedToId: "",
  });

  // Fetch salespeople when dialog opens
  useEffect(() => {
    if (open) {
      fetchSalespeople();
    }
  }, [open]);

  const fetchSalespeople = async () => {
    try {
      setLoadingSalespeople(true);
      const res = await fetch("/api/salespeople");
      const data = await res.json();
      if (data.salespeople) {
        setSalespeople(data.salespeople);
      }
    } catch (error) {
      console.error("Error fetching salespeople:", error);
    } finally {
      setLoadingSalespeople(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle sales rep selection - auto-populate manager
  const handleSalesRepChange = (salesRepId: string) => {
    const selectedRep = salespeople.find((sp) => sp.id === salesRepId);
    if (selectedRep) {
      setFormData((prev) => ({
        ...prev,
        salesRepName: selectedRep.name,
        assignedToId: selectedRep.id,
        assignedToName: selectedRep.managerName || "",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        salesRepName: "",
        assignedToId: "",
        assignedToName: "",
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address",
      });
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch("/api/crm/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create customer");
      }

      toast({
        title: "Success!",
        description: "Customer added successfully",
      });

      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        street: "",
        city: "",
        state: "",
        zipcode: "",
        companyName: "",
        businessType: "individual",
        source: "remotive-website",
        status: "lead",
        notes: "",
        salesRepName: "",
        assignedToName: "",
        assignedToId: "",
      });
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error("Error creating customer:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create customer",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Find currently selected rep for the Select component
  const selectedRepId = salespeople.find((sp) => sp.name === formData.salesRepName)?.id || "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Customer</DialogTitle>
          <DialogDescription>
            Enter customer information to add them to your CRM
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground">Personal Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">
                  First Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="John"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">
                  Last Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Doe"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="john@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">
                  Phone <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="(555) 123-4567"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground">Address (Optional)</h3>
            <div className="space-y-2">
              <Label htmlFor="street">Street Address</Label>
              <Input
                id="street"
                name="street"
                value={formData.street}
                onChange={handleInputChange}
                placeholder="123 Main St"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="Springfield"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  placeholder="IL"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zipcode">ZIP Code</Label>
                <Input
                  id="zipcode"
                  name="zipcode"
                  value={formData.zipcode}
                  onChange={handleInputChange}
                  placeholder="62701"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground">Lead Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="source">Lead Source</Label>
                <Select
                  value={formData.source}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, source: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="facebook-marketplace">Facebook Marketplace</SelectItem>
                    <SelectItem value="facebook-ads">Facebook Ads</SelectItem>
                    <SelectItem value="youtube">YouTube</SelectItem>
                    <SelectItem value="remotive-website">Main Remotive Website</SelectItem>
                    <SelectItem value="referral">Referral</SelectItem>
                    <SelectItem value="google-search">Google Search</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lead">New Lead</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="qualified">Qualified</SelectItem>
                    <SelectItem value="negotiating">Negotiating</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground">Assignment</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="salesRep">Sales Rep</Label>
                <Select
                  value={selectedRepId}
                  onValueChange={handleSalesRepChange}
                  disabled={loadingSalespeople}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={loadingSalespeople ? "Loading..." : "Select sales rep"} />
                  </SelectTrigger>
                  <SelectContent className="z-[9999]">
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {salespeople.map((sp) => (
                      <SelectItem key={sp.id} value={sp.id}>
                        {sp.name} {sp.role !== "salesperson" ? `(${sp.role})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="manager">Manager</Label>
                <Input
                  id="manager"
                  value={formData.assignedToName}
                  readOnly
                  disabled
                  placeholder="Auto-populated from Sales Rep"
                  className="bg-muted/50"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Add any additional notes about this customer..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Customer
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
