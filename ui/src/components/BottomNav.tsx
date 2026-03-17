import type { AppPage } from "../types";
import {
  CameraIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  UserCircleIcon,
  SparklesIcon
} from "@heroicons/react/24/outline";

interface BottomNavProps {
  currentPage: AppPage;
  onNavigate: (page: AppPage) => void;
}

const nav = [
  { page: "camera", label: "Camera", Icon: CameraIcon },
  { page: "stories", label: "Stories", Icon: SparklesIcon },
  { page: "chats", label: "Messages", Icon: ChatBubbleLeftRightIcon },
  { page: "friends", label: "Amis", Icon: UserGroupIcon },
  { page: "profile", label: "Profil", Icon: UserCircleIcon }
] as const;

export function BottomNav({ currentPage, onNavigate }: BottomNavProps) {
  return (
    <nav className="bottom-nav glass">
      {nav.map((item) => {
        const active = item.page === currentPage;
        const Icon = item.Icon;
        return (
          <button
            key={item.page}
            type="button"
            className={`nav-item ${active ? "active" : ""}`}
            onClick={() => onNavigate(item.page)}
          >
            <span className="nav-mark" aria-hidden="true">
              <Icon />
            </span>
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
