interface CaptureButtonProps {
  onCapture: () => void;
  className?: string;
}

export function CaptureButton({ onCapture, className = "" }: CaptureButtonProps) {
  return (
    <button
      type="button"
      className={`capture-button ${className}`.trim()}
      onClick={onCapture}
      aria-label="Capture"
    >
      <span />
    </button>
  );
}
