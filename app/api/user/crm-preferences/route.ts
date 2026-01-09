import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// CRM Preferences structure
export interface CRMPreferences {
  // Default CRM View
  defaultViewId: string | null;

  // Default Sorting
  defaultSort: "newest" | "oldest" | "priority" | "lastActivity";

  // Follow-up defaults
  followUpDays: number; // Default days for next follow-up (1, 2, 3, 5, 7)
  overdueReminders: boolean; // Toggle for overdue follow-up reminders

  // Email signature
  emailSignature: string; // HTML/text signature for outbound CRM emails
  fromNameFormat: "name" | "nameCompany"; // "{Name}" or "{Name} (Remotive Logistics)"
}

const DEFAULT_CRM_PREFERENCES: CRMPreferences = {
  defaultViewId: null,
  defaultSort: "newest",
  followUpDays: 2,
  overdueReminders: true,
  emailSignature: "",
  fromNameFormat: "nameCompany",
};

// GET /api/user/crm-preferences - Get current user's CRM preferences
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { profile: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Return preferences or defaults
    const preferences = user.profile?.crmPreferences as CRMPreferences | null;

    return NextResponse.json({
      preferences: preferences || DEFAULT_CRM_PREFERENCES,
    });
  } catch (error) {
    console.error("Error fetching CRM preferences:", error);
    return NextResponse.json(
      { error: "Failed to fetch preferences" },
      { status: 500 }
    );
  }
}

// PATCH /api/user/crm-preferences - Update CRM preferences
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { profile: true },
    });

    if (!user || !user.profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get existing preferences or defaults
    const existingPreferences = (user.profile.crmPreferences as CRMPreferences | null) || DEFAULT_CRM_PREFERENCES;

    // Validate and merge updates
    const updatedPreferences: CRMPreferences = {
      defaultViewId: body.defaultViewId !== undefined ? body.defaultViewId : existingPreferences.defaultViewId,
      defaultSort: body.defaultSort !== undefined ? body.defaultSort : existingPreferences.defaultSort,
      followUpDays: body.followUpDays !== undefined ? Number(body.followUpDays) : existingPreferences.followUpDays,
      overdueReminders: body.overdueReminders !== undefined ? body.overdueReminders : existingPreferences.overdueReminders,
      emailSignature: body.emailSignature !== undefined ? body.emailSignature : existingPreferences.emailSignature,
      fromNameFormat: body.fromNameFormat !== undefined ? body.fromNameFormat : existingPreferences.fromNameFormat,
    };

    // Validate followUpDays
    if (![1, 2, 3, 5, 7, 14].includes(updatedPreferences.followUpDays)) {
      updatedPreferences.followUpDays = 2; // Default to 2 days
    }

    // Validate defaultSort
    if (!["newest", "oldest", "priority", "lastActivity"].includes(updatedPreferences.defaultSort)) {
      updatedPreferences.defaultSort = "newest";
    }

    // Validate fromNameFormat
    if (!["name", "nameCompany"].includes(updatedPreferences.fromNameFormat)) {
      updatedPreferences.fromNameFormat = "nameCompany";
    }

    // Update profile
    await prisma.userProfile.update({
      where: { userId: user.id },
      data: {
        crmPreferences: updatedPreferences as any,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      preferences: updatedPreferences,
    });
  } catch (error) {
    console.error("Error updating CRM preferences:", error);
    return NextResponse.json(
      { error: "Failed to update preferences" },
      { status: 500 }
    );
  }
}
