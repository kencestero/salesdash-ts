import { NextResponse } from "next/server";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { requireRole } from "@/lib/authz";

interface Trailer {
  id: string;
  stockNumber: string;
  manufacturer: string;
  model: string;
  year: number;
  category: string;
  length: number;
  width: number;
  msrp: number;
  salePrice: number;
  features?: string[];
}

export async function POST(req: Request) {
  // Auth guard: requires authenticated user
  try {
    await requireRole(["salesperson", "manager", "owner"]);
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    throw error;
  }

  try {
    const { trailers }: { trailers: Trailer[] } = await req.json();

    if (!trailers || trailers.length === 0) {
      return NextResponse.json(
        { error: "No trailers provided" },
        { status: 400 }
      );
    }

    // Generate PDF
    const pdf = generateInventoryPDF(trailers);

    // Convert PDF to buffer
    const pdfBuffer = Buffer.from(pdf.output("arraybuffer"));

    // Return PDF as downloadable file
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=MJ-Cargo-Inventory-Quote-${new Date().toISOString().split('T')[0]}.pdf`,
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}

function generateInventoryPDF(trailers: Trailer[]): jsPDF {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Colors - MJ Cargo Branding
  const orangeColor: [number, number, number] = [245, 166, 35]; // #f5a623
  const darkBlue: [number, number, number] = [30, 41, 59];
  const lightGray: [number, number, number] = [240, 240, 240];

  // === HEADER SECTION ===
  doc.setFillColor(...orangeColor);
  doc.rect(0, 0, pageWidth, 35, "F");

  // MJ CARGO TRAILERS title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.text("MJ CARGO TRAILERS", pageWidth / 2, 15, { align: "center" });

  // Inventory Quote subtitle
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("INVENTORY QUOTE", pageWidth / 2, 25, { align: "center" });

  // === QUOTE INFO BAR ===
  doc.setFillColor(...lightGray);
  doc.rect(10, 40, pageWidth - 20, 12, "F");

  doc.setTextColor(...darkBlue);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text(
    `Quote Date: ${new Date().toLocaleDateString()}`,
    15,
    47
  );
  doc.text(
    `${trailers.length} Unit(s) Selected`,
    pageWidth / 2,
    47,
    { align: "center" }
  );
  doc.text(
    `Quote #${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    pageWidth - 15,
    47,
    { align: "right" }
  );

  let yPos = 60;

  // === SUMMARY SECTION ===
  doc.setFillColor(...darkBlue);
  doc.rect(10, yPos, pageWidth - 20, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("QUOTE SUMMARY", 15, yPos + 5.5);

  yPos += 12;
  doc.setTextColor(...darkBlue);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  const totalMSRP = trailers.reduce((sum, t) => sum + t.msrp, 0);
  const totalSalePrice = trailers.reduce((sum, t) => sum + t.salePrice, 0);
  const totalSavings = totalMSRP - totalSalePrice;

  doc.text(`Total MSRP: $${totalMSRP.toLocaleString()}`, 15, yPos);
  yPos += 6;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(220, 38, 38); // Red for savings
  doc.text(
    `You Save: $${totalSavings.toLocaleString()} (${((totalSavings / totalMSRP) * 100).toFixed(1)}%)`,
    15,
    yPos
  );
  yPos += 6;
  doc.setTextColor(...darkBlue);
  doc.setFontSize(14);
  doc.text(
    `Total Sale Price: $${totalSalePrice.toLocaleString()}`,
    15,
    yPos
  );

  yPos += 15;

  // === TRAILER DETAILS TABLE ===
  doc.setFillColor(...orangeColor);
  doc.rect(10, yPos, pageWidth - 20, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("TRAILER DETAILS", 15, yPos + 5.5);

  yPos += 12;

  // Create table data
  const tableData = trailers.map((trailer) => [
    trailer.stockNumber,
    `${trailer.year} ${trailer.manufacturer}`,
    trailer.model,
    `${trailer.length}' x ${trailer.width}'`,
    trailer.category,
    `$${trailer.msrp.toLocaleString()}`,
    `$${trailer.salePrice.toLocaleString()}`,
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [
      [
        "Stock #",
        "Year/Make",
        "Model",
        "Size",
        "Category",
        "MSRP",
        "Sale Price",
      ],
    ],
    body: tableData,
    theme: "grid",
    headStyles: {
      fillColor: darkBlue,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: darkBlue,
    },
    alternateRowStyles: {
      fillColor: lightGray,
    },
    margin: { left: 10, right: 10 },
    didDrawPage: (data) => {
      // Add footer to every page
      const footerY = pageHeight - 20;
      doc.setFillColor(...darkBlue);
      doc.rect(0, footerY, pageWidth, 20, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text(
        "MJ Cargo Trailers - Premium Enclosed Cargo Trailers & Equipment Trailers",
        pageWidth / 2,
        footerY + 5,
        { align: "center" }
      );
      doc.text(
        "We offer delivery service, and deliver for free subject to distance from our location.",
        pageWidth / 2,
        footerY + 10,
        { align: "center" }
      );
      doc.text(
        "This quote and prices subject to change without notice.",
        pageWidth / 2,
        footerY + 14,
        { align: "center" }
      );
    },
  });

  // Get the final Y position after the table
  const finalY = (doc as any).lastAutoTable.finalY + 10;

  // Add features section if space allows
  if (finalY < pageHeight - 80) {
    doc.setFillColor(...darkBlue);
    doc.rect(10, finalY, pageWidth - 20, 8, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("FINANCING AVAILABLE", 15, finalY + 5.5);

    doc.setTextColor(...darkBlue);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    let featureY = finalY + 15;
    doc.text("✓ Cash deals available", 15, featureY);
    featureY += 5;
    doc.text("✓ Finance options with competitive rates", 15, featureY);
    featureY += 5;
    doc.text("✓ Rent-to-Own programs available", 15, featureY);
    featureY += 5;
    doc.text("✓ Trade-ins welcome", 15, featureY);
  }

  // === SIGNATURE LINE ===
  const signatureY = pageHeight - 40;
  doc.setFontSize(9);
  doc.setTextColor(...darkBlue);
  doc.text("Customer Signature:", 15, signatureY);
  doc.text("Date:", pageWidth - 60, signatureY);

  // Signature lines
  doc.setLineWidth(0.5);
  doc.setDrawColor(...darkBlue);
  doc.line(15, signatureY + 10, pageWidth / 2, signatureY + 10);
  doc.line(pageWidth - 60, signatureY + 10, pageWidth - 15, signatureY + 10);

  return doc;
}
