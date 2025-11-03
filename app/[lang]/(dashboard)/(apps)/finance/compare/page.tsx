"use client";

import { useState, useEffect, useMemo } from "react";
import { DollarSign, User, Phone, Mail } from "lucide-react";
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
import { generateQuote, type SelectedPaymentOption, type ExportFormat } from "@/lib/finance/pdf-generator-v2";
import { Button } from "@/components/ui/button";
import { FileDown, Check } from "lucide-react";
import { generateCashSnippet, generateFinanceSnippet, generateRTOSnippet, copyToClipboard } from "@/lib/finance/sms-snippets";
import { calculateFinance } from "@/lib/finance/finance-calc";
import { calculateRTO } from "@/lib/finance/rto-calc";
import { getLocationByZip } from "@/lib/data/zip-tax-map";

interface Trailer {
  id: string;
  stockNumber: string;
  manufacturer: string;
  model: string;
  year: number;
  salePrice: number;
  status: string;
}

export default function FinanceComparePage() {
  const { data: session } = useSession();

  // Trailers from database
  const [trailers, setTrailers] = useState<Trailer[]>([]);
  const [loadingTrailers, setLoadingTrailers] = useState(true);

  // Customer Info
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");

  // Input states
  const [selectedUnit, setSelectedUnit] = useState("");
  const [price, setPrice] = useState(14000);
  const [zipcode, setZipcode] = useState("");
  const [taxPct, setTaxPct] = useState(8.25);
  const [fees, setFees] = useState(125);
  const [apr, setApr] = useState(8.99);

  // Zipcode to tax rate mapping (centralized in lib/data/zip-tax-map.ts)
  const getTaxRateFromZip = (zip: string): number => {
    const location = getLocationByZip(zip);
    return location.taxRate;
  };

  // Fetch trailers on mount
  useEffect(() => {
    const fetchTrailers = async () => {
      try {
        setLoadingTrailers(true);
        const res = await fetch("/api/inventory?status=available");
        const data = await res.json();
        setTrailers(data.trailers || []);
      } catch (error) {
        console.error("Failed to fetch trailers:", error);
        toast({
          title: "Error",
          description: "Failed to load trailers from inventory",
          variant: "destructive",
        });
      } finally {
        setLoadingTrailers(false);
      }
    };
    fetchTrailers();
  }, []);

  // Handle trailer selection and auto-update price
  const handleTrailerSelect = (trailerId: string) => {
    setSelectedUnit(trailerId);
    const trailer = trailers.find(t => t.id === trailerId);
    if (trailer) {
      setPrice(trailer.salePrice);
      toast({
        title: "Trailer Selected",
        description: `${trailer.year} ${trailer.manufacturer} ${trailer.model} - $${trailer.salePrice.toLocaleString()}`,
        variant: "default",
      });
    }
  };

  // Handle zipcode change and auto-update tax
  const handleZipcodeChange = (value: string) => {
    setZipcode(value);
    if (value.length === 5) {
      const newTaxRate = getTaxRateFromZip(value);
      setTaxPct(newTaxRate);
      if (newTaxRate !== taxPct) {
        toast({
          title: "Tax Rate Updated",
          description: `Tax rate set to ${newTaxRate}% based on ZIP code`,
          variant: "default",
        });
      }
    }
  };

  // Down payment options (configurable)
  const downPaymentOptions = [0, 1000, 2000, 3000];

  // Selected payment options for PDF
  const [selectedOptions, setSelectedOptions] = useState<SelectedPaymentOption[]>([]);

  // Export format selector
  const [exportFormat, setExportFormat] = useState<ExportFormat>("pdf");

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

  // Handle finance quote save - adds best option (lowest down, longest term)
  const handleSaveFinanceQuote = () => {
    // Find best finance option (60 months, lowest down payment)
    const bestTerm = 60; // Most popular term
    const bestDown = downPaymentOptions[0]; // Lowest down payment
    const result = calculateFinance({
      price,
      down: bestDown,
      taxPct,
      fees,
      aprPercent: apr,
      termMonths: bestTerm,
    });

    const payment = {
      down: bestDown,
      term: bestTerm,
      monthly: result.monthlyPayment,
      mode: "FINANCE" as const,
    };

    handleSelectPayment(payment);
  };

  // Handle RTO quote save - adds best option (lowest down, longest term)
  const handleSaveRTOQuote = () => {
    // Find best RTO option (48 months, lowest down payment)
    const bestTerm = 48; // Most popular RTO term
    const bestDown = downPaymentOptions[0]; // Lowest down payment
    const result = calculateRTO({
      price,
      down: bestDown,
      taxPct,
      termMonths: bestTerm,
    });

    const payment = {
      down: bestDown,
      term: bestTerm,
      monthly: result.monthlyTotal,
      mode: "RTO" as const,
    };

    handleSelectPayment(payment);
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

  // Generate Quote (PDF/JPEG/PNG)
  const handleGeneratePDF = async () => {
    if (!customerName.trim()) {
      toast({
        title: "Customer Name Required",
        description: "Please enter customer name before generating quote",
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
        : session?.user?.name || session?.user?.email || "MJ Cargo Rep";

    // Get selected trailer details for quote
    const selectedTrailer = trailers.find(t => t.id === selectedUnit);
    const unitDescription = selectedTrailer
      ? `${selectedTrailer.year} ${selectedTrailer.manufacturer} ${selectedTrailer.model} (${selectedTrailer.stockNumber})`
      : "Cargo Trailer";

    try {
      await generateQuote({
        customerName,
        customerPhone,
        customerEmail,
        repId,
        repName: session?.user?.name || "MJ Cargo Rep",
        repEmail: session?.user?.email || "",
        unitDescription,
        unitPrice: price,
        taxPercent: taxPct,
        fees,
        selectedOptions,
        quoteDate: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }),
      }, exportFormat);

      toast({
        title: `${exportFormat.toUpperCase()} Generated!`,
        description: `Quote for ${customerName} has been downloaded`,
        variant: "default",
      });
    } catch (error) {
      console.error("Error generating quote:", error);
      toast({
        title: "Generation Failed",
        description: "There was an error generating the quote. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Get unit description helper
  const getUnitDescription = () => {
    const selectedTrailer = trailers.find(t => t.id === selectedUnit);
    return selectedTrailer
      ? `${selectedTrailer.year} ${selectedTrailer.manufacturer} ${selectedTrailer.model}`
      : "Cargo Trailer";
  };

  // SMS Copy Handlers
  const handleCopyCashSMS = async () => {
    const snippet = generateCashSnippet({
      customerName,
      unitDescription: getUnitDescription(),
      unitPrice: price,
      taxPercent: taxPct,
      fees,
    });

    const success = await copyToClipboard(snippet);
    if (success) {
      toast({
        title: "✅ Copied to clipboard!",
        description: "Cash deal SMS text ready to send",
      });
    } else {
      toast({
        title: "❌ Copy failed",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleCopyFinanceSMS = async () => {
    // Calculate all finance payments for the matrix
    const terms = [24, 36, 48, 60];
    const payments: Record<number, Record<number, number>> = {};

    terms.forEach(term => {
      payments[term] = {};
      downPaymentOptions.forEach(down => {
        const result = calculateFinance({
          price,
          down,
          taxPct,
          fees,
          aprPercent: apr,
          termMonths: term
        });
        payments[term][down] = result.monthlyPayment;
      });
    });

    const snippet = generateFinanceSnippet({
      customerName,
      unitDescription: getUnitDescription(),
      unitPrice: price,
      taxPercent: taxPct,
      fees,
      apr,
      downPayments: downPaymentOptions,
      terms,
      payments,
    });

    const success = await copyToClipboard(snippet);
    if (success) {
      toast({
        title: "✅ Copied to clipboard!",
        description: "Finance options SMS text ready to send",
      });
    } else {
      toast({
        title: "❌ Copy failed",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleCopyRTOSMS = async () => {
    // Calculate all RTO payments for the matrix
    const terms = [24, 36, 48];
    const payments: Record<number, Record<number, number>> = {};

    terms.forEach(term => {
      payments[term] = {};
      downPaymentOptions.forEach(down => {
        const result = calculateRTO({
          price,
          down,
          taxPct,
          termMonths: term
        });
        payments[term][down] = result.monthlyTotal;
      });
    });

    const snippet = generateRTOSnippet({
      customerName,
      unitDescription: getUnitDescription(),
      unitPrice: price,
      taxPercent: taxPct,
      fees,
      downPayments: downPaymentOptions,
      terms,
      payments,
    });

    const success = await copyToClipboard(snippet);
    if (success) {
      toast({
        title: "✅ Copied to clipboard!",
        description: "RTO options SMS text ready to send",
      });
    } else {
      toast({
        title: "❌ Copy failed",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <DollarSign className="h-6 w-6 text-primary" />
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

        {/* MJ Cargo Trailers Finance Center Logo */}
        <div className="relative z-10 flex justify-center mb-6">
          <Image
            src="/images/mjctfc.webp"
            alt="MJ Cargo Trailers Finance Center"
            width={400}
            height={120}
            className="h-32 w-auto object-contain drop-shadow-2xl"
            priority
          />
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
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-6">
              {/* Unit Price */}
              <div className="space-y-2">
                <Label htmlFor="price" className="text-foreground">
                  Unit Price
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground font-semibold">
                    $
                  </span>
                  <Input
                    id="price"
                    type="number"
                    value={price || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "" || val === "-") {
                        setPrice(0);
                      } else {
                        const parsed = parseFloat(val);
                        if (!isNaN(parsed)) {
                          setPrice(parsed);
                        }
                      }
                    }}
                    className="pl-7"
                  />
                </div>
              </div>

              {/* Zipcode */}
              <div className="space-y-2">
                <Label htmlFor="zipcode" className="text-foreground">
                  ZIP Code
                </Label>
                <Input
                  id="zipcode"
                  type="text"
                  maxLength={5}
                  placeholder="42101"
                  value={zipcode}
                  onChange={(e) => handleZipcodeChange(e.target.value)}
                  className="font-mono"
                />
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

              {/* Unit Selector - REAL 172 TRAILERS FROM DATABASE */}
              <div className="space-y-2">
                <Label htmlFor="unit" className="text-foreground">
                  Select Unit from Inventory
                </Label>
                <Select value={selectedUnit} onValueChange={handleTrailerSelect} disabled={loadingTrailers}>
                  <SelectTrigger id="unit">
                    <SelectValue placeholder={loadingTrailers ? "Loading inventory..." : "Choose from 172 trailers..."} />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {loadingTrailers ? (
                      <SelectItem value="loading" disabled>Loading...</SelectItem>
                    ) : trailers.length === 0 ? (
                      <SelectItem value="none" disabled>No trailers available</SelectItem>
                    ) : (
                      trailers.map((trailer) => (
                        <SelectItem key={trailer.id} value={trailer.id}>
                          {trailer.stockNumber} - {trailer.year} {trailer.manufacturer} {trailer.model} - ${trailer.salePrice.toLocaleString()}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {!loadingTrailers && trailers.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {trailers.length} trailers available in inventory
                  </p>
                )}
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
              onSaveQuote={handleSaveFinanceQuote}
              onCopySMS={handleCopyFinanceSMS}
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
              onSaveQuote={handleSaveRTOQuote}
              onCopySMS={handleCopyRTOSMS}
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
              onShare={handleCopyCashSMS}
            />
          </CardContent>
        </Card>

        {/* Selected Options & Quote Generation */}
        {selectedOptions.length > 0 && (
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader>
              <CardTitle className="space-y-4 text-foreground">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-primary" />
                    Selected Payment Options ({selectedOptions.length}/3)
                  </span>
                </div>

                {/* Export Format Selector & Generate Button */}
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setExportFormat("pdf")}
                      className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                        exportFormat === "pdf"
                          ? "bg-primary text-primary-foreground shadow-md scale-105"
                          : "bg-muted hover:bg-muted/80 text-muted-foreground"
                      }`}
                    >
                      📄 PDF
                    </button>
                    <button
                      onClick={() => setExportFormat("jpeg")}
                      className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                        exportFormat === "jpeg"
                          ? "bg-primary text-primary-foreground shadow-md scale-105"
                          : "bg-muted hover:bg-muted/80 text-muted-foreground"
                      }`}
                    >
                      🖼️ JPEG
                    </button>
                    <button
                      onClick={() => setExportFormat("png")}
                      className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                        exportFormat === "png"
                          ? "bg-primary text-primary-foreground shadow-md scale-105"
                          : "bg-muted hover:bg-muted/80 text-muted-foreground"
                      }`}
                    >
                      🎨 PNG
                    </button>
                  </div>

                  <Button
                    onClick={handleGeneratePDF}
                    disabled={!customerName.trim()}
                    className="gap-2 flex-1 min-w-[200px]"
                    size="lg"
                  >
                    <FileDown className="h-5 w-5" />
                    Generate {exportFormat.toUpperCase()} Quote
                  </Button>
                </div>
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
                  ⚠️ Please enter customer name above to generate quote
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

      {/* Version Stamp */}
      <div className="text-[10px] text-gray-500 mt-6 opacity-70">
        FIN-COMPARE v2 • commit 39f1ca6 • env:{process.env.VERCEL_ENV ?? 'local'}
      </div>
    </div>
  );
}
