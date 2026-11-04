
import { useState } from "react";
import {
  Home as HomeIcon,
  LayoutGrid,
  Wallet,
  Info,
  UserRound,
  ChevronDown,
  LogIn,
  UserPlus,
  Settings,
  Menu,
  X,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Zap,
  Headset,
  Gift,
  Percent,
  PartyPopper,
  CreditCard,
  Star,
  UsersRound,
  Handshake,
  Smartphone,
  Landmark,
  FileText,
  BadgeCheck,
  Building2,
  BriefcaseBusiness,
  GraduationCap,
  Newspaper,
  Receipt,
  FileCheck,
  Globe,
  Users,
} from "lucide-react";

import "./Home.css";

function Home({
  onBack,
  onOpenServices,
  onOpenAnnouncements,
  onSelectService,
}) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  const navItems = [
  { label: "Home", href: "#home", icon: HomeIcon },
  { label: "Services", href: "#services", icon: LayoutGrid },
  { label: "Wallet", href: "#wallet", icon: Wallet },
  { label: "About Us", href: "#about", icon: Info },
];

  const slides = [
  {
    eyebrow: "YOUR EVERYDAY SERVICES, SIMPLIFIED",
    first: "Everything You Need.",
    second: "All in One Place.",
    description:
      "Discover financial, legal, property and everyday services through one convenient platform.",
    button: "Explore Services",
    target: "#services",
    icons: [HomeIcon, LayoutGrid, Wallet, ShieldCheck],
    phone: true,
    visual: "home",
  },
  {
    eyebrow: "SMARTER FINANCIAL SERVICES",
    first: "Your Money.",
    second: "Your Convenience.",
    description:
      "Explore financial tools and services designed to make everyday tasks simpler.",
    button: "Explore Financial Services",
    target: "#financial",
    icons: [Landmark, Wallet, ArrowRight, BadgeCheck],
    phone: false,
    visual: "finance",
  },
  {
    eyebrow: "SERVICES FOR EVERY NEED",
    first: "Less Hassle.",
    second: "More Possibilities.",
    description:
      "Find convenient solutions for your financial, legal, property and personal needs.",
    button: "Discover More",
    target: "#services",
    icons: [HomeIcon, FileText, LayoutGrid, ShieldCheck],
    phone: false,
    visual: "services",
  },
];

  const changeSlide = (direction) => {
    setActiveSlide((current) =>
      (current + direction + slides.length) % slides.length
    );
  };

  const slide = slides[activeSlide];

  const footerSections = [
  {
    title: "Home",
    links: [
      { label: "Home", href: "#home" },
      { label: "Our Services", href: "#services" },
      { label: "Contact Us", href: "#contact" },
    ],
  },
  {
    title: "Financial",
    links: [
      "Housing Loan",
      "Property Loan",
      "Personal Loan",
      "Business Loan – Secured",
      "Business Loan – Unsecured",
    ],
  },
  {
    title: "Legal",
    links: [
      "CIBIL Report",
      "MSME",
      "Mudra Project Report",
      "GST Registration",
      "ITR – Income Tax Filing",
      "FSSAI Services",
      "Import Export Code",
      "ISO Certificate",
    ],
  },
  {
    title: "Jobs",
    links: [
      "Udyog Registration",
      "Basic Registration",
      "Udyog Plus Registration",
      "Standard Registration",
      "Corporate Plus",
    ],
  },
  {
    title: "Times",
    links: [
      "Growup Package",
      "Standard Package",
      "Premium Package",
      "Corporate Package",
    ],
  },
  {
    title: "Business Development",
    links: [
      "Business Associate",
      "Premium Franchise",
      "Normal Franchise",
      "Virtual Franchise",
    ],
  },
  {
    title: "Wallet",
    links: [
      { label: "My Wallet", href: "#wallet" },
    ],
  },
  {
    title: "About Us",
    links: [
      { label: "About Us", href: "#about" },
      { label: "Contact Us", href: "#contact" },
    ],
  },
];

  
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
];


  return (
    <div className="indipay-home" id="home">
      <header className="indipay-topbar">
        <button
          className="indipay-menu-button"
          type="button"
          aria-label="Toggle navigation"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={23} /> : <Menu size={23} />}
        </button>

        <a
  href="#home"
  className="indipay-brand"
  onClick={(event) => {
    event.preventDefault();
    onBack?.();
  }}
