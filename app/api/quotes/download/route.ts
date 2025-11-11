import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import { requireRole } from "@/lib/authz";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Helper to replace optional tokens (blank if not provided)
 */
function replaceOptional(html: string, token: string, value?: string | null): string {
  return html.replace(new RegExp(token, "g"), value ?? "");
}

/**
 * Quote HTML Download API
 *
 * Returns filled HTML template as downloadable file
 *
 * Query params:
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

    // Return HTML as downloadable file
    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `attachment; filename="Quote-${quoteNumber}.html"`,
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Quote download error:", error);
    return NextResponse.json(
      { error: "Failed to generate quote download" },
      { status: 500 }
    );
  }
}
