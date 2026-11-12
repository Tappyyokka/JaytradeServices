
import {
  UserRound,
  Users,
  Gift,
  BookOpen,
  Headset,
} from "lucide-react";

function BottomNav({ activeTab, onNavigate }) {
  const bottomItems = [
    { label: "Me", icon: UserRound },
    { label: "My Customers", icon: Users },
    { label: "Rewards", icon: Gift },
    { label: "Learn & Earn", icon: BookOpen },
    { label: "About Us", icon: Headset },
  ];

  return (
    <nav className="indipay-bottom-nav" aria-label="Main navigation">
      {bottomItems.map((item) => {
        const Icon = item.icon;

        return (
          <button
            key={item.label}
            className={activeTab === item.label ? "active" : ""}
            onClick={() => onNavigate?.(item.label)}
          >
            <Icon size={20} strokeWidth={1.9} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

export default BottomNav;
