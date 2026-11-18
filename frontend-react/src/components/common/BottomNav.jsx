
import UseAnimations from "react-useanimations";

import user from "react-useanimations/lib/user";
import users from "react-useanimations/lib/users";
import gift from "react-useanimations/lib/gift";
import bookOpen from "react-useanimations/lib/bookOpen";
import headphones from "react-useanimations/lib/headphones";

const bottomItems = [
  { label: "Me", icon: user, page: "me" },
  { label: "Refer", icon: users, page: "refer" },
  { label: "Rewards", icon: gift, page: "rewards" },
  { label: "Learn & Earn", icon: bookOpen, page: "learn-earn" },
  { label: "About Us", icon: headphones, page: "about-us" },
];

function BottomNav({ activeTab, onNavigate }) {
  return (
    <nav className="indipay-bottom-nav" aria-label="Main navigation">
      {bottomItems.map((item) => {
        const isActive = activeTab === item.label;

        return (
          <button
            key={item.label}
            type="button"
            className={isActive ? "active" : ""}
            onClick={() => onNavigate?.(item.page)}
          >
            <UseAnimations
              animation={item.icon}
              size={25}
              strokeColor="currentColor"
              speed={1}
            />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

export default BottomNav;
