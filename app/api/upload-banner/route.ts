import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const MAX_BANNER_SIZE = 3 * 1024 * 1024; // 3MB

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 400 }
      );
    }

    // Validate file size (max 3MB)
    if (file.size > MAX_BANNER_SIZE) {
      return NextResponse.json(
        { error: "File size must be less than 3MB" },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "banners");
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileExtension = file.name.split(".").pop() || "jpg";
    const fileName = `${session.user.id}-${Date.now()}.${fileExtension}`;
    const filePath = path.join(uploadsDir, fileName);

    // Write file to disk
    await writeFile(filePath, buffer);

    // Return public URL
    const publicUrl = `/uploads/banners/${fileName}`;

    return NextResponse.json({
      url: publicUrl,
      message: "Banner uploaded successfully",
    });
  } catch (error) {
    console.error("Banner upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload banner" },
      { status: 500 }
    );
  }
}
