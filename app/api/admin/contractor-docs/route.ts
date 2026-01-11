import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { guardPayplanAccess } from "@/lib/payplan-guard";

export const dynamic = "force-dynamic";

// GET /api/admin/contractor-docs - List all contractor documents (admin only)
export async function GET(req: NextRequest) {
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

    // Check payplan access
    const guardResponse = await guardPayplanAccess(currentUser.id);
    if (guardResponse) return guardResponse;

    // Check admin permissions (owner, director, or canAdminCRM)
    const role = currentUser.profile.role || "salesperson";
    const isAdmin = ["owner", "director"].includes(role) || currentUser.profile.canAdminCRM;

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    // Parse query params
    const { searchParams } = new URL(req.url);
    const docType = searchParams.get("docType");
    const userId = searchParams.get("userId");

    // Build where clause
    const where: Record<string, unknown> = {};
    if (docType) where.docType = docType;
    if (userId) where.userId = userId;

    // Fetch all documents with user info
    const documents = await prisma.contractorDocument.findMany({
      where,
      orderBy: { uploadedAt: "desc" },
      include: {
        user: {
          include: {
            profile: {
              select: {
                firstName: true,
                lastName: true,
                repCode: true,
              },
            },
          },
        },
      },
    });

    // Format response - include driveUrl for admins
    const formattedDocs = documents.map((doc) => ({
      id: doc.id,
      userId: doc.userId,
      docType: doc.docType,
      fileName: doc.fileName,
      uploadedAt: doc.uploadedAt,
      fileSize: doc.fileSize,
      mimeType: doc.mimeType,
      driveFileId: doc.driveFileId,
      driveUrl: doc.driveUrl, // Admins can see this
      user: {
        id: doc.user.id,
        name: doc.user.name,
        email: doc.user.email,
        firstName: doc.user.profile?.firstName,
        lastName: doc.user.profile?.lastName,
        repCode: doc.user.profile?.repCode,
      },
    }));

    // Get summary stats
    const stats = {
      total: documents.length,
      byType: {
        W9: documents.filter((d) => d.docType === "W9").length,
        CONTRACTOR_AGREEMENT: documents.filter((d) => d.docType === "CONTRACTOR_AGREEMENT").length,
      },
    };

    return NextResponse.json({
      documents: formattedDocs,
      stats,
    });
  } catch (error) {
    console.error("Error fetching admin contractor documents:", error);
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}
