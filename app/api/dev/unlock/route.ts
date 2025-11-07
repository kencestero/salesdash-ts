import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Disabled in production" }, { status: 403 });
    }

    // Verify secret
    const secret = req.nextUrl.searchParams.get("secret") || "";
    if (!process.env.DEV_UNLOCK_SECRET || secret !== process.env.DEV_UNLOCK_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get email from query params
    const email = (req.nextUrl.searchParams.get("email") || "").trim().toLowerCase();
    if (!email) {
      return NextResponse.json({ error: "Missing email parameter" }, { status: 400 });
    }

    // Ensure User exists & is verified
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Create new user if doesn't exist
      user = await prisma.user.create({
        data: {
          email,
          emailVerified: new Date(),
          name: "Ken C"
        }
      });
    } else if (!user.emailVerified) {
      // Verify existing user
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() }
      });
    }

    // Ensure UserProfile exists with owner role + repCode
    const profile = await prisma.userProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        firstName: "Ken",
        lastName: "C",
        role: "owner",
        accountStatus: "active",
        isActive: true,
        repCode: `OWNER-${user.id.slice(0, 6)}`,
        canAccessCRM: true,
        canAccessInventory: true,
        canAccessConfigurator: true,
        canAccessCalendar: true,
        canAccessReports: true,
        canManageUsers: true,
      },
      update: {
        role: "owner",
        accountStatus: "active",
        isActive: true,
        canAccessCRM: true,
        canAccessInventory: true,
        canAccessConfigurator: true,
        canAccessCalendar: true,
        canAccessReports: true,
        canManageUsers: true,
      },
      include: { user: true }
    });

    return NextResponse.json({
      ok: true,
      userId: user.id,
      email,
      role: profile.role,
      repCode: profile.repCode,
      message: "✅ Owner profile created/updated. You can now sign in!"
    });

  } catch (err: any) {
    console.error("Dev unlock error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal error" },
      { status: 500 }
    );
  }
}
