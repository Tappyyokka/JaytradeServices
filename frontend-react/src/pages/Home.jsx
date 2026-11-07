import { useState } from "react";
import indipayLogo from "../assets/images/logo-transparent2.png";
import Jaytradelogo from "../assets/images/Jaytrade-logo.jpg";
import {
  Menu, X, Bell, LogOut, UserRound, ChevronRight, ChevronLeft,
  Eye, EyeOff, FileText, ClipboardList, BellRing, Landmark,
  BriefcaseBusiness, GraduationCap, Newspaper, Gift, Star,
  BookOpen, Headset, Users, Wallet, ArrowRight, Sparkles,
  CreditCard, CircleHelp, Home as HomeIcon, Settings, Building2,
  BadgeCheck, Receipt, FileCheck, Globe
} from "lucide-react";
import "./Home.css";

const serviceCategories = [
  {
    title: "Financial Services",
    description: "Financial solutions for your needs",
    icon: Landmark,
     background: "financial.jpg",
    services: [
      {
  name: "Housing Loan",
  icon: Building2,
  image: `${import.meta.env.BASE_URL}images/housing-loan.jpeg`,
},
      {
  name: "Property Loan",
  icon: Building2,
  image: `${import.meta.env.BASE_URL}images/property-loan.jpeg`,
},
      {
  name: "Personal Loan",
  icon: Building2,
  image: `${import.meta.env.BASE_URL}images/personal-loan.jpeg`,
},
      {
  name: "Business Loan – Secured",
  icon: Building2,
  image: `${import.meta.env.BASE_URL}images/bl-secured.jpeg`,
},
     {
  name: "Business Loan – Unsecured",
  icon: Building2,
  image: `${import.meta.env.BASE_URL}images/bl-unsecured.jpeg`,
}, 
{
  name: "Take Over Loan",
  icon: Building2,
},
    ],
  },
  {
    title: "Legal Services",
    description: "Documentation and registration support",
    icon: FileText,
    background: "legal.jpg",

    services: [
      { name: "CIBIL Report", icon: FileCheck },
      { name: "MSME", icon: Building2 },
      { name: "Mudra Project Report", icon: FileText },
      { name: "GST Registration", icon: Receipt },
      { name: "ITR – Income Tax Filing", icon: FileText },
      { name: "FSSAI Services", icon: BadgeCheck },
       { name: "ISO Certificate", icon: BadgeCheck },
       { name: "Trademark - Individual, MSME (Without Track Records)", icon: BadgeCheck },
    ],
  },
  {
    title: "Business Development",
    description: "Partnership and business opportunities",
    icon: BriefcaseBusiness,
    background: "business-development.jpg",
    services: [
      { name: "Business Associate", icon: Users },
      { name: "Premium Franchise", icon: Building2 },
      { name: "Normal Franchise", icon: Building2 },
      { name: "Virtual Franchise", icon: Globe },
    ],
  },
  {
    title: "Jaytrade Jobs",
    description: "Registration services and opportunities",
    icon: GraduationCap,
    background: "jobs.jpg",
    services: [
      { name: "Udyog Registration", icon: FileCheck },
      { name: "Basic Registration", icon: FileText },
      { name: "Udyog Plus Registration", icon: BadgeCheck },
      { name: "Standard Registration", icon: FileCheck },
      { name: "Corporate Plus", icon: Building2 },
    ],
  },
  {
  title: "Jaytrade Times & Technologies",
  description: "Business growth and technology packages",
  icon: Newspaper,
  background: "times.jpg",
  services: [
    { name: "Growup Package", icon: BriefcaseBusiness },
    { name: "Standard Package", icon: BadgeCheck },
    { name: "Premium Package", icon: Star },
    { name: "Corporate Package", icon: Building2 },
  ],
},
]

