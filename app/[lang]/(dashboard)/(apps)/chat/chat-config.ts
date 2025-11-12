import { api } from "@/config/axios.config";

// Get all registered users with online/offline status
export const getContacts = async () => {
  try {
    // Fetch users and unread counts in parallel
    const [usersResponse, unreadResponse] = await Promise.all([
      api.get("/chat/online-users"),
      api.get("/chat/unread-counts"),
    ]);

    // Transform API response to match expected format
    const users = usersResponse.data.users || [];
    const unreadByUserId = unreadResponse.data.unreadByUserId || {};

    const contacts = users.map((user: any) => {
      const unreadData = unreadByUserId[user.id] || { unreadCount: 0, lastMessageTime: null };

      return {
        id: user.id,
        fullName: user.name,
        avatar: user.avatar,
        status: user.isOnline ? "online" : "offline",
        about: user.role,
        unreadmessage: unreadData.unreadCount,
        date: unreadData.lastMessageTime || "",
      };
    });

    return { contacts };
  } catch (error) {
    console.error("Error fetching contacts:", error);
    throw error;
  }
};

// Get messages for a specific user (receiverId)
export const getMessages = async (receiverId: string) => {
  try {
    // Fetch messages from PostgreSQL thread
    const response = await api.get(`/chat/messages?receiverId=${receiverId}`);
    console.log("Response from getMessages:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw error;
  }
};

export const deleteMessage = async (obj: any) => {
  console.log("Object to be sent:", obj);
  try {
    // TODO: Create DELETE /api/chat/messages/[id] endpoint
    await api.delete(`/chat/messages/${obj.messageId}`);
  } catch (error) {
    console.error("Error deleting message:", error);
    throw error;
  }
};

export const getProfile = async () => {
  const response = await api.get("/chat/profile-data");
  return response.data;
};

export const sendMessage = async (msg: any) => {
  // Transform message format for new API
  // Old format: { message: string, contact: { id: string }, replayMetadata: boolean }
  // New format: { receiverId: string, body: string }
  const payload = {
    receiverId: msg.contact.id,
    body: msg.message,
  };

  const response = await api.post("/chat/send", payload);
  return response.data;
};
