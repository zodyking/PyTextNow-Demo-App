export interface User {
  id: string;
  username: string;
  password?: string;
  textnowUsername: string;
  sidCookie: string;
  csrfCookie: string;
  geminiApiKey?: string;
  createdAt?: string;
}

export interface Conversation {
  id: string;
  number: string;
  lastMessage: string;
  lastMessageTime: string;
  unread: number;
}

export interface Message {
  id: string;
  content: string;
  number: string;
  date: string;
  direction: "sent" | "received";
  type: "sms" | "mms" | "voice";
  mediaUrl?: string;
  contentType?: string;
}

