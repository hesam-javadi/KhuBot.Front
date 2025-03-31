import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { chatService, extractErrorMessage } from '../services/api';
import { Chat, ChatMessage as ChatMessageType } from '../types';
import ChatMessageComponent from '../components/chat/ChatMessage';
import MessageInput from '../components/chat/MessageInput';
import UserDropdown from '../components/chat/UserDropdown';
import logo from '../assets/Logo.png';
import loadingGif from '../assets/LoadingAnimation.gif';

const ChatPage: React.FC = () => {
  const { user, logout, updateUserUsage } = useAuth();
  const navigate = useNavigate();
  const [_chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const hasFetchedData = useRef(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchChats = async () => {
      if (hasFetchedData.current) return;
      
      try {
        const response = await chatService.getChatList();
        setChats(response.chats);
        if (response.chats.length > 0) {
          setSelectedChat(response.chats[0]);
          setMessages(response.chats[0].messages);
        }
        updateUserUsage(response.user.usagePercentage);
        hasFetchedData.current = true;
      } catch (error) {
        const errorMessage = extractErrorMessage(error);
        toast.error(errorMessage);
        console.error('Failed to fetch chats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChats();
  }, [user, navigate]);

  useEffect(() => {
    // Auto-scroll to bottom when a new message is added or typing indicator changes
    scrollToBottom();
  }, [messages, isTyping]);

  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 30;
    setShowScrollButton(!isAtBottom);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleMessageSent = async (message: string) => {
    const newMessage: ChatMessageType = {
      id: Date.now().toString(),
      content: message,
      isUser: true,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setIsTyping(true);
    
    // Ensure we scroll to bottom when sending a new message
    scrollToBottom();

    try {
      const botResponse = await chatService.sendMessage(message);
      setIsTyping(false);
      setMessages((prev) => [...prev, botResponse]);
      
      // Update chat list with new messages
      const updatedChat: Chat = {
        ...selectedChat!,
        messages: [...messages, newMessage, botResponse],
        lastMessage: botResponse.content,
        lastMessageTime: botResponse.timestamp,
      };
      
      setChats([updatedChat]);
      setSelectedChat(updatedChat);

      // Fetch updated usage percentage
      try {
        const response = await chatService.getChatList();
        updateUserUsage(response.user.usagePercentage);
      } catch (error) {
        console.error('Failed to update usage data:', error);
      }
    } catch (error) {
      setIsTyping(false);
      const errorMessage = extractErrorMessage(error);
      toast.error(errorMessage);
      console.error('Failed to send message:', error);
      
      // Mark the message as having an error
      setMessages((prev) => 
        prev.map(msg => 
          msg.id === newMessage.id ? { ...msg, hasError: true } : msg
        )
      );
    }
  };

  const handleRetry = async (messageId: string) => {
    // Find the message that needs to be retried
    const messageToRetry = messages.find(msg => msg.id === messageId);
    if (!messageToRetry) return;

    // Create a new array without the error message
    const updatedMessages = messages.filter(msg => msg.id !== messageId);
    
    // Add back the message without the error flag
    const retryMessage: ChatMessageType = {
      ...messageToRetry,
      hasError: false,
      id: Date.now().toString(), // Generate a new ID to ensure it's treated as a new message
    };
    
    setMessages([...updatedMessages, retryMessage]);
    setIsTyping(true);
    
    // Scroll to bottom
    scrollToBottom();

    try {
      const botResponse = await chatService.sendMessage(retryMessage.content);
      setIsTyping(false);
      setMessages((prevMessages) => [...prevMessages, botResponse]);
      
      // Update chat list with new messages
      const updatedChat: Chat = {
        ...selectedChat!,
        messages: [...updatedMessages, retryMessage, botResponse],
        lastMessage: botResponse.content,
        lastMessageTime: botResponse.timestamp,
      };
      
      setChats([updatedChat]);
      setSelectedChat(updatedChat);

      // Fetch updated usage percentage
      try {
        const response = await chatService.getChatList();
        updateUserUsage(response.user.usagePercentage);
      } catch (error) {
        console.error('Failed to update usage data:', error);
      }
    } catch (error) {
      setIsTyping(false);
      const errorMessage = extractErrorMessage(error);
      toast.error(errorMessage);
      console.error('Failed to send message:', error);
      
      // Mark the message as having an error
      setMessages((prevMessages) => 
        prevMessages.map(msg => 
          msg.id === retryMessage.id ? { ...msg, hasError: true } : msg
        )
      );
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 px-2 sm:px-4 py-2 sm:py-3 w-full z-10 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1 sm:space-x-2 space-x-reverse">
            <img src={logo} alt="خوبات" className="h-8 sm:h-10" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-indigo-600">
            <UserDropdown user={user!} onLogout={handleLogout} />
          </div>
        </div>
      </header>

      {/* Main Content - with padding to account for fixed header */}
      <div className="flex-1 overflow-y-auto scrollbar-right pt-16" onScroll={handleScroll} ref={messagesContainerRef}>
        <div className="max-w-[780px] mx-auto pb-20">
          {messages.length === 0 ? (
            <div className="flex-1 h-[calc(100vh-180px)] flex items-center justify-center text-gray-500 text-lg sm:text-xl">
              <div className="text-center px-2">
                <p className="font-extrabold text-xl sm:text-2xl">سلام {user?.firstName} 👋</p>
                <p className="mt-2">چه کمکی از دستم برمیاد؟</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 p-2 sm:p-4 space-y-4">
              {messages.map((message) => (
                <ChatMessageComponent 
                  key={message.id} 
                  message={message} 
                  onRetry={message.isUser ? handleRetry : undefined}
                />
              ))}
              
              {/* Typing indicator */}
              {isTyping && (
                <div className="flex justify-start mb-4">
                  <div className="max-w-[85%] sm:max-w-[70%] rounded-tr-lg rounded-tl-lg rounded-bl-lg px-3 py-2 bg-gray-200 text-gray-800">
                    <img src={loadingGif} alt="در حال نوشتن" className="h-5 sm:h-6" />
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Scroll to bottom button */}
        {showScrollButton && (
          <button 
            onClick={scrollToBottom}
            className="fixed bottom-24 left-1/2 transform -translate-x-1/2 flex items-center justify-center bg-[#4e95d9] text-white rounded-full w-10 h-10 shadow-lg hover:bg-[#3d86ca] transition-all duration-300 z-10"
            aria-label="Scroll to bottom"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path fillRule="evenodd" d="M12 2.25a.75.75 0 01.75.75v16.19l6.22-6.22a.75.75 0 111.06 1.06l-7.5 7.5a.75.75 0 01-1.06 0l-7.5-7.5a.75.75 0 111.06-1.06l6.22 6.22V3a.75.75 0 01.75-.75z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>

      {/* Fixed Message Input at bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="max-w-[780px] mx-auto">
          <MessageInput onMessageSent={handleMessageSent} />
        </div>
      </div>
    </div>
  );
};

export default ChatPage; 