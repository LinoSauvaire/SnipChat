import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ChatBubble } from "../components/ChatBubble";
import { FriendRow } from "../components/FriendRow";
import type { Conversation, Friend, Message } from "../types";

interface ChatPageProps {
  activeChatId: string | null;
  friends: Friend[];
  conversations: Conversation[];
  messages: Message[];
  onSelectChat: (chatId: string) => void;
  onSendMessage: (chatId: string, content: string) => void;
}

export function ChatPage({
  activeChatId,
  friends,
  conversations,
  messages,
  onSelectChat,
  onSendMessage
}: ChatPageProps) {
  const [draft, setDraft] = useState("");

  const friendById = useMemo(() => {
    return new Map(friends.map((friend) => [friend.id, friend]));
  }, [friends]);

  const activeMessages = messages.filter((message) => message.chatId === activeChatId);

  return (
    <motion.section
      key="chats"
      initial={{ opacity: 0, x: 14 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25 }}
      className="page chat-page"
    >
      <h2 className="section-title">Pulse Chats</h2>

      <div className="chat-layout">
        <aside className="chat-list">
          {conversations.map((conversation) => {
            const friend = friendById.get(conversation.friendId);
            if (!friend) return null;

            return (
              <button
                key={conversation.id}
                type="button"
                className={`conversation ${activeChatId === conversation.id ? "active" : ""}`}
                onClick={() => onSelectChat(conversation.id)}
              >
                <FriendRow friend={friend} rightSlot={conversation.updatedAt} />
              </button>
            );
          })}
        </aside>

        <div className="chat-thread glass">
          <div className="messages">
            {activeMessages.map((message) => (
              <ChatBubble key={message.id} message={message} />
            ))}
          </div>

          <form
            className="composer"
            onSubmit={(event) => {
              event.preventDefault();
              if (!activeChatId) return;
              onSendMessage(activeChatId, draft);
              setDraft("");
            }}
          >
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Type a message..."
              maxLength={120}
            />
            <button type="submit">Send</button>
          </form>
        </div>
      </div>
    </motion.section>
  );
}
