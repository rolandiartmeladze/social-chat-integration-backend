export type Platform = 'telegram' | 'messenger' | 'instagram';

export interface TelegramUpdate {
  message?: {
    chat?: { id: number };
    from?: { username?: string; first_name?: string };
    text?: string;
    date?: number;
  };
}

export interface User {
  id: string;
  name: string;
  avatarUrl: string;
}

export interface Message {
  id: string;
  sender: User;
  text: string;
  timestamp: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  participants: Participants;
  messages: Message[];
  lastUpdated: string;
  platform: string;
  unreadCount: string | null,
}

export interface Participants {
  user: User;
  page: User;
}

export interface IncomingMessagePayload {
  conversationId: string;
  platform: Platform;
  senderId: string;
  username: string;
  text: string;
  timestamp: string;
}
