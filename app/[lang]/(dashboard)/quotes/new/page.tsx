"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Calculator, User, MapPin, DollarSign, FileText, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { getLocationByZip } from "@/lib/data/zip-tax-map";
import { getTrailerByVIN, validatePriceRange } from "@/app/actions/inventory";
import { calculateRTO } from "@/lib/finance/rto-calc";
import { calculateFinance } from "@/lib/finance/finance-calc";
import { generateQuotePDF, SelectedPaymentOption } from "@/lib/finance/pdf-generator";

type QuoteMode = "FINANCE" | "RTO" | "CASH";

export default function QuoteBuilderPage() {
  const { data: session } = useSession();
  const router = useRouter();

  // Customer Info
  const [customerLastName, setCustomerLastName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");

  // Rep Info (pre-filled from session)
  const [repInitials, setRepInitials] = useState("");

  // Location & Tax
  const [zipcode, setZipcode] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [taxRate, setTaxRate] = useState(6.0);

  // VIN Lookup
  const [vin, setVin] = useState("");
  const [vinLookupLoading, setVinLookupLoading] = useState(false);
  const [vinMatched, setVinMatched] = useState(false);
  const [vinData, setVinData] = useState<any>(null);

  // Pricing
  const [unitPrice, setUnitPrice] = useState(14000);
  const [downPayment, setDownPayment] = useState(0);
  const [priceError, setPriceError] = useState("");

  // Quote Mode & Terms
  const [quoteMode, setQuoteMode] = useState<QuoteMode>("RTO");
  const [apr, setApr] = useState(8.99);
  const [term, setTerm] = useState(48);

  // Live calculation results
  const [monthlyPayment, setMonthlyPayment] = useState(0);
  const [totalCost, setTotalCost] = useState(0);

  // Pre-fill rep initials from session
  useEffect(() => {
    if (session?.user?.name) {
      const names = session.user.name.split(" ");
      const initials = names.map(n => n[0]).join("").toUpperCase();
      setRepInitials(initials);
    }
  }, [session]);

  // Handle ZIP code change - auto-fill city/state/tax
  const handleZipChange = async (zip: string) => {
    setZipcode(zip);

    if (zip.length === 5) {
      const location = getLocationByZip(zip);
      setCity(location.city);
      setState(location.state);
      setTaxRate(location.taxRate);

      toast({
        title: "Location Auto-filled",
        description: `${location.city}, ${location.state} - Tax: ${location.taxRate}%`,
      });
    }
  };

  // Handle VIN lookup - auto-fill price and specs
  const handleVinLookup = async () => {
    if (!vin || vin.length < 6) {
      toast({
        title: "Invalid VIN",
        description: "Please enter a valid VIN (minimum 6 characters)",
        variant: "destructive",
      });
      return;
    }

    setVinLookupLoading(true);
    try {
      const result = await getTrailerByVIN(vin);
      if (result) {
        setVinData(result);
        setVinMatched(true);
        setUnitPrice(result.salePrice);

        toast({
          title: "VIN Matched!",
          description: `${result.year} ${result.manufacturer} ${result.model} - $${result.salePrice.toLocaleString()}`,
        });
      } else {
        setVinMatched(false);
        toast({
          title: "VIN Not Found",
          description: "No matching trailer in inventory. You can still proceed with manual entry.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Lookup Error",
        description: "Failed to lookup VIN. Please try again.",
        variant: "destructive",
      });
    } finally {
      setVinLookupLoading(false);
    }
  };

  // Validate price when VIN matched
  const handlePriceChange = (newPrice: number) => {
    setUnitPrice(newPrice);

    if (vinMatched && vinData) {
      const validation = validatePriceRange(newPrice, vinData.salePrice);
      if (!validation.valid) {
        setPriceError(validation.message || "");
      } else {
        setPriceError("");
      }
    }
  };

  // Live calculation (runs whenever inputs change)
  useEffect(() => {
    if (quoteMode === "RTO") {
      const result = calculateRTO({
        price: unitPrice,
        down: downPayment,
        taxPct: taxRate,
        termMonths: term,
      });
      setMonthlyPayment(result.monthlyTotal);
      setTotalCost(result.totalPaid);
    } else if (quoteMode === "FINANCE") {
      const result = calculateFinance({
        price: unitPrice,
        down: downPayment,
        taxPct: taxRate,
        fees: 125,
        aprPercent: apr,
        termMonths: term,
      });
      setMonthlyPayment(result.monthlyPayment);
      setTotalCost(result.totalPaid);
    } else {
      // CASH
      const cashTotal = unitPrice + (unitPrice * taxRate / 100) + 125;
      setMonthlyPayment(0);
      setTotalCost(cashTotal);
    }
  }, [quoteMode, unitPrice, downPayment, taxRate, apr, term]);

  // Generate PDF
  const handleGeneratePDF = () => {
    if (!customerLastName.trim()) {
      toast({
        title: "Customer Name Required",
        description: "Please enter customer last name",
        variant: "destructive",
      });
      return;
    }

    if (!zipcode || zipcode.length !== 5) {
      toast({
        title: "ZIP Code Required",
        description: "Please enter a valid 5-digit ZIP code",
        variant: "destructive",
      });
      return;
    }

    if (priceError) {
      toast({
        title: "Price Error",
        description: priceError,
        variant: "destructive",
      });
      return;
    }

    const repId = session?.user?.id?.slice(0, 6).toUpperCase() || repInitials;
    const unitDescription = vinData
      ? `${vinData.year} ${vinData.manufacturer} ${vinData.model} (${vinData.stockNumber})`
      : `Cargo Trailer`;

    const selectedOptions: SelectedPaymentOption[] = [];

    if (quoteMode === "CASH") {
      selectedOptions.push({
        mode: "CASH",
        label: "Cash Payment",
        amount: totalCost,
        details: "Pay in full - No monthly payments",
      });
    } else {
      selectedOptions.push({
        mode: quoteMode,
        label: `${quoteMode} - ${term} months`,
        amount: monthlyPayment,
        term,
        down: downPayment,
        details: quoteMode === "FINANCE" ? `APR ${apr.toFixed(2)}%` : undefined,
      });
    }

    generateQuotePDF({
      customerName: customerLastName,
      customerPhone,
      customerEmail,
      repId,
      repName: session?.user?.name || repInitials,
      repEmail: session?.user?.email || "",
      unitDescription,
      unitPrice,
      taxPercent: taxRate,
      fees: 125,
      selectedOptions,
      quoteDate: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    });

    toast({
      title: "PDF Generated!",
      description: `Quote for ${customerLastName} has been downloaded`,
    });
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E96114]/10">
              <Calculator className="h-6 w-6 text-[#E96114]" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                Quick Quote Builder
              </h1>
              <p className="text-sm text-muted-foreground">
                One screen, lightning fast
              </p>
            </div>
          </div>
        </div>

        {/* Main Form Card */}
        <Card className="border-[#09213C]/20 bg-card">
          <CardHeader className="bg-[#09213C]/5 border-b">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-[#E96114]" />
              Customer & Rep Info
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {/* Customer Last Name + Rep Initials */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerLastName" className="text-base font-semibold">
                  Customer Last Name *
                </Label>
                <Input
                  id="customerLastName"
                  type="text"
                  placeholder="Smith"
                  value={customerLastName}
                  onChange={(e) => setCustomerLastName(e.target.value)}
                  className="h-12 text-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="repInitials" className="text-base font-semibold">
                  Rep Initials
                </Label>
                <Input
                  id="repInitials"
                  type="text"
                  placeholder="JD"
                  value={repInitials}
                  onChange={(e) => setRepInitials(e.target.value.toUpperCase())}
                  maxLength={4}
                  className="h-12 text-lg font-mono uppercase"
                />
              </div>
            </div>

            {/* Phone + Email (Optional) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerPhone" className="text-sm">
                  Phone (optional)
                </Label>
                <Input
                  id="customerPhone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerEmail" className="text-sm">
                  Email (optional)
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

        {/* Location & Tax Card */}
        <Card className="border-[#09213C]/20">
          <CardHeader className="bg-[#09213C]/5 border-b">
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5 text-[#E96114]" />
              Location & Tax
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2 md:col-span-1">
                <Label htmlFor="zipcode" className="text-base font-semibold">
                  ZIP Code *
                </Label>
                <Input
                  id="zipcode"
                  type="text"
                  maxLength={5}
                  placeholder="42101"
                  value={zipcode}
                  onChange={(e) => handleZipChange(e.target.value)}
                  className="h-12 text-lg font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm">City (auto-filled)</Label>
                <Input
                  value={city}
                  readOnly
                  className="bg-muted/50"
                  placeholder="Auto-fills from ZIP"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Tax Rate</Label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.01"
                    value={taxRate}
                    onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                    className="pr-8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    %
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* VIN Lookup Card */}
        <Card className="border-[#E96114]/30">
          <CardHeader className="bg-[#E96114]/5 border-b border-[#E96114]/20">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#E96114]" />
              VIN Lookup (Optional)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="flex gap-2">
              <div className="flex-1 space-y-2">
                <Label htmlFor="vin">Enter VIN to auto-fill price & specs</Label>
                <Input
                  id="vin"
                  type="text"
                  placeholder="1HGBH41JXMN109186"
                  value={vin}
                  onChange={(e) => setVin(e.target.value.toUpperCase())}
                  className="font-mono uppercase"
                  onKeyDown={(e) => e.key === "Enter" && handleVinLookup()}
                />
              </div>
              <div className="pt-7">
                <Button
                  onClick={handleVinLookup}
                  disabled={vinLookupLoading || !vin}
                  className="h-10 bg-[#E96114] hover:bg-[#E96114]/90"
                >
                  {vinLookupLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Lookup"
                  )}
                </Button>
              </div>
            </div>

            {vinMatched && vinData && (
              <div className="rounded-lg bg-green-500/10 border border-green-500/30 p-4">
                <p className="text-sm font-semibold text-green-700">
                  ✓ VIN Matched: {vinData.year} {vinData.manufacturer} {vinData.model}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Stock #{vinData.stockNumber} | Listed: ${vinData.salePrice.toLocaleString()}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pricing Card */}
        <Card className="border-[#09213C]/20">
          <CardHeader className="bg-[#09213C]/5 border-b">
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-[#E96114]" />
              Pricing & Terms
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {/* Price + Down */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unitPrice" className="text-base font-semibold">
                  Unit Price *
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground font-bold text-lg">
                    $
                  </span>
                  <Input
                    id="unitPrice"
                    type="number"
                    value={unitPrice}
                    onChange={(e) => handlePriceChange(parseFloat(e.target.value) || 0)}
                    className={`h-12 text-lg pl-8 ${priceError ? "border-red-500" : ""}`}
                  />
                </div>
                {priceError && (
                  <p className="text-xs text-red-500">{priceError}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="downPayment" className="text-base font-semibold">
                  Down Payment
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    id="downPayment"
                    type="number"
                    value={downPayment}
                    onChange={(e) => setDownPayment(parseFloat(e.target.value) || 0)}
                    className="h-12 text-lg pl-7"
                  />
                </div>
              </div>
            </div>

            {/* Quote Mode Selector */}
            <div className="space-y-2">
              <Label className="text-base font-semibold">Quote Mode</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={quoteMode === "RTO" ? "default" : "outline"}
                  onClick={() => setQuoteMode("RTO")}
                  className={quoteMode === "RTO" ? "bg-[#E96114] hover:bg-[#E96114]/90" : ""}
                >
                  RTO
                </Button>
                <Button
                  variant={quoteMode === "FINANCE" ? "default" : "outline"}
                  onClick={() => setQuoteMode("FINANCE")}
                  className={quoteMode === "FINANCE" ? "bg-[#09213C] hover:bg-[#09213C]/90" : ""}
                >
                  Finance
                </Button>
                <Button
                  variant={quoteMode === "CASH" ? "default" : "outline"}
                  onClick={() => setQuoteMode("CASH")}
                  className={quoteMode === "CASH" ? "bg-green-600 hover:bg-green-700" : ""}
                >
                  Cash
                </Button>
              </div>
            </div>

            {/* APR (Finance only) */}
            {quoteMode === "FINANCE" && (
              <div className="space-y-2">
                <Label htmlFor="apr">APR</Label>
                <div className="relative">
                  <Input
                    id="apr"
                    type="number"
                    step="0.01"
                    value={apr}
                    onChange={(e) => setApr(parseFloat(e.target.value) || 0)}
                    className="pr-8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    %
                  </span>
                </div>
              </div>
            )}

            {/* Term (RTO/Finance only) */}
            {quoteMode !== "CASH" && (
              <div className="space-y-2">
                <Label htmlFor="term">Term (months)</Label>
                <Input
                  id="term"
                  type="number"
                  value={term}
                  onChange={(e) => setTerm(parseInt(e.target.value) || 0)}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Live Summary Card */}
        <Card className="border-[#E96114] border-2 bg-gradient-to-br from-[#E96114]/5 to-[#09213C]/5">
          <CardHeader>
            <CardTitle className="text-xl">Quote Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {quoteMode !== "CASH" && (
                <div className="text-center p-4 rounded-lg bg-card border">
                  <p className="text-sm text-muted-foreground">Monthly Payment</p>
                  <p className="text-3xl font-bold text-[#E96114]">
                    ${monthlyPayment.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">{term} months</p>
                </div>
              )}
              <div className={`text-center p-4 rounded-lg bg-card border ${quoteMode === "CASH" ? "col-span-2" : ""}`}>
                <p className="text-sm text-muted-foreground">
                  {quoteMode === "CASH" ? "Total Cash" : "Total Paid"}
                </p>
                <p className="text-3xl font-bold text-[#09213C]">
                  ${totalCost.toFixed(2)}
                </p>
              </div>
            </div>

            <Button
              onClick={handleGeneratePDF}
              size="lg"
              className="w-full h-14 text-lg bg-[#E96114] hover:bg-[#E96114]/90"
              disabled={!customerLastName.trim() || !zipcode || !!priceError}
            >
              Generate PDF Quote
            </Button>

            {!customerLastName.trim() && (
              <p className="text-sm text-center text-destructive">
                Enter customer last name and ZIP to generate PDF
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
