import { useState } from "react";
import { motion } from "framer-motion";
import type { Friend, FriendRequest, SearchUser } from "../types";
import { FriendRow } from "../components/FriendRow";

interface FriendsPageProps {
  friends: Friend[];
  friendRequests: FriendRequest[];
  searchUsers: SearchUser[];
  searchPage: number;
  searchTotalPages: number;
  onSearch: (query: string, page: number) => Promise<void>;
  onSendFriendRequest: (username: string) => Promise<void>;
  onRespondRequest: (requestId: string, accept: boolean) => Promise<void>;
}

export function FriendsPage({
  friends,
  friendRequests,
  searchUsers,
  searchPage,
  searchTotalPages,
  onSearch,
  onSendFriendRequest,
  onRespondRequest
}: FriendsPageProps) {
  const [username, setUsername] = useState("");
  const [search, setSearch] = useState("");

  return (
    <motion.section key="friends" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="page">
      <h2 className="section-title">Amis</h2>

      <form
        className="glass add-friend add-friend-single"
        onSubmit={async (event) => {
          event.preventDefault();
          if (!username.trim()) return;
          await onSendFriendRequest(username.trim().replace(/^@/, ""));
          setUsername("");
        }}
      >
        <input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="@pseudo" />
        <button type="submit">Demander</button>
      </form>

      <form
        className="glass add-friend add-friend-single"
        onSubmit={async (event) => {
          event.preventDefault();
          await onSearch(search, 1);
        }}
      >
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher un utilisateur" />
        <button type="submit">Chercher</button>
      </form>

      {searchUsers.length > 0 && (
        <section className="friends-list">
          {searchUsers.map((user) => (
            <article key={user.id} className="friend-row glass">
              <div className="friend-avatar">{user.avatar}</div>
              <div>
                <h3>{user.displayName}</h3>
                <p>@{user.username}</p>
              </div>
              <div className="friend-side">
                <button
                  type="button"
                  className="mini-action"
                  disabled={user.isFriend || user.hasPending}
                  onClick={() => onSendFriendRequest(user.username)}
                >
                  {user.isFriend ? "Ami" : user.hasPending ? "En attente" : "Ajouter"}
                </button>
              </div>
            </article>
          ))}
          <div className="requests-actions">
            <button type="button" className="mini-action" disabled={searchPage <= 1} onClick={() => onSearch(search, searchPage - 1)}>
              Prec.
            </button>
            <small>
              Page {searchPage}/{searchTotalPages}
            </small>
            <button
              type="button"
              className="mini-action"
              disabled={searchPage >= searchTotalPages}
              onClick={() => onSearch(search, searchPage + 1)}
            >
              Suiv.
            </button>
          </div>
        </section>
      )}

      {friendRequests.length > 0 && (
        <section className="friends-list">
          <h3 className="section-title">Demandes recues</h3>
          {friendRequests.map((request) => (
            <article key={request.id} className="friend-row glass">
              <div className="friend-avatar">{request.from.avatar}</div>
              <div>
                <h3>{request.from.name}</h3>
                <p>@{request.from.username}</p>
              </div>
              <div className="requests-actions">
                <button type="button" className="mini-action" onClick={() => onRespondRequest(request.id, true)}>
                  Accepter
                </button>
                <button type="button" className="mini-action danger" onClick={() => onRespondRequest(request.id, false)}>
                  Refuser
                </button>
              </div>
            </article>
          ))}
        </section>
      )}

      <div className="friends-list">
        {friends.map((friend) => (
          <FriendRow key={friend.id} friend={friend} />
        ))}
      </div>
    </motion.section>
  );
}
