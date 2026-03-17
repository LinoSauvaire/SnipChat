import { useState } from "react";
import { motion } from "framer-motion";
import type { Friend } from "../types";
import { FriendRow } from "../components/FriendRow";

interface FriendsPageProps {
  friends: Friend[];
  onAddFriend: (username: string) => Promise<void>;
}

export function FriendsPage({ friends, onAddFriend }: FriendsPageProps) {
  const [username, setUsername] = useState("");

  return (
    <motion.section key="friends" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="page">
      <h2 className="section-title">Amis</h2>

      <form
        className="glass add-friend add-friend-single"
        onSubmit={(event) => {
          event.preventDefault();
          if (!username.trim()) return;
          onAddFriend(username.trim().replace(/^@/, ""));
          setUsername("");
        }}
      >
        <input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="@pseudo" />
        <button type="submit">Ajouter</button>
      </form>

      <div className="friends-list">
        {friends.map((friend) => (
          <FriendRow key={friend.id} friend={friend} />
        ))}
      </div>
    </motion.section>
  );
}
