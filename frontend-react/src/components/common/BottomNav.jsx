
import {
  UserRound,
  Gift,
  BookOpen,
  Headset,
  Users,
} from "lucide-react";

const bottomItems = [
  { label: "Me", icon: UserRound, page: "me" },
  { label: "Refer", icon: Users, page: "refer" },
  { label: "Rewards", icon: Gift, page: "rewards" },
  { label: "Learn & Earn", icon: BookOpen, page: "learn-earn" },
  { label: "About Us", icon: Headset, page: "about-us" },
];

function BottomNav({ activeTab, onNavigate }) {
  return (
    <nav className="indipay-bottom-nav" aria-label="Main navigation">
      {bottomItems.map((item) => {
        const Icon = item.icon;

        return (
          <button
            key={item.label}
            type="button"
            className={activeTab === item.label ? "active" : ""}
            onClick={() => onNavigate?.(item.page)}
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
