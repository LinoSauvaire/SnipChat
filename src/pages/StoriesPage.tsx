import { motion } from "framer-motion";
import { StoryBubble } from "../components/StoryBubble";
import type { Story } from "../types";

interface StoriesPageProps {
  stories: Story[];
}

export function StoriesPage({ stories }: StoriesPageProps) {
  return (
    <motion.section
      key="stories"
      initial={{ opacity: 0, x: 14 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25 }}
      className="page stories-page"
    >
      <h2 className="section-title">Story Circle</h2>
      <div className="stories-grid">
        {stories.map((story) => (
          <StoryBubble key={story.id} story={story} />
        ))}
      </div>
    </motion.section>
  );
}
