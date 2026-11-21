import { useState } from "react";
import indipayLogo from "../assets/images/logo-transparent2.png";
import Jaytradelogo from "../assets/images/Jaytrade-logo.jpg";
import {
  Menu, X, Bell, LogOut, UserRound, ChevronRight, ChevronLeft, Moon, Sun,
  Eye, EyeOff, FileText, ClipboardList, Landmark,
  BriefcaseBusiness, GraduationCap, Newspaper, Gift, Star,
  Users, Wallet, ArrowRight, Sparkles,
  CreditCard, Home as HomeIcon, Building2,
  BadgeCheck, Receipt, FileCheck, Globe, Search, Copy, Check, Plus, CheckCircle,
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
  image: `${import.meta.env.BASE_URL}images/icons/housing-loan.jpeg`,
},
      {
  name: "Property Loan",
  icon: Building2,
  image: `${import.meta.env.BASE_URL}images/icons/property-loan.jpeg`,
},
      {
  name: "Personal Loan",
  icon: Building2,
  image: `${import.meta.env.BASE_URL}images/icons/personal-loan.jpeg`,
},
      {
  name: "Business Loan – Secured",
  icon: Building2,
  image: `${import.meta.env.BASE_URL}images/icons/bl-secured.jpeg`,
},
     {
  name: "Business Loan – Unsecured",
  icon: Building2,
  image: `${import.meta.env.BASE_URL}images/icons/bl-unsecured.jpeg`,
}, 
{
  name: "Take Over Loan",
  image: `${import.meta.env.BASE_URL}images/icons/Takeover-loan.png`,
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
      { name: "CIBIL Report", 
        image: `${import.meta.env.BASE_URL}images/icons/Cibil.png`,
        icon: FileCheck },
      { name: "MSME", 
        image: `${import.meta.env.BASE_URL}images/icons/MSME.png`,
        icon: Building2 },
      { name: "Mudra Project Report", 
        image: `${import.meta.env.BASE_URL}images/icons/PR-above5.png`,
        icon: FileText },
      { name: "GST Registration", 
        image: `${import.meta.env.BASE_URL}images/icons/GST.png`,
        icon: Receipt },
      { name: "ITR – Income Tax Filing", 
        image: `${import.meta.env.BASE_URL}images/icons/ITR.png`,
        icon: FileText },
      { name: "FSSAI Services", 
        image: `${import.meta.env.BASE_URL}images/icons/FSSAI.png`,
        icon: BadgeCheck },
       { name: "ISO Certificate", 
        image: `${import.meta.env.BASE_URL}images/icons/ISO.png`,
        icon: BadgeCheck },
       { name: "Trademark", 
        image: `${import.meta.env.BASE_URL}images/icons/Trademark.png`,
        icon: BadgeCheck },
    ],
  },
  {
    title: "Business Development",
    description: "Partnership and business opportunities",
    icon: BriefcaseBusiness,
    background: "business-development.jpg",
    services: [
      { name: "Business Associate",
        image: `${import.meta.env.BASE_URL}images/icons/BA.png`,
         icon: Users },
      { name: "Premium Franchise",
        image: `${import.meta.env.BASE_URL}images/icons/PF.png`,
         icon: Building2 },
      { name: "Normal Franchise",
        image: `${import.meta.env.BASE_URL}images/icons/NF.png`,
         icon: Building2 },
      { name: "Virtual Franchise",
        image: `${import.meta.env.BASE_URL}images/icons/VF.png`,
         icon: Globe },
    ],
  },
  {
    title: "Jaytrade Jobs",
    description: "Registration services and opportunities",
    icon: GraduationCap,
    background: "jobs.jpg",
    services: [
      { name: "Udyog Registration", 
        image: `${import.meta.env.BASE_URL}images/icons/Udyog.png`,
      icon: FileCheck },
      { name: "Udyog Plus Registration", 
        image: `${import.meta.env.BASE_URL}images/icons/Udplus.png`,
      icon: BadgeCheck },
      { name: "Standard Registration", 
        image: `${import.meta.env.BASE_URL}images/icons/Standard.png`,
      icon: FileCheck },
      { name: "Corporate Plus",
        image: `${import.meta.env.BASE_URL}images/icons/Corporate.png`,
       icon: Building2 },
    ],
  },
  {
  title: "Jaytrade Times & Technologies",
  description: "Business growth and technology packages",
  icon: Newspaper,
  background: "times.jpg",
  services: [
    { name: "Growup Package", image: `${import.meta.env.BASE_URL}images/icons/growup.png`,
    icon: BriefcaseBusiness },
    { name: "Standard Package", image: `${import.meta.env.BASE_URL}images/icons/ST.png`,
    icon: BadgeCheck },
    { name: "Premium Package", image: `${import.meta.env.BASE_URL}images/icons/premium.png`,
    icon: Star },

    { name: "Corporate Package", image: `${import.meta.env.BASE_URL}images/icons/Corp.png`,
    icon: Building2 },
  ],
},
]

