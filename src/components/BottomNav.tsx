import type { AppPage } from "../types";

interface BottomNavProps {
  currentPage: AppPage;
  onNavigate: (page: AppPage) => void;
}

const navItems: Array<{ page: AppPage; label: string; icon: string }> = [
  { page: "camera", label: "Camera", icon: "O" },
  { page: "stories", label: "Stories", icon: "S" },
  { page: "chats", label: "Chats", icon: "C" },
  { page: "friends", label: "Friends", icon: "F" },
  { page: "profile", label: "Profile", icon: "P" }
];

export function BottomNav({ currentPage, onNavigate }: BottomNavProps) {
  return (
    <nav className="bottom-nav glass">
      {navItems.map((item) => {
        const active = item.page === currentPage;
        return (
          <button
            key={item.page}
            type="button"
            className={`nav-item ${active ? "active" : ""}`}
            onClick={() => onNavigate(item.page)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
