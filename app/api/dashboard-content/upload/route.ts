/**
 * Dashboard Media Upload API
 *
 * POST: Upload image/video to Google Drive (Dashboard Media folder)
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { google } from "googleapis";
import { Readable } from "stream";

const DASHBOARD_MEDIA_FOLDER_ID = process.env.GOOGLE_DRIVE_DASHBOARD_FOLDER_ID?.trim();

function getDriveClient() {
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim();
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.trim()?.replace(/\\n/g, "\n");

  if (!serviceAccountEmail || !privateKey) {
    console.error("Missing Google Drive credentials");
    return null;
  }

  const auth = new google.auth.JWT({
    email: serviceAccountEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/drive.file"],
  });

  return google.drive({ version: "v3", auth });
}

// POST: Upload media file
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

    if (!currentUser?.profile || !["owner", "director"].includes(currentUser.profile.role)) {
      return NextResponse.json(
        { error: "Only owners and directors can upload media" },
        { status: 403 }
      );
    }

    if (!DASHBOARD_MEDIA_FOLDER_ID) {
      return NextResponse.json(
        { error: "Dashboard media folder not configured" },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "video/mp4",
      "video/webm",
      "video/quicktime",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: JPEG, PNG, GIF, WebP, MP4, WebM, MOV" },
        { status: 400 }
      );
    }

    // Max file size: 50MB
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 50MB" },
        { status: 400 }
      );
    }

    const drive = getDriveClient();
    if (!drive) {
      return NextResponse.json(
        { error: "Google Drive not configured" },
        { status: 500 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const fileName = `dashboard_${timestamp}_${cleanName}`;

    // Convert file to buffer and stream
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const stream = Readable.from(buffer);

    // Upload to Google Drive
    const response = await drive.files.create({
      requestBody: {
        name: fileName,
        parents: [DASHBOARD_MEDIA_FOLDER_ID],
      },
      media: {
        mimeType: file.type,
        body: stream,
      },
      fields: "id, webViewLink, webContentLink",
      supportsAllDrives: true,
    });

    if (!response.data.id) {
      throw new Error("Upload failed - no file ID returned");
    }

    // Make file publicly accessible
    await drive.permissions.create({
      fileId: response.data.id,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
      supportsAllDrives: true,
    });

    // Get direct link for embedding
    // For images, use the thumbnail link for better embedding
    const isImage = file.type.startsWith("image/");
    let embedUrl: string;

    if (isImage) {
      // Use Google Drive's direct image serving
      embedUrl = `https://drive.google.com/uc?export=view&id=${response.data.id}`;
    } else {
      // For videos, use the preview link
      embedUrl = `https://drive.google.com/file/d/${response.data.id}/preview`;
    }

    return NextResponse.json({
      success: true,
      fileId: response.data.id,
      webViewLink: response.data.webViewLink,
      embedUrl,
      fileName,
      mimeType: file.type,
    });
  } catch (error) {
    console.error("Error uploading media:", error);
    return NextResponse.json(
      { error: "Failed to upload media" },
      { status: 500 }
    );
  }
}
