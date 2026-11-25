
import UseAnimations from "react-useanimations";
import { ShoppingBag } from "lucide-react";

import user from "react-useanimations/lib/user";
import users from "react-useanimations/lib/users";
import gift from "react-useanimations/lib/gift";
import bookOpen from "react-useanimations/lib/bookOpen";

const bottomItems = [
  { label: "Me", icon: user, page: "me" },
  { label: "Refer", icon: users, page: "refer" },
  { label: "Rewards", icon: gift, page: "rewards" },
  { label: "Learn & Earn", icon: bookOpen, page: "learn-earn" },
  { label: "Marketplace", Icon: ShoppingBag, page: "marketplace" },
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
            {Icon ? (
              <Icon size={25} aria-hidden="true" />
            ) : (
              <UseAnimations
                animation={item.icon}
                size={25}
                strokeColor="currentColor"
                speed={1}
              />
            )}
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

export default BottomNav;
