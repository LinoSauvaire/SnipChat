import type { AppPage } from "../types";

interface BottomNavProps {
  currentPage: AppPage;
  onNavigate: (page: AppPage) => void;
}

const nav = [
  { page: "camera", label: "Camera", mark: "O" },
  { page: "stories", label: "Stories", mark: "S" },
  { page: "chats", label: "Messages", mark: "C" },
  { page: "friends", label: "Amis", mark: "F" },
  { page: "profile", label: "Profil", mark: "P" }
] as const;

export function BottomNav({ currentPage, onNavigate }: BottomNavProps) {
  return (
    <nav className="bottom-nav glass">
      {nav.map((item) => {
        const active = item.page === currentPage;
        return (
          <button
            key={item.page}
            type="button"
            className={`nav-item ${active ? "active" : ""}`}
            onClick={() => onNavigate(item.page)}
          >
            <span className="nav-mark">{item.mark}</span>
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