function Home({
  onBack,
  onOpenServices,
  onOpenAnnouncements,
  onOpenApplicationStatus,
  onSelectService,
  onLogin,
  onRegister,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("Financial Services");
  const [activeTab, setActiveTab] = useState("Me");
  const [balanceVisible, setBalanceVisible] = useState(false);
  const [activeAccount, setActiveAccount] = useState(0);

  const bottomItems = [
    { label: "Me", icon: UserRound },
    { label: "My Customers", icon: Users },
    { label: "Rewards", icon: Gift },
    { label: "Learn & Earn", icon: BookOpen },
    { label: "Contact Us", icon: Headset },
  ];

  const accountCards = [
    {
      eyebrow: "MY INDIPAY ACCOUNT",
      title: "Indipay Account",
      number: "•••• •••• 5397",
      detail: "Your account at a glance",
      action: "Wallet Balance",
    },
    {
      eyebrow: "MY APPLICATIONS",
      title: "Track your requests",
      number: "Stay up to date",
      detail: "Check the latest application status",
      action: "View Applications",
    },
    {
      eyebrow: "MY SERVICES",
      title: "Services made simple",
      number: `${serviceCategories.reduce((sum, item) => sum + item.services.length, 0)}+ services`,
      detail: "Explore all available categories",
      action: "Explore Services",
    },
  ];

  const miniBanners = [
    { icon: Sparkles, tag: "INDIPAY", title: "Everything you need, in one place", note: "Explore convenient services" },
    { icon: Gift, tag: "REWARDS & OFFERS", title: "Discover benefits and offers", note: "More value with Indipay" },
    { icon: Users, tag: "REFER & EARN", title: "Invite friends. Grow together.", note: "Share the Indipay experience" },
  ];

  const selectedCategory = serviceCategories.find(
    (category) => category.title === activeCategory
  );

  const handleShortcut = (label) => {
    if (label === "Applications") {
      onOpenApplicationStatus?.();
    } else if (label === "Notifications") {
      onOpenAnnouncements?.();
    } else if (label === "Statements") {
      setActiveTab("Statements");
    }
  };

  const handleHorizontalWheel = (e) => {
  if (e.deltaY !== 0) {
    e.preventDefault();
    e.currentTarget.scrollLeft += e.deltaY;
  }
};

  const handleBottomTab = (label) => {
    setActiveTab(label);
    if (label === "Me") {
      setProfileOpen(true);
    }
  };

  return (
    <div className="indipay-home indipay-app-home" id="home">
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
          <span>What would you like to do today?</span>
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
          aria-label="Login"
          onClick={onLogin}
        >
          <LogOut size={22} />
        </button>
      </header>

      {menuOpen && (
        <div className="indipay-drawer-backdrop" onClick={() => setMenuOpen(false)}>
          <nav className="indipay-app-drawer" onClick={(event) => event.stopPropagation()}>
            <div className="indipay-drawer-brand"><img src={indipayLogo} alt="Jaytrade Logo" /></div>
            <button onClick={() => { setMenuOpen(false); onBack?.(); }}><HomeIcon size={18} /> Home</button>
            <button onClick={() => { setMenuOpen(false); onOpenServices?.(); }}><Wallet size={18} /> All Services</button>
            <button onClick={() => { setMenuOpen(false); onOpenApplicationStatus?.(); }}><ClipboardList size={18} /> My Applications</button>
            <button onClick={() => { setMenuOpen(false); onOpenAnnouncements?.(); }}><Bell size={18} /> Notifications</button>
            <button onClick={() => { setMenuOpen(false); onLogin?.(); }}><LogOut size={18} /> Login</button>
            <button onClick={() => { setMenuOpen(false); onRegister?.(); }}><UserRound size={18} /> Create Account</button>
          </nav>
        </div>
      )}

      <main className="indipay-app-main">
        <section className="indipay-account-section">
          <div className="indipay-account-carousel">
            <div
              className="indipay-account-track"
              style={{ transform: `translateX(calc(${activeAccount} * -100%))` }}
              onTouchStart={(event) => { event.currentTarget.dataset.touchStart = event.touches[0].clientX; }}
              onTouchEnd={(event) => {
                const delta = Number(event.currentTarget.dataset.touchStart || 0) - event.changedTouches[0].clientX;
                if (Math.abs(delta) > 45) {
                  setActiveAccount((current) => (current + (delta > 0 ? 1 : -1) + accountCards.length) % accountCards.length);
                }
              }}
            >
              {accountCards.map((card, index) => (
                <article className={`indipay-account-card account-card-${index + 1}`} key={card.eyebrow}>
                  <div className="indipay-account-card-top">
                    <span>{card.eyebrow}</span>
                    <img src={Jaytradelogo} alt="Jaytrade Logo" />
                  </div>
                  <h2>{card.title}</h2>
                  <div className="indipay-account-number">
                    {index === 0 && balanceVisible ? "₹ 0.00" : card.number}
                  </div>
                  {index === 0 && (
                    <button className="indipay-balance-button" onClick={() => setBalanceVisible((visible) => !visible)}>
                      {balanceVisible ? <EyeOff size={15} /> : <Eye size={15} />}
                      {balanceVisible ? "Hide Balance" : card.action}
                    </button>
                  )}
                  {index !== 0 && (
                    <button className="indipay-balance-button" onClick={index === 1 ? onOpenApplicationStatus : onOpenServices}>
                      {card.action} <ArrowRight size={15} />
                    </button>
                  )}
                  <p>{card.detail}</p>
                  <div className="indipay-account-card-links">
                    <button onClick={() => handleShortcut("Statements")}>Statements</button>
                    <button onClick={onOpenApplicationStatus}>Applications</button>
                    <button onClick={onOpenAnnouncements}>Notifications</button>
                  </div>
                </article>
              ))}
            </div>
          </div>
          <div className="indipay-account-carousel-controls">
            
            <div>
              <button aria-label="Previous account card" onClick={() => setActiveAccount((n) => (n + accountCards.length - 1) % accountCards.length)}><ChevronLeft size={17} /></button>
              <button aria-label="Next account card" onClick={() => setActiveAccount((n) => (n + 1) % accountCards.length)}><ChevronRight size={17} /></button>
            </div>
          </div>
        </section>

        <section className="indipay-mini-banners" 
        onWheel={handleHorizontalWheel} aria-label="Indipay updates">
          {miniBanners.map((banner) => {
            const Icon = banner.icon;
            return (
              <article className="indipay-mini-banner" key={banner.tag}>
                <span className="indipay-mini-banner-icon"><Icon size={22} /></span>
                <div>
                  <small>{banner.tag}</small>
                  <strong>{banner.title}</strong>
                  <p>{banner.note}</p>
                </div>
                <ChevronRight size={18} />
              </article>
            );
          })}
        </section>

        <section className="indipay-service-hub" id="services">
          <div className="indipay-section-heading">
            <div>
              <span>EXPLORE INDIPAY</span>
              <h1>Service Categories</h1>
              <p>Select a category to see all available services.</p>
            </div>
            <button onClick={onOpenServices}>View all <ArrowRight size={16} /></button>
          </div>

         <div
  className="indipay-category-grid"
  onWheel={handleHorizontalWheel}
>
            {serviceCategories.map((category) => {
              const active = activeCategory === category.title;

return (
  <button
    className={`indipay-category-tile ${active ? "selected" : ""}`}
    key={category.title}
    onClick={() => setActiveCategory(active ? null : category.title)}
    aria-expanded={active}
  >
    <strong>{category.title.replace(" Services", "")}</strong>
  </button>
);
            })}
          </div>

          {selectedCategory && (
            <div className="indipay-selected-category">
              <div className="indipay-selected-category-heading">
                <div>
                  <span>SELECTED CATEGORY</span>
                  <h2>{selectedCategory.title}</h2>
                  <p>{selectedCategory.description}</p>
                </div>
                <button onClick={() => setActiveCategory(null)} aria-label="Close category"><X size={20} /></button>
              </div>
              <div className="indipay-selected-services">
  {selectedCategory.services.map((service) => {
    const Icon = service.icon;

    return (
      <button
        className="indipay-selected-service"
        key={service.name}
        onClick={() => onSelectService?.(service)}
      >
        <span>
          {service.image ? (
            <img src={service.image} alt="" />
          ) : (
            <Icon size={27} />
          )}
        </span>

        <strong>{service.name}</strong>
      </button>
    );
  })}
</div>
            </div>
          )}
        </section>

        {activeTab !== "Me" && (
          <div className="indipay-tab-placeholder">
            <CircleHelp size={20} />
            <div>
              <strong>{activeTab}</strong>
              <span>This section will be connected in a later update.</span>
            </div>
          </div>
        )}
      </main>

      {profileOpen && (
        <div className="indipay-profile-overlay" onClick={() => setProfileOpen(false)}>
          <section className="indipay-profile-sheet" onClick={(event) => event.stopPropagation()}>
            <div className="indipay-profile-sheet-handle" />
            <div className="indipay-profile-sheet-heading">
              <span><UserRound size={25} /></span>
              <div><strong>Welcome to Indipay</strong><small>Sign in to access your account</small></div>
              <button onClick={() => setProfileOpen(false)} aria-label="Close profile"><X size={20} /></button>
            </div>
            <button onClick={() => { setProfileOpen(false); onLogin?.(); }}><LogOut size={18} /> Login <ChevronRight size={17} /></button>
            <button onClick={() => { setProfileOpen(false); onRegister?.(); }}><UserRound size={18} /> Create Account <ChevronRight size={17} /></button>
            <button onClick={() => { setProfileOpen(false); setActiveTab("My Profile"); }}><Settings size={18} /> My Profile <ChevronRight size={17} /></button>
          </section>
        </div>
      )}

      <nav className="indipay-bottom-nav" aria-label="Main navigation">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              className={activeTab === item.label ? "active" : ""}
              onClick={() => handleBottomTab(item.label)}
            >
              <Icon size={20} strokeWidth={1.9} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

export default Home;
