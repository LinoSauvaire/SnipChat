import type { Friend } from "../types";

interface FriendRowProps {
  friend: Friend;
  rightSlot?: string;
}

export function FriendRow({ friend, rightSlot }: FriendRowProps) {
  return (
    <article className="friend-row glass">
      <div className="friend-avatar">{friend.avatar}</div>
      <div>
        <h3>{friend.name}</h3>
        <p>@{friend.username}</p>
      </div>
      <div className="friend-meta">
        <span className={`presence ${friend.isOnline ? "online" : "offline"}`} />
        <small>{rightSlot ?? `${friend.streak} day streak`}</small>
      </div>
    </article>
  );
}
