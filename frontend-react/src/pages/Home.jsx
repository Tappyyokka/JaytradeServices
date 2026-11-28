import { useState, useEffect } from "react";
import PublishedAdminContent from "./PublishedAdminContent";
import CustomerPanel from "../components/common/CustomerPanel";
import indipayLogo from "../assets/images/logo-transparent2.png";
import jaytradeLogo from "../assets/images/Jaytrade-logo.jpg";
import {
  ArrowRight, ArrowUpRight, Bell, BriefcaseBusiness, Check, ChevronRight, ChevronLeft, ClipboardList,
  Copy, CreditCard, Eye, EyeOff, FileText, Gift, Headset, Home as HomeIcon, Info,
  LogOut, Menu, MessageCircle, Moon, Palmtree, Phone, Receipt, Search,
  Shield, ShoppingBag, Sun, TrendingUp, UserRound, Users, Wallet, X,
} from "lucide-react";
import { selectCatalogService, serviceCatalog } from "./serviceCatalog";
import { formatPaise } from "../wallet/walletData";
import "./Home.css";

const homePromo = {
  title: "Have a business idea?",
  description: "Explore Jaytrade’s Business Associate and franchise services.",
  button: "View business services",
};

const homeDemo = { rewardsPoints: "0 demo points" };
const helpPhone = "+910000000000";

const featuredNames = [
  "Housing Loan", "GST Registration", "Mudra Loan",
  "Business Associate", "Udyog Registration", "Growup Package",
];
const shortCategoryNames = {
  "financial-services": "Financial",
  "legal-services": "Legal",
  "business-development": "Business Development",
  "jaytrade-jobs": "Jobs",
  "jaytrade-times": "Times",
};
const featuredServices = featuredNames.map((name) => serviceCatalog.flatMap((category) =>
  category.services.map((service) => ({ service, categoryId: category.id })))
  .find(({ service }) => service.name === name)).filter(Boolean);

const comingSoon = [
  { title: "Insurance", icon: Shield },
  { title: "Bill Payments", icon: Receipt },
  { title: "Travel", icon: Palmtree },
  { title: "Investments", icon: TrendingUp },
];

function SectionHeading({ id, title, subtitle, action, onAction }) {
  return (
    <div className="home-overview-heading">
      <div><h2 id={id}>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>
      {action && <button type="button" className="home-overview-button quiet" onClick={onAction}>
        {action} <ArrowRight size={16} aria-hidden="true" />
      </button>}
    </div>
  );
}

function FeaturedServices({ actions, serviceOverrides }) {
  return (
    <section className="home-overview-section" id="services" aria-labelledby="home-services-title">
      <div className="home-services-heading">
        <div className="home-services-title-row">
          <h2 id="home-services-title">Our Services</h2>
          <button type="button" className="home-services-view-more" onClick={actions.onOpenServices}>
            <span>View more</span>
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        </div>
        <p>Explore financing, registrations and business services.</p>
      </div>
      <div className="home-overview-services-grid">
        {featuredServices.filter(({ service }) => serviceOverrides[service.name.toLowerCase()]?.available !== false).map(({ service, categoryId }) => (
          <button key={service.name} className="home-overview-service" type="button"
            onClick={() => selectCatalogService(categoryId, service, actions)}>
            <img src={service.image} alt="" width={64} height={64} loading="lazy" decoding="async" />
            <span className="home-overview-service-category">{shortCategoryNames[categoryId]}</span>
            <strong>{service.name}</strong>
            <ArrowUpRight size={17} aria-hidden="true" />
          </button>
        ))}
      </div>
    </section>
  );
}

