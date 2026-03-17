import { motion } from "framer-motion";
import type { Story } from "../types";

interface StoryBubbleProps {
  story: Story;
}

export function StoryBubble({ story }: StoryBubbleProps) {
  return (
    <motion.article
      whileHover={{ scale: 1.03 }}
      className={`story-bubble ${story.viewed ? "viewed" : "new"}`}
      title={story.mediaUrl}
    >
      <div className="story-avatar">{story.avatar}</div>
      <p>{story.name}</p>
      <small>{story.postedAt}</small>
    </motion.article>
  );
}
