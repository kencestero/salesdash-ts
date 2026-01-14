/**
 * W-9 PDF Generation and Google Drive Upload API
 *
 * This endpoint:
 * 1. Validates the onboarding entry token
 * 2. Generates a filled W-9 PDF using pdf-lib
 * 3. Embeds the signature
 * 4. Uploads to Google Drive
 * 5. Creates signup code for account creation
 *
 * SSN is only used to fill the PDF and is never stored in the database.
 */

import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { prisma } from "@/lib/prisma";
import { uploadToGoogleDrive } from "@/lib/google-drive";

// Character set for signup codes (no ambiguous chars like 0/O, 1/I/L)
const SIGNUP_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateSignupCode(): string {
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += SIGNUP_CODE_CHARS[Math.floor(Math.random() * SIGNUP_CODE_CHARS.length)];
  }
  return code;
}

async function generateUniqueSignupCode(): Promise<string> {
  for (let attempts = 0; attempts < 10; attempts++) {
    const code = generateSignupCode();
    const existing = await prisma.signupCode.findUnique({
      where: { code },
    });
    if (!existing) {
      return code;
    }
  }
  throw new Error("Failed to generate unique signup code");
}

interface W9FormData {
  entryToken: string;
  name: string;
  businessName?: string;
  taxClassification: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  ssn: string; // 9 digits only
  signature: string; // Base64 data URL
}

export async function POST(req: NextRequest) {
  try {
    const body: W9FormData = await req.json();

    // Validate required fields
    if (!body.entryToken || !body.name || !body.address || !body.city ||
        !body.state || !body.zip || !body.ssn || !body.signature) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate SSN format (9 digits)
    const ssnDigits = body.ssn.replace(/\D/g, "");
    if (ssnDigits.length !== 9) {
      return NextResponse.json(
        { success: false, error: "Invalid SSN format" },
        { status: 400 }
      );
    }

    // Validate entry token
    const onboardingToken = await prisma.onboardingToken.findUnique({
      where: { token: body.entryToken },
      include: { signupCode: true },
    });

    if (!onboardingToken) {
      return NextResponse.json(
        { success: false, error: "Invalid onboarding token" },
        { status: 404 }
      );
    }

    if (onboardingToken.used) {
      return NextResponse.json(
        { success: false, error: "This onboarding link has already been used" },
        { status: 410 }
      );
    }

    if (new Date() > onboardingToken.expiresAt) {
      return NextResponse.json(
        { success: false, error: "This onboarding link has expired" },
        { status: 410 }
      );
    }

    // If signup code already exists, return it
    if (onboardingToken.signupCode) {
      return NextResponse.json({
        success: true,
        signupCode: onboardingToken.signupCode.code,
        expiresAt: onboardingToken.signupCode.expiresAt.toISOString(),
        message: "W-9 already submitted",
      });
    }

    // Generate W-9 PDF
    const pdfBytes = await generateW9PDF(body);

    // Parse name for filename (extract first and last name)
    const nameParts = body.name.trim().split(/\s+/);
    const firstName = nameParts[0] || "UNKNOWN";
    const lastName = nameParts[nameParts.length - 1] || "UNKNOWN";

    // Generate filename: W9_LASTNAME_FIRSTNAME_PHONE_YYYY-MM-DD.pdf
    const date = new Date().toISOString().split("T")[0];
    const cleanLast = lastName.toUpperCase().replace(/[^A-Z]/g, "");
    const cleanFirst = firstName.toUpperCase().replace(/[^A-Z]/g, "");
    const fileName = `W9_${cleanLast}_${cleanFirst}_${date}.pdf`;

    // Upload to Google Drive
    const uploadResult = await uploadToGoogleDrive({
      fileName,
      mimeType: "application/pdf",
      fileBuffer: Buffer.from(pdfBytes),
      docType: "W9",
      userLastName: lastName,
      userFirstName: firstName,
    });

    if (!uploadResult.success) {
      console.error("Google Drive upload failed:", uploadResult.error);
      return NextResponse.json(
        { success: false, error: `Failed to upload W-9: ${uploadResult.error}` },
        { status: 500 }
      );
    }

    // Generate unique signup code
    const signupCode = await generateUniqueSignupCode();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create signup code record
    await prisma.signupCode.create({
      data: {
        code: signupCode,
        expiresAt,
        onboardingTokenId: onboardingToken.id,
        firstName,
        lastName,
        w9Url: uploadResult.webViewLink || undefined,
        w9DriveFileId: uploadResult.fileId || undefined,
        // Note: Address info stored later during actual signup
      },
    });

    // Return success with signup code
    return NextResponse.json({
      success: true,
      signupCode,
      expiresAt: expiresAt.toISOString(),
      message: "W-9 submitted successfully",
    });
  } catch (error) {
    console.error("W-9 generation error:", error);
    return NextResponse.json(
      { success: false, error: "An error occurred processing your W-9" },
      { status: 500 }
    );
  }
}

/**
 * Generate a W-9 PDF with the provided form data
 */
