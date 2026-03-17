import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { AccountProfile, Friend, Story } from "../types";

interface ProfilePageProps {
  account: AccountProfile | null;
  friends: Friend[];
  stories: Story[];
  onCreateAccount: (username: string, displayName: string, password: string) => Promise<void>;
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
  const [password, setPassword] = useState("");
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

      {!account ? (
        <section className="glass card">
          <h3>Creer un compte</h3>
          <p>Choisis un nom utilisateur et un mot de passe pour commencer.</p>
          <form
            className="add-friend"
            onSubmit={async (event) => {
              event.preventDefault();
              if (!username.trim() || !displayName.trim() || password.length < 4) return;
              await onCreateAccount(username.trim().replace(/^@/, ""), displayName.trim(), password);
              setUsername("");
              setPassword("");
            }}
          >
            <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Nom affiché" />
            <input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Nom utilisateur" />
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Mot de passe (4 caracteres min)"
              minLength={4}
            />
            <button type="submit">Créer le compte</button>
          </form>
        </section>
      ) : (
        <>
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
        </>
      )}
    </motion.section>
  );
}
