import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/firebase";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { collection, query, orderBy, getDocs, doc, deleteDoc, getDoc } from "firebase/firestore";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, response: any) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const contactId = response.params.id;

  try {
    // Get contact info from database
    const contact = await prisma.user.findUnique({
      where: { id: contactId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    });

    if (!contact) {
      return NextResponse.json({ message: "Contact not found" }, { status: 404 });
    }

    // Get messages from Firebase with consistent chat ID
    const [userId1, userId2] = [session.user.id, contactId].sort();
    const chatId = `chat_${userId1}_${userId2}`;
    const chatRef = doc(db, "chats", chatId);
    const messagesRef = collection(chatRef, "messages");
    const messagesQuery = query(messagesRef, orderBy("time", "asc"));

    const messagesSnapshot = await getDocs(messagesQuery);
    const messages = messagesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      time: doc.data().time?.toDate?.()?.toISOString() || new Date().toISOString(),
    }));

    // Get chat metadata
    const chatDoc = await getDoc(chatRef);
    const chatData = chatDoc.exists() ? chatDoc.data() : { unseenMsgs: 0 };

    const combinedData = {
      chat: {
        id: chatId,
        userId: contactId,
        unseenMsgs: chatData.unseenMsgs || 0,
        chat: messages,
      },
      contact: {
        id: contact.id,
        fullName: contact.name,
        avatar: contact.image,
        email: contact.email,
      },
    };

    return NextResponse.json(combinedData, { status: 200 });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, response: any) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { selectedChatId, messageId } = await request.json();

  try {
    const messageRef = doc(db, "chats", selectedChatId, "messages", messageId);
    await deleteDoc(messageRef);

    return NextResponse.json(
      { message: "Message deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting message:", error);
    return NextResponse.json(
      { error: "Failed to delete message" },
      { status: 500 }
    );
  }
}
