import React from 'react';
import { Chat } from '../../types';

interface ChatListProps {
  chats: Chat[];
  onChatSelect?: (chat: Chat) => void;
  selectedChatId?: string;
}

// Using _chats to indicate it's intentionally unused
const ChatList: React.FC<ChatListProps> = (_props) => {
  return (
    <div className="space-y-2">
      {/* Empty div to maintain layout */}
    </div>
  );
};

export default ChatList; 