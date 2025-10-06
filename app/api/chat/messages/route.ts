import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, doc, getDoc, setDoc } from "firebase/firestore";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest, response: NextResponse) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const obj = await request.json();
  const { message, contact, replayMetadata } = obj;

  try {
    // Create or get chat document
    const chatId = `chat_${session.user.id}_${contact.id}`;
    const chatRef = doc(db, "chats", chatId);

    // Create message data
    const newMessageData = {
      message,
      time: serverTimestamp(),
      senderId: session.user.id,
      senderEmail: session.user.email,
      receiverId: contact.id,
      replayMetadata: replayMetadata || false,
    };

    // Add message to messages subcollection
    const messagesRef = collection(chatRef, "messages");
    const messageDoc = await addDoc(messagesRef, newMessageData);

    // Update chat metadata
    await setDoc(chatRef, {
      participants: [session.user.id, contact.id],
      lastMessage: message,
      lastMessageTime: serverTimestamp(),
      unseenMsgs: 0,
    }, { merge: true });

    return NextResponse.json(
      {
        id: messageDoc.id,
        chatId,
        ...newMessageData,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
