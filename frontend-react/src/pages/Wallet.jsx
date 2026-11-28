
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
  Eye,
  EyeOff,
} from "lucide-react";

import Jaytradelogo from "../assets/images/Jaytrade-logo.jpg";
import { formatPaise } from "../wallet/walletData";
import IndipayWalletActivity from "./IndipayWalletActivity";
import { LoadingSkeleton } from "../components/common/Feedback";
import CustomerPanel from "../components/common/CustomerPanel";
import "./Wallet.css";

function Wallet({
  customer,
  identity,
  onOpenMerchantPlans,
  onOpenMyStore,
  wallet,
  walletLoading,
  walletError,
  creditRequests,
  onBack,
  onOpenServices,
  onOpenAnnouncements,
  onLogin,
  onLogout,
  onOpenRewards,
  onOpenWalletHistory,
  onView,
  view = "overview",
  onAddMoney,
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
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [showAddMoneyInfo, setShowAddMoneyInfo] = useState(false);
  const [showRewardsInfo, setShowRewardsInfo] = useState(false);
  const transactions = wallet?.transactions ?? [];
  const balance = wallet?.totalPaise ?? wallet?.availablePaise;

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
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <Menu size={25} />
        </button>

        <div className="indipay-wallet-header-title">
  <span>Indipay Wallet</span>
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
    <CustomerPanel
      className="indipay-app-drawer"
      label="Wallet menu"
      onClose={() => setMenuOpen(false)}
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
    </CustomerPanel>
  </div>
)}

      {/* Main */}
      <main className="indipay-wallet-main" data-view={view}>

        <div className="wallet-page-heading">
          <div>
            <span>YOUR INDIPAY ACCOUNT</span>
            <h1>My Wallet</h1>
            <p>Your Customer Money and complete account activity.</p>
          </div>
          <div className="wallet-heading-controls">
            <button type="button" onClick={() => setBalanceVisible((visible) => !visible)}
              aria-label={balanceVisible ? "Hide wallet balance" : "Show wallet balance"}>
              {balanceVisible ? <EyeOff size={21} /> : <Eye size={21} />}
            </button>
            <span className="wallet-heading-icon"><WalletIcon size={27} /></span>
          </div>
        </div>
        {walletError && <p role="alert" className="wallet-load-error">Wallet activity could not be refreshed. {walletError}</p>}

        
        <div className="wallet-workspace">
        <div className="wallet-summary">
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
            INDIPAY CUSTOMER MONEY
          </span>
          <h2>INDIPAY</h2>
        </div>

        <img src={Jaytradelogo} alt="Jaytrade Logo" />
      </div>

      <div className="wallet-balance-area">
        <span>AVAILABLE CUSTOMER MONEY</span>
        <h1>{walletLoading ? "Loading…" : balanceVisible ? formatPaise(balance) : "₹ ••••••"}</h1>
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

        </div>
        <div className="wallet-workspace-content">
        <nav className="indipay-wallet-tabs" aria-label="Indipay wallet sections">
          {[["overview", "Overview"], ["history", "History"], ["statements", "Statements"]].map(([tab, label]) =>
            <button key={tab} type="button" aria-current={view === tab ? "page" : undefined} onClick={() => onView(tab)}>{label}</button>)}
        </nav>

        {view === "overview" && <>
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
              onClick={onAddMoney ?? (() => setShowAddMoneyInfo(true))}
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
                const isCredit = transaction.direction === "credit";

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
                        {new Date(transaction.timestamp).toLocaleDateString("en-IN")}
                        {transaction.status !== "completed" && ` · ${transaction.status}`}
                      </small>
                    </div>

                    <strong className={isCredit ? "credit-amount" : "debit-amount"}>
                      {isCredit ? "+" : "−"}{formatPaise(transaction.amountPaise)}
                    </strong>
                  </div>
                );
              })}
            </div>
          ) : walletLoading ? <LoadingSkeleton lines={3} /> : (
            <div className="wallet-empty-state">
              <span>
                <History size={30} />
              </span>
              <strong>No transactions to display</strong>
              <p>Indipay activity will appear here after a confirmed transaction.</p>
            </div>
          )}
        </section>

        {/* Wallet Terms */}
        <div className="wallet-terms">
          <Clock size={19} />
          <p>
            Customer Money can be used for eligible Indipay services and Super Store purchases.
            Pending wallet credits become available after verification.
          </p>
        </div>
        </>}

        <IndipayWalletActivity wallet={wallet ?? { transactions: [], availablePaise: null, partial: false }}
          view={view} creditRequests={creditRequests ?? (walletLoading ? null : [])} onAddMoney={onAddMoney} />
        </div>
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
    <CustomerPanel
      className="wallet-profile-panel"
      label="Wallet profile"
      onClose={() => setProfileOpen(false)}
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
      <p>{identity?.label ?? "Customer Account"}</p>

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
        {identity?.accountType === "merchant" && identity.storeName && <div><span>Store</span><strong>{identity.storeName}</strong></div>}
        {identity?.planName && <div><span>Merchant plan</span><strong>{identity.planName} demo plan</strong></div>}
      </div>

      {(identity?.canUpgrade || (identity?.accountType === "merchant" && (identity.canManageDemo || identity.canManageLive))) && (
        <button className="wallet-profile-merchant" type="button" onClick={() => {
          setProfileOpen(false);
          if (identity.canUpgrade) onOpenMerchantPlans();
          else onOpenMyStore();
        }}>
          <ShoppingBag size={18} /> {identity.canUpgrade ? "Become a Merchant" : "My Store"}
        </button>
      )}

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
    </CustomerPanel>
  </div>
)}

    </div>
  );
}

export default Wallet;
