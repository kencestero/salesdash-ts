import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Helper to replace optional tokens (blank if not provided)
 */
function replaceOptional(html: string, token: string, value?: string | null): string {
  return html.replace(new RegExp(token, "g"), value ?? "");
}

/**
 * Quote Renderer API
 *
 * Renders the quote-luxury.html template with customer/quote data
 *
 * Query params:
 * - name (required)
 * - zip (required)
 * - price (required)
 * - phone (optional)
 * - email (optional)
 * - rep (optional, defaults to "MJ Sales Rep")
 * - financeTableHtml (optional)
 * - rtoTableHtml (optional)
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);

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

    // Replace optional table slots (blank if not supplied)
    html = replaceOptional(
      html,
      "{{FINANCE_TABLE_HTML}}",
      url.searchParams.get("financeTableHtml")
    );
    html = replaceOptional(
      html,
      "{{RTO_TABLE_HTML}}",
      url.searchParams.get("rtoTableHtml")
    );

    // Return rendered HTML
    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Quote render error:", error);
    return NextResponse.json(
      { error: "Failed to render quote template" },
      { status: 500 }
    );
  }
}