>
  <img
    src="/JaytradeServices/images/logo-blue.jpeg"
    alt="Indipay"
    className="indipay-logo-image"
  />
</a>

        <nav className={`indipay-main-nav ${mobileOpen ? "mobile-open" : ""}`}>
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={`indipay-nav-link ${
                item.label === "Home" ? "active" : ""
              }`}
              onClick={() => setMobileOpen(false)}
            >
              <span className="indipay-nav-icon">
  <item.icon size={18} strokeWidth={1.9} />
</span>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="indipay-profile-dropdown">
          <button
            className="indipay-profile-trigger"
            type="button"
            aria-expanded={profileOpen}
            onClick={() => setProfileOpen(!profileOpen)}
          >
            <span className="indipay-profile-circle">
  <UserRound size={19} />
</span>
            <span className="indipay-profile-label">My Account</span>
            <ChevronDown
  size={16}
  className={`indipay-chevron ${profileOpen ? "rotated" : ""}`}
/>
          </button>

          {profileOpen && (
            <div className="indipay-profile-menu">
              <div className="indipay-profile-heading">
                <strong>Welcome to Indipay!</strong>
                <small>Access your account</small>
              </div>

              <a href="#login" className="indipay-profile-item">
  <LogIn size={17} />
  <span>Log In</span>
</a>

<a href="#register" className="indipay-profile-item">
  <UserPlus size={17} />
  <span>Create Account</span>
</a>

<a href="#profile" className="indipay-profile-item">
  <UserRound size={17} />
  <span>My Profile</span>
</a>

<a href="#settings" className="indipay-profile-item">
  <Settings size={17} />
  <span>Settings</span>
</a>
            </div>
          )}
        </div>
      </header>
      {/* ANNOUNCEMENT TICKER */}
<div className="indipay-announcement-bar">
  <div className="indipay-announcement-label">
    <span className="announcement-live-dot"></span>
    ANNOUNCEMENTS
  </div>

  <div className="indipay-announcement-window">
    <div className="indipay-announcement-track">
      <span>
        Welcome to Indipay! Stay tuned for the latest updates and announcements.
      </span>
      <span className="announcement-separator">✦</span>
      <span>
        New services and exciting opportunities are coming soon!
      </span>
      <span className="announcement-separator">✦</span>
      <span>
        Welcome to Indipay! Stay tuned for the latest updates and announcements.
      </span>
    </div>
  </div>

  <button
    className="indipay-announcement-view"
    type="button"
    onClick={onOpenAnnouncements}
  >
    View All →
  </button>
</div>

      <main className="indipay-page-container">
        {/* HERO CAROUSEL */}
        <section className="indipay-hero-banner" aria-label="Featured services">
          <article className="indipay-hero-slide">
            <div className="indipay-hero-copy">
              <div className="indipay-eyebrow">{slide.eyebrow}</div>

              <h1>
                {slide.first}
                <br />
                <span>{slide.second}</span>
              </h1>

              <p className="indipay-hero-description">
                {slide.description}
              </p>

              <a href={slide.target} className="indipay-primary-button">
                {slide.button}
                <span>→</span>
              </a>
            </div>

            <div className="indipay-hero-art">
              <div className="indipay-art-orbit orbit-one" />
              <div className="indipay-art-orbit orbit-two" />

              {slide.phone && (
                <div className="indipay-phone-mockup">
                  <div className="indipay-phone-screen">
                    <div className="indipay-phone-logo">▣</div>
                    <div className="indipay-phone-wordmark">
                      Indi<span>pay</span>
                    </div>
                    <p>One platform. Many solutions.</p>
                  </div>
                </div>
              )}

              {/* FINANCIAL SERVICES ILLUSTRATION */}
{slide.visual === "finance" && (
  <div className="indipay-hero-feature-visual finance-visual">

    <div className="finance-main-card">
      <div className="finance-card-top">
        <span>Financial Services</span>
        <Landmark size={22} />
      </div>

      <div className="finance-card-balance">
        <small>Smart financial solutions</small>
        <strong>₹ Your Future</strong>
      </div>

      <div className="finance-card-bottom">
        <span><CreditCard size={17} /> Loans</span>
        <span><BadgeCheck size={17} /> Trusted</span>
      </div>
    </div>

    <div className="finance-floating finance-float-one">
      <Wallet size={25} />
    </div>

    <div className="finance-floating finance-float-two">
      <span>₹</span>
    </div>

    <div className="finance-floating finance-float-three">
      <ShieldCheck size={25} />
    </div>

  </div>
)}

