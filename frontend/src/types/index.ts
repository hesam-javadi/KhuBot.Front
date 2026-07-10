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

export interface RagContext {
  id: number;
  name: string;
  slug: string;
  description?: string;
  topK: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export enum RequestState {
  Received = 0,
  SearchingRelevantDocuments = 1,
  ProcessingRequest = 2,
  StreamingResponse = 3,
  Completed = 4,
  Failed = 5,
}

export interface RequestStateNotification {
  requestId: string;
  state: RequestState;
  stateMessage: string;
  metadata?: Record<string, unknown> | null;
  timestamp: string;
}
