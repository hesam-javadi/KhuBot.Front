import React, { useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import hljs from "highlight.js";
import { IoRefreshOutline } from "react-icons/io5";
import { ChatMessage as ChatMessageType } from "../../types";

interface ChatMessageProps {
  message: ChatMessageType;
  onRetry?: (messageId: string) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, onRetry }) => {
  const isUser = message.isUser;
  const hasError = message.hasError || false;

  useEffect(() => {
    document.querySelectorAll("pre code").forEach((block) => {
      hljs.highlightElement(block as HTMLElement);
    });
  }, [message.content]);

  const formatUserMessage = (content: string) =>
    content.split("\n").map((line, i, arr) => (
      <React.Fragment key={i}>
        {line}
        {i < arr.length - 1 && <br />}
      </React.Fragment>
    ));

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
      <div
        className={`
          max-w-[85%] sm:max-w-[70%] px-4 py-2.5 text-sm
          ${
            isUser
              ? hasError
                ? "bg-gradient-to-br from-red-500 to-red-600 text-white rounded-2xl rounded-br-sm shadow-md shadow-red-200"
                : "bg-gradient-to-br from-indigo-500 to-blue-500 text-white rounded-2xl rounded-br-sm shadow-md shadow-indigo-200"
              : "bg-white text-gray-800 rounded-2xl rounded-bl-sm shadow-md shadow-gray-200/80 ring-1 ring-gray-100"
          }
        `}
      >
        {isUser ? (
          <div className="flex items-start gap-2">
            <p className="break-words whitespace-pre-line leading-relaxed">
              {formatUserMessage(message.content)}
            </p>
            {hasError && onRetry && (
              <button
                onClick={() => onRetry(message.id)}
                className="mt-0.5 p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex-shrink-0"
                title="ارسال مجدد"
              >
                <IoRefreshOutline size={16} />
              </button>
            )}
          </div>
        ) : (
          <div className="markdown-content break-words leading-relaxed">
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