function Home({
  onBack,
  onOpenServices,
  customer,
  onLogout,
  onOpenAnnouncements,
  onOpenApplicationStatus,
  onSelectService,
  onOpenJobs,
  onOpenTimes,
  darkMode,
  setDarkMode,
  onOpenWallet,
  onOpenBusinessDevelopment,
  onLogin,
  onRegister,
  onOpenRefer,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("Financial Services");
  const [balanceVisible, setBalanceVisible] = useState(false);
  const [activeAccount, setActiveAccount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [accountIdCopied, setAccountIdCopied] = useState(false);
  const formatAccountId = (accountId) => {
  const digits = String(accountId || "").replace(/\D/g, "");
  return digits.replace(/(.{4})/g, "$1 ").trim();
};

  const accountCards = [
    {
    eyebrow: "MY INDIPAY ACCOUNT",
    title: customer?.name || "My Account",
    number: customer?.accountId
  ? formatAccountId(customer.accountId)
  : "Sign in to view",
    detail: "Your personal Indipay Account ID",
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

  const handleHorizontalWheel = (e) => {
  if (e.deltaY !== 0) {
    e.preventDefault();
    e.currentTarget.scrollLeft += e.deltaY;
  }
};

  return (
    <div
      className={`indipay-home indipay-app-home${darkMode ? " dark-mode" : ""}`}
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
          <nav className="indipay-app-drawer" onClick={(event) => event.stopPropagation()}>
            <div className="indipay-drawer-brand"><img src={indipayLogo} alt="Jaytrade Logo" /></div>
            <button onClick={() => { setMenuOpen(false); onBack?.(); }}><HomeIcon size={18} /> Home</button>
            <button onClick={() => {
  setMenuOpen(false);
  onOpenServices?.();
}}>
  <Wallet size={18} /> All Services
</button>

<button onClick={() => {
  setMenuOpen(false);
  onOpenWallet?.();
}}>
  <CreditCard size={18} /> My Wallet
</button>
            <button onClick={() => { setMenuOpen(false); onOpenApplicationStatus?.(); }}><ClipboardList size={18} /> My Applications</button>
            <button onClick={() => { setMenuOpen(false); onOpenAnnouncements?.(); }}><Bell size={18} /> Notifications</button>
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
          </nav>
        </div>
      )}

      <main className="indipay-app-main">
        <section className="indipay-account-section">
          <div className="indipay-account-carousel">
            <div
              className="indipay-account-track"
              style={{ transform: `translateX(-${activeAccount * 100}%)` }}
              onTouchStart={(event) => { event.currentTarget.dataset.touchStart = event.touches[0].clientX; }}
              onTouchEnd={(event) => {
                const delta = Number(event.currentTarget.dataset.touchStart || 0) - event.changedTouches[0].clientX;
                if (Math.abs(delta) > 45) {
                  setActiveAccount((current) => (current + (delta > 0 ? 1 : -1) + accountCards.length) % accountCards.length);
                }
              }}
            >
              
{accountCards.map((card, index) => (
  
<article
  className={`indipay-account-card account-card-${index + 1}`}
  key={card.eyebrow}
>
  <div className="indipay-account-card-top">
    <span>{card.eyebrow}</span>
    <img src={Jaytradelogo} alt="Jaytrade Logo" />
  </div>

  <h2>{card.title}</h2>

  {index === 0 ? (
    <>
      <div className="indipay-account-id-row">
        <strong>{card.number}</strong>

        <button
          type="button"
          aria-label="Copy account ID"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(card.number);
              setAccountIdCopied(true);
              setTimeout(() => setAccountIdCopied(false), 1600);
            } catch (error) {
              console.error("Could not copy account ID", error);
            }
          }}
        >
          {accountIdCopied ? <Check size={17} /> : <Copy size={17} />}
        </button>
      </div>

      <p>{card.detail}</p>

      <div className="indipay-wallet-preview">
        <div>
          <span>Wallet balance</span>
          <strong>
            {balanceVisible ? "₹ 0.00" : "₹ ••••••"}
          </strong>
        </div>

        <button
          type="button"
          onClick={() => setBalanceVisible((visible) => !visible)}
        >
          {balanceVisible ? <EyeOff size={17} /> : <Eye size={17} />}
          {balanceVisible ? "Hide" : "Show"}
        </button>
      </div>
    </>
  ) : (
    <>
      <div className="indipay-account-number">{card.number}</div>
      <p>{card.detail}</p>

      <button
        className="indipay-balance-button"
        onClick={index === 1 ? onOpenApplicationStatus : onOpenServices}
      >
        {card.action}
        <ArrowRight size={15} />
      </button>
    </>
  )}

  <div className="indipay-account-card-links">
    <button type="button" onClick={onOpenWallet}>
      <FileText size={18} />
      <span>Statements</span>
    </button>

    <button onClick={onOpenApplicationStatus}>
      <ClipboardList size={18} />
      <span>Applications</span>
    </button>

    <button onClick={onOpenAnnouncements}>
      <Bell size={18} />
      <span>Notifications</span>
    </button>
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
          <div className="indipay-quick-actions">
  <button onClick={() => {
    setActiveCategory("Financial Services");
    document.getElementById("services")?.scrollIntoView({
      behavior: "smooth"
    });
  }}>
    <Plus size={17} />
    Apply for a loan
  </button>

  <button onClick={onOpenApplicationStatus}>
    <CheckCircle size={17} />
    Check status
  </button>

  <button onClick={onOpenRefer}>
    <Gift size={17} />
    Refer & Earn
  </button>
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
          onClick={() => setActiveCategory(category.title)}
          aria-pressed={active}
        >
          <strong>{category.title.replace(" Services", "")}</strong>
        </button>
      );
    })}
  </div>

  {selectedCategory && (
    <div
      className={`indipay-selected-category category-${serviceCategories
        .findIndex((category) => category.title === selectedCategory.title) + 1}`}
    >
      <div className="indipay-selected-services">
        {selectedCategory.services.map((service) => {
          const Icon = service.icon;

          return (
            <button
              className="indipay-selected-service"
              key={service.name}
              onClick={() => {
                if (selectedCategory.title === "Jaytrade Jobs") {
                  onOpenJobs?.();
                } else if (
                  selectedCategory.title === "Jaytrade Times & Technologies"
                ) {
                  onOpenTimes?.();
                } else if (
                  selectedCategory.title === "Business Development"
                ) {
                  onOpenBusinessDevelopment?.();
                } else {
                  onSelectService?.(service);
                }
              }}
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

      <button
        type="button"
        className="indipay-view-all-services"
        onClick={onOpenServices}
      >
        View All Services
        <ArrowRight size={16} />
      </button>
    </div>
  )}

</section>


        {/* Homepage Promotional Banner */}
        <section className="indipay-home-banner">
          <img
            src={`${import.meta.env.BASE_URL}images/bottomads/indipayad.webp`}
            alt="Indipay promotional banner"
            className="indipay-home-banner-image"
          />
        </section>


      </main>

      {profileOpen && (
        <div className="indipay-profile-overlay" onClick={() => setProfileOpen(false)}>
          <section
  className="indipay-profile-sheet"
  onClick={(event) => event.stopPropagation()}
>
  <div className="indipay-profile-sheet-handle" />

  <div className="indipay-profile-sheet-heading">
    <span><UserRound size={25} /></span>

    <div>
      <strong>
        {customer ? `Welcome, ${customer.name}` : "Welcome to Indipay"}
      </strong>
      <small>
        {customer ? "Your Indipay account" : "Sign in to access your account"}
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
        <p><strong>Account ID:</strong> {formatAccountId(customer?.accountId)}</p>
        <p><strong>Email:</strong> {customer.email}</p>
        <p><strong>Mobile:</strong> {customer.phone}</p>
      </div>

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
</section>
        </div>
      )}
    </div>
  );
}

export default Home;
