import axios, { AxiosError } from 'axios';
import { AuthResponse, Chat, ChatMessage } from '../types';
import { jwtDecode } from 'jwt-decode';

const API_URL = 'https://api.khubot.ir';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
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

// Error response interface from the API
export interface ErrorResponse {
  ErrorMessages: Array<{
    ErrorMessage: string;
    ErrorKey: string | null;
    ErrorId: string | null;
    IsInternalError: boolean;
  }>;
  IsSuccess: boolean;
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

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
  if (token) {
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      const currentTime = Date.now() / 1000;
      if (decoded.exp > currentTime) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        // Token has expired, clear it
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
      }
    } catch (error) {
      // Invalid token, clear it
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    }
  }
  return config;
});

// Helper function to extract error message from API response
export const extractErrorMessage = (error: unknown): string => {
  // Handle Axios errors
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ErrorResponse>;
    
    // Check if we have the specific error format in the response
    if (axiosError.response?.data?.ErrorMessages && axiosError.response.data.ErrorMessages.length > 0) {
      return axiosError.response.data.ErrorMessages[0].ErrorMessage;
    }
    
    // Generic error handling
    if (axiosError.response && axiosError.response.status === 401) {
      return 'نام کاربری یا رمز عبور نادرست است';
    } else if (axiosError.response && axiosError.response.status === 403) {
      return 'شما اجازه دسترسی به این بخش را ندارید';
    } else if (axiosError.response && axiosError.response.status === 404) {
      return 'مسیر مورد نظر یافت نشد';
    } else if (axiosError.response && axiosError.response.status >= 500) {
      return 'خطای سرور، لطفا مجددا تلاش کنید';
    } else if (axiosError.message === 'Network Error') {
      return 'خطا در ارتباط با سرور، لطفا اتصال اینترنت خود را بررسی کنید';
    }
  }
  
  // Fallback error message
  return 'خطایی رخ داده است، لطفا مجددا تلاش کنید';
};

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (username: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await api.post<ApiResponse<LoginResponse>>('/api/Auth/Login', { username, password });
      
      if (!response.data.isSuccess) {
        throw new Error('Login failed');
      }

      // Set token in cookie with expiration
      const expireDate = new Date();
      expireDate.setDate(expireDate.getDate() + response.data.data.loginExpireInDays);
      document.cookie = `token=${response.data.data.token}; path=/; expires=${expireDate.toUTCString()}`;
      
      // Get user data immediately after login to have full user info
      const chatResponse = await api.get<ApiResponse<ChatListResponse>>('/api/Chat/GetChatList');
      
      if (!chatResponse.data.isSuccess) {
        throw new Error('Failed to fetch user data');
      }
      
      // Transform the response to match our AuthResponse type
      return {
        token: response.data.data.token,
        user: {
          name: chatResponse.data.data.firstName + ' ' + chatResponse.data.data.lastName,
          firstName: chatResponse.data.data.firstName,
          lastName: chatResponse.data.data.lastName,
          usagePercentage: chatResponse.data.data.usagePercent
        }
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
};

export const chatService = {
  getChatList: async (): Promise<{ chats: Chat[]; user: { name: string; firstName: string; lastName: string; usagePercentage: number } }> => {
    try {
      const response = await api.get<ApiResponse<ChatListResponse>>('/api/Chat/GetChatList');
      
      if (!response.data.isSuccess) {
        throw new Error('Failed to fetch chat list');
      }
      
      // Transform the response to match our Chat type
      const messages: ChatMessage[] = response.data.data.messages.map((msg, index) => ({
        id: index.toString(),
        content: msg.content,
        isUser: !msg.isFromBot,
        timestamp: new Date().toISOString(),
      }));

      const chat: Chat = {
        id: '1',
        title: 'گفتگو',
        messages,
        lastMessage: messages[messages.length - 1]?.content || '',
        lastMessageTime: new Date().toISOString(),
      };

      return {
        chats: [chat],
        user: {
          name: response.data.data.firstName + ' ' + response.data.data.lastName,
          firstName: response.data.data.firstName,
          lastName: response.data.data.lastName,
          usagePercentage: response.data.data.usagePercent
        }
      };
    } catch (error) {
      console.error('Get chat list error:', error);
      throw error;
    }
  },
  
  sendMessage: async (message: string): Promise<ChatMessage> => {
    try {
      const response = await api.post<ApiResponse<string>>('/api/Chat/SendMessage', { message });
      
      if (!response.data.isSuccess) {
        throw new Error('Failed to send message');
      }
      
      return {
        id: Date.now().toString(),
        content: response.data.data,
        isUser: false,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Send message error:', error);
      throw error;
    }
  },
};

export default api; 