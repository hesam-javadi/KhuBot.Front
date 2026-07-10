import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { chatService, extractErrorMessage } from "../services/api";
import {
  Chat,
  ChatMessage as ChatMessageType,
  RagContext,
  RequestState,
  RequestStateNotification,
} from "../types";
import ChatMessageComponent from "../components/chat/ChatMessage";
import MessageInput from "../components/chat/MessageInput";
import UserDropdown from "../components/chat/UserDropdown";
import ContextSidebar from "../components/chat/ContextSidebar";
import logo from "../assets/Logo.png";
import loadingGif from "../assets/LoadingAnimation.gif";

const ChatPage: React.FC = () => {
  const { user, logout, updateUserUsage } = useAuth();
  const navigate = useNavigate();
  const { contextId: contextIdParam } = useParams<{ contextId: string }>();

  const contextId = parseInt(contextIdParam ?? "1", 10);

  const [contexts, setContexts] = useState<RagContext[]>([]);
  const [contextsLoading, setContextsLoading] = useState(true);
  const [, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [stateMessage, setStateMessage] = useState<string>("");
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  // Fetch available contexts once on mount
  useEffect(() => {
    if (!user) return;
    chatService
      .getContexts()
      .then(setContexts)
      .catch((err) => console.error("Failed to load contexts:", err))
      .finally(() => setContextsLoading(false));
  }, [user]);

  // Fetch chat history whenever contextId changes
  useEffect(() => {
    if (!user) return;
    if (isNaN(contextId)) {
      navigate("/1", { replace: true });
      return;
    }

    setIsLoading(true);
    setMessages([]);

    chatService
      .getChatList(contextId)
      .then((response) => {
        setChats(response.chats);
        if (response.chats.length > 0) {
          setSelectedChat(response.chats[0]);
          setMessages(response.chats[0].messages);
        }
        updateUserUsage(response.user.usagePercentage);
      })
      .catch((error) => {
        toast.error(extractErrorMessage(error));
        console.error("Failed to fetch chats:", error);
      })
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contextId]);

  // Auto-scroll on new messages or typing state change
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } =
      messagesContainerRef.current;
    setShowScrollButton(scrollHeight - scrollTop - clientHeight > 30);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleContextSelect = (newContextId: number) => {
    if (newContextId !== contextId) {
      navigate(`/${newContextId}`);
    }
  };

  const handleStateUpdate = (notification: RequestStateNotification) => {
    if (
      notification.state === RequestState.Completed ||
      notification.state === RequestState.Failed
    ) {
      setStateMessage("");
    } else {
      setStateMessage(notification.stateMessage);
    }
  };

  const sendMessageWithSignalR = async (
    message: string,
  ): Promise<ChatMessageType> => {
    const requestId = crypto.randomUUID();
    return chatService.sendMessage(
      message,
      contextId,
      requestId,
      handleStateUpdate,
    );
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
    setStateMessage("در حال ارسال...");
    scrollToBottom();

    try {
      const botResponse = await sendMessageWithSignalR(message);
      setIsTyping(false);
      setStateMessage("");
      setMessages((prev) => [...prev, botResponse]);

      const updatedChat: Chat = {
        ...selectedChat!,
        messages: [...messages, newMessage, botResponse],
        lastMessage: botResponse.content,
        lastMessageTime: botResponse.timestamp,
      };
      setChats([updatedChat]);
      setSelectedChat(updatedChat);

      // Refresh usage percentage
      chatService
        .getChatList(contextId)
        .then((r) => updateUserUsage(r.user.usagePercentage))
        .catch((err) => console.error("Failed to update usage:", err));
    } catch (error) {
      setIsTyping(false);
      setStateMessage("");
      toast.error(extractErrorMessage(error));
      console.error("Failed to send message:", error);

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === newMessage.id ? { ...msg, hasError: true } : msg,
        ),
      );
    }
  };

  const handleRetry = async (messageId: string) => {
    const messageToRetry = messages.find((msg) => msg.id === messageId);
    if (!messageToRetry) return;

    const updatedMessages = messages.filter((msg) => msg.id !== messageId);
    const retryMessage: ChatMessageType = {
      ...messageToRetry,
      hasError: false,
      id: Date.now().toString(),
    };

    setMessages([...updatedMessages, retryMessage]);
    setIsTyping(true);
    setStateMessage("در حال ارسال...");
    scrollToBottom();

    try {
      const botResponse = await sendMessageWithSignalR(retryMessage.content);
      setIsTyping(false);
      setStateMessage("");
      setMessages((prev) => [...prev, botResponse]);

      const updatedChat: Chat = {
        ...selectedChat!,
        messages: [...updatedMessages, retryMessage, botResponse],
        lastMessage: botResponse.content,
        lastMessageTime: botResponse.timestamp,
      };
      setChats([updatedChat]);
      setSelectedChat(updatedChat);

      chatService
        .getChatList(contextId)
        .then((r) => updateUserUsage(r.user.usagePercentage))
        .catch((err) => console.error("Failed to update usage:", err));
    } catch (error) {
      setIsTyping(false);
      setStateMessage("");
      toast.error(extractErrorMessage(error));
      console.error("Failed to send message:", error);

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === retryMessage.id ? { ...msg, hasError: true } : msg,
        ),
      );
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-indigo-200 border-t-indigo-600" />
        <p className="text-sm text-indigo-400">در حال بارگذاری...</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 lg:right-64 bg-white/80 backdrop-blur-md border-b border-white/60 px-3 sm:px-5 py-2 sm:py-2.5 w-auto z-10 shadow-sm shadow-indigo-100/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <img
              src={logo}
              alt="خوبات"
              className="h-8 sm:h-10 drop-shadow-sm"
            />
          </div>
          <UserDropdown user={user!} onLogout={handleLogout} />
        </div>
      </header>

      {/* Main Content — transparent so aurora shows through */}
      <div
        className="flex-1 overflow-y-auto scrollbar-right pt-16 pb-[76px] sm:pb-[92px] lg:pr-64"
        onScroll={handleScroll}
        ref={messagesContainerRef}
      >
        <div className="max-w-[780px] mx-auto">
          {messages.length === 0 ? (
            <div className="flex-1 h-[calc(100vh-180px)] flex items-center justify-center">
              <div className="text-center px-4 py-10 bg-white/70 backdrop-blur-sm rounded-3xl shadow-lg shadow-indigo-100/40 ring-1 ring-white/80">
                <p className="font-extrabold text-2xl sm:text-3xl text-gray-800">
                  سلام {user?.firstName} 👋
                </p>
                <p className="mt-2 text-gray-400 text-sm">
                  چه کمکی از دستم برمیاد؟
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 p-3 sm:p-5 space-y-2">
              {messages.map((message) => (
                <ChatMessageComponent
                  key={message.id}
                  message={message}
                  onRetry={message.isUser ? handleRetry : undefined}
                />
              ))}

              {/* Typing / progress indicator */}
              {isTyping && (
                <div className="flex justify-start mb-3">
                  <div className="max-w-[85%] sm:max-w-[70%] bg-white rounded-2xl rounded-bl-sm shadow-md shadow-gray-200/80 ring-1 ring-gray-100 px-4 py-2.5 flex items-center gap-2.5">
                    <img
                      src={loadingGif}
                      alt=""
                      className="h-5 flex-shrink-0"
                    />
                    <span className="text-sm text-gray-500">
                      {stateMessage}
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {showScrollButton && (
          <button
            onClick={scrollToBottom}
            className="fixed bottom-[100px] left-1/2 -translate-x-1/2 flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-lg shadow-indigo-100/60 ring-1 ring-indigo-100 text-indigo-500 hover:text-indigo-600 hover:shadow-indigo-200/60 transition-all duration-200 z-10"
            aria-label="Scroll to bottom"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path
                fillRule="evenodd"
                d="M12 2.25a.75.75 0 01.75.75v16.19l6.22-6.22a.75.75 0 111.06 1.06l-7.5 7.5a.75.75 0 01-1.06 0l-7.5-7.5a.75.75 0 111.06-1.06l6.22 6.22V3a.75.75 0 01.75-.75z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Fixed Message Input */}
      <div className="fixed bottom-0 left-0 right-0 lg:right-64 bg-white/80 backdrop-blur-md border-t border-white/60 shadow-lg shadow-indigo-100/30">
        <div className="max-w-[780px] mx-auto">
          <MessageInput onMessageSent={handleMessageSent} />
        </div>
      </div>

      {/* Context selector sidebar (right side) */}
      <ContextSidebar
        contexts={contexts}
        selectedContextId={contextId}
        onSelectContext={handleContextSelect}
        isLoading={contextsLoading}
      />
    </div>
  );
};

export default ChatPage;
