import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authService, chatService, extractErrorMessage } from '../services/api';
import { jwtDecode } from 'jwt-decode';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  updateUserUsage: (usagePercentage: number) => void;
}

interface JwtPayload {
  userId: string;
  exp: number;
  iss: string;
  aud: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const validateToken = (token: string): boolean => {
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch (error) {
      return false;
    }
  };

  const fetchUserData = async () => {
    try {
      const response = await chatService.getChatList();
      setUser({
        name: response.user.name,
        firstName: response.user.firstName,
        lastName: response.user.lastName,
        usagePercentage: response.user.usagePercentage
      });
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const initializeAuth = async () => {
    const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    
    if (token && validateToken(token)) {
      try {
        await fetchUserData();
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        logout();
      }
    } else {
      setIsLoading(false);
      if (token) {
        logout(); // Clear invalid token
      }
    }
  };

  useEffect(() => {
    initializeAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await authService.login(username, password);
      await fetchUserData(); // Fetch user data immediately after login
      setUser(response.user);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    setUser(null);
  };

  const updateUserUsage = (usagePercentage: number) => {
    if (user) {
      setUser({
        ...user,
        usagePercentage
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, updateUserUsage }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 