export type Platform = 'telegram' | 'messenger' | 'instagram';

export interface TelegramChat {
  id: number;
  type?: string;
}

export interface TelegramUser {
  id?: number;
  is_bot?: boolean;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

export interface TelegramMessage {
  message_id?: number;
  from?: TelegramUser;
  chat?: TelegramChat;
  date?: number; 
  text?: string;
}

export interface TelegramUpdate {
  update_id?: number;
  message?: TelegramMessage;
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
  id?: string;
  conversationId: string;
  platform: Platform;
  senderId: string;
  username: string;
  text: string;
  timestamp: string;
}
