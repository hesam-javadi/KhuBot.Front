import React, { useState } from 'react';
import { IoSend } from 'react-icons/io5';

interface MessageInputProps {
  onMessageSent: (message: string) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ onMessageSent }) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

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

  return (
    <form onSubmit={handleSubmit} className="border-t border-gray-200 p-2 sm:p-4">
      <div className="flex items-center">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="پیام خود را بنویسید..."
          className="flex-1 rounded-lg border border-gray-300 px-2 sm:px-4 py-2 bg-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm ml-1 sm:ml-4"
          disabled={isTyping}
        />
        <button
          type="submit"
          disabled={isTyping || !message.trim()}
          className="inline-flex items-center justify-center rounded-lg bg-indigo-600 p-2 sm:px-4 sm:py-2 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
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