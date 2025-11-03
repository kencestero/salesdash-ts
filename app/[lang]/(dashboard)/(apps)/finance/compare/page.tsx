"use client";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, FileDown } from "lucide-react";

export default function ComparePage() {
  const sp = useSearchParams();
  const name = (sp.get("name") ?? "").trim();
  const zip = (sp.get("zip") ?? "").trim();
  const price = Number(sp.get("price") ?? 0);
  const phone = (sp.get("phone") ?? "").trim();
  const email = (sp.get("email") ?? "").trim();

  const financeDowns = useMemo(() => [0, 1000, 2000, 3000], []);
  const [rtoDown, setRtoDown] = useState<number>(950);

  const missing = !name || !zip || !price;

  function buildQuoteParams(): URLSearchParams {
    return new URLSearchParams({
      name,
      zip,
      price: String(price),
      ...(phone ? { phone } : {}),
      ...(email ? { email } : {}),
      // If you render tables client-side, serialize & include them here:
      // paymentTablesHtml
    });
  }

  function previewQuote() {
    if (missing) {
      alert("Name, ZIP, and Price required.");
      return;
    }
    window.open(`/api/quotes/render?${buildQuoteParams().toString()}`, "_blank");
  }

  function downloadHTML() {
    if (missing) {
      alert("Name, ZIP, and Price required.");
      return;
    }
    window.open(`/api/quotes/download?${buildQuoteParams().toString()}`, "_blank");
  }

  function downloadPDF() {
    if (missing) {
      alert("Name, ZIP, and Price required.");
      return;
    }
    window.open(`/api/quotes/export?format=pdf&${buildQuoteParams().toString()}`, "_blank");
  }

  function downloadPNG() {
    if (missing) {
      alert("Name, ZIP, and Price required.");
      return;
    }
    window.open(`/api/quotes/export?format=png&${buildQuoteParams().toString()}`, "_blank");
  }

  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Finance vs RTO Comparison</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Customer: {name || "—"} | ZIP: {zip || "—"} | Price: ${price.toLocaleString() || "—"}
          </p>
        </div>
      </div>

      {/* ZIP Accuracy Warning */}
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <p className="text-red-800 font-semibold">
                ZIP must be accurate—payments change by tax.
              </p>
              <p className="text-red-700 text-sm mt-1">
                Confirm ZIP code before generating quotes to ensure accurate payment calculations.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Finance Presets */}
      <Card>
        <CardHeader>
          <CardTitle>Finance Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Label>Down Payment Presets</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {financeDowns.map((v) => (
                <Card key={v} className="border-2">
                  <CardContent className="p-4 text-center">
                    <div className="text-lg font-semibold">${v.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">Down Payment</div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Standard finance down payment options: $0, $1,000, $2,000, $3,000
            </p>
          </div>
        </CardContent>
      </Card>

      {/* RTO Options */}
      <Card>
        <CardHeader>
          <CardTitle>Rent-to-Own (RTO) Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="rto-down">RTO Down Payment</Label>
              <Input
                id="rto-down"
                type="number"
                className="w-full md:w-64"
                value={rtoDown}
                onChange={(e) => setRtoDown(Number(e.target.value) || 0)}
                min={0}
                step={50}
              />
              <p className="text-xs text-muted-foreground">
                Default: $950 (editable). Adjust based on customer needs.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle>Export Quote</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Generate professional quotes with customer information and payment options.
              Choose from multiple export formats below.
            </p>

            {/* Export Buttons Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button
                onClick={previewQuote}
                disabled={missing}
                variant="outline"
                className="gap-2"
                size="lg"
              >
                <FileDown className="w-4 h-4" />
                Preview Quote (Browser)
              </Button>

              <Button
                onClick={downloadHTML}
                disabled={missing}
                variant="outline"
                className="gap-2"
                size="lg"
              >
                <FileDown className="w-4 h-4" />
                Download HTML
              </Button>

              <Button
                onClick={downloadPDF}
                disabled={missing}
                className="gap-2"
                size="lg"
              >
                <FileDown className="w-4 h-4" />
                Download PDF
              </Button>

              <Button
                onClick={downloadPNG}
                disabled={missing}
                variant="secondary"
                className="gap-2"
                size="lg"
              >
                <FileDown className="w-4 h-4" />
                Download PNG
              </Button>
            </div>

            {missing && (
              <p className="text-sm text-red-600 font-medium">
                ⚠️ Name, ZIP, and Price are required to export a quote.
              </p>
            )}

            {/* Export Info */}
            <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
              <p><strong>Preview:</strong> Opens quote in new tab for review</p>
              <p><strong>HTML:</strong> Downloads editable HTML file</p>
              <p><strong>PDF:</strong> Pixel-perfect PDF export (recommended for printing)</p>
              <p><strong>PNG:</strong> High-quality image export (for sharing)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Notice */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="space-y-2">
            <h3 className="font-semibold text-blue-900">Privacy & Security</h3>
            <p className="text-sm text-blue-800">
              Only the following customer information is used: Name, Phone, Email, ZIP, and Price.
              No DOB or SSN is collected or stored in this system.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
