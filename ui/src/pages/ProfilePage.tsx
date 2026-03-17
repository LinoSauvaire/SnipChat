import { motion } from "framer-motion";
import type { Friend, Story } from "../types";

interface ProfilePageProps {
  friends: Friend[];
  stories: Story[];
}

export function ProfilePage({ friends, stories }: ProfilePageProps) {
  return (
    <motion.section key="profile" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="page">
      <section className="glass card profile-head">
        <div className="profile-avatar">SC</div>
        <div>
          <h2>Operateur Snip</h2>
          <p>@snipchat_me</p>
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
    </motion.section>
  );
}
