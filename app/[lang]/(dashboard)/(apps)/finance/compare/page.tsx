"use client";

import { useState, useEffect } from "react";
import { Calculator, User, Phone, Mail } from "lucide-react";
import Image from "next/image";
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
import { useSession } from "next-auth/react";
import { generateQuotePDF, SelectedPaymentOption } from "@/lib/finance/pdf-generator";
import { Button } from "@/components/ui/button";
import { FileDown, Check } from "lucide-react";

export default function FinanceComparePage() {
  const { data: session } = useSession();

  // Customer Info
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");

  // Input states
  const [selectedUnit, setSelectedUnit] = useState("");
  const [price, setPrice] = useState(14000);
  const [taxPct, setTaxPct] = useState(8.25);
  const [fees, setFees] = useState(125);
  const [apr, setApr] = useState(8.99);

  // Down payment options (configurable)
  const downPaymentOptions = [0, 1000, 2500, 5000];

  // Selected payment options for PDF
  const [selectedOptions, setSelectedOptions] = useState<SelectedPaymentOption[]>([]);

  // Handle payment selection
  const handleSelectPayment = (payment: {
    down: number;
    term: number;
    monthly: number;
    mode: "FINANCE" | "RTO" | "CASH";
  }) => {
    // Check if already selected
    const existingIndex = selectedOptions.findIndex(
      (opt) =>
        opt.mode === payment.mode &&
        opt.down === payment.down &&
        opt.term === payment.term
    );

    if (existingIndex >= 0) {
      // Remove if already selected
      setSelectedOptions((prev) => prev.filter((_, i) => i !== existingIndex));
      toast({
        title: "Option Removed",
        description: `${payment.mode} option deselected`,
        variant: "default",
      });
    } else if (selectedOptions.length < 3) {
      // Add if less than 3 selected
      const newOption: SelectedPaymentOption = {
        mode: payment.mode,
        label: `${payment.mode} - ${payment.term} months`,
        amount: payment.monthly,
        term: payment.term,
        down: payment.down,
        details: payment.mode === "FINANCE" ? `APR ${apr.toFixed(2)}%` : undefined,
      };
      setSelectedOptions((prev) => [...prev, newOption]);
      toast({
        title: "Option Added",
        description: `${payment.mode}: $${payment.monthly.toFixed(2)}/mo added to quote`,
        variant: "default",
      });
    } else {
      toast({
        title: "Maximum Reached",
        description: "You can select up to 3 payment options",
        variant: "destructive",
      });
    }
  };

  // Handle cash quote save
  const handleSaveCashQuote = (quote: { totalCash: number; mode: "CASH" }) => {
    const existingIndex = selectedOptions.findIndex((opt) => opt.mode === "CASH");

    if (existingIndex >= 0) {
      // Remove cash option if already selected
      setSelectedOptions((prev) => prev.filter((_, i) => i !== existingIndex));
      toast({
        title: "Cash Option Removed",
        variant: "default",
      });
    } else if (selectedOptions.length < 3) {
      // Add cash option
      const newOption: SelectedPaymentOption = {
        mode: "CASH",
        label: "Cash Payment",
        amount: quote.totalCash,
        details: "Pay in full - No monthly payments",
      };
      setSelectedOptions((prev) => [...prev, newOption]);
      toast({
        title: "Cash Option Added",
        description: `Total: $${quote.totalCash.toFixed(2)}`,
        variant: "default",
      });
    } else {
      toast({
        title: "Maximum Reached",
        description: "You can select up to 3 payment options",
        variant: "destructive",
      });
    }
  };

  // Generate PDF Quote
  const handleGeneratePDF = () => {
    if (!customerName.trim()) {
      toast({
        title: "Customer Name Required",
        description: "Please enter customer name before generating PDF",
        variant: "destructive",
      });
      return;
    }

    if (selectedOptions.length === 0) {
      toast({
        title: "No Options Selected",
        description: "Please select at least one payment option",
        variant: "destructive",
      });
      return;
    }

    const repId =
      session?.user?.role && ["REP", "SMA", "DIR", "VIP"].includes(session.user.role)
        ? `${session.user.role}#${session.user.id?.slice(0, 6).toUpperCase()}`
        : "REP#UNKNOWN";

    generateQuotePDF({
      customerName,
      customerPhone,
      customerEmail,
      repId,
      repName: session?.user?.name || "MJ Cargo Rep",
      repEmail: session?.user?.email || "",
      unitDescription: selectedUnit || "Cargo Trailer",
      unitPrice: price,
      taxPercent: taxPct,
      fees,
      selectedOptions,
      quoteDate: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    });

    toast({
      title: "PDF Generated!",
      description: `Quote for ${customerName} has been downloaded`,
      variant: "default",
    });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
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
          {/* Employee Info */}
          {session?.user && (
            <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-2">
              <p className="text-sm font-medium text-primary">
                {session.user.role === "REP" && `REP#${session.user.id?.slice(0, 6).toUpperCase()}`}
                {session.user.role === "SMA" && `SMA#${session.user.id?.slice(0, 6).toUpperCase()}`}
                {session.user.role === "DIR" && `DIR#${session.user.id?.slice(0, 6).toUpperCase()}`}
                {session.user.role === "VIP" && `VIP#${session.user.id?.slice(0, 6).toUpperCase()}`}
                {!["REP", "SMA", "DIR", "VIP"].includes(session.user.role || "") && session.user.name}
              </p>
              <p className="text-xs text-muted-foreground">{session.user.email}</p>
            </div>
          )}
        </div>

        {/* MJ Cargo Trailers Finance Center Logo Badge */}
        <div className="flex justify-center">
          <div className="relative h-24 w-auto">
            <Image
              src="/images/mjctfc.webp"
              alt="MJ Cargo Trailers Finance Center"
              width={400}
              height={96}
              className="h-24 w-auto object-contain"
              priority
            />
          </div>
        </div>

        {/* Customer Information Card */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <User className="h-5 w-5" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {/* Customer Name */}
              <div className="space-y-2">
                <Label htmlFor="customerName" className="text-foreground">
                  Customer Name *
                </Label>
                <Input
                  id="customerName"
                  type="text"
                  placeholder="John Doe"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>

              {/* Customer Phone */}
              <div className="space-y-2">
                <Label htmlFor="customerPhone" className="text-foreground">
                  Phone Number
                </Label>
                <Input
                  id="customerPhone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                />
              </div>

              {/* Customer Email */}
              <div className="space-y-2">
                <Label htmlFor="customerEmail" className="text-foreground">
                  Email Address
                </Label>
                <Input
                  id="customerEmail"
                  type="email"
                  placeholder="customer@example.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

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

        {/* Selected Options & PDF Generation */}
        {selectedOptions.length > 0 && (
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-foreground">
                <span className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  Selected Payment Options ({selectedOptions.length}/3)
                </span>
                <Button
                  onClick={handleGeneratePDF}
                  disabled={!customerName.trim()}
                  className="gap-2"
                  size="lg"
                >
                  <FileDown className="h-5 w-5" />
                  Generate PDF Quote
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {selectedOptions.map((option, index) => (
                  <div
                    key={index}
                    className="relative rounded-lg border-2 border-primary/30 bg-card p-4"
                  >
                    <div
                      className={`absolute right-2 top-2 rounded-full px-2 py-0.5 text-xs font-bold text-white ${
                        option.mode === "CASH"
                          ? "bg-green-500"
                          : option.mode === "FINANCE"
                          ? "bg-blue-500"
                          : "bg-purple-500"
                      }`}
                    >
                      {option.mode}
                    </div>
                    <div className="mt-2 text-2xl font-bold text-foreground">
                      {option.mode === "CASH"
                        ? `$${option.amount.toLocaleString()}`
                        : `$${option.amount.toFixed(2)}/mo`}
                    </div>
                    {option.term && (
                      <p className="text-sm text-muted-foreground">
                        {option.term} months
                      </p>
                    )}
                    {option.down !== undefined && (
                      <p className="text-sm text-muted-foreground">
                        Down: ${option.down.toLocaleString()}
                      </p>
                    )}
                    {option.details && (
                      <p className="text-xs text-muted-foreground">
                        {option.details}
                      </p>
                    )}
                  </div>
                ))}
              </div>
              {!customerName.trim() && (
                <p className="mt-4 text-sm text-destructive">
                  ⚠️ Please enter customer name above to generate PDF
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Disclaimer */}
        <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4">
          <p className="text-sm text-foreground font-medium text-center">
            ⚠️ All quotes are subject to top tier credit approval and fees may vary depending on location of residence.
          </p>
        </div>

        {/* Info Footer */}
        <div className="rounded-lg border border-border bg-muted/50 p-4">
          <p className="text-sm text-muted-foreground">
            💡 <strong>Pro Tip:</strong> Click any payment amount in the matrix
            to select it for the PDF quote (max 3 options). Uncheck terms to hide them from the display.
          </p>
        </div>
      </div>
    </div>
  );
}
