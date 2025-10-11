"use client";

import { useState, useEffect } from "react";
import { Calculator } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FinanceMatrix } from "@/components/calculator/FinanceMatrix";
import { RTOMatrix } from "@/components/calculator/RTOMatrix";
import { CashSummary } from "@/components/calculator/CashSummary";
import { toast } from "@/components/ui/use-toast";

export default function FinanceComparePage() {
  // Input states
  const [selectedUnit, setSelectedUnit] = useState("");
  const [price, setPrice] = useState(14000);
  const [taxPct, setTaxPct] = useState(8.25);
  const [fees, setFees] = useState(125);
  const [apr, setApr] = useState(8.99);

  // Down payment options (configurable)
  const downPaymentOptions = [0, 1000, 2500, 5000];

  // Handle payment selection
  const handleSelectPayment = (payment: {
    down: number;
    term: number;
    monthly: number;
    mode: "FINANCE" | "RTO" | "CASH";
  }) => {
    console.log("Selected payment:", payment);

    toast({
      title: "Payment Option Selected",
      description: `${payment.mode}: $${payment.monthly.toFixed(2)}/mo${payment.mode !== "CASH" ? ` for ${payment.term} months` : ""}`,
      variant: "default",
    });

    // TODO: Open save quote dialog
    // For now, just log it
  };

  // Handle cash quote save
  const handleSaveCashQuote = (quote: { totalCash: number; mode: "CASH" }) => {
    console.log("Saving cash quote:", quote);

    toast({
      title: "Cash Quote Saved",
      description: `Total: $${quote.totalCash.toFixed(2)}`,
      variant: "default",
    });

    // TODO: Actually save the quote via API
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Calculator className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              MJ Finance Calculator
            </h1>
            <p className="text-muted-foreground">
              Compare Cash, Finance, and Rent-To-Own options side-by-side
            </p>
          </div>
        </div>

        {/* Input Controls Card */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Quote Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
              {/* Unit Price */}
              <div className="space-y-2">
                <Label htmlFor="price" className="text-foreground">
                  Unit Price
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    id="price"
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                    className="pl-7"
                  />
                </div>
              </div>

              {/* Tax % */}
              <div className="space-y-2">
                <Label htmlFor="tax" className="text-foreground">
                  Tax %
                </Label>
                <div className="relative">
                  <Input
                    id="tax"
                    type="number"
                    step="0.01"
                    value={taxPct}
                    onChange={(e) => setTaxPct(parseFloat(e.target.value) || 0)}
                    className="pr-7"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    %
                  </span>
                </div>
              </div>

              {/* Fees */}
              <div className="space-y-2">
                <Label htmlFor="fees" className="text-foreground">
                  Fees
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    id="fees"
                    type="number"
                    value={fees}
                    onChange={(e) => setFees(parseFloat(e.target.value) || 0)}
                    className="pl-7"
                  />
                </div>
              </div>

              {/* APR */}
              <div className="space-y-2">
                <Label htmlFor="apr" className="text-foreground">
                  APR (Finance)
                </Label>
                <div className="relative">
                  <Input
                    id="apr"
                    type="number"
                    step="0.01"
                    value={apr}
                    onChange={(e) => setApr(parseFloat(e.target.value) || 0)}
                    className="pr-7"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    %
                  </span>
                </div>
              </div>

              {/* Unit Selector (placeholder) */}
              <div className="space-y-2">
                <Label htmlFor="unit" className="text-foreground">
                  Select Unit
                </Label>
                <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                  <SelectTrigger id="unit">
                    <SelectValue placeholder="Choose trailer..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="demo1">
                      2024 Diamond 6x12 SA - $14,000
                    </SelectItem>
                    <SelectItem value="demo2">
                      2024 Quality 7x14 TA - $18,500
                    </SelectItem>
                    <SelectItem value="demo3">
                      2024 PJ 8x20 Gooseneck - $25,000
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Finance Matrix */}
        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <FinanceMatrix
              price={price}
              taxPct={taxPct}
              fees={fees}
              apr={apr}
              downPaymentOptions={downPaymentOptions}
              onSelectPayment={handleSelectPayment}
            />
          </CardContent>
        </Card>

        {/* RTO Matrix */}
        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <RTOMatrix
              price={price}
              taxPct={taxPct}
              downPaymentOptions={downPaymentOptions}
              onSelectPayment={handleSelectPayment}
            />
          </CardContent>
        </Card>

        {/* Cash Summary */}
        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <CashSummary
              price={price}
              taxPct={taxPct}
              fees={fees}
              onSaveQuote={handleSaveCashQuote}
              onShare={() => toast({ title: "Share feature coming soon!" })}
              onGeneratePDF={() => toast({ title: "PDF generation coming soon!" })}
            />
          </CardContent>
        </Card>

        {/* Info Footer */}
        <div className="rounded-lg border border-border bg-muted/50 p-4">
          <p className="text-sm text-muted-foreground">
            💡 <strong>Pro Tip:</strong> Click any payment amount in the matrix
            to save it as a quote. Uncheck terms to hide them from all exports
            and customer-facing quotes.
          </p>
        </div>
      </div>
    </div>
  );
}
