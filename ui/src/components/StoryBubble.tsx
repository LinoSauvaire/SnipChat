import { motion } from "framer-motion";
import type { Story } from "../types";

interface StoryBubbleProps {
  story: Story;
}

export function StoryBubble({ story }: StoryBubbleProps) {
  return (
    <motion.article whileHover={{ scale: 1.03 }} className={`story ${story.viewed ? "seen" : "fresh"}`}>
      <div className="story-avatar">{story.avatar}</div>
      <p>{story.name}</p>
      <small>{story.postedAt}</small>
    </motion.article>
  );
}
