export interface User {
  name: string;
  firstName: string;
  lastName: string;
  usagePercentage: number;
}

export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
  hasError?: boolean;
}

export interface Chat {
  id: string;
  title: string;
  messages: ChatMessage[];
  lastMessage: string;
  lastMessageTime: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
} 