{/* BUSINESS AND DOCUMENT SERVICES ILLUSTRATION */}
{slide.visual === "services" && (
  <div className="indipay-hero-feature-visual services-visual">

    <div className="services-main-card">
      <div className="services-document-icon">
        <FileText size={42} />
      </div>

      <div className="services-document-lines">
        <span></span>
        <span></span>
        <span></span>
      </div>

      <div className="services-check-row">
        <BadgeCheck size={22} />
        <strong>Verified Services</strong>
      </div>
    </div>

    <div className="services-floating services-float-one">
      <BriefcaseBusiness size={25} />
    </div>

    <div className="services-floating services-float-two">
      <UsersRound size={25} />
    </div>

    <div className="services-floating services-float-three">
      <ShieldCheck size={25} />
    </div>

  </div>
)}

           {slide.visual === "home" && (
  <>
    <div className="indipay-floating-icon float-home">
      <HomeIcon size={25} />
    </div>

    <div className="indipay-floating-icon float-bank">
      <Wallet size={25} />
    </div>

    <div className="indipay-floating-icon float-doc">
      <FileText size={25} />
    </div>

    <div className="indipay-floating-icon float-shield">
      <ShieldCheck size={25} />
    </div>
  </>
)}
            </div>
          </article>

          <button
            className="indipay-hero-arrow hero-prev"
            type="button"
            aria-label="Previous slide"
            onClick={() => changeSlide(-1)}
          >
            ‹
          </button>

          <button
            className="indipay-hero-arrow hero-next"
            type="button"
            aria-label="Next slide"
            onClick={() => changeSlide(1)}
          >
            ›
          </button>

          <div className="indipay-hero-dots">
            {slides.map((item, index) => (
              <button
                key={item.eyebrow}
                type="button"
                aria-label={`Go to slide ${index + 1}`}
                aria-current={activeSlide === index ? "true" : undefined}
                className={`indipay-dot ${
                  activeSlide === index ? "selected" : ""
                }`}
                onClick={() => setActiveSlide(index)}
              />
            ))}
          </div>
        </section>

        
        {/* FEATURE STRIP */}
        <section className="indipay-feature-strip">
          <div className="indipay-feature-card">
            <div className="indipay-feature-icon">
  <LayoutGrid size={26} />
</div>
            <div>
              <h3>All-in-One Platform</h3>
              <p>Services in one place</p>
            </div>
          </div>

          <div className="indipay-feature-card">
            <div className="indipay-feature-icon">
  <Zap size={26} />
</div>
            <div>
              <h3>Simple & Convenient</h3>
              <p>Designed for easy access</p>
            </div>
          </div>

          <div className="indipay-feature-card">
            <div className="indipay-feature-icon">
  <ShieldCheck size={26} />
</div>
            <div>
              <h3>Security Focused</h3>
              <p>Built with care</p>
            </div>
          </div>

          <div className="indipay-feature-card">
            <div className="indipay-feature-icon">
  <Headset size={26} />
</div>
            <div>
              <h3>Customer Support</h3>
              <p>Help when you need it</p>
            </div>
          </div>
        </section>

        
        {/* SERVICES SECTION */}
        <section className="indipay-services-section" id="services">

          {serviceCategories.map((category) => {
            const CategoryIcon = category.icon;

            return (
              <section
                className="indipay-service-category"
                key={category.title}
              >
                <div className="indipay-category-heading">

                  <div className="indipay-category-symbol">
                    <CategoryIcon size={29} strokeWidth={1.8} />
                  </div>

                  <div className="indipay-category-title">
                    <h2>{category.title}</h2>
                    <p>{category.description}</p>
                  </div>

                  <button
                    type="button"
                    className="indipay-see-more"
                    onClick={onOpenServices}
                  >
                    More <ArrowRight size={17} />
                  </button>

                </div>

                {category.comingSoon ? (
                  <div className="indipay-service-coming-soon">
                    More services coming soon
                  </div>
                ) : (
                  <div
  className="indipay-services-card"
  style={{
    "--service-bg-image": `url("${import.meta.env.BASE_URL}images/service-backgrounds/${category.background}")`,
  }}
>
                  <div className="indipay-service-grid">

                    {category.services.map((service) => {
                      const ServiceIcon = service.icon;

                      
return (
  <div
    className="indipay-service-item"
    key={service.name}
    onClick={() => onSelectService?.(service)}
    role="button"
    tabIndex={0}
    onKeyDown={(event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onSelectService?.(service);
      }
    }}
  >
    <div className="indipay-service-icon">
      {service.image ? (
        <img
          src={service.image}
          alt={service.name}
          className="indipay-custom-service-image"
        />
      ) : (
        <ServiceIcon size={30} strokeWidth={1.8} />
      )}
    </div>

    <h3>{service.name}</h3>
  </div>
  
);

                    })}

                  </div>
                  </div>
                )}

              </section>
            );
          })}

        </section>



        {/* WALLET BANNER */}
        <section className="indipay-wallet-banner" id="wallet">
          <div className="indipay-wallet-copy">
            <span className="indipay-wallet-label">
              INTRODUCING INDIPAY
            </span>

            <h2>Your Everyday Services, One Convenient Place</h2>

            <p>
              Explore services and manage your next steps with ease.
            </p>

            <a href="#register" className="indipay-wallet-button">
              Get Started <span>→</span>
            </a>
          </div>

          
<div className="indipay-wallet-art">
  <div className="indipay-wallet-main-icon">
    <Wallet size={58} strokeWidth={1.7} />
  </div>

  <div className="indipay-wallet-card-icon">
    <CreditCard size={35} strokeWidth={1.8} />
  </div>

  <div className="indipay-wallet-coin-icon">
    <span>₹</span>
  </div>
</div>


          
<div className="indipay-wallet-benefits">
  <div>
    <span><BadgeCheck size={18} /></span>
    Convenient access
  </div>

  <div>
    <span><LayoutGrid size={18} /></span>
    Multiple service categories
  </div>

  <div>
    <span><Smartphone size={18} /></span>
    Designed for your devices
  </div>
</div>

        </section>

            
        {/* REWARDS AND OFFERS BANNER */}
        <section className="indipay-promo-banner indipay-rewards-banner">
          <div className="indipay-promo-copy">
            <span className="indipay-promo-label">
              EXCLUSIVE BENEFITS
            </span>

            <h2>Rewards That Make Every Day Better</h2>

            <p>
              Discover exciting offers, special discounts and rewards
              designed to give you more value every day.
            </p>

            <a href="#offers" className="indipay-promo-button">
              Explore Offers <span>→</span>
            </a>
          </div>

          <div className="indipay-promo-visual" aria-hidden="true">
            <div className="indipay-gift-box">
  <Gift size={65} strokeWidth={1.5} />
</div>
            <div className="indipay-promo-floating-tag">
              SPECIAL OFFER
            </div>
            <div className="indipay-promo-floating-circle">
  <Percent size={27} />
</div>
          </div>

          
<div className="indipay-promo-points">
  <div>
    <PartyPopper size={18} />
    Exciting deals and discounts
  </div>

  <div>
    <CreditCard size={18} />
    Exclusive member benefits
  </div>

  <div>
    <Star size={18} />
    New rewards to discover
  </div>
</div>

        </section>

            
        {/* REFER AND EARN BANNER */}
        <section className="indipay-promo-banner indipay-referral-banner">
          <div className="indipay-promo-copy">
            <span className="indipay-promo-label">
              SHARE THE BENEFITS
            </span>

            <h2>Invite Friends. Earn Together.</h2>

            <p>
              Share Indipay with your friends and family.
              Enjoy exciting referral benefits when they join.
            </p>

            <a href="#referral" className="indipay-promo-button">
              Invite Friends <span>→</span>
            </a>
          </div>

          <div className="indipay-promo-visual" aria-hidden="true">
            <div className="indipay-people-icon">
  <UsersRound size={65} strokeWidth={1.5} />
</div>
            <div className="indipay-referral-coin">₹</div>
            <div className="indipay-referral-bubble">
              + REWARDS
            </div>
          </div>

          <div className="indipay-promo-points">
            
<div className="indipay-promo-points">
  <div>
    <Handshake size={18} />
    Share with friends and family
  </div>

  <div>
    <Gift size={18} />
    Unlock referral benefits
  </div>

  <div>
    <UsersRound size={18} />
    Grow your Indipay community
  </div>
</div>

          </div>
        </section>


        <button className="indipay-back-button" onClick={onBack}>
          ← Back to Existing Page
        </button>
      </main>
    


    </div>
  );
}

export default Home;
