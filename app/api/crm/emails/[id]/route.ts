import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/crm/emails/[id] - Fetch single email by ID
export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    const email = await prisma.email.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            companyName: true,
          },
        },
      },
    });

    if (!email) {
      return NextResponse.json({ error: "Email not found" }, { status: 404 });
    }

    return NextResponse.json({ email });
  } catch (error: any) {
    console.error("Error fetching email:", error);
    return NextResponse.json(
      { error: "Failed to fetch email", details: error.message },
      { status: 500 }
    );
  }
}
