import axios, { AxiosError } from "axios";
import * as signalR from "@microsoft/signalr";
import {
  AuthResponse,
  Chat,
  ChatMessage,
  RagContext,
  RequestStateNotification,
} from "../types";
import { jwtDecode } from "jwt-decode";

export const API_URL = "https://localhost:7193";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

interface JwtPayload {
  userId: string;
  exp: number;
  iss: string;
  aud: string;
}

interface ApiResponse<T> {
  data: T;
  isSuccess: boolean;
}

export interface ErrorResponseDetail {
  errorMessage: string;
  errorKey?: string | null;
  errorId?: string | null;
  isInternalError: boolean;
}

export interface ErrorResponse {
  errorMessages: ErrorResponseDetail[];
  isSuccess: false;
}

interface LoginResponse {
  token: string;
  loginExpireInDays: number;
}

interface ChatListResponse {
  messages: Array<{
    content: string;
    isFromBot: boolean;
  }>;
  usagePercent: number;
  firstName: string;
  lastName: string;
}

const getToken = (): string | null => {
  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];
  if (!token) return null;
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    if (decoded.exp > Date.now() / 1000) return token;
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
    return null;
  } catch {
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
    return null;
  }
};

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Helper function to extract error message from API response
export const extractErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ErrorResponse>;

    if (axiosError.response?.data?.errorMessages?.length) {
      return axiosError.response.data.errorMessages[0].errorMessage;
    }

    if (axiosError.response?.status === 401) {
      return "نام کاربری یا رمز عبور نادرست است";
    } else if (axiosError.response?.status === 403) {
      return "شما اجازه دسترسی به این بخش را ندارید";
    } else if (axiosError.response?.status === 404) {
      return "مسیر مورد نظر یافت نشد";
    } else if (axiosError.response && axiosError.response.status >= 500) {
      return "خطای سرور، لطفا مجددا تلاش کنید";
    } else if (axiosError.message === "Network Error") {
      return "خطا در ارتباط با سرور، لطفا اتصال اینترنت خود را بررسی کنید";
    }
  }

  return "خطایی رخ داده است، لطفا مجددا تلاش کنید";
};

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export const authService = {
  login: async (username: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await api.post<ApiResponse<LoginResponse>>(
        "/api/Auth/Login",
        { username, password },
      );

      if (!response.data.isSuccess) {
        throw new Error("Login failed");
      }

      const expireDate = new Date();
      expireDate.setDate(
        expireDate.getDate() + response.data.data.loginExpireInDays,
      );
      document.cookie = `token=${response.data.data.token}; path=/; expires=${expireDate.toUTCString()}`;

      // Fetch user data using context 1 as default after login
      const chatResponse = await api.get<ApiResponse<ChatListResponse>>(
        "/api/Chat/GetChatList",
        {
          params: { contextId: 1 },
        },
      );

      if (!chatResponse.data.isSuccess) {
        throw new Error("Failed to fetch user data");
      }

      return {
        token: response.data.data.token,
        user: {
          name:
            chatResponse.data.data.firstName +
            " " +
            chatResponse.data.data.lastName,
          firstName: chatResponse.data.data.firstName,
          lastName: chatResponse.data.data.lastName,
          usagePercentage: chatResponse.data.data.usagePercent,
        },
      };
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },
};

export const chatService = {
  getContexts: async (): Promise<RagContext[]> => {
    const response = await api.get<ApiResponse<RagContext[]>>(
      "/api/Chat/GetContexts",
    );
    if (!response.data.isSuccess) {
      throw new Error("Failed to fetch contexts");
    }
    return response.data.data;
  },

  getChatList: async (
    contextId: number,
  ): Promise<{
    chats: Chat[];
    user: {
      name: string;
      firstName: string;
      lastName: string;
      usagePercentage: number;
    };
  }> => {
    try {
      const response = await api.get<ApiResponse<ChatListResponse>>(
        "/api/Chat/GetChatList",
        {
          params: { contextId },
        },
      );

      if (!response.data.isSuccess) {
        throw new Error("Failed to fetch chat list");
      }

      const messages: ChatMessage[] = response.data.data.messages.map(
        (msg, index) => ({
          id: index.toString(),
          content: msg.content,
          isUser: !msg.isFromBot,
          timestamp: new Date().toISOString(),
        }),
      );

      const chat: Chat = {
        id: contextId.toString(),
        title: "گفتگو",
        messages,
        lastMessage: messages[messages.length - 1]?.content || "",
        lastMessageTime: new Date().toISOString(),
      };

      return {
        chats: [chat],
        user: {
          name:
            response.data.data.firstName + " " + response.data.data.lastName,
          firstName: response.data.data.firstName,
          lastName: response.data.data.lastName,
          usagePercentage: response.data.data.usagePercent,
        },
      };
    } catch (error) {
      console.error("Get chat list error:", error);
      throw error;
    }
  },

  sendMessage: async (
    message: string,
    contextId: number,
    requestId: string,
    onStateUpdate?: (notification: RequestStateNotification) => void,
  ): Promise<ChatMessage> => {
    const token = getToken();

    // Build SignalR connection scoped to this requestId
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${API_URL}/hub/chat-state?requestId=${requestId}`, {
        accessTokenFactory: () => token ?? "",
      })
      .withAutomaticReconnect()
      .build();

    if (onStateUpdate) {
      connection.on(
        "ReceiveUpdate",
        (notification: RequestStateNotification) => {
          onStateUpdate(notification);
        },
      );
    }

    try {
      await connection.start();
    } catch (err) {
      console.warn(
        "SignalR connection failed, continuing without real-time updates:",
        err,
      );
    }

    try {
      const response = await api.post<ApiResponse<string>>(
        "/api/Chat/SendMessage",
        {
          requestId,
          message,
          contextId,
        },
      );

      if (!response.data.isSuccess) {
        throw new Error("Failed to send message");
      }

      return {
        id: Date.now().toString(),
        content: response.data.data,
        isUser: false,
        timestamp: new Date().toISOString(),
      };
    } finally {
      try {
        await connection.stop();
      } catch {
        // ignore cleanup errors
      }
    }
  },
};

export default api;
