"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { DollarSign, User, FileDown, Printer, Copy, Image as ImageIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
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
import { generateQuoteV2, type QuoteDataV2, type ExportFormat } from "@/lib/finance/pdf-generator-v2";
import { Button } from "@/components/ui/button";
import { generateCashSnippet, generateFinanceSnippet, generateRTOSnippet, copyToClipboard } from "@/lib/finance/sms-snippets";
import { calculateFinance } from "@/lib/finance/finance-calc";
import { calculateRTO } from "@/lib/finance/rto-calc";
import { calculateCash } from "@/lib/finance/cash-calc";
import { getLocationByZip } from "@/lib/data/zip-tax-map";

// Dynamic build info
const COMMIT = (process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? '').slice(0, 7);
const ENV = process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.VERCEL_ENV ?? 'local';

interface Trailer {
  id: string;
  stockNumber: string;
  manufacturer: string;
  model: string;
  year: number;
  salePrice: number;
  status: string;
}

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  zipcode?: string;
}

export default function FinanceComparePage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();

  // CRM Integration: Get customerId from URL params
  const customerId = searchParams.get("customerId");

  // Trailers from database
  const [trailers, setTrailers] = useState<Trailer[]>([]);
  const [loadingTrailers, setLoadingTrailers] = useState(true);

  // Customer Info
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [loadedFromCRM, setLoadedFromCRM] = useState(false);
  const [crmCustomerId, setCrmCustomerId] = useState<string | null>(null);

  // Input states
  const [selectedUnit, setSelectedUnit] = useState("");
  const [price, setPrice] = useState(14000);
  const [zipcode, setZipcode] = useState("");
  const [taxPct, setTaxPct] = useState(8.25);
  const [fees, setFees] = useState(125);
  const [apr, setApr] = useState(8.99);

  // Export options
  const [showAPRInPDF, setShowAPRInPDF] = useState(true);
  const [includeFinance, setIncludeFinance] = useState(true);
  const [includeRTO, setIncludeRTO] = useState(true);
  const [includeCash, setIncludeCash] = useState(true);

  // Finance terms (which rows to include)
  const [financeTerms] = useState([24, 36, 48, 60]);
  const [rtoTerms] = useState([24, 36, 48]);

  // Down payment options (configurable)
  const downPaymentOptions = [0, 1000, 2000, 3000];

  // Zipcode to tax rate mapping
  const getTaxRateFromZip = (zip: string): number => {
    const location = getLocationByZip(zip);
    return location.taxRate;
  };

  // Fetch customer data if customerId is provided
  useEffect(() => {
    const fetchCustomer = async () => {
      if (!customerId) return;

      try {
        const res = await fetch(`/api/crm/customers/${customerId}`);
        if (res.ok) {
          const customer: Customer = await res.json();
          setCustomerName(`${customer.firstName} ${customer.lastName}`.trim());
          setCustomerPhone(customer.phone || "");
          setCustomerEmail(customer.email || "");
          if (customer.zipcode) {
            setZipcode(customer.zipcode);
            const newTaxRate = getTaxRateFromZip(customer.zipcode);
            setTaxPct(newTaxRate);
          }
          setLoadedFromCRM(true);
          setCrmCustomerId(customerId);
          toast({
            title: "Customer Loaded",
            description: `Loaded ${customer.firstName} ${customer.lastName} from CRM`,
          });
        }
      } catch (error) {
        console.error("Failed to fetch customer:", error);
      }
    };
    fetchCustomer();
  }, [customerId]);

  // Fetch trailers on mount
  useEffect(() => {
    const fetchTrailers = async () => {
      try {
        setLoadingTrailers(true);
        const res = await fetch("/api/trailers");
        const data = await res.json();
        setTrailers(data.items || []);
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

  // Auto-update tax rate when ZIP changes
  useEffect(() => {
    const updateTaxRate = async () => {
      if (zipcode && zipcode.length >= 5) {
        try {
          const res = await fetch(`/api/tax?zip=${zipcode.slice(0, 5)}`);
          const data = await res.json();
          setTaxPct(data.rate || 0);
        } catch (error) {
          console.error("Failed to fetch tax rate:", error);
        }
      }
    };
    updateTaxRate();
  }, [zipcode]);

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
      toast({
        title: "Tax Rate Updated",
        description: `Tax rate set to ${newTaxRate}% based on ZIP code`,
        variant: "default",
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

  // Calculate all finance payments for export
  const calculateFinanceMatrix = useMemo(() => {
    const payments: Record<number, Record<number, number>> = {};
    financeTerms.forEach(term => {
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
    return { terms: financeTerms, downPayments: downPaymentOptions, payments, apr };
  }, [price, taxPct, fees, apr, financeTerms, downPaymentOptions]);

  // Calculate all RTO payments for export
  const calculateRTOMatrix = useMemo(() => {
    const payments: Record<number, Record<number, number>> = {};
    rtoTerms.forEach(term => {
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
    return { terms: rtoTerms, downPayments: downPaymentOptions, payments };
  }, [price, taxPct, rtoTerms, downPaymentOptions]);

  // Calculate cash data for export
  const cashData = useMemo(() => {
    const result = calculateCash({ price, taxPct, fees });
    return {
      basePrice: result.basePrice,
      fees: result.fees,
      taxes: result.taxes,
      totalCash: result.totalCash,
    };
  }, [price, taxPct, fees]);

  // Save quote to CRM activity timeline
  const saveQuoteToActivity = async () => {
    if (!crmCustomerId) return;

    try {
      // Create a summary of the quote
      const financeExample = calculateFinanceMatrix.payments[60]?.[0];
      const rtoExample = calculateRTOMatrix.payments[48]?.[0];

      let description = `Quote for $${price.toLocaleString()} ${getUnitDescription()}`;
      if (includeFinance && financeExample) {
        description += ` - Finance: $${financeExample.toFixed(2)}/mo (60mo)`;
      }
      if (includeRTO && rtoExample) {
        description += ` - RTO: $${rtoExample.toFixed(2)}/mo (48mo)`;
      }
      if (includeCash) {
        description += ` - Cash: $${cashData.totalCash.toFixed(2)}`;
      }

      await fetch('/api/crm/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: crmCustomerId,
          type: 'quote',
          subject: 'Finance Quote Generated',
          description,
        }),
      });

      toast({
        title: "Quote Saved to Timeline",
        description: "Quote activity has been logged in the customer's timeline",
      });
    } catch (error) {
      console.error("Failed to save quote to activity:", error);
    }
  };

  // Generate Quote with full matrices
  const handleExportQuote = async (format: ExportFormat) => {
    if (!customerName.trim()) {
      toast({
        title: "Customer Name Required",
        description: "Please enter customer name before generating quote",
        variant: "destructive",
      });
      return;
    }

    const repId =
      session?.user?.role && ["REP", "SMA", "DIR", "VIP"].includes(session.user.role)
        ? `${session.user.role}#${session.user.id?.slice(0, 6).toUpperCase()}`
        : session?.user?.name || session?.user?.email || "Remotive Logistics Rep";

    const selectedTrailer = trailers.find(t => t.id === selectedUnit);
    const unitDescription = selectedTrailer
      ? `${selectedTrailer.year} ${selectedTrailer.manufacturer} ${selectedTrailer.model} (${selectedTrailer.stockNumber})`
      : "Cargo Trailer";

    const quoteData: QuoteDataV2 = {
      customerName,
      customerPhone,
      customerEmail,
      repId,
      repName: session?.user?.name || "Remotive Logistics Rep",
      repEmail: session?.user?.email || "",
      unitDescription,
      unitPrice: price,
      taxPercent: taxPct,
      fees,
      financeMatrix: includeFinance ? calculateFinanceMatrix : undefined,
      rtoMatrix: includeRTO ? calculateRTOMatrix : undefined,
      cashData: includeCash ? cashData : undefined,
      showAPR: showAPRInPDF,
      quoteDate: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }),
    };

    try {
      await generateQuoteV2(quoteData, format);

      toast({
        title: `${format.toUpperCase()} Generated!`,
        description: `Quote for ${customerName} has been downloaded`,
        variant: "default",
      });

      // Save to CRM activity if customer was loaded from CRM
      if (crmCustomerId) {
        await saveQuoteToActivity();
      }
    } catch (error) {
      console.error("Error generating quote:", error);
      toast({
        title: "Generation Failed",
        description: "There was an error generating the quote. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Print handler
  const handlePrint = () => {
    window.print();
  };

  // Copy all scenarios as text
  const handleCopyAllText = async () => {
    let allText = `REMOTIVE LOGISTICS - Finance Quote\n`;
    allText += `Customer: ${customerName}\n`;
    allText += `Unit: ${getUnitDescription()} - $${price.toLocaleString()}\n`;
    allText += `Date: ${new Date().toLocaleDateString()}\n\n`;

    if (includeFinance) {
      allText += `=== FINANCE OPTIONS (${apr}% APR) ===\n`;
      financeTerms.forEach(term => {
        allText += `${term} months: `;
        downPaymentOptions.forEach((down, i) => {
          const payment = calculateFinanceMatrix.payments[term][down];
          allText += `$${down} down = $${payment.toFixed(2)}/mo`;
          if (i < downPaymentOptions.length - 1) allText += ` | `;
        });
        allText += `\n`;
      });
      allText += `\n`;
    }

    if (includeRTO) {
      allText += `=== RENT-TO-OWN OPTIONS ===\n`;
      rtoTerms.forEach(term => {
        allText += `${term} months: `;
        downPaymentOptions.forEach((down, i) => {
          const payment = calculateRTOMatrix.payments[term][down];
          allText += `$${down} down = $${payment.toFixed(2)}/mo`;
          if (i < downPaymentOptions.length - 1) allText += ` | `;
        });
        allText += `\n`;
      });
      allText += `\n`;
    }

    if (includeCash) {
      allText += `=== CASH PURCHASE ===\n`;
      allText += `Total: $${cashData.totalCash.toFixed(2)}\n`;
      allText += `(Price: $${cashData.basePrice.toLocaleString()} + Tax: $${cashData.taxes.toFixed(2)} + Fees: $${cashData.fees})\n`;
    }

    const success = await copyToClipboard(allText);
    if (success) {
      toast({
        title: "Copied to Clipboard",
        description: "All payment options copied as text",
      });
    } else {
      toast({
        title: "Copy Failed",
        description: "Please try again",
        variant: "destructive",
      });
    }
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
        title: "Copied to clipboard!",
        description: "Cash deal SMS text ready to send",
      });
    } else {
      toast({
        title: "Copy failed",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleCopyFinanceSMS = async () => {
    const snippet = generateFinanceSnippet({
      customerName,
      unitDescription: getUnitDescription(),
      unitPrice: price,
      taxPercent: taxPct,
      fees,
      apr,
      downPayments: downPaymentOptions,
      terms: financeTerms,
      payments: calculateFinanceMatrix.payments,
    });

    const success = await copyToClipboard(snippet);
    if (success) {
      toast({
        title: "Copied to clipboard!",
        description: "Finance options SMS text ready to send",
      });
    } else {
      toast({
        title: "Copy failed",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleCopyRTOSMS = async () => {
    const snippet = generateRTOSnippet({
      customerName,
      unitDescription: getUnitDescription(),
      unitPrice: price,
      taxPercent: taxPct,
      fees,
      downPayments: downPaymentOptions,
      terms: rtoTerms,
      payments: calculateRTOMatrix.payments,
    });

    const success = await copyToClipboard(snippet);
    if (success) {
      toast({
        title: "Copied to clipboard!",
        description: "RTO options SMS text ready to send",
      });
    } else {
      toast({
        title: "Copy failed",
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
                Finance Calculator
              </h1>
              <p className="text-foreground/70">
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
              <p className="text-xs text-foreground/70">{session.user.email}</p>
            </div>
          )}
        </div>

        {/* CRM Integration Badge */}
        {loadedFromCRM && (
          <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-3">
            <p className="text-sm text-green-700 dark:text-green-400 font-medium">
              Loaded from CRM: {customerName}
            </p>
            <p className="text-xs text-green-600/70 dark:text-green-500/70">
              Quote will be saved to customer's activity timeline when exported
            </p>
          </div>
        )}

        {/* Customer Information Card */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle asChild>
              <h2 className="text-foreground flex items-center gap-2">
                <User className="h-5 w-5" aria-hidden="true" />
                Customer Information
              </h2>
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
            <CardTitle asChild>
              <h2 className="text-foreground">Quote Details</h2>
            </CardTitle>
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
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/70">
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
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/70">
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
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/70">
                    %
                  </span>
                </div>
              </div>

              {/* Unit Selector */}
              <div className="space-y-2">
                <Label htmlFor="unit" className="text-foreground">
                  Select Unit from Inventory
                </Label>
                <Select value={selectedUnit} onValueChange={handleTrailerSelect} disabled={loadingTrailers}>
                  <SelectTrigger id="unit">
                    <SelectValue placeholder={loadingTrailers ? "Loading inventory..." : "Choose from inventory..."} />
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
                  <p className="text-xs text-foreground/70">
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
              onShare={handleCopyCashSMS}
            />
          </CardContent>
        </Card>

        {/* Export Quote Section */}
        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardHeader>
            <CardTitle asChild>
              <h2 className="text-foreground flex items-center gap-2">
                <FileDown className="h-5 w-5 text-primary" />
                Export Quote
              </h2>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Export Options */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* Include Finance */}
              <div className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
                <Label htmlFor="includeFinance" className="text-sm font-medium">
                  Include Finance
                </Label>
                <Switch
                  id="includeFinance"
                  checked={includeFinance}
                  onCheckedChange={setIncludeFinance}
                />
              </div>

              {/* Include RTO */}
              <div className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
                <Label htmlFor="includeRTO" className="text-sm font-medium">
                  Include RTO
                </Label>
                <Switch
                  id="includeRTO"
                  checked={includeRTO}
                  onCheckedChange={setIncludeRTO}
                />
              </div>

              {/* Include Cash */}
              <div className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
                <Label htmlFor="includeCash" className="text-sm font-medium">
                  Include Cash
                </Label>
                <Switch
                  id="includeCash"
                  checked={includeCash}
                  onCheckedChange={setIncludeCash}
                />
              </div>

              {/* Show APR in PDF */}
              <div className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
                <Label htmlFor="showAPR" className="text-sm font-medium">
                  Show APR in PDF
                </Label>
                <Switch
                  id="showAPR"
                  checked={showAPRInPDF}
                  onCheckedChange={setShowAPRInPDF}
                />
              </div>
            </div>

            {/* Export Buttons */}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <Button
                onClick={() => handleExportQuote("pdf")}
                disabled={!customerName.trim()}
                className="gap-2"
                size="lg"
              >
                <FileDown className="h-5 w-5" />
                PDF
              </Button>
              <Button
                onClick={() => handleExportQuote("png")}
                disabled={!customerName.trim()}
                variant="secondary"
                className="gap-2"
                size="lg"
              >
                <ImageIcon className="h-5 w-5" />
                PNG
              </Button>
              <Button
                onClick={handlePrint}
                variant="outline"
                className="gap-2"
                size="lg"
              >
                <Printer className="h-5 w-5" />
                Print
              </Button>
              <Button
                onClick={handleCopyAllText}
                variant="outline"
                className="gap-2"
                size="lg"
              >
                <Copy className="h-5 w-5" />
                Copy Text
              </Button>
            </div>

            {/* Customer name warning */}
            {!customerName.trim() && (
              <p className="text-sm text-destructive text-center">
                Please enter customer name above to generate quote
              </p>
            )}
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4">
          <p className="text-sm text-foreground font-medium text-center">
            All quotes are subject to top tier credit approval and fees may vary depending on location of residence.
          </p>
        </div>

        {/* Info Footer */}
        <div className="rounded-lg border border-border bg-muted/50 p-4">
          <p className="text-sm text-foreground/80">
            <strong>Pro Tip:</strong> Use the toggles above to customize which sections appear in your exported quote.
            All visible payment options will be included in the PDF/PNG export.
          </p>
        </div>
      </div>

      {/* Version Stamp */}
      <div className="text-[10px] text-gray-500 mt-6 opacity-70">
        FIN-COMPARE v3 • commit {COMMIT} • env:{ENV}
      </div>
    </div>
  );
}
