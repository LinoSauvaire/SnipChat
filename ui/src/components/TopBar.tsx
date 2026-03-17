interface TopBarProps {
  title: string;
  subtitle: string;
}

export function TopBar({ title, subtitle }: TopBarProps) {
  return (
    <header className="top-bar glass">
      <div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      <span className="status-badge">EN LIGNE</span>
    </header>
  );
}
