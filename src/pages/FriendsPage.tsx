import { useState } from "react";
import { motion } from "framer-motion";
import { FriendRow } from "../components/FriendRow";
import type { Friend } from "../types";

interface FriendsPageProps {
  friends: Friend[];
  onAddFriend: (name: string, username: string) => void;
}

export function FriendsPage({ friends, onAddFriend }: FriendsPageProps) {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");

  return (
    <motion.section
      key="friends"
      initial={{ opacity: 0, x: 14 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25 }}
      className="page friends-page"
    >
      <h2 className="section-title">Friends Hub</h2>

      <form
        className="add-friend glass"
        onSubmit={(event) => {
          event.preventDefault();
          if (!name.trim() || !username.trim()) return;
          onAddFriend(name.trim(), username.trim().replace(/^@/, ""));
          setName("");
          setUsername("");
        }}
      >
        <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Friend name" />
        <input
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          placeholder="@username"
        />
        <button type="submit">Add friend</button>
      </form>

      <div className="friends-list">
        {friends.map((friend) => (
          <FriendRow key={friend.id} friend={friend} />
        ))}
      </div>
    </motion.section>
  );
}