async function generateW9PDF(data: W9FormData): Promise<Uint8Array> {
  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]); // US Letter size

  // Get fonts
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const { width, height } = page.getSize();
  const margin = 50;
  let y = height - margin;

  // Colors
  const black = rgb(0, 0, 0);
  const gray = rgb(0.4, 0.4, 0.4);

  // Header
  page.drawText("Form W-9", {
    x: margin,
    y,
    size: 24,
    font: helveticaBold,
    color: black,
  });
  y -= 20;

  page.drawText("(Rev. October 2018)", {
    x: margin,
    y,
    size: 10,
    font: helvetica,
    color: gray,
  });

  page.drawText("Request for Taxpayer Identification Number and Certification", {
    x: margin + 150,
    y: y + 10,
    size: 12,
    font: helveticaBold,
    color: black,
  });
  y -= 15;

  page.drawText("Department of the Treasury - Internal Revenue Service", {
    x: margin + 150,
    y,
    size: 10,
    font: helvetica,
    color: gray,
  });
  y -= 30;

  // Divider line
  page.drawLine({
    start: { x: margin, y },
    end: { x: width - margin, y },
    thickness: 1,
    color: black,
  });
  y -= 25;

  // Name field
  page.drawText("1. Name (as shown on your income tax return)", {
    x: margin,
    y,
    size: 10,
    font: helveticaBold,
    color: black,
  });
  y -= 15;
  page.drawText(data.name, {
    x: margin + 10,
    y,
    size: 12,
    font: helvetica,
    color: black,
  });
  y -= 25;

  // Business name field (if provided)
  page.drawText("2. Business name/disregarded entity name (if different from above)", {
    x: margin,
    y,
    size: 10,
    font: helveticaBold,
    color: black,
  });
  y -= 15;
  if (data.businessName) {
    page.drawText(data.businessName, {
      x: margin + 10,
      y,
      size: 12,
      font: helvetica,
      color: black,
    });
  }
  y -= 25;

  // Tax classification
  page.drawText("3. Federal tax classification:", {
    x: margin,
    y,
    size: 10,
    font: helveticaBold,
    color: black,
  });
  y -= 15;

  const classificationMap: Record<string, string> = {
    "individual": "Individual/sole proprietor or single-member LLC",
    "c-corp": "C Corporation",
    "s-corp": "S Corporation",
    "partnership": "Partnership",
    "trust": "Trust/estate",
    "llc-C": "LLC (C Corporation)",
    "llc-S": "LLC (S Corporation)",
    "llc-P": "LLC (Partnership)",
  };

  const classificationText = classificationMap[data.taxClassification] || data.taxClassification;
  page.drawText(`[X] ${classificationText}`, {
    x: margin + 10,
    y,
    size: 11,
    font: helvetica,
    color: black,
  });
  y -= 30;

  // Address
  page.drawText("5. Address (number, street, and apt. or suite no.)", {
    x: margin,
    y,
    size: 10,
    font: helveticaBold,
    color: black,
  });
  y -= 15;
  page.drawText(data.address, {
    x: margin + 10,
    y,
    size: 12,
    font: helvetica,
    color: black,
  });
  y -= 25;

  // City, State, ZIP
  page.drawText("6. City, state, and ZIP code", {
    x: margin,
    y,
    size: 10,
    font: helveticaBold,
    color: black,
  });
  y -= 15;
  page.drawText(`${data.city}, ${data.state} ${data.zip}`, {
    x: margin + 10,
    y,
    size: 12,
    font: helvetica,
    color: black,
  });
  y -= 40;

  // Part I - TIN
  page.drawLine({
    start: { x: margin, y },
    end: { x: width - margin, y },
    thickness: 1,
    color: black,
  });
  y -= 20;

  page.drawText("Part I - Taxpayer Identification Number (TIN)", {
    x: margin,
    y,
    size: 12,
    font: helveticaBold,
    color: black,
  });
  y -= 20;

  page.drawText("Social Security Number (SSN):", {
    x: margin,
    y,
    size: 10,
    font: helvetica,
    color: black,
  });

  // Format SSN for display
  const ssnFormatted = `${data.ssn.slice(0, 3)}-${data.ssn.slice(3, 5)}-${data.ssn.slice(5, 9)}`;
  page.drawText(ssnFormatted, {
    x: margin + 180,
    y,
    size: 12,
    font: helveticaBold,
    color: black,
  });
  y -= 40;

  // Part II - Certification
  page.drawLine({
    start: { x: margin, y },
    end: { x: width - margin, y },
    thickness: 1,
    color: black,
  });
  y -= 20;

  page.drawText("Part II - Certification", {
    x: margin,
    y,
    size: 12,
    font: helveticaBold,
    color: black,
  });
  y -= 20;

  const certText = "Under penalties of perjury, I certify that the information provided on this form is correct.";
  page.drawText(certText, {
    x: margin,
    y,
    size: 9,
    font: helvetica,
    color: black,
    maxWidth: width - margin * 2,
  });
  y -= 50;

  // Signature section
  page.drawText("Signature:", {
    x: margin,
    y,
    size: 10,
    font: helveticaBold,
    color: black,
  });

  // Embed signature image
  if (data.signature && data.signature.startsWith("data:image")) {
    try {
      const signatureBase64 = data.signature.split(",")[1];
      const signatureBytes = Buffer.from(signatureBase64, "base64");

      // Embed as PNG (signature canvas outputs PNG)
      const signatureImage = await pdfDoc.embedPng(signatureBytes);

      // Scale signature to fit
      const sigWidth = 200;
      const sigHeight = (signatureImage.height / signatureImage.width) * sigWidth;

      page.drawImage(signatureImage, {
        x: margin + 70,
        y: y - sigHeight + 10,
        width: sigWidth,
        height: Math.min(sigHeight, 60),
      });
    } catch (sigError) {
      console.error("Failed to embed signature:", sigError);
      // Continue without signature image - will show signature line only
    }
  }

  // Date
  const signDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  page.drawText(`Date: ${signDate}`, {
    x: width - margin - 150,
    y,
    size: 10,
    font: helvetica,
    color: black,
  });

  // Generate PDF bytes
  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}
