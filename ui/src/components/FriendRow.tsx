import type { Friend } from "../types";

interface FriendRowProps {
  friend: Friend;
  tailText?: string;
}

export function FriendRow({ friend, tailText }: FriendRowProps) {
  return (
    <article className="friend-row glass">
      <div className="friend-avatar">{friend.avatar}</div>
      <div>
        <h3>{friend.name}</h3>
        <p>@{friend.username}</p>
      </div>
      <div className="friend-side">
        <span className={`dot ${friend.isOnline ? "online" : "offline"}`} />
        <small>{tailText ?? `${friend.streak} jours de serie`}</small>
      </div>
    </article>
  );
}
