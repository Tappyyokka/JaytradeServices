
import { useState, useRef, useEffect } from "react";
import {
  Menu,
  Bell,
  UserRound,
  LogOut,
  Wallet as WalletIcon,
  History,
  Gift,
  ShoppingBag,
  PlusCircle,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  X,
  Info,
  ChevronRight,
} from "lucide-react";

import Jaytradelogo from "../assets/images/Jaytrade-logo.jpg";
import "./Wallet.css";

function Wallet({
  customer,
  walletBalance = 0,
  transactions = [],
  onBack,
  onOpenServices,
  onOpenAnnouncements,
  onLogin,
  onLogout,
  onOpenRewards,
  onOpenWalletHistory,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
const wheelLock = useRef(false);
const wheelTimer = useRef(null);

const handleWalletCardWheel = () => {
  if (wheelLock.current) return;

  wheelLock.current = true;
  setIsCardFlipped((previous) => !previous);

  wheelTimer.current = setTimeout(() => {
    wheelLock.current = false;
  }, 700);
};

useEffect(() => {
  return () => clearTimeout(wheelTimer.current);
}, []);
  const [profileOpen, setProfileOpen] = useState(false);
  const [showAddMoneyInfo, setShowAddMoneyInfo] = useState(false);
  const [showRewardsInfo, setShowRewardsInfo] = useState(false);
  const formatAmount = (amount) =>
    Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const handleUseBalance = () => {
    onOpenServices?.();
  };

  return (
    <div className="indipay-home indipay-wallet-page">

      {/* Header */}
      <header className="indipay-app-header">
        <button
          className="indipay-app-menu"
          type="button"
          aria-label="Open menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <Menu size={25} />
        </button>

        <div className="indipay-app-search">
          <span>Manage your Indipay Wallet</span>
          <span className="indipay-search-line" />
        </div>

        <button
          className="indipay-header-icon"
          type="button"
          aria-label="Notifications"
          onClick={onOpenAnnouncements}
        >
          <Bell size={21} />
        </button>

        <button
          className="indipay-header-icon"
          type="button"
          aria-label="My Profile"
          onClick={() => {
  if (customer) {
    setProfileOpen(true);
  } else {
    onLogin?.();
  }
}}
        >
          <UserRound size={22} />
        </button>
      </header>
      {menuOpen && (
  <div
    className="indipay-drawer-backdrop"
    onClick={() => setMenuOpen(false)}
  >
    <nav
      className="indipay-app-drawer"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="indipay-drawer-brand">
        <img src={Jaytradelogo} alt="Jaytrade Logo" />
      </div>

      <button onClick={() => {
        setMenuOpen(false);
        onBack?.();
      }}>
        <WalletIcon size={18} /> Home
      </button>

      <button onClick={() => {
        setMenuOpen(false);
        onOpenServices?.();
      }}>
        <ShoppingBag size={18} /> All Services
      </button>

      <button onClick={() => setMenuOpen(false)}>
        <WalletIcon size={18} /> My Wallet
      </button>

      <button onClick={() => {
        setMenuOpen(false);
        onOpenWalletHistory?.();
      }}>
        <History size={18} /> Wallet History
      </button>

      <button onClick={() => {
        setMenuOpen(false);
        onOpenAnnouncements?.();
      }}>
        <Bell size={18} /> Notifications
      </button>

      {customer ? (
        <button onClick={() => {
          setMenuOpen(false);
          setProfileOpen(true);
        }}>
          <UserRound size={18} /> My Profile
        </button>
      ) : (
        <button onClick={() => {
          setMenuOpen(false);
          onLogin?.();
        }}>
          <UserRound size={18} /> Login
        </button>
      )}

      {customer && (
        <button onClick={() => {
          setMenuOpen(false);
          onLogout?.();
        }}>
          <LogOut size={18} /> Logout
        </button>
      )}
    </nav>
  </div>
)}

      {/* Main */}
      <main className="indipay-wallet-main">

        <div className="wallet-page-heading">
          <div>
            <span>YOUR INDIPAY ACCOUNT</span>
            <h1>My Wallet</h1>
            <p>Your balance. Your rewards. More ways to benefit.</p>
          </div>
          <div className="wallet-heading-icon">
            <WalletIcon size={27} />
          </div>
        </div>

        
{/* Physical Wallet Card - Flip Interaction */}
<div
  className="wallet-card-scene"
  onClick={() => setIsCardFlipped((previous) => !previous)}
  onWheel={handleWalletCardWheel}
  role="button"
  tabIndex={0}
  aria-label="Tap or scroll to flip your Indipay wallet card"
  onKeyDown={(event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setIsCardFlipped((previous) => !previous);
    }
  }}
>
  <div className={`wallet-card-flipper ${isCardFlipped ? "flipped" : ""}`}>

    {/* FRONT SIDE */}
    <section className="wallet-card wallet-card-front">

      <div className="wallet-card-top">
        <div>
          <span className="wallet-card-eyebrow">
            INDIPAY REWARDS WALLET
          </span>
          <h2>INDIPAY</h2>
        </div>

        <img src={Jaytradelogo} alt="Jaytrade Logo" />
      </div>

      <div className="wallet-balance-area">
        <span>AVAILABLE BALANCE</span>
        <h1>₹ {formatAmount(walletBalance)}</h1>
      </div>

      <div className="wallet-card-divider" />

      <div className="wallet-card-bottom">
        <div>
          <span>ACCOUNT HOLDER</span>
          <strong>{customer?.name || "Indipay Customer"}</strong>
        </div>

        <div className="wallet-account-id">
          <span>INDIPAY ACCOUNT ID</span>
          <strong>{customer?.accountId || "Not available"}</strong>
        </div>
      </div>

      <div className="wallet-card-decoration" />
    </section>

    {/* BACK SIDE */}
    <section className="wallet-card wallet-card-back">
      <div className="wallet-back-decoration" />

      <img src={Jaytradelogo} alt="Jaytrade Logo" />

      <span className="wallet-back-eyebrow">
        THE INDIPAY MINDSET
      </span>

      <div className="wallet-quote">
        <span className="wallet-quote-mark">“</span>

        <h2>
          Great businesses are built by turning bold ideas into consistent action.
        </h2>

        <span className="wallet-quote-line" />
        <p>THINK BIG. BUILD BETTER.</p>
      </div>
    </section>

  </div>
</div>


        {/* Wallet Information */}
        <div className="wallet-benefit-strip">
          <Gift size={21} />
          <div>
            <strong>Earn rewards with every service</strong>
            <p>Get eligible cashback and use it on your next service.</p>
          </div>
          <button
            type="button"
            onClick={() => setShowRewardsInfo(true)}
            aria-label="Reward information"
          >
            <Info size={19} />
          </button>
        </div>

        {/* Wallet Actions */}
        <section className="wallet-actions-section">
          <div className="wallet-section-heading">
            <h2>Wallet Services</h2>
            <span>MANAGE YOUR BALANCE</span>
          </div>

          <div className="wallet-actions-grid">

            <button
              className="wallet-action-card"
              onClick={() => setShowAddMoneyInfo(true)}
            >
              <span className="wallet-action-icon orange">
                <PlusCircle size={23} />
              </span>
              <strong>Add Money</strong>
              <small>Company-managed credits</small>
              <ChevronRight size={17} />
            </button>

            <button
              className="wallet-action-card"
              onClick={onOpenWalletHistory}
            >
              <span className="wallet-action-icon navy">
                <History size={23} />
              </span>
              <strong>Wallet History</strong>
              <small>View all transactions</small>
              <ChevronRight size={17} />
            </button>

            <button
              className="wallet-action-card"
              onClick={handleUseBalance}
            >
              <span className="wallet-action-icon orange">
                <ShoppingBag size={23} />
              </span>
              <strong>Use Balance</strong>
              <small>Explore available services</small>
              <ChevronRight size={17} />
            </button>

            <button
  className="wallet-action-card"
  onClick={onOpenRewards}
>
              <span className="wallet-action-icon navy">
                <Gift size={23} />
              </span>
              <strong>My Rewards</strong>
              <small>Coupons, offers and cashback</small>
              <ChevronRight size={17} />
            </button>

          </div>
        </section>

        {/* Recent Transactions */}
        <section className="wallet-transactions-section">
          <div className="wallet-section-heading">
            <div>
              <h2>Recent Transactions</h2>
              <p>Your latest wallet activity</p>
            </div>

            <button
              onClick={onOpenWalletHistory}
              className="wallet-see-all"
            >
              View All <ArrowUpRight size={16} />
            </button>
          </div>

          {transactions.length > 0 ? (
            <div className="wallet-transaction-list">
              {transactions.slice(0, 5).map((transaction) => {
                const isCredit = transaction.type === "credit";

                return (
                  <div
                    className="wallet-transaction"
                    key={transaction.id}
                  >
                    <span className={`wallet-transaction-icon ${isCredit ? "credit" : "debit"}`}>
                      {isCredit ? (
                        <ArrowDownLeft size={20} />
                      ) : (
                        <ArrowUpRight size={20} />
                      )}
                    </span>

                    <div className="wallet-transaction-details">
                      <strong>{transaction.description}</strong>
                      <small>
                        {transaction.date}
                        {transaction.expiresAt
                          ? ` • Expires ${transaction.expiresAt}`
                          : ""}
                      </small>
                    </div>

                    <strong className={isCredit ? "credit-amount" : "debit-amount"}>
                      {isCredit ? "+" : "-"} ₹{formatAmount(transaction.amount)}
                    </strong>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="wallet-empty-state">
              <span>
                <History size={30} />
              </span>
              <strong>No transactions yet</strong>
              <p>Your wallet credits and service payments will appear here.</p>
            </div>
          )}
        </section>

        {/* Wallet Terms */}
        <div className="wallet-terms">
          <Clock size={19} />
          <p>
            Promotional rewards are valid for 6 months from their credit date.
            Wallet balance can be used only for eligible Indipay and Jaytrade
            services.
          </p>
        </div>

      </main>

      {/* Add Money Information Modal */}
      {showAddMoneyInfo && (
        <div
          className="wallet-info-overlay"
          onClick={() => setShowAddMoneyInfo(false)}
        >
          <div
            className="wallet-info-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="wallet-modal-close"
              onClick={() => setShowAddMoneyInfo(false)}
              aria-label="Close"
            >
              <X size={21} />
            </button>

            <span className="wallet-modal-icon">
              <PlusCircle size={27} />
            </span>

            <h2>Add Money to Wallet</h2>
            <p>
              Wallet credits are managed by the Indipay team.
              Contact our team to request a wallet credit or promotional
              balance.
            </p>

            <button
              className="wallet-modal-primary"
              onClick={() => setShowAddMoneyInfo(false)}
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Rewards Information Modal */}
      {showRewardsInfo && (
        <div
          className="wallet-info-overlay"
          onClick={() => setShowRewardsInfo(false)}
        >
          <div
            className="wallet-info-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="wallet-modal-close"
              onClick={() => setShowRewardsInfo(false)}
              aria-label="Close"
            >
              <X size={21} />
            </button>

            <span className="wallet-modal-icon">
              <Gift size={27} />
            </span>

            <h2>Indipay Rewards</h2>
            <p>
              Eligible customers can receive a one-time welcome reward
              of up to ₹1,000. Cashback can also be earned after
              successful service payments.
            </p>
            <p>
              Promotional rewards expire 6 months after they are credited.
              Use your eligible balance on your next service.
            </p>

            <button
              className="wallet-modal-primary"
              onClick={() => setShowRewardsInfo(false)}
            >
              Understood
            </button>
          </div>
        </div>
      )}
      {/* Wallet Profile Panel */}
{profileOpen && (
  <div
    className="wallet-profile-overlay"
    onClick={() => setProfileOpen(false)}
  >
    <section
      className="wallet-profile-panel"
      onClick={(event) => event.stopPropagation()}
    >
      <button
        className="wallet-profile-close"
        onClick={() => setProfileOpen(false)}
        aria-label="Close profile"
      >
        <X size={21} />
      </button>

      <span className="wallet-profile-icon">
        <UserRound size={27} />
      </span>

      <h2>{customer?.name || "Indipay Customer"}</h2>
      <p>Your Indipay Account</p>

      <div className="wallet-profile-details">
        <div>
          <span>Account ID</span>
          <strong>{customer?.accountId || "Not available"}</strong>
        </div>

        <div>
          <span>Email</span>
          <strong>{customer?.email || "Not available"}</strong>
        </div>

        <div>
          <span>Mobile</span>
          <strong>{customer?.phone || "Not available"}</strong>
        </div>
      </div>

      <button
        className="wallet-profile-logout"
        onClick={() => {
          setProfileOpen(false);
          onLogout?.();
        }}
      >
        <LogOut size={18} />
        Logout
      </button>
    </section>
  </div>
)}

    </div>
  );
}

export default Wallet;
