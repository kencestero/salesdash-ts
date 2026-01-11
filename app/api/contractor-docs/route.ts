import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/contractor-docs - List current user's uploaded documents
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get user's documents
    const documents = await prisma.contractorDocument.findMany({
      where: { userId: currentUser.id },
      orderBy: { uploadedAt: "desc" },
      select: {
        id: true,
        docType: true,
        fileName: true,
        uploadedAt: true,
        fileSize: true,
        mimeType: true,
        // DO NOT include driveFileId or driveUrl - security
      },
    });

    // Check what docs are required and what's uploaded
    const requiredDocs = ["W9", "CONTRACTOR_AGREEMENT"];
    const uploadedTypes = documents.map((d) => d.docType);

    const status = requiredDocs.map((docType) => ({
      docType,
      label: docType === "W9" ? "W-9 Form" : "Contractor Agreement",
      uploaded: uploadedTypes.includes(docType),
      document: documents.find((d) => d.docType === docType) || null,
    }));

    return NextResponse.json({
      documents,
      status,
      allUploaded: requiredDocs.every((dt) => uploadedTypes.includes(dt)),
    });
  } catch (error) {
    console.error("Error fetching contractor documents:", error);
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}
