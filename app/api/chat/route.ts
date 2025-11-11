import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { db } from "@/lib/firebase";
import { collection, query, getDocs, where } from "firebase/firestore";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, response: NextResponse) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get all users from database as potential contacts
    const users = await prisma.user.findMany({
      where: {
        NOT: {
          id: session.user.id, // Exclude current user
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    });

    // Get chats from Firebase for this user
    const chatsRef = collection(db, "chats");
    const chatsQuery = query(
      chatsRef,
      where("participants", "array-contains", session.user.id)
    );
    const chatsSnapshot = await getDocs(chatsQuery);

    const chatsMap = new Map();
    chatsSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      const otherUserId = data.participants.find((p: string) => p !== session.user.id);
      if (otherUserId) {
        chatsMap.set(otherUserId, {
          id: doc.id,
          unseenMsgs: data.unseenMsgs || 0,
          lastMessage: data.lastMessage || null,
          lastMessageTime: data.lastMessageTime?.toDate?.()?.toISOString() || null,
        });
      }
    });

    // Combine users with their chat data
    const contactsWithChats = users.map((user) => {
      const chatData = chatsMap.get(user.id) || {
        id: null,
        unseenMsgs: 0,
        lastMessage: null,
        lastMessageTime: null,
      };

      return {
        id: user.id,
        fullName: user.name,
        email: user.email,
        avatar: user.image,
        role: "User",
        status: "online",
        chat: chatData,
      };
    });

    return NextResponse.json({ contacts: contactsWithChats }, { status: 200 });
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return NextResponse.json(
      { error: "Failed to fetch contacts" },
      { status: 500 }
    );
  }
}
