
import { BookOpen, Gift, ShoppingBag, UserRound, Users } from "lucide-react";

const bottomItems = [
  { label: "Me", Icon: UserRound, page: "me" },
  { label: "Refer", Icon: Users, page: "refer" },
  { label: "Rewards", Icon: Gift, page: "rewards" },
  { label: "Learn & Earn", Icon: BookOpen, page: "learn-earn" },
  { label: "Superstore", Icon: ShoppingBag, page: "marketplace" },
];

function BottomNav({ activeTab, onNavigate }) {
  return (
    <nav className="indipay-bottom-nav" aria-label="Main navigation">
      {bottomItems.map((item) => {
        const isActive = activeTab === item.label;
        const Icon = item.Icon;

        return (
          <button
            key={item.label}
            type="button"
            className={isActive ? "active" : ""}
            aria-current={isActive ? "page" : undefined}
            onClick={() => onNavigate?.(item.page)}
          >
            <Icon size={21} strokeWidth={isActive ? 2.4 : 1.8} aria-hidden="true" />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

export default BottomNav;
