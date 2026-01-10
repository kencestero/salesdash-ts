import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/goals - Get user's monthly goals
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const targetUserId = searchParams.get("userId");
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        profile: { select: { role: true, managerId: true } }
      }
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const role = currentUser.profile?.role || "salesperson";
    const userId = targetUserId || currentUser.id;

    // Permission check: can view own goals, managers can view their team, directors/owners can view all
    if (targetUserId && targetUserId !== currentUser.id) {
      if (!["owner", "director", "manager"].includes(role)) {
        return NextResponse.json(
          { error: "You can only view your own goals" },
          { status: 403 }
        );
      }

      // Managers can only view their direct reports
      if (role === "manager") {
        const targetProfile = await prisma.userProfile.findUnique({
          where: { userId: targetUserId },
          select: { managerId: true }
        });

        if (targetProfile?.managerId !== currentUser.id) {
          return NextResponse.json(
            { error: "You can only view goals for your team members" },
            { status: 403 }
          );
        }
      }
    }

    const now = new Date();
    const targetMonth = month ? parseInt(month) : now.getMonth() + 1;
    const targetYear = year ? parseInt(year) : now.getFullYear();

    // Get goals for specified period (or current month)
    const goals = await prisma.monthlyGoal.findMany({
      where: {
        userId,
        ...(month && year ? { month: targetMonth, year: targetYear } : {})
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profile: {
              select: { role: true, repCode: true }
            }
          }
        },
        setBy: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: [
        { year: "desc" },
        { month: "desc" }
      ]
    });

    // Get current month goal status
    const currentMonthGoal = goals.find(
      g => g.month === (now.getMonth() + 1) && g.year === now.getFullYear()
    );

    // Check if goal is editable
    const dayOfMonth = now.getDate();
    const isFirstOfMonth = dayOfMonth === 1;
    const canSetGoal = dayOfMonth <= 5 || !currentMonthGoal; // Allow setting until 5th
    const canManagerEdit = dayOfMonth <= 20 && ["owner", "director", "manager"].includes(role);

    return NextResponse.json({
      goals: goals.map(g => ({
        id: g.id,
        month: g.month,
        year: g.year,
        targetUnits: g.targetUnits,
        actualUnits: g.actualUnits,
        progress: g.targetUnits > 0 ? Math.round((g.actualUnits / g.targetUnits) * 100) : 0,
        isLocked: g.isLocked,
        setBy: g.setBy ? { id: g.setBy.id, name: g.setBy.name } : null,
        createdAt: g.createdAt,
        updatedAt: g.updatedAt
      })),
      currentMonth: {
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        goal: currentMonthGoal ? {
          id: currentMonthGoal.id,
          targetUnits: currentMonthGoal.targetUnits,
          actualUnits: currentMonthGoal.actualUnits,
          progress: currentMonthGoal.targetUnits > 0
            ? Math.round((currentMonthGoal.actualUnits / currentMonthGoal.targetUnits) * 100)
            : 0,
          isLocked: currentMonthGoal.isLocked
        } : null,
        needsGoal: !currentMonthGoal,
        canSetGoal,
        canManagerEdit,
        isFirstOfMonth,
        dayOfMonth
      }
    });
  } catch (error) {
    console.error("Error fetching goals:", error);
    return NextResponse.json(
      { error: "Failed to fetch goals" },
      { status: 500 }
    );
  }
}

// POST /api/goals - Set monthly goal
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { targetUnits, month, year, userId: targetUserId } = body;

    if (!targetUnits || targetUnits < 1 || targetUnits > 99) {
      return NextResponse.json(
        { error: "Target units must be between 1 and 99" },
        { status: 400 }
      );
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        profile: { select: { role: true } }
      }
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const role = currentUser.profile?.role || "salesperson";
    const now = new Date();
    const dayOfMonth = now.getDate();

    const targetMonth = month || now.getMonth() + 1;
    const targetYear = year || now.getFullYear();

    // Determine who we're setting the goal for
    let userId = currentUser.id;
    let isSettingForOther = false;

    if (targetUserId && targetUserId !== currentUser.id) {
      // Setting for another user - must be manager+
      if (!["owner", "director", "manager"].includes(role)) {
        return NextResponse.json(
          { error: "You can only set your own goals" },
          { status: 403 }
        );
      }

      // Check manager can edit their team member
      if (role === "manager") {
        const targetProfile = await prisma.userProfile.findUnique({
          where: { userId: targetUserId },
          select: { managerId: true }
        });

        if (targetProfile?.managerId !== currentUser.id) {
          return NextResponse.json(
            { error: "You can only set goals for your team members" },
            { status: 403 }
          );
        }
      }

      userId = targetUserId;
      isSettingForOther = true;
    }

    // Check time restrictions
    // Own goal: can only set in first 5 days
    // Manager editing: can edit until 20th
    if (!isSettingForOther && dayOfMonth > 5) {
      // Check if goal already exists
      const existingGoal = await prisma.monthlyGoal.findUnique({
        where: {
          userId_month_year: {
            userId,
            month: targetMonth,
            year: targetYear
          }
        }
      });

      if (existingGoal) {
        return NextResponse.json(
          { error: "You can only edit your goal in the first 5 days of the month" },
          { status: 400 }
        );
      }
    }

    if (isSettingForOther && dayOfMonth > 20) {
      return NextResponse.json(
        { error: "Managers can only edit goals until the 20th of the month" },
        { status: 400 }
      );
    }

    // Check if locked
    const existingGoal = await prisma.monthlyGoal.findUnique({
      where: {
        userId_month_year: {
          userId,
          month: targetMonth,
          year: targetYear
        }
      }
    });

    if (existingGoal?.isLocked) {
      return NextResponse.json(
        { error: "This goal is locked and cannot be modified" },
        { status: 400 }
      );
    }

    // Upsert the goal
    const goal = await prisma.monthlyGoal.upsert({
      where: {
        userId_month_year: {
          userId,
          month: targetMonth,
          year: targetYear
        }
      },
      update: {
        targetUnits,
        setByUserId: currentUser.id
      },
      create: {
        userId,
        month: targetMonth,
        year: targetYear,
        targetUnits,
        actualUnits: 0,
        setByUserId: currentUser.id
      }
    });

    return NextResponse.json({
      message: existingGoal ? "Goal updated" : "Goal created",
      goal: {
        id: goal.id,
        month: goal.month,
        year: goal.year,
        targetUnits: goal.targetUnits,
        actualUnits: goal.actualUnits
      }
    });
  } catch (error) {
    console.error("Error setting goal:", error);
    return NextResponse.json(
      { error: "Failed to set goal" },
      { status: 500 }
    );
  }
}

// PATCH /api/goals - Lock goals (system/cron use on 20th)
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        profile: { select: { role: true } }
      }
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Only owners can manually lock goals
    if (currentUser.profile?.role !== "owner") {
      return NextResponse.json(
        { error: "Only owners can lock goals" },
        { status: 403 }
      );
    }

    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    // Lock all goals for current month
    const result = await prisma.monthlyGoal.updateMany({
      where: {
        month,
        year,
        isLocked: false
      },
      data: {
        isLocked: true
      }
    });

    return NextResponse.json({
      message: `Locked ${result.count} goals for ${month}/${year}`
    });
  } catch (error) {
    console.error("Error locking goals:", error);
    return NextResponse.json(
      { error: "Failed to lock goals" },
      { status: 500 }
    );
  }
}
