import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadToGoogleDrive } from "@/lib/google-drive";

// File validation constants
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
];
const VALID_DOC_TYPES = ["W9", "CONTRACTOR_AGREEMENT"];

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { profile: true },
    });

    if (!currentUser || !currentUser.profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Note: This endpoint bypasses payplan check (allowed in middleware)
    // because reps might need to upload docs before full access

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const docType = formData.get("docType") as string;

    // Validate doc type
    if (!docType || !VALID_DOC_TYPES.includes(docType)) {
      return NextResponse.json(
        { error: "Invalid document type. Must be W9 or CONTRACTOR_AGREEMENT" },
        { status: 400 }
      );
    }

    // Validate file exists
    if (!file || !(file instanceof File) || file.size === 0) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only PDF, JPEG, and PNG allowed" },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum 10MB allowed" },
        { status: 400 }
      );
    }

    // Get user name for file naming
    const firstName = currentUser.profile.firstName || currentUser.name?.split(" ")[0] || "Unknown";
    const lastName = currentUser.profile.lastName || currentUser.name?.split(" ").slice(-1)[0] || "User";

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to Google Drive
    const uploadResult = await uploadToGoogleDrive({
      fileName: file.name,
      mimeType: file.type,
      fileBuffer: buffer,
      docType,
      userFirstName: firstName,
      userLastName: lastName,
    });

    if (!uploadResult.success) {
      console.error("Google Drive upload failed:", uploadResult.error);
      return NextResponse.json(
        { error: "Failed to upload document. Please try again." },
        { status: 500 }
      );
    }

    // Check if user already has this doc type uploaded
    const existingDoc = await prisma.contractorDocument.findFirst({
      where: {
        userId: currentUser.id,
        docType,
      },
    });

    // Create or update database record
    let document;
    if (existingDoc) {
      // Update existing record
      document = await prisma.contractorDocument.update({
        where: { id: existingDoc.id },
        data: {
          fileName: file.name,
          driveFileId: uploadResult.fileId || null,
          driveUrl: uploadResult.webViewLink || null,
          uploadedAt: new Date(),
          fileSize: file.size,
          mimeType: file.type,
        },
      });
    } else {
      // Create new record
      document = await prisma.contractorDocument.create({
        data: {
          userId: currentUser.id,
          docType,
          fileName: file.name,
          driveFileId: uploadResult.fileId || null,
          driveUrl: uploadResult.webViewLink || null,
          fileSize: file.size,
          mimeType: file.type,
        },
      });
    }

    // Get IP and user agent for audit log
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: currentUser.id,
        userEmail: currentUser.email || "",
        userName: `${firstName} ${lastName}`,
        action: "CONTRACTOR_DOC_UPLOADED",
        entityType: "ContractorDocument",
        entityId: document.id,
        newValue: {
          docType,
          fileName: file.name,
          driveFileId: uploadResult.fileId,
          fileSize: file.size,
        },
        ipAddress: ip,
        userAgent,
      },
    });

    // Return success - DO NOT return driveUrl to client (security)
    return NextResponse.json({
      success: true,
      documentId: document.id,
      docType: document.docType,
      fileName: document.fileName,
      uploadedAt: document.uploadedAt,
      fileSize: document.fileSize,
    });
  } catch (error) {
    console.error("Error uploading contractor document:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
