"use client";

import { useState } from "react";
import { generateQuote, type QuoteData, type ExportFormat } from "@/lib/finance/pdf-generator-v2";
import { Button } from "@/components/ui/button";

/**
 * Test page for PDF Generator V2
 * Uses Ken's exact sample data from the provided PDF
 */
export default function TestPDFPage() {
  const [format, setFormat] = useState<ExportFormat>("pdf");
  const [generating, setGenerating] = useState(false);

  // Ken's sample data from MJ_Quote_Ken_Cestero_1760479957254.pdf
  const sampleData: QuoteData = {
    // Customer Info
    customerName: "Ken Cestero",
    customerPhone: "8888888888",
    customerEmail: "kencestero@gmail.com",

    // Rep Info
    repId: "REP12345",
    repName: "Ken Cestero",
    repEmail: "kencestero@gmail.com",

    // Unit Info
    unitDescription: "2025 Diamond Cargo 8.5X24TA4 (DC-115780)",
    unitPrice: 7883,
    taxPercent: 6.00,
    fees: 125,

    // Selected payment options
    selectedOptions: [
      {
        mode: "FINANCE",
        label: "Finance Option",
        amount: 176.01,
        term: 60,
        down: 1000,
        details: "APR 8.99%",
      },
      {
        mode: "RTO",
        label: "Rent-To-Own",
        amount: 446.49,
        term: 48,
        down: 0,
      },
      {
        mode: "CASH",
        label: "Cash Payment",
        amount: 8480.98,
      },
    ],

    // Timestamp
    quoteDate: new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }),
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await generateQuote(sampleData, format);
    } catch (error) {
      console.error("Error generating quote:", error);
      alert("Error generating quote. Check console for details.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold">PDF Generator V2 Test</h1>
          <p className="text-muted-foreground mt-2">
            Testing with Ken's sample data from MJ_Quote_Ken_Cestero_1760479957254.pdf
          </p>
        </div>

        {/* Sample Data Display */}
        <div className="bg-card border rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold">Sample Data</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium">Customer:</p>
              <p>{sampleData.customerName}</p>
              <p>{sampleData.customerPhone}</p>
              <p>{sampleData.customerEmail}</p>
            </div>
            <div>
              <p className="font-medium">Unit:</p>
              <p>{sampleData.unitDescription}</p>
              <p>Price: ${sampleData.unitPrice.toLocaleString()}</p>
              <p>Tax: {sampleData.taxPercent}%</p>
              <p>Fees: ${sampleData.fees}</p>
            </div>
          </div>
          <div className="space-y-2">
            <p className="font-medium">Payment Options:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Finance: ${sampleData.selectedOptions[0].amount}/mo × {sampleData.selectedOptions[0].term} months (APR 8.99%)</li>
              <li>RTO: ${sampleData.selectedOptions[1].amount}/mo × {sampleData.selectedOptions[1].term} months</li>
              <li>Cash: ${sampleData.selectedOptions[2].amount.toLocaleString()}</li>
            </ul>
          </div>
        </div>

        {/* Export Format Selector */}
        <div className="bg-card border rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold">Export Format</h2>
          <div className="flex gap-4">
            <button
              onClick={() => setFormat("pdf")}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                format === "pdf"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
              }`}
            >
              📄 PDF
            </button>
            <button
              onClick={() => setFormat("jpeg")}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                format === "jpeg"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
              }`}
            >
              🖼️ JPEG
            </button>
            <button
              onClick={() => setFormat("png")}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                format === "png"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
              }`}
            >
              🎨 PNG
            </button>
          </div>
        </div>

        {/* Generate Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleGenerate}
            disabled={generating}
            size="lg"
            className="px-12 py-6 text-lg"
          >
            {generating ? "Generating..." : `Generate ${format.toUpperCase()}`}
          </Button>
        </div>

        {/* Instructions */}
        <div className="bg-muted/50 border rounded-lg p-6 space-y-2 text-sm">
          <p className="font-medium">Test Instructions:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Select export format (PDF, JPEG, or PNG)</li>
            <li>Click "Generate" button</li>
            <li>Check if file downloads successfully</li>
            <li>Open the file and compare against Ken's sample PDF</li>
            <li>Verify design matches exactly</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
