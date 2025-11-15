"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Package, Calendar, User, TrendingUp, Trash2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

type DeliveryRecordDTO = {
  id: string;
  customerName: string;
  trailerIdentifier: string;
  deliveryDate: string;
  commissionAmount: number;
  profitAmount: number;
  createdByName: string | null;
  createdByEmail: string | null;
  createdAt: string;
};

type Props = {
  initialRecords: DeliveryRecordDTO[];
};

export function OwnerDeliveryPageClient({ initialRecords }: Props) {
  const [records, setRecords] = useState<DeliveryRecordDTO[]>(initialRecords);

  const [customerName, setCustomerName] = useState("");
  const [trailerIdentifier, setTrailerIdentifier] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [commissionAmount, setCommissionAmount] = useState("");
  const [profitAmount, setProfitAmount] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Calculate summary stats
  const totalCommission = records.reduce((sum, r) => sum + r.commissionAmount, 0);
  const totalProfit = records.reduce((sum, r) => sum + r.profitAmount, 0);
  const totalDeliveries = records.length;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/delivery-records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          trailerIdentifier,
          deliveryDate,
          commissionAmount: Number(commissionAmount),
          profitAmount: Number(profitAmount),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create delivery record");
      }

      const { deliveryRecord } = await res.json();

      const newRecord: DeliveryRecordDTO = {
        id: deliveryRecord.id,
        customerName: deliveryRecord.customerName,
        trailerIdentifier: deliveryRecord.trailerIdentifier,
        deliveryDate: deliveryRecord.deliveryDate,
        commissionAmount: Number(deliveryRecord.commissionAmount),
        profitAmount: Number(deliveryRecord.profitAmount),
        createdByName: deliveryRecord.createdByUser?.name ?? null,
        createdByEmail: deliveryRecord.createdByUser?.email ?? null,
        createdAt: deliveryRecord.createdAt,
      };

      setRecords((prev) => [newRecord, ...prev]);

      toast({
        title: "Success",
        description: "Delivery record saved successfully",
      });

      // Clear form
      setCustomerName("");
      setTrailerIdentifier("");
      setDeliveryDate("");
      setCommissionAmount("");
      setProfitAmount("");
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Error",
        description: err.message ?? "Error saving record",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  function toggleSelectAll() {
    if (selectedIds.length === records.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(records.map((r) => r.id));
    }
  }

  function toggleSelectOne(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }

  async function handleDeleteSelected() {
    if (selectedIds.length === 0) return;

    setIsDeleting(true);
    try {
      const res = await fetch("/api/delivery-records", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete records");
      }

      const { deletedCount } = await res.json();

      // Remove deleted records from state
      setRecords((prev) => prev.filter((r) => !selectedIds.includes(r.id)));
      setSelectedIds([]);
      setShowDeleteDialog(false);

      toast({
        title: "Success",
        description: `Successfully deleted ${deletedCount} delivery record(s)`,
      });
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Error",
        description: err.message ?? "Error deleting records",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Delivery Log</h1>
        <p className="text-muted-foreground mt-1">
          Track delivered trailers, commissions, and profit
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deliveries</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDeliveries}</div>
            <p className="text-xs text-muted-foreground">
              Lifetime deliveries tracked
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Commission</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalCommission.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Across all deliveries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalProfit.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Gross margin earned
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>Log Delivered Trailer</CardTitle>
          <CardDescription>
            Record a new trailer delivery with commission and profit details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="customerName">
                  Customer Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="customerName"
                  placeholder="John Smith"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="trailerIdentifier">
                  Trailer # / VIN <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="trailerIdentifier"
                  placeholder="VIN123456 or Unit #42"
                  value={trailerIdentifier}
                  onChange={(e) => setTrailerIdentifier(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deliveryDate">
                  Delivery Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="deliveryDate"
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="commissionAmount">
                  Commission ($) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="commissionAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="1500.00"
                  value={commissionAmount}
                  onChange={(e) => setCommissionAmount(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="profitAmount">
                  Profit ($) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="profitAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="3000.00"
                  value={profitAmount}
                  onChange={(e) => setProfitAmount(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Delivery"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Table Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Deliveries</CardTitle>
              <CardDescription>
                View all delivery records ordered by most recent
              </CardDescription>
            </div>
            {selectedIds.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete {selectedIds.length} Selected
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {records.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No delivery records yet. Add your first one above!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={selectedIds.length === records.length && records.length > 0}
                        onCheckedChange={toggleSelectAll}
                        aria-label="Select all"
                      />
                    </TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Trailer</TableHead>
                    <TableHead className="text-right">Commission</TableHead>
                    <TableHead className="text-right">Profit</TableHead>
                    <TableHead>Logged By</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.includes(r.id)}
                          onCheckedChange={() => toggleSelectOne(r.id)}
                          aria-label={`Select ${r.customerName}`}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {new Date(r.deliveryDate).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{r.customerName}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{r.trailerIdentifier}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="font-medium text-green-600 dark:text-green-400">
                          ${r.commissionAmount.toFixed(2)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="font-medium text-blue-600 dark:text-blue-400">
                          ${r.profitAmount.toFixed(2)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {r.createdByName || r.createdByEmail || "—"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {selectedIds.length} delivery record(s).
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSelected}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
