import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { Conversation, Friend, Message } from "../types";
import { FriendRow } from "../components/FriendRow";
import { ChatBubble } from "../components/ChatBubble";

interface ChatPageProps {
  activeChatId: string | null;
  conversations: Conversation[];
  friends: Friend[];
  messages: Message[];
  onOpenChat: (chatId: string) => void;
  onSendMessage: (chatId: string, text: string) => void;
}

export function ChatPage({
  activeChatId,
  conversations,
  friends,
  messages,
  onOpenChat,
  onSendMessage
}: ChatPageProps) {
  const [draft, setDraft] = useState("");

  const friendMap = useMemo(() => new Map(friends.map((friend) => [friend.id, friend])), [friends]);

  return (
    <motion.section key="chats" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="page">
      <h2 className="section-title">Pulse Chats</h2>

      <div className="chat-list">
        {conversations.map((conversation) => {
          const friend = friendMap.get(conversation.friendId);
          if (!friend) return null;

          return (
            <button
              key={conversation.id}
              type="button"
              className={`conversation ${activeChatId === conversation.id ? "active" : ""}`}
              onClick={() => onOpenChat(conversation.id)}
            >
              <FriendRow friend={friend} tailText={conversation.updatedAt} />
            </button>
          );
        })}
      </div>

      <section className="glass thread">
        <div className="messages">
          {messages.map((message) => (
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
            placeholder="Type a message"
            maxLength={120}
          />
          <button type="submit">Send</button>
        </form>
      </section>
    </motion.section>
  );
}
