import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadToGoogleDrive } from "@/lib/google-drive";
import { nanoid } from "nanoid";

export const dynamic = "force-dynamic";

/**
 * Generate an 8-character uppercase alphanumeric signup code
 */
function generateSignupCode(): string {
  // Use nanoid to generate random string, then convert to uppercase and remove ambiguous chars
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // No I, O, 1, 0 for clarity
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

/**
 * POST /api/onboarding/complete
 * Completes the onboarding flow:
 * 1. Validates entry token
 * 2. Uploads W-9 to Google Drive
 * 3. Marks entry token as used
 * 4. Generates one-time signup code
 */
export async function POST(req: NextRequest) {
  try {
    // Parse multipart form data
    const formData = await req.formData();

    const entryToken = formData.get("entryToken") as string;
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const phone = formData.get("phone") as string;
    const state = formData.get("state") as string;
    const w9File = formData.get("w9File") as File | null;

    // Validate required fields
    if (!entryToken) {
      return NextResponse.json(
        { success: false, error: "Entry token is required" },
        { status: 400 }
      );
    }

    if (!firstName || !lastName) {
      return NextResponse.json(
        { success: false, error: "First name and last name are required" },
        { status: 400 }
      );
    }

    if (!w9File) {
      return NextResponse.json(
        { success: false, error: "W-9 document is required" },
        { status: 400 }
      );
    }

    // Find and validate the token
    const onboardingToken = await prisma.onboardingToken.findUnique({
      where: { token: entryToken },
      include: { signupCode: true },
    });

    if (!onboardingToken) {
      return NextResponse.json(
        { success: false, error: "Invalid entry token" },
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

    // Upload W-9 to Google Drive
    const fileBuffer = Buffer.from(await w9File.arrayBuffer());

    const uploadResult = await uploadToGoogleDrive({
      fileName: w9File.name,
      mimeType: w9File.type || "application/pdf",
      fileBuffer,
      docType: "W9",
      userLastName: lastName,
      userFirstName: firstName,
    });

    if (!uploadResult.success) {
      console.error("W-9 upload failed:", uploadResult.error);
      return NextResponse.json(
        { success: false, error: "Failed to upload W-9 document. Please try again." },
        { status: 500 }
      );
    }

    // Generate signup code
    let signupCodeValue = generateSignupCode();

    // Ensure code is unique (retry if collision)
    let attempts = 0;
    while (attempts < 5) {
      const existing = await prisma.signupCode.findUnique({
        where: { code: signupCodeValue },
      });
      if (!existing) break;
      signupCodeValue = generateSignupCode();
      attempts++;
    }

    // Signup code expires in 24 hours
    const codeExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Transaction: Mark token as used and create signup code
    const result = await prisma.$transaction(async (tx) => {
      // Mark token as used
      await tx.onboardingToken.update({
        where: { id: onboardingToken.id },
        data: {
          used: true,
          usedAt: new Date(),
        },
      });

      // Create signup code with collected data
      const signupCode = await tx.signupCode.create({
        data: {
          code: signupCodeValue,
          expiresAt: codeExpiresAt,
          onboardingTokenId: onboardingToken.id,
          firstName,
          lastName,
          phone: phone || null,
          state: state || null,
          w9Url: uploadResult.webViewLink || null,
          w9DriveFileId: uploadResult.fileId || null,
        },
      });

      return signupCode;
    });

    return NextResponse.json({
      success: true,
      signupCode: result.code,
      expiresAt: result.expiresAt,
      message: "Onboarding complete! Use this code to create your account.",
    });
  } catch (error) {
    console.error("Onboarding completion failed:", error);
    return NextResponse.json(
      { success: false, error: "Failed to complete onboarding" },
      { status: 500 }
    );
  }
}
