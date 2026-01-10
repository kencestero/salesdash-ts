"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DollarSign,
  Calendar,
  User,
  Truck,
  FileText,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

interface Trailer {
  id: string;
  vin: string;
  stockNumber: string;
  manufacturer: string;
  model?: string;
  category: string;
  length: number;
  width: number;
  height?: number;
  axles?: number;
  cost: number;
  salePrice: number;
  features?: string[];
  status: string;
}

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
}

interface Salesperson {
  id: string;
  name: string;
  email: string;
  role: string;
  repCode: string | null;
}

interface MarkAsSoldDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer;
  trailer?: Trailer | null;
  onSuccess: () => void;
}

export function MarkAsSoldDialog({
  open,
  onOpenChange,
  customer,
  trailer,
  onSuccess,
}: MarkAsSoldDialogProps) {
  // Form state
  const [soldByUserId, setSoldByUserId] = useState("");
  const [deliveryDate, setDeliveryDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [finalPrice, setFinalPrice] = useState("");
  const [vin, setVin] = useState("");
  const [notes, setNotes] = useState("");
  const [dealType, setDealType] = useState("cash");

  // UI state
  const [salespeople, setSalespeople] = useState<Salesperson[]>([]);
  const [nextDealNumber, setNextDealNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Load salespeople and next deal number when dialog opens
  useEffect(() => {
    if (open) {
      fetchSalespeople();
      fetchNextDealNumber();

      // Pre-populate trailer data
      if (trailer) {
        setVin(trailer.vin || "");
        setFinalPrice(trailer.salePrice?.toString() || "");
      }
    }
  }, [open, trailer]);

  const fetchSalespeople = async () => {
    try {
      const res = await fetch("/api/salespeople");
      if (res.ok) {
        const data = await res.json();
        setSalespeople(data.salespeople || []);
      }
    } catch (error) {
      console.error("Error fetching salespeople:", error);
    }
  };

  const fetchNextDealNumber = async () => {
    try {
      const res = await fetch("/api/deals/next-number");
      if (res.ok) {
        const data = await res.json();
        setNextDealNumber(data.nextNumber);
      }
    } catch (error) {
      console.error("Error fetching next deal number:", error);
    }
  };

  const handleSubmit = async () => {
    setError("");

    // Validate required fields
    if (!soldByUserId) {
      setError("Please select the salesperson who made the sale");
      return;
    }
    if (!deliveryDate) {
      setError("Please enter the delivery date");
      return;
    }
    if (!finalPrice || parseFloat(finalPrice) <= 0) {
      setError("Please enter a valid sale price");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/deals/mark-sold", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: customer.id,
          trailerId: trailer?.id || null,
          soldByUserId,
          deliveryDate,
          finalPrice: parseFloat(finalPrice),
          vin: vin || undefined,
          dealType,
          notes: notes || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to mark deal as sold");
        return;
      }

      toast.success(`Deal ${data.dealNumber} marked as sold!`, {
        description: `${customer.firstName} ${customer.lastName} - $${parseFloat(finalPrice).toLocaleString()}`,
      });

      // Reset form and close
      resetForm();
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      setError(error.message || "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSoldByUserId("");
    setDeliveryDate(new Date().toISOString().split("T")[0]);
    setFinalPrice("");
    setVin("");
    setNotes("");
    setDealType("cash");
    setError("");
  };

  const handleCancel = () => {
    resetForm();
    onOpenChange(false);
  };

  // Extract color from features
  const extractColor = (features: string[] = []) => {
    const commonColors = ["Black", "White", "Silver", "Charcoal", "Red", "Blue", "Green", "Orange"];
    for (const feature of features) {
      const featureLower = feature.toLowerCase();
      for (const color of commonColors) {
        if (featureLower.includes(color.toLowerCase())) {
          return color;
        }
      }
    }
    return null;
  };

  // Calculate profit
  const cost = trailer?.cost || 0;
  const salePrice = parseFloat(finalPrice) || 0;
  const profit = cost > 0 && salePrice > 0 ? salePrice - cost : null;
  const profitMargin = cost > 0 && profit ? ((profit / cost) * 100).toFixed(1) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-green-500" />
            Mark Deal as Sold
          </DialogTitle>
          <DialogDescription>
            Record the completed sale for{" "}
            <span className="font-semibold text-foreground">
              {customer.firstName} {customer.lastName}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Deal Number Preview */}
          <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground">Deal Number</p>
            <p className="text-2xl font-bold text-green-600">
              {nextDealNumber || "Generating..."}
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Trailer Info (Auto-populated) */}
          {trailer && (
            <Card className="border-primary/20">
              <CardHeader className="py-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Truck className="w-4 h-4" />
                  Trailer Information (Auto-populated)
                </CardTitle>
              </CardHeader>
              <CardContent className="py-3">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Manufacturer:</span>
                    <p className="font-medium">{trailer.manufacturer}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Category:</span>
                    <p className="font-medium">{trailer.category}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Size:</span>
                    <p className="font-medium">
                      {trailer.width}' x {trailer.length}'
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Stock #:</span>
                    <p className="font-medium">{trailer.stockNumber}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Axles:</span>
                    <p className="font-medium">{trailer.axles || "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Height:</span>
                    <p className="font-medium">
                      {trailer.height ? `${trailer.height}'` : "N/A"}
                    </p>
                  </div>
                  {extractColor(trailer.features) && (
                    <div>
                      <span className="text-muted-foreground">Color:</span>
                      <p className="font-medium">{extractColor(trailer.features)}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground">Cost:</span>
                    <p className="font-medium text-red-600">
                      ${trailer.cost.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">List Price:</span>
                    <p className="font-medium">
                      ${trailer.salePrice.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Separator />

          {/* Sale Details Form */}
          <div className="space-y-4">
            {/* Sold By */}
            <div className="space-y-2">
              <Label htmlFor="soldBy" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Sold By <span className="text-destructive">*</span>
              </Label>
              <Select value={soldByUserId} onValueChange={setSoldByUserId}>
                <SelectTrigger className="z-[9999]">
                  <SelectValue placeholder="Select salesperson" />
                </SelectTrigger>
                <SelectContent className="z-[9999]">
                  {salespeople.map((sp) => (
                    <SelectItem key={sp.id} value={sp.id}>
                      {sp.name} {sp.repCode && `(${sp.repCode})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* VIN */}
            <div className="space-y-2">
              <Label htmlFor="vin">VIN Number</Label>
              <Input
                id="vin"
                value={vin}
                onChange={(e) => setVin(e.target.value.toUpperCase())}
                placeholder="Enter VIN"
                className="font-mono"
              />
            </div>

            {/* Delivery Date */}
            <div className="space-y-2">
              <Label htmlFor="deliveryDate" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Delivery Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="deliveryDate"
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
              />
            </div>

            {/* Deal Type */}
            <div className="space-y-2">
              <Label htmlFor="dealType">Payment Type</Label>
              <Select value={dealType} onValueChange={setDealType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[9999]">
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="trade">Trade-In</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sale Price */}
            <div className="space-y-2">
              <Label htmlFor="finalPrice" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Sale Price <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  id="finalPrice"
                  type="number"
                  value={finalPrice}
                  onChange={(e) => setFinalPrice(e.target.value)}
                  placeholder="0.00"
                  className="pl-7"
                  step="0.01"
                />
              </div>
            </div>

            {/* Profit Preview */}
            {profit !== null && (
              <div className="bg-muted/50 rounded-lg p-3 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Estimated Profit:
                </span>
                <div className="text-right">
                  <span
                    className={`font-bold ${profit >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    ${profit.toLocaleString()}
                  </span>
                  {profitMargin && (
                    <Badge
                      variant={parseFloat(profitMargin) >= 0 ? "default" : "destructive"}
                      className="ml-2"
                    >
                      {profitMargin}%
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Notes (Optional)
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional notes about this sale..."
                rows={3}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleCancel} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-green-600 hover:bg-green-700"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Mark as Sold
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