function AccountWallet({ customer, wallet, accountId, accountCopyMessage, onCopyAccountId, actions }) {
  const [balanceVisible, setBalanceVisible] = useState(false);
  return (
    <section className="indipay-account-section home-overview-account" aria-label="My Indipay account">
      <article className="indipay-account-card account-card-1" role="link" tabIndex={0}
        aria-label="Open wallet" onClick={(event) => {
          if (!event.target.closest("button")) actions.onOpenWallet?.();
        }}
        onKeyDown={(event) => {
          if (event.target === event.currentTarget && ["Enter", " "].includes(event.key)) {
            event.preventDefault();
            actions.onOpenWallet?.();
          }
        }}>
        <div className="indipay-account-card-top">
          <span>MY INDIPAY ACCOUNT</span>
          <img src={jaytradeLogo} alt="Jaytrade logo" />
        </div>
        <h2>{customer?.name || "My Account"}</h2>
        <div className="indipay-account-id-row">
          <strong>{accountId || "Sign in to view"}</strong>
          {accountId && <button type="button" aria-label={accountCopyMessage || "Copy account ID"} onClick={onCopyAccountId}>
            {accountCopyMessage === "Account ID copied" ? <Check size={17} aria-hidden="true" /> : <Copy size={17} aria-hidden="true" />}
          </button>}
        </div>
        <p>Your personal Indipay Account ID</p>
        <div className="indipay-wallet-preview">
          <div>
            <span>Customer Money</span>
            <strong>{balanceVisible ? formatPaise(wallet?.availablePaise) : "₹ ••••••"}</strong>
          </div>
          <button type="button" aria-label={balanceVisible ? "Hide balance" : "Show balance"}
            onClick={() => setBalanceVisible((visible) => !visible)}>
            {balanceVisible ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}
            {balanceVisible ? "Hide" : "Show"}
          </button>
        </div>
        <div className="indipay-account-card-links">
          <button type="button" onClick={actions.onOpenWalletHistory ?? actions.onOpenWallet}>
            <FileText size={18} aria-hidden="true" /><span>Statements</span>
          </button>
          <button type="button" onClick={actions.onOpenApplicationStatus}>
            <ClipboardList size={18} aria-hidden="true" /><span>Applications</span>
          </button>
          <button type="button" onClick={actions.onOpenAnnouncements}>
            <Bell size={18} aria-hidden="true" /><span>Notifications</span>
          </button>
        </div>
      </article>
    </section>
  );
}

function RewardsWallet({ actions }) {
  return (
    <section className="home-overview-section" aria-labelledby="home-wallet-title">
      <SectionHeading id="home-wallet-title" title="Rewards & Wallet"
        subtitle="Find your wallet, rewards and application updates." action="Add money" onAction={actions.onAddMoney} />
      <div className="home-overview-wallet-grid">
        <DashboardLink icon={Gift} title="Rewards" text={homeDemo.rewardsPoints} onClick={actions.onOpenRewards} />
        <DashboardLink icon={ClipboardList} title="My Applications" text="Check your application status" onClick={actions.onOpenApplicationStatus} />
        <DashboardLink icon={Users} title="Refer & Earn" text="Open your referral page" onClick={actions.onOpenRefer} />
      </div>
    </section>
  );
}

function DashboardLink({ icon: Icon, title, text, onClick }) {
  return (
    <button className="home-overview-dashboard-link" type="button" onClick={onClick}>
      <span className="home-overview-symbol"><Icon size={20} aria-hidden="true" /></span>
      <strong>{title}</strong><span>{text}</span>
      <ArrowUpRight size={17} aria-hidden="true" />
    </button>
  );
}

function SuperStoreBanner({ onOpenMarketplace }) {
  return (
    <button type="button" className="home-super-store-banner" onClick={onOpenMarketplace}>
      <span className="home-super-store-copy">
        <span className="home-super-store-kicker">SHOP · DISCOVER · EXPLORE</span>
        <strong>Indipay Super Store</strong>
        <span>Your wallet. Your favourite products.</span>
        <span className="home-super-store-action">
          Explore Super Store <ArrowRight size={17} aria-hidden="true" />
        </span>
      </span>
      <span className="home-super-store-art" aria-hidden="true">
        <ShoppingBag strokeWidth={1.45} />
      </span>
    </button>
  );
}

const homePromotionalBanners = [
  {
    id: "rewards",
    label: "INDIPAY REWARDS",
    title: "Earn more. Enjoy more.",
    description: "Discover your available rewards.",
    button: "Explore Rewards",
    icon: Gift,
    theme: "rewards",
    action: "onOpenRewards",
  },
  {
    id: "referral",
    label: "REFER & EARN",
    title: "Grow together.",
    description: "Invite your friends to Indipay.",
    button: "Refer Now",
    icon: Users,
    theme: "referral",
    action: "onOpenRefer",
  },
  {
    id: "business",
    label: "BUSINESS DEVELOPMENT",
    title: "Take your business further.",
    description: "Explore new business opportunities.",
    button: "Explore Now",
    icon: BriefcaseBusiness,
    theme: "business",
    action: "onOpenBusinessDevelopment",
  },
];

