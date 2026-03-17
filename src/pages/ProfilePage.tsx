import { motion } from "framer-motion";
import { GlassCard } from "../components/GlassCard";
import type { Friend, Story } from "../types";

interface ProfilePageProps {
  friends: Friend[];
  stories: Story[];
}

export function ProfilePage({ friends, stories }: ProfilePageProps) {
  return (
    <motion.section
      key="profile"
      initial={{ opacity: 0, x: 14 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25 }}
      className="page profile-page"
    >
      <GlassCard className="profile-header">
        <div className="profile-avatar">SC</div>
        <div>
          <h2>Snip Operator</h2>
          <p>@snipchat_me</p>
        </div>
      </GlassCard>

      <div className="stats-grid">
        <GlassCard>
          <h3>{friends.length}</h3>
          <p>Friends</p>
        </GlassCard>
        <GlassCard>
          <h3>{stories.length}</h3>
          <p>Total stories</p>
        </GlassCard>
      </div>

      <GlassCard>
        <h3>About</h3>
        <p>
          SnipChat is a fast visual messenger for city crews. Capture moments, run streaks, and keep your
          circle updated in real time.
        </p>
      </GlassCard>
    </motion.section>
  );
}
