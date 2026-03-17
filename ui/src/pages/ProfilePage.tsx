import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { AccountProfile, Friend, Story } from "../types";

interface ProfilePageProps {
  account: AccountProfile | null;
  friends: Friend[];
  stories: Story[];
  onCreateAccount: (username: string, displayName: string) => Promise<void>;
  onUpdateProfile: (displayName: string, bio: string) => Promise<void>;
}

export function ProfilePage({
  account,
  friends,
  stories,
  onCreateAccount,
  onUpdateProfile
}: ProfilePageProps) {
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState(account?.displayName ?? "");
  const [bio, setBio] = useState(account?.bio ?? "");

  useEffect(() => {
    setDisplayName(account?.displayName ?? "");
    setBio(account?.bio ?? "");
  }, [account]);

  return (
    <motion.section key="profile" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="page">
      <section className="glass card profile-head">
        <div className="profile-avatar">{account?.avatar ?? "SC"}</div>
        <div>
          <h2>{account?.displayName ?? "Compte SnipChat"}</h2>
          <p>{account ? `@${account.username}` : "Crée ton compte"}</p>
        </div>
      </section>

      <div className="stats-grid">
        <section className="glass card">
          <h3>{friends.length}</h3>
          <p>Amis</p>
        </section>
        <section className="glass card">
          <h3>{stories.length}</h3>
          <p>Stories</p>
        </section>
      </div>

      <section className="glass card">
        <h3>A propos</h3>
        <p>SnipChat est une messagerie visuelle sobre, rapide et axee sur le partage instantane.</p>
      </section>

      {!account ? (
        <form
          className="glass add-friend"
          onSubmit={async (event) => {
            event.preventDefault();
            if (!username.trim() || !displayName.trim()) return;
            await onCreateAccount(username.trim().replace(/^@/, ""), displayName.trim());
            setUsername("");
          }}
        >
          <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Nom affiché" />
          <input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="@pseudo" />
          <button type="submit">Créer</button>
        </form>
      ) : (
        <form
          className="glass add-friend"
          onSubmit={async (event) => {
            event.preventDefault();
            if (!displayName.trim()) return;
            await onUpdateProfile(displayName.trim(), bio.trim());
          }}
        >
          <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Nom affiché" />
          <input value={bio} onChange={(event) => setBio(event.target.value)} placeholder="Bio" maxLength={120} />
          <button type="submit">Sauvegarder</button>
        </form>
      )}
    </motion.section>
  );
}
