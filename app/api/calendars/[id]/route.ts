import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// DELETE /api/calendars/[id] - Delete event
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({
        status: "fail",
        message: "Unauthorized",
      }, { status: 401 });
    }

    const { id } = params;

    // Check if event exists
    const event = await prisma.calendarEvent.findUnique({
      where: { id },
    });

    if (!event) {
      return NextResponse.json({
        status: "fail",
        message: "Event not found",
      }, { status: 404 });
    }

    // Check permission - user can only delete their own events
    // OR managers/owners can delete company announcements they created
    if (event.userId !== session.user.email && event.createdBy !== session.user.email) {
      return NextResponse.json({
        status: "fail",
        message: "You don't have permission to delete this event",
      }, { status: 403 });
    }

    // Delete event
    await prisma.calendarEvent.delete({
      where: { id },
    });

    return NextResponse.json({
      status: "success",
      message: "Event deleted successfully",
    });
  } catch (error) {
    console.error("Calendar event deletion error:", error);
    return NextResponse.json({
      status: "fail",
      message: "Something went wrong",
      data: error,
    }, { status: 500 });
  }
}

// PUT /api/calendars/[id] - Update event
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({
        status: "fail",
        message: "Unauthorized",
      }, { status: 401 });
    }

    const { id } = params;
    const updatedEventData = await request.json();

    // Check if event exists
    const event = await prisma.calendarEvent.findUnique({
      where: { id },
    });

    if (!event) {
      return NextResponse.json({
        status: "fail",
        message: "Event not found",
      }, { status: 404 });
    }

    // Check permission - user can only update their own events
    // OR managers/owners can update company announcements they created
    if (event.userId !== session.user.email && event.createdBy !== session.user.email) {
      return NextResponse.json({
        status: "fail",
        message: "You don't have permission to update this event",
      }, { status: 403 });
    }

    // Update event
    const updatedEvent = await prisma.calendarEvent.update({
      where: { id },
      data: {
        ...(updatedEventData.title && { title: updatedEventData.title }),
        ...(updatedEventData.description !== undefined && { description: updatedEventData.description }),
        ...(updatedEventData.start && { start: new Date(updatedEventData.start) }),
        ...(updatedEventData.end && { end: new Date(updatedEventData.end) }),
        ...(updatedEventData.allDay !== undefined && { allDay: updatedEventData.allDay }),
        ...(updatedEventData.category && { category: updatedEventData.category }),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      status: "success",
      message: "Event updated successfully",
      data: {
        id: updatedEvent.id,
        title: updatedEvent.title,
        start: updatedEvent.start,
        end: updatedEvent.end,
        allDay: updatedEvent.allDay,
        extendedProps: {
          calendar: updatedEvent.category,
          description: updatedEvent.description,
          eventType: updatedEvent.eventType,
          isAnnouncement: updatedEvent.isAnnouncement,
        },
      },
    });
  } catch (error) {
    console.error("Calendar event update error:", error);
    return NextResponse.json({
      status: "fail",
      message: "Something went wrong",
      data: error,
    }, { status: 500 });
  }
}
