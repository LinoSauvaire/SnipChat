import { motion } from "framer-motion";
import type { Story } from "../types";
import { StoryBubble } from "../components/StoryBubble";

interface StoriesPageProps {
  stories: Story[];
}

export function StoriesPage({ stories }: StoriesPageProps) {
  return (
    <motion.section key="stories" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="page">
      <h2 className="section-title">Story Circle</h2>
      <div className="stories-grid">
        {stories.map((story) => (
          <StoryBubble key={story.id} story={story} />
        ))}
      </div>
    </motion.section>
  );
}
