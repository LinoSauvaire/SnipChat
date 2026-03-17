import { motion } from "framer-motion";
import { PaperAirplaneIcon, PlusCircleIcon } from "@heroicons/react/24/outline";
import { CaptureButton } from "../components/CaptureButton";

interface CameraPageProps {
  onStoryCapture: () => void;
  onSendSnap: () => void;
}

export function CameraPage({ onStoryCapture, onSendSnap }: CameraPageProps) {
  return (
    <motion.section key="camera" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="page camera-page">
      <div className="camera-view glass camera-main">
        <div className="camera-glow" />
        <div className="camera-meta">
          <p>Mission Row - 19:24</p>
        </div>

        <div className="camera-actions camera-actions-overlay">
          <button type="button" className="soft-btn soft-btn-icon" onClick={onStoryCapture} aria-label="Publier en story">
            <PlusCircleIcon />
            <span>Story</span>
          </button>

          <CaptureButton className="capture-main" onCapture={onSendSnap} />

          <button type="button" className="soft-btn soft-btn-icon" onClick={onSendSnap} aria-label="Envoyer un snap">
            <PaperAirplaneIcon />
            <span>Envoyer</span>
          </button>
        </div>
      </div>
    </motion.section>
  );
}
