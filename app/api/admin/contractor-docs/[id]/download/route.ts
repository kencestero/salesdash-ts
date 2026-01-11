import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { guardPayplanAccess } from "@/lib/payplan-guard";
import { getFileDownloadUrl } from "@/lib/google-drive";

// GET /api/admin/contractor-docs/[id]/download - Get download URL for document (admin only)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

    // Find the document
    const document = await prisma.contractorDocument.findUnique({
      where: { id },
      include: {
        user: {
          include: {
            profile: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    if (!document.driveFileId) {
      return NextResponse.json(
        { error: "Document file not available in Google Drive" },
        { status: 404 }
      );
    }

    // Get download URL from Google Drive
    const downloadUrl = await getFileDownloadUrl(document.driveFileId);

    if (!downloadUrl) {
      return NextResponse.json(
        { error: "Failed to generate download URL" },
        { status: 500 }
      );
    }

    // Get IP and user agent for audit log
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    // Create audit log for document access
    await prisma.auditLog.create({
      data: {
        userId: currentUser.id,
        userEmail: currentUser.email || "",
        userName: currentUser.profile.firstName
          ? `${currentUser.profile.firstName} ${currentUser.profile.lastName || ""}`
          : currentUser.name || "",
        action: "CONTRACTOR_DOC_ACCESSED",
        entityType: "ContractorDocument",
        entityId: document.id,
        newValue: {
          docType: document.docType,
          documentOwnerId: document.userId,
          documentOwnerName: document.user.profile
            ? `${document.user.profile.firstName} ${document.user.profile.lastName}`
            : document.user.name || "Unknown",
        },
        ipAddress: ip,
        userAgent,
      },
    });

    return NextResponse.json({
      downloadUrl,
      fileName: document.fileName,
      docType: document.docType,
      mimeType: document.mimeType,
    });
  } catch (error) {
    console.error("Error getting document download URL:", error);
    return NextResponse.json(
      { error: "Failed to get download URL" },
      { status: 500 }
    );
  }
}
