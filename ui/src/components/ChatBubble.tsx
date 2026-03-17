import type { Message } from "../types";

interface ChatBubbleProps {
  message: Message;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  return (
    <div className={`chat-bubble ${message.mine ? "mine" : "theirs"}`}>
      <p>{message.content}</p>
      <small>
        {message.type === "snap" ? "SNAP" : "TEXTE"} - {message.createdAt}
      </small>
    </div>
  );
}
