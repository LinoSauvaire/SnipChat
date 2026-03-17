import { motion } from "framer-motion";
import { CaptureButton } from "../components/CaptureButton";
import { GlassCard } from "../components/GlassCard";

interface CameraPageProps {
  onCaptureStory: () => void;
  onSendSnap: () => void;
}

export function CameraPage({ onCaptureStory, onSendSnap }: CameraPageProps) {
  return (
    <motion.section
      key="camera"
      initial={{ opacity: 0, x: 14 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25 }}
      className="page camera-page"
    >
      <div className="camera-viewport glass">
        <div className="camera-overlay" />
        <p>Downtown Vinewood · 19:24</p>
      </div>

      <GlassCard>
        <h2>Ready to snap</h2>
        <p>Take a photo and instantly publish to your story or send to your active chat.</p>
      </GlassCard>

      <div className="camera-actions">
        <button type="button" className="soft-btn" onClick={onCaptureStory}>
          Send to story
        </button>
        <CaptureButton onCapture={onSendSnap} />
        <button type="button" className="soft-btn" onClick={onSendSnap}>
          Send to chat
        </button>
      </div>
    </motion.section>
  );
}
