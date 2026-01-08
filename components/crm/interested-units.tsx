"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { Truck, Plus, Trash2, Hash, FileText } from "lucide-react";

interface CustomerInterest {
  id: string;
  stockNumber: string | null;
  vin: string | null;
  notes: string | null;
  createdAt: string;
}

interface InterestedUnitsProps {
  customerId: string;
}

export function InterestedUnits({ customerId }: InterestedUnitsProps) {
  const [interests, setInterests] = useState<CustomerInterest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [saving, setSaving] = useState(false);

  // Add form state
  const [stockNumber, setStockNumber] = useState("");
  const [vin, setVin] = useState("");
  const [notes, setNotes] = useState("");

  // Fetch interests for this customer
  const fetchInterests = async () => {
    try {
      const response = await fetch(`/api/crm/interests?customerId=${customerId}`);
      if (response.ok) {
        const data = await response.json();
        setInterests(data.interests || []);
      }
    } catch (error) {
      console.error("Error fetching interests:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterests();
  }, [customerId]);

  // Add new interest
  const handleAdd = async () => {
    if (!stockNumber && !vin) {
      toast({
        title: "Error",
        description: "Please enter a stock number or VIN",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/crm/interests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          stockNumber: stockNumber || null,
          vin: vin || null,
          notes: notes || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to add interest");
      }

      toast({
        title: "Success",
        description: "Interest added successfully",
      });

      // Reset form and close dialog
      setStockNumber("");
      setVin("");
      setNotes("");
      setShowAddDialog(false);

      // Refresh list
      fetchInterests();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add interest",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Remove interest
  const handleRemove = async (interestId: string) => {
    if (!confirm("Remove this interest?")) return;

    try {
      const response = await fetch(`/api/crm/interests?id=${interestId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to remove interest");
      }

      toast({
        title: "Success",
        description: "Interest removed",
      });

      fetchInterests();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove interest",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Truck className="w-5 h-5" />
              Interested Units
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddDialog(true)}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : interests.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No interested units tracked yet
            </p>
          ) : (
            <div className="space-y-3">
              {interests.map((interest) => (
                <div
                  key={interest.id}
                  className="flex items-start justify-between p-3 bg-muted rounded-lg"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {interest.stockNumber && (
                        <Badge variant="outline" className="gap-1">
                          <Hash className="w-3 h-3" />
                          {interest.stockNumber}
                        </Badge>
                      )}
                      {interest.vin && (
                        <Badge variant="secondary" className="gap-1">
                          <FileText className="w-3 h-3" />
                          {interest.vin}
                        </Badge>
                      )}
                    </div>
                    {interest.notes && (
                      <p className="text-sm text-muted-foreground">
                        {interest.notes}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Added {new Date(interest.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemove(interest.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Interest Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Interested Unit</DialogTitle>
            <DialogDescription>
              Track a trailer this customer is interested in
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="stockNumber">Stock Number</Label>
              <Input
                id="stockNumber"
                placeholder="Enter stock #"
                value={stockNumber}
                onChange={(e) => setStockNumber(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vin">VIN</Label>
              <Input
                id="vin"
                placeholder="Enter VIN"
                value={vin}
                onChange={(e) => setVin(e.target.value.toUpperCase())}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any notes about their interest..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="h-20"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddDialog(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={handleAdd} disabled={saving}>
              {saving ? "Adding..." : "Add Interest"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
