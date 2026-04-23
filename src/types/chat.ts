export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  readAt: string | null;
  createdAt: string;
  sender?: {
    name: string | null;
    email: string;
  };
}

export interface ChatConversation {
  userId: string;
  userName: string | null;
  userEmail: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}
