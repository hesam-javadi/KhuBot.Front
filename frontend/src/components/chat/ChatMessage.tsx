import React, { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import hljs from 'highlight.js';
import { IoRefreshOutline } from 'react-icons/io5';
import { ChatMessage as ChatMessageType } from '../../types';

interface ChatMessageProps {
  message: ChatMessageType;
  onRetry?: (messageId: string) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, onRetry }) => {
  const isUser = message.isUser;
  const hasError = message.hasError || false;

  useEffect(() => {
    // Apply syntax highlighting to code blocks
    document.querySelectorAll('pre code').forEach((block) => {
      hljs.highlightElement(block as HTMLElement);
    });
  }, [message.content]);

  // Function to convert newlines to breaks in user messages
  const formatUserMessage = (content: string) => {
    return content.split('\n').map((line, i) => (
      <React.Fragment key={i}>
        {line}
        {i < content.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-[85%] sm:max-w-[70%] px-3 py-2 ${
          isUser
            ? hasError 
              ? 'bg-red-500 text-white rounded-tr-lg rounded-tl-lg rounded-br-lg' 
              : 'bg-[#4e95d9] text-white rounded-tr-lg rounded-tl-lg rounded-br-lg'
            : 'bg-gray-200 text-gray-800 rounded-tr-lg rounded-tl-lg rounded-bl-lg'
        }`}
      >
        {isUser ? (
          <div className="flex items-start">
            <p className="text-sm break-words whitespace-pre-line">
              {formatUserMessage(message.content)}
            </p>
            {hasError && onRetry && (
              <button 
                onClick={() => onRetry(message.id)}
                className="mr-2 mt-0.5 p-1 rounded-full bg-white text-red-500 hover:bg-gray-100 transition-colors duration-200 flex-shrink-0"
                title="ارسال مجدد"
              >
                <IoRefreshOutline size={18} />
              </button>
            )}
          </div>
        ) : (
          <div className="text-sm markdown-content break-words">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw, rehypeSanitize]}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage; 