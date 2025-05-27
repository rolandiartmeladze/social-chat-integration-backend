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
