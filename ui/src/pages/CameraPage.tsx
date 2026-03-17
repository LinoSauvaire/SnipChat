import { motion } from "framer-motion";
import { PaperAirplaneIcon, PlusCircleIcon } from "@heroicons/react/24/outline";
import { CaptureButton } from "../components/CaptureButton";

interface CameraPageProps {
  onStoryCapture: (mediaUrl: string) => void;
  onSendSnap: (mediaUrl: string) => void;
}

export function CameraPage({ onStoryCapture, onSendSnap }: CameraPageProps) {
  const openCamera = (onCaptured: (mediaUrl: string) => void) => {
    useCamera(
      (url) => {
        onCaptured(url);
      },
      {
        default: {
          type: "Photo",
          flash: false,
          camera: "rear"
        },
        permissions: {
          toggleFlash: true,
          flipCamera: true,
          takePhoto: true
        }
      }
    );
  };

  return (
    <motion.section key="camera" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="page camera-page">
      <div className="camera-view glass camera-main">
        <div className="camera-glow" />
        <div className="camera-meta">
          <p>Mission Row - 19:24</p>
        </div>

        <div className="camera-actions camera-actions-overlay">
          <button
            type="button"
            className="soft-btn soft-btn-icon"
            onClick={() => openCamera(onStoryCapture)}
            aria-label="Publier en story"
          >
            <PlusCircleIcon />
            <span>Story</span>
          </button>

          <CaptureButton className="capture-main" onCapture={() => openCamera(onSendSnap)} />

          <button
            type="button"
            className="soft-btn soft-btn-icon"
            onClick={() => openCamera(onSendSnap)}
            aria-label="Envoyer un snap"
          >
            <PaperAirplaneIcon />
            <span>Envoyer</span>
          </button>
        </div>
      </div>
    </motion.section>
  );
}
