import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/help - Get help content for a section
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const section = searchParams.get("section");

    if (!section) {
      // Return all help sections
      const allHelp = await prisma.helpContent.findMany({
        where: { isActive: true },
        select: {
          section: true,
          title: true
        },
        orderBy: { section: "asc" }
      });

      return NextResponse.json({ sections: allHelp });
    }

    // Get specific section
    const help = await prisma.helpContent.findUnique({
      where: { section }
    });

    if (!help || !help.isActive) {
      return NextResponse.json(
        { error: "Help content not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      section: help.section,
      title: help.title,
      content: help.content,
      rules: help.rules,
      videoUrl: help.videoUrl
    });
  } catch (error) {
    console.error("Error fetching help:", error);
    return NextResponse.json(
      { error: "Failed to fetch help content" },
      { status: 500 }
    );
  }
}
