import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET /api/calendars - Get all events for current user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({
        status: "fail",
        message: "Unauthorized",
        data: [],
      }, { status: 401 });
    }

    // Get user profile to get role
    const userProfile = await prisma.userProfile.findFirst({
      where: {
        user: {
          email: session.user.email,
        },
      },
    });

    const userId = session.user.email; // Using email as userId for now

    // Fetch events:
    // 1. User's personal events (userId matches)
    // 2. Company announcements (eventType = "company")
    const events = await prisma.calendarEvent.findMany({
      where: {
        OR: [
          { userId: userId }, // Personal events
          { eventType: "company" }, // Company announcements
        ],
      },
      orderBy: {
        start: "asc",
      },
    });

    // Transform to FullCalendar format
    const formattedEvents = events.map((event) => ({
      id: event.id,
      title: event.title,
      start: event.start,
      end: event.end,
      allDay: event.allDay,
      extendedProps: {
        calendar: event.category,
        description: event.description,
        eventType: event.eventType,
        isAnnouncement: event.isAnnouncement,
      },
    }));

    return NextResponse.json({
      status: "success",
      message: "Events fetched successfully",
      data: formattedEvents,
    });
  } catch (error) {
    console.error("Calendar events fetch error:", error);
    return NextResponse.json({
      status: "fail",
      message: "Something went wrong",
      data: error,
    }, { status: 500 });
  }
}

// POST /api/calendars - Create new event
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({
        status: "fail",
        message: "Unauthorized",
        data: null,
      }, { status: 401 });
    }

    // Get user profile to check role
    const userProfile = await prisma.userProfile.findFirst({
      where: {
        user: {
          email: session.user.email,
        },
      },
    });

    const reqBody = await request.json();
    const {
      title,
      description,
      start,
      end,
      allDay,
      category,
      eventType,
      isAnnouncement,
    } = reqBody;

    // Validation
    if (!title || !start || !end) {
      return NextResponse.json({
        status: "fail",
        message: "Missing required fields: title, start, end",
        data: null,
      }, { status: 400 });
    }

    // Role-based permission check for company announcements
    if (eventType === "company" || isAnnouncement) {
      const allowedRoles = ["owner", "manager", "director"];
      const userRole = userProfile?.role || "salesperson";

      if (!allowedRoles.includes(userRole)) {
        return NextResponse.json({
          status: "fail",
          message: "Only managers, owners, and directors can create company announcements",
          data: null,
        }, { status: 403 });
      }
    }

    // Create event
    const newEvent = await prisma.calendarEvent.create({
      data: {
        title,
        description: description || null,
        start: new Date(start),
        end: new Date(end),
        allDay: allDay || false,
        eventType: eventType || "personal",
        category: category || "personal",
        userId: eventType === "company" ? null : session.user.email,
        createdBy: session.user.email,
        createdByRole: userProfile?.role || "salesperson",
        isAnnouncement: isAnnouncement || false,
        visibleToRoles: [], // Empty = visible to all
      },
    });

    return NextResponse.json({
      status: "success",
      message: "Event created successfully",
      data: {
        id: newEvent.id,
        title: newEvent.title,
        start: newEvent.start,
        end: newEvent.end,
        allDay: newEvent.allDay,
        extendedProps: {
          calendar: newEvent.category,
          description: newEvent.description,
          eventType: newEvent.eventType,
          isAnnouncement: newEvent.isAnnouncement,
        },
      },
    });
  } catch (error) {
    console.error("Calendar event creation error:", error);
    return NextResponse.json({
      status: "fail",
      message: "Something went wrong",
      data: error,
    }, { status: 500 });
  }
}
