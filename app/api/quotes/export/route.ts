import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const maxDuration = 60; // Allow up to 60 seconds for PDF/PNG generation

/**
 * Helper to replace optional tokens (blank if not provided)
 */
function replaceOptional(html: string, token: string, value?: string | null): string {
  return html.replace(new RegExp(token, "g"), value ?? "");
}

/**
 * Quote Export API (PDF/PNG)
 *
 * Renders quote template as pixel-perfect PDF or PNG using Puppeteer
 *
 * Query params:
 * - format (required): "pdf" or "png"
 * - name (required)
 * - zip (required)
 * - price (required)
 * - phone (optional)
 * - email (optional)
 * - rep (optional, defaults to "MJ Sales Rep")
 * - unitInfo (optional)
 * - paymentTablesHtml (optional)
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);

    // Extract format parameter
    const format = url.searchParams.get("format");
    if (!format || !["pdf", "png"].includes(format)) {
      return NextResponse.json(
        { error: "Invalid format. Must be 'pdf' or 'png'" },
        { status: 400 }
      );
    }

    // Extract query params
    const name = (url.searchParams.get("name") ?? "").trim();
    const zip = (url.searchParams.get("zip") ?? "").trim();
    const priceParam = url.searchParams.get("price");
    const price = priceParam ? Number(priceParam) : 0;
    const phone = (url.searchParams.get("phone") ?? "").trim();
    const email = (url.searchParams.get("email") ?? "").trim();
    const rep = (url.searchParams.get("rep") ?? "MJ Sales Rep").trim();

    // Validation
    if (!name || !zip || !price) {
      return NextResponse.json(
        { error: "Missing required parameters: name, zip, and price" },
        { status: 400 }
      );
    }

    // Generate quote number
    const quoteNumber = crypto.randomUUID().slice(0, 8).toUpperCase();

    // Load template
    const templatePath = path.join(process.cwd(), "templates", "quote-luxury.html");
    let html = await fs.readFile(templatePath, "utf8");

    // Format price with commas (no currency symbol - template controls styling)
    const priceStr = Number.isFinite(price) ? price.toLocaleString("en-US") : "";

    // Replace required tokens
    html = html
      .replace(/{{CUSTOMER_NAME}}/g, name)
      .replace(/{{CUSTOMER_PHONE}}/g, phone)
      .replace(/{{CUSTOMER_EMAIL}}/g, email)
      .replace(/{{ZIP}}/g, zip)
      .replace(/{{SELLING_PRICE}}/g, priceStr)
      .replace(/{{QUOTE_DATE}}/g, new Date().toLocaleDateString("en-US"))
      .replace(/{{REP_NAME}}/g, rep)
      .replace(/{{QUOTE_NUMBER}}/g, quoteNumber);

    // Replace optional unit info (blank if not supplied)
    html = replaceOptional(
      html,
      "{{UNIT_INFO}}",
      url.searchParams.get("unitInfo")
    );

    // Replace payment tables HTML (filled by dashboard)
    html = replaceOptional(
      html,
      "{{PAYMENT_TABLES_HTML}}",
      url.searchParams.get("paymentTablesHtml")
    );

    // Launch Puppeteer with Chromium
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();

    // Set content and wait for network idle
    await page.setContent(html, {
      waitUntil: "networkidle0",
    });

    let output: Buffer;
    let contentType: string;
    let filename: string;

    if (format === "pdf") {
      // Generate PDF with print-optimized settings
      output = await page.pdf({
        format: "Letter",
        printBackground: true,
        margin: {
          top: "0.5in",
          right: "0.5in",
          bottom: "0.5in",
          left: "0.5in",
        },
      });
      contentType = "application/pdf";
      filename = `Quote-${quoteNumber}.pdf`;
    } else {
      // Generate PNG screenshot
      output = await page.screenshot({
        fullPage: true,
        type: "png",
      });
      contentType = "image/png";
      filename = `Quote-${quoteNumber}.png`;
    }

    await browser.close();

    // Return file as download
    return new NextResponse(output, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Quote export error:", error);
    return NextResponse.json(
      { error: "Failed to export quote", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
