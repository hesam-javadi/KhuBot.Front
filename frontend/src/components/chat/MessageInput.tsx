import React, { useState, KeyboardEvent, useRef, useEffect } from 'react';
import { IoSend } from 'react-icons/io5';

interface MessageInputProps {
  onMessageSent: (message: string) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ onMessageSent }) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize the textarea as content changes
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto';
    // Set the height to scrollHeight to fit the content
    textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
  }, [message]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const messageContent = message.trim();
    setMessage('');
    setIsTyping(true);
    try {
      await onMessageSent(messageContent);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (message.trim()) {
        handleSubmit(e as unknown as React.FormEvent);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-gray-200 p-2 sm:p-4">
      <div className="flex items-center">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="پیام خود را بنویسید... (Shift+Enter برای خط جدید)"
          className="flex-1 rounded-lg border border-gray-300 px-2 sm:px-4 py-2 bg-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm ml-1 sm:ml-4 resize-none min-h-[40px] max-h-[150px] scrollbar-hide"
          disabled={isTyping}
          rows={1}
          style={{ 
            scrollbarWidth: 'none', /* Firefox */
            msOverflowStyle: 'none', /* IE and Edge */
            overflowY: 'auto'
          }}
        />
        <button
          type="submit"
          disabled={isTyping || !message.trim()}
          className="inline-flex items-center justify-center rounded-lg bg-[#4e95d9] p-2 sm:px-4 sm:py-2 text-white hover:bg-[#3d86ca] focus:outline-none focus:ring-2 focus:ring-[#4e95d9] focus:ring-offset-2 disabled:opacity-50"
        >
          {isTyping ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <div className="transform scale-x-[-1]">
              <IoSend size={20} />
            </div>
          )}
        </button>
      </div>
    </form>
  );
};

export default MessageInput; 