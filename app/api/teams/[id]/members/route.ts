import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const MAX_TEAM_MEMBERS = 10;

// POST /api/teams/[id]/members - Add a member to a team
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: teamId } = await params;

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        profile: { select: { role: true } },
        managedTeam: true
      }
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const role = currentUser.profile?.role || "salesperson";

    // Get the team
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        _count: { select: { members: true } }
      }
    });

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // Check permission: owner/director, or the team's manager
    const canManageTeam =
      ["owner", "director"].includes(role) ||
      (currentUser.managedTeam?.id === teamId);

    if (!canManageTeam) {
      return NextResponse.json(
        { error: "You don't have permission to manage this team" },
        { status: 403 }
      );
    }

    // Check team capacity
    if (team._count.members >= MAX_TEAM_MEMBERS) {
      return NextResponse.json(
        { error: `Team is full (maximum ${MAX_TEAM_MEMBERS} members)` },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { userId, memberRole = "member" } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Check if user exists
    const userToAdd = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        teamMembership: true
      }
    });

    if (!userToAdd) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user is already on a team
    if (userToAdd.teamMembership) {
      return NextResponse.json(
        { error: "User is already on a team. They must leave their current team first." },
        { status: 400 }
      );
    }

    // Add member to team
    const membership = await prisma.teamMember.create({
      data: {
        teamId: teamId,
        userId: userId,
        role: memberRole
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({
      message: "Member added to team",
      member: {
        id: membership.id,
        user: membership.user,
        role: membership.role,
        joinedAt: membership.joinedAt
      }
    });
  } catch (error) {
    console.error("Error adding team member:", error);
    return NextResponse.json(
      { error: "Failed to add team member" },
      { status: 500 }
    );
  }
}

// DELETE /api/teams/[id]/members - Remove a member from a team
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: teamId } = await params;
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        profile: { select: { role: true } },
        managedTeam: true
      }
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const role = currentUser.profile?.role || "salesperson";

    // Get the team
    const team = await prisma.team.findUnique({
      where: { id: teamId }
    });

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // Check permission: owner/director, the team's manager, or the user themselves
    const canManageTeam =
      ["owner", "director"].includes(role) ||
      (currentUser.managedTeam?.id === teamId) ||
      (currentUser.id === userId); // Users can leave their own team

    if (!canManageTeam) {
      return NextResponse.json(
        { error: "You don't have permission to manage this team" },
        { status: 403 }
      );
    }

    // Find the membership
    const membership = await prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId: teamId,
          userId: userId
        }
      }
    });

    if (!membership) {
      return NextResponse.json(
        { error: "User is not a member of this team" },
        { status: 404 }
      );
    }

    // Remove from team
    await prisma.teamMember.delete({
      where: { id: membership.id }
    });

    return NextResponse.json({ message: "Member removed from team" });
  } catch (error) {
    console.error("Error removing team member:", error);
    return NextResponse.json(
      { error: "Failed to remove team member" },
      { status: 500 }
    );
  }
}
