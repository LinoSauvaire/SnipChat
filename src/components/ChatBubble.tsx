import type { Message } from "../types";

interface ChatBubbleProps {
  message: Message;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  return (
    <div className={`chat-bubble ${message.mine ? "mine" : "their"}`}>
      <p>{message.content}</p>
      <small>
        {message.type === "snap" ? "Snap" : "Text"} · {message.createdAt}
      </small>
    </div>
  );
}
