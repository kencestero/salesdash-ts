import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/teams - Get all teams (or user's team)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        profile: {
          select: { role: true }
        },
        teamMembership: {
          include: {
            team: {
              include: {
                manager: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                    profile: {
                      select: {
                        role: true,
                        avatarUrl: true
                      }
                    }
                  }
                },
                members: {
                  include: {
                    user: {
                      select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                        profile: {
                          select: {
                            role: true,
                            avatarUrl: true,
                            repCode: true
                          }
                        },
                        salesStats: {
                          select: {
                            totalUnitsSold: true,
                            monthlyUnits: true
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        managedTeam: {
          include: {
            manager: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
                profile: {
                  select: {
                    role: true,
                    avatarUrl: true
                  }
                }
              }
            },
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                    profile: {
                      select: {
                        role: true,
                        avatarUrl: true,
                        repCode: true
                      }
                    },
                    salesStats: {
                      select: {
                        totalUnitsSold: true,
                        monthlyUnits: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const role = currentUser.profile?.role || "salesperson";

    // If owner/director, can see all teams
    if (["owner", "director"].includes(role)) {
      const teams = await prisma.team.findMany({
        where: { isActive: true },
        include: {
          manager: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              profile: {
                select: {
                  role: true,
                  avatarUrl: true
                }
              }
            }
          },
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                  profile: {
                    select: {
                      role: true,
                      avatarUrl: true,
                      repCode: true
                    }
                  },
                  salesStats: {
                    select: {
                      totalUnitsSold: true,
                      monthlyUnits: true
                    }
                  }
                }
              }
            }
          },
          _count: {
            select: { members: true }
          }
        },
        orderBy: { name: "asc" }
      });

      return NextResponse.json({
        teams: teams.map(formatTeam),
        userTeam: currentUser.managedTeam ? formatTeam({
          ...currentUser.managedTeam,
          _count: { members: currentUser.managedTeam.members.length }
        }) : null
      });
    }

    // For managers, return their team
    if (currentUser.managedTeam) {
      return NextResponse.json({
        teams: [formatTeam({
          ...currentUser.managedTeam,
          _count: { members: currentUser.managedTeam.members.length }
        })],
        userTeam: formatTeam({
          ...currentUser.managedTeam,
          _count: { members: currentUser.managedTeam.members.length }
        }),
        isManager: true
      });
    }

    // For regular users, return their team membership
    if (currentUser.teamMembership?.team) {
      return NextResponse.json({
        teams: [formatTeam({
          ...currentUser.teamMembership.team,
          _count: { members: currentUser.teamMembership.team.members.length }
        })],
        userTeam: formatTeam({
          ...currentUser.teamMembership.team,
          _count: { members: currentUser.teamMembership.team.members.length }
        }),
        isManager: false
      });
    }

    // User not on any team
    return NextResponse.json({
      teams: [],
      userTeam: null,
      isManager: false
    });
  } catch (error) {
    console.error("Error fetching teams:", error);
    return NextResponse.json(
      { error: "Failed to fetch teams" },
      { status: 500 }
    );
  }
}

// POST /api/teams - Create a new team (auto-created when someone becomes manager)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    // Only owners/directors can create teams (or system auto-creates for managers)
    if (!["owner", "director"].includes(currentUser.profile?.role || "")) {
      return NextResponse.json(
        { error: "Only owners and directors can create teams" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { managerId, name, description, color } = body;

    if (!managerId) {
      return NextResponse.json(
        { error: "Manager ID is required" },
        { status: 400 }
      );
    }

    // Check if manager exists and is a valid manager role
    const manager = await prisma.user.findUnique({
      where: { id: managerId },
      include: {
        profile: { select: { role: true } },
        managedTeam: true
      }
    });

    if (!manager) {
      return NextResponse.json({ error: "Manager not found" }, { status: 404 });
    }

    if (!["owner", "director", "manager"].includes(manager.profile?.role || "")) {
      return NextResponse.json(
        { error: "User must be a manager or above to lead a team" },
        { status: 400 }
      );
    }

    if (manager.managedTeam) {
      return NextResponse.json(
        { error: "This manager already has a team" },
        { status: 400 }
      );
    }

    const teamName = name || `${manager.name?.split(" ")[0]}'s Team`;

    const team = await prisma.team.create({
      data: {
        name: teamName,
        description: description || null,
        managerId: managerId,
        color: color || "#E96114"
      },
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({
      message: "Team created successfully",
      team: {
        id: team.id,
        name: team.name,
        manager: team.manager
      }
    });
  } catch (error) {
    console.error("Error creating team:", error);
    return NextResponse.json(
      { error: "Failed to create team" },
      { status: 500 }
    );
  }
}

// Helper function to format team data
function formatTeam(team: any) {
  return {
    id: team.id,
    name: team.name,
    description: team.description,
    color: team.color,
    memberCount: team._count?.members || team.members?.length || 0,
    manager: {
      id: team.manager.id,
      name: team.manager.name,
      email: team.manager.email,
      image: team.manager.profile?.avatarUrl || team.manager.image,
      role: team.manager.profile?.role
    },
    members: team.members?.map((m: any) => ({
      id: m.user.id,
      name: m.user.name,
      email: m.user.email,
      image: m.user.profile?.avatarUrl || m.user.image,
      role: m.user.profile?.role,
      repCode: m.user.profile?.repCode,
      memberRole: m.role,
      joinedAt: m.joinedAt,
      stats: {
        totalUnitsSold: m.user.salesStats?.totalUnitsSold || 0,
        monthlyUnits: m.user.salesStats?.monthlyUnits || 0
      }
    })) || [],
    createdAt: team.createdAt
  };
}