function HomePromotionalCarousel({ actions }) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [paused, setPaused] = useState(false);

  const totalSlides = homePromotionalBanners.length;

  useEffect(() => {
    if (paused) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduceMotion) return;

    const timer = setInterval(() => {
      setActiveSlide((current) =>
        (current + 1) % totalSlides
      );
    }, 5000);

    return () => clearInterval(timer);
  }, [paused, totalSlides, activeSlide]);

  function nextSlide() {
    setActiveSlide((current) =>
      (current + 1) % totalSlides
    );
  }

  function previousSlide() {
    setActiveSlide((current) =>
      (current - 1 + totalSlides) % totalSlides
    );
  }

  const banner = homePromotionalBanners[activeSlide];
  const BannerIcon = banner.icon;

  return (
    <section
      className="home-promo-carousel"
      aria-label="Indipay promotions"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setPaused(false);
        }
      }}
    >
      <div className="home-promo-carousel-container">

        <div
          key={banner.id}
          className={`home-promo-slide ${banner.theme}`}
        >
          <div className="home-promo-content">

            <span className="home-promo-eyebrow">
              {banner.label}
            </span>

            <h2>{banner.title}</h2>

            <p>{banner.description}</p>

            <button
              type="button"
              className="home-promo-action"
              onClick={() => actions[banner.action]?.()}
            >
              {banner.button}
              <ArrowRight size={16} />
            </button>

          </div>

          <div
            className="home-promo-illustration"
            aria-hidden="true"
          >
            <div className="home-promo-icon-circle">
              <BannerIcon size={58} strokeWidth={1.6} />
            </div>
          </div>
        </div>

        <button
          type="button"
          className="home-promo-arrow previous"
          aria-label="Previous banner"
          onClick={previousSlide}
        >
          <ChevronLeft size={20} />
        </button>

        <button
          type="button"
          className="home-promo-arrow next"
          aria-label="Next banner"
          onClick={nextSlide}
        >
          <ChevronRight size={20} />
        </button>

      </div>

      <div className="home-promo-dots">
        {homePromotionalBanners.map((item, index) => (
          <button
            key={item.id}
            type="button"
            className={`home-promo-dot ${
              activeSlide === index ? "active" : ""
            }`}
            aria-label={`Show banner ${index + 1}`}
            aria-pressed={activeSlide === index}
            onClick={() => setActiveSlide(index)}
          />
        ))}
      </div>

    </section>
  );
}

