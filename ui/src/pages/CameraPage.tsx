import { motion } from "framer-motion";
import { CaptureButton } from "../components/CaptureButton";

interface CameraPageProps {
  onStoryCapture: () => void;
  onSendSnap: () => void;
}

export function CameraPage({ onStoryCapture, onSendSnap }: CameraPageProps) {
  return (
    <motion.section key="camera" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="page">
      <div className="camera-view glass">
        <div className="camera-glow" />
        <p>Mission Row - 19:24</p>
      </div>

      <section className="glass card">
        <h2>Capture moment</h2>
        <p>Create a story or send a snap to your active chat instantly.</p>
      </section>

      <div className="camera-actions">
        <button type="button" className="soft-btn" onClick={onStoryCapture}>
          Story
        </button>
        <CaptureButton onCapture={onSendSnap} />
        <button type="button" className="soft-btn" onClick={onSendSnap}>
          Chat
        </button>
      </div>
    </motion.section>
  );
}
