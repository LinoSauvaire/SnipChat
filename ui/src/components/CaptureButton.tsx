interface CaptureButtonProps {
  onCapture: () => void;
}

export function CaptureButton({ onCapture }: CaptureButtonProps) {
  return (
    <button type="button" className="capture-button" onClick={onCapture} aria-label="Capture">
      <span />
    </button>
  );
}