function Home({
  serviceOverrides = {},
  onBack,
  onOpenMarketplace,
  onOpenAboutUs,
  onOpenServices,
  customer,
  wallet,
  identity,
  onOpenMerchantPlans,
  onOpenMyStore,
  onOpenWalletHistory,
  onLogout,
  onOpenAnnouncements,
  onOpenApplicationStatus,
  onSelectService,
  onSelectLegalService,
  onOpenJobs,
  onOpenTimes,
  darkMode,
  setDarkMode,
  onAddMoney,
  onOpenRewards,
  onOpenWallet,
  onOpenBusinessDevelopment,
  onLogin,
  onRegister,
  onOpenRefer,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [accountCopyMessage, setAccountCopyMessage] = useState("");
  const accountId = String(customer?.accountId ?? "").replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim();

  async function copyAccountId() {
    try {
      await navigator.clipboard.writeText(accountId);
      setAccountCopyMessage("Account ID copied");
    } catch {
      setAccountCopyMessage("Could not copy account ID");
    }
  }

  const actions = {
    onOpenServices, onSelectService, onSelectLegalService, onOpenJobs, onOpenTimes,
    onOpenBusinessDevelopment, onAddMoney, onOpenWallet, onOpenWalletHistory, onOpenRewards,
    onOpenApplicationStatus, onOpenRefer, onOpenAnnouncements,
  };

  return (
    <div
      className={`indipay-home indipay-app-home indipay-home-redesign${darkMode ? " dark-mode" : ""}`}
      id="home"
      data-theme={darkMode ? "dark" : "light"}
    >
      <header className="indipay-app-header">
        <button
          className="indipay-app-menu"
          type="button"
          aria-label="Open menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={24} /> : <Menu size={25} />}
        </button>

        <div className="indipay-app-search">
  <Search size={19} />

  <input
    type="search"
    value={searchQuery}
    onChange={(event) => setSearchQuery(event.target.value)}
    onKeyDown={(event) => {
      if (event.key === "Enter") {
        onOpenServices?.();
        window.scrollTo(0, 0);
      }
    }}
    placeholder="Search loans, services, help"
    aria-label="Search loans, services and help"
  />
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
          className="indipay-header-icon indipay-theme-toggle"
          type="button"
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          aria-pressed={darkMode}
          title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          onClick={() => setDarkMode((current) => !current)}
        >
          {darkMode ? <Sun size={21} /> : <Moon size={21} />}
        </button>
        <button
  className="indipay-header-icon"
  type="button"
  aria-label={customer ? "My Profile" : "Login"}
  onClick={() => {
    if (customer) {
      setProfileOpen(true);
    } else {
      onLogin?.();
    }
  }}
>
  {customer ? <UserRound size={22} /> : <LogOut size={22} />}
</button>
      </header>

      {menuOpen && (
        <div className="indipay-drawer-backdrop" onClick={() => setMenuOpen(false)}>
          <CustomerPanel className="indipay-app-drawer" label="Indipay menu" onClose={() => setMenuOpen(false)}>
            <div className="indipay-drawer-brand"><img src={indipayLogo} alt="Jaytrade Logo" /></div>
            <button onClick={() => { setMenuOpen(false); onBack?.(); }}><HomeIcon size={18} /> Home</button>
            <button onClick={() => {
  setMenuOpen(false);
  onOpenServices?.();
}}>
  <Wallet size={18} /> All Services
</button>

<button type="button" onClick={() => {
  setMenuOpen(false);
  onOpenMarketplace();
}}>
  <ShoppingBag size={18} aria-hidden="true" /> Superstore
</button>

<button onClick={() => {
  setMenuOpen(false);
  onOpenWallet?.();
}}>
  <CreditCard size={18} /> My Wallet
</button>
            <button onClick={() => { setMenuOpen(false); onOpenApplicationStatus?.(); }}><ClipboardList size={18} /> My Applications</button>
            <button onClick={() => { setMenuOpen(false); onOpenAnnouncements?.(); }}><Bell size={18} /> Notifications</button>
            <button type="button" onClick={() => { setMenuOpen(false); onOpenAboutUs(); }}><Info size={18} aria-hidden="true" /> About Us</button>
            {customer ? (
  <>
    <button onClick={() => {
      setMenuOpen(false);
      setProfileOpen(true);
    }}>
      <UserRound size={18} /> My Profile
    </button>

    <button onClick={() => {
      setMenuOpen(false);
      onLogout?.();
    }}>
      <LogOut size={18} /> Logout
    </button>
  </>
) : (
  <>
    <button onClick={() => {
      setMenuOpen(false);
      onLogin?.();
    }}>
      <LogOut size={18} /> Login
    </button>

    <button onClick={() => {
      setMenuOpen(false);
      onRegister?.();
    }}>
      <UserRound size={18} /> Create Account
    </button>
  </>
)}
          </CustomerPanel>
        </div>
      )}

      <main className="home-overview">
        <div className="home-account-row">
          <AccountWallet customer={customer} wallet={wallet} accountId={accountId} accountCopyMessage={accountCopyMessage}
            onCopyAccountId={copyAccountId} actions={actions} />
          <SuperStoreBanner onOpenMarketplace={onOpenMarketplace} />
        </div>
        <FeaturedServices actions={actions} serviceOverrides={serviceOverrides} />

<HomePromotionalCarousel actions={actions} />
        <PublishedAdminContent channel="indipay" />

<RewardsWallet actions={actions} />
        <section className="home-overview-callout" aria-labelledby="home-promo-title">
          <span className="home-overview-symbol"><BriefcaseBusiness size={23} aria-hidden="true" /></span>
          <div><h2 id="home-promo-title">{homePromo.title}</h2><p>{homePromo.description}</p></div>
          <button type="button" className="home-overview-button secondary" onClick={actions.onOpenBusinessDevelopment}>
            {homePromo.button} <ArrowRight size={17} aria-hidden="true" />
          </button>
        </section>
        <section className="home-overview-section" aria-labelledby="home-coming-title">
          <SectionHeading id="home-coming-title" title="More Services Coming Soon" />
          <div className="home-overview-coming-grid">
            {comingSoon.map(({ title, icon: Icon }) => <article key={title}>
              <span className="home-overview-symbol"><Icon size={20} aria-hidden="true" /></span>
              <h3>{title}</h3><span>Coming soon</span>
            </article>)}
          </div>
        </section>
        <section className="home-overview-callout" aria-labelledby="home-help-title">
          <span className="home-overview-symbol"><Headset size={24} aria-hidden="true" /></span>
          <div><h2 id="home-help-title">Need help choosing a service?</h2><p>Placeholder support number</p></div>
          <div className="home-overview-actions">
            <a className="home-overview-button secondary" href={`tel:${helpPhone}`}><Phone size={17} aria-hidden="true" /> Call</a>
            <a className="home-overview-button secondary" href={`https://wa.me/${helpPhone.slice(1)}`} target="_blank" rel="noreferrer">
              <MessageCircle size={17} aria-hidden="true" /> WhatsApp
            </a>
          </div>
        </section>
      </main>

      {profileOpen && (
        <div className="indipay-profile-overlay" onClick={() => setProfileOpen(false)}>
          <CustomerPanel className="indipay-profile-sheet" label="My profile" onClose={() => setProfileOpen(false)}>
  <div className="indipay-profile-sheet-handle" />

  <div className="indipay-profile-sheet-heading">
    <span><UserRound size={25} /></span>

    <div>
      <strong>
        {customer ? `Welcome, ${customer.name}` : "Welcome to Indipay"}
      </strong>
      <small>
        {customer ? identity?.label ?? "Customer Account" : "Sign in to access your account"}
      </small>
    </div>

    <button
      onClick={() => setProfileOpen(false)}
      aria-label="Close profile"
    >
      <X size={20} />
    </button>
  </div>

  {customer ? (
    <>
      <div className="indipay-profile-details">
        <p className="home-overview-account-id"><span><strong>Account ID:</strong> {accountId}</span>
          {accountId && <button type="button" aria-label="Copy account ID" onClick={copyAccountId}>
            {accountCopyMessage === "Account ID copied" ? <Check size={17} aria-hidden="true" /> : <Copy size={17} aria-hidden="true" />}
          </button>}
        </p>
        {accountCopyMessage && <p role="status">{accountCopyMessage}</p>}
        <p><strong>Email:</strong> {customer.email}</p>
        <p><strong>Mobile:</strong> {customer.phone}</p>
        {identity?.accountType === "merchant" && identity.storeName && <p><strong>Store:</strong> {identity.storeName}</p>}
        {identity?.planName && <p><strong>Merchant plan:</strong> {identity.planName} demo plan</p>}
      </div>

      {(identity?.canUpgrade || (identity?.accountType === "merchant" && (identity.canManageDemo || identity.canManageLive))) && (
        <button type="button" onClick={() => {
          setProfileOpen(false);
          if (identity.canUpgrade) onOpenMerchantPlans();
          else onOpenMyStore();
        }}>
          <ShoppingBag size={18} /> {identity.canUpgrade ? "Become a Merchant" : "My Store"} <ChevronRight size={17} />
        </button>
      )}

      <button
        onClick={() => {
          setProfileOpen(false);
          onLogout?.();
        }}
      >
        <LogOut size={18} /> Logout <ChevronRight size={17} />
      </button>
    </>
  ) : (
    <>
      <button onClick={() => {
        setProfileOpen(false);
        onLogin?.();
      }}>
        <LogOut size={18} /> Login <ChevronRight size={17} />
      </button>

      <button onClick={() => {
        setProfileOpen(false);
        onRegister?.();
      }}>
        <UserRound size={18} /> Create Account <ChevronRight size={17} />
      </button>
    </>
  )}
</CustomerPanel>
        </div>
      )}
    </div>
  );
}

export default Home;
