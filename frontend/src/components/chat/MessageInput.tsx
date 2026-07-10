import React, { useState, KeyboardEvent, useRef, useEffect } from "react";
import { IoSend } from "react-icons/io5";

interface MessageInputProps {
  onMessageSent: (message: string) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ onMessageSent }) => {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
  }, [message]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    const messageContent = message.trim();
    setMessage("");
    setIsTyping(true);
    try {
      await onMessageSent(messageContent);
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (message.trim()) handleSubmit(e as unknown as React.FormEvent);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="px-3 py-3 sm:px-5 sm:py-4">
      <div className="flex items-end gap-2 sm:gap-3">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="پیام خود را بنویسید... (Shift+Enter برای خط جدید)"
          className="
            flex-1 rounded-2xl border border-gray-200 bg-gray-50
            px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300
            resize-none min-h-[42px] max-h-[150px] transition
          "
          disabled={isTyping}
          rows={1}
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            overflowY: "auto",
          }}
        />
        <button
          type="submit"
          disabled={isTyping || !message.trim()}
          className="
            flex-shrink-0 flex items-center justify-center
            w-10 h-10 rounded-2xl
            bg-gradient-to-br from-indigo-500 to-blue-500
            hover:from-indigo-600 hover:to-blue-600
            shadow-md shadow-indigo-200
            text-white
            focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:ring-offset-2
            disabled:opacity-40 disabled:cursor-not-allowed
            transition-all duration-200
          "
        >
          {isTyping ? (
            <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
          ) : (
            <div className="transform scale-x-[-1]">
              <IoSend size={18} />
            </div>
          )}
        </button>
      </div>
    </form>
  );
};

export default MessageInput;
