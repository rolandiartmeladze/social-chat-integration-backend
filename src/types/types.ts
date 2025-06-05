export type Platform = 'telegram' | 'messenger' | 'instagram';

export interface IncomingMessagePayload {
  senderId: string;
  username: string;
  text: string;
  platform: Platform;
}

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
    participants: User[];
    messages: Message[];
    lastUpdated: string;
    unreadCount?: number;
}

// export interface Conversation {
//   conversationId: string;
//   user: {
//     id?: string;
//     name: string;
//     avatar?: string | null;
//   };
//   lastMessage?: string;
//   page?: string;
//   source: "messenger" | "instagram" | "telegram";
// }
