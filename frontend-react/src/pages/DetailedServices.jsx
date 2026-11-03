
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
  Landmark,
  FileText,
  BriefcaseBusiness,
  GraduationCap,
  Newspaper,
  CreditCard,
  Building2,
  Building,
  BadgeCheck,
  ClipboardCheck,
  ShieldCheck,
  Receipt,
  FileCheck,
  Globe,
  Users,
  ChevronRight,
  Star,
} from "lucide-react";

import "./Home.css";
import "./DetailedServices.css";

function DetailedServices({ onBack, onSelectService }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { label: "Home", href: "#home", icon: HomeIcon },
    { label: "Services", href: "#financial-services", icon: LayoutGrid },
    { label: "Wallet", href: "#wallet", icon: Wallet },
    { label: "About Us", href: "#about", icon: Info },
  ];

  const categories = [
  {
    id: "financial-services",
    title: "Financial Services",
    description: "Financial solutions for your needs",
    icon: Landmark,
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
      id: "legal-services",
      title: "Legal Services",
      description: "Documentation, registration and compliance services.",
      icon: FileText,
      services: [
        { name: "CIBIL Report", icon: FileCheck },
        { name: "MSME", icon: Building2 },
        { name: "Mudra Project Report (up to ₹5 lakh)", icon: ClipboardCheck },
        { name: "Mudra Project Report (above ₹5 lakh)", icon: ClipboardCheck },
        { name: "GST Registration", icon: Receipt },
        { name: "ITR – Income Tax Filing", icon: FileText },
        { name: "FSSAI Registration Fee", icon: BadgeCheck },
        { name: "FSSAI License Fee", icon: BadgeCheck },
        { name: "FSSAI Registration Modification", icon: FileCheck },
        { name: "FSSAI License Modification", icon: FileCheck },
        { name: "FSSAI Manufacture Registration", icon: ClipboardCheck },
        { name: "FSSAI Manufacture License", icon: ShieldCheck },
        { name: "Import Export Code", icon: Globe },
        { name: "ISO Certificate", icon: BadgeCheck },
      ],
    },
    {
      id: "business-development",
      title: "Business Development",
      description: "Business opportunities and partnership programmes.",
      icon: BriefcaseBusiness,
      services: [
        { name: "Business Associate", icon: Users },
        { name: "Premium Franchise", icon: Building2 },
        { name: "Normal Franchise", icon: Building },
        { name: "Virtual Franchise", icon: Globe },
      ],
    },
    {
      id: "jaytrade-jobs",
      title: "Jaytrade Jobs",
      description: "Explore our registration and employment-related services.",
      icon: GraduationCap,
      services: [
        { name: "Udyog Registration", icon: FileCheck },
        { name: "Basic Registration", icon: ClipboardCheck },
        { name: "Udyog Plus Registration", icon: BadgeCheck },
        { name: "Standard Registration", icon: FileText },
        { name: "Corporate Plus", icon: Building2 },
      ],
    },
    {
  id: "jaytrade-times",
  title: "Jaytrade Times & Technologies",
  description: "Media, advertising and technology solutions.",
  icon: Newspaper,
  services: [
    { name: "Growup Package", icon: BriefcaseBusiness },
    { name: "Standard Package", icon: BadgeCheck },
    { name: "Premium Package", icon: Star },
    { name: "Corporate Package", icon: Building2 },
  ],
},
  ];

  const totalServices = categories.reduce(
    (total, category) => total + category.services.length,
    0
  );

  return (
    <div className="indipay-home indipay-detailed-services">

      {/* HEADER AND NAVIGATION */}
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
                item.label === "Services" ? "active" : ""
              }`}
              onClick={() => {
                setMobileOpen(false);

                if (item.label === "Home") {
                  onBack();
                }
              }}
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

      <main className="indipay-services-page-container">

        {/* PAGE INTRODUCTION */}
        <section className="indipay-services-hero">
          <div className="indipay-services-hero-content">
            <span className="indipay-services-eyebrow">
              <span className="indipay-services-eyebrow-dot" />
              EVERYTHING YOU NEED, IN ONE PLACE
            </span>

            <h1>
              Discover Services
              <span> Made for You.</span>
            </h1>

            <p>
              From financial solutions to business opportunities,
              explore the services available through Indipay.
            </p>

            <a href="#financial-services" className="indipay-services-explore">
              Explore All Services
              <ArrowRight size={18} />
            </a>
          </div>

          <div className="indipay-services-hero-visual">
            <div className="indipay-services-visual-circle">
              <LayoutGrid size={58} strokeWidth={1.4} />
            </div>

            <div className="indipay-services-floating-icon services-float-one">
              <Landmark size={25} />
            </div>

            <div className="indipay-services-floating-icon services-float-two">
              <FileText size={24} />
            </div>

            <div className="indipay-services-floating-icon services-float-three">
              <BriefcaseBusiness size={25} />
            </div>
          </div>

          <div className="indipay-services-hero-stats">
            <div>
              <strong>{categories.length}</strong>
              <span>Service Categories</span>
            </div>

            <div className="indipay-services-stat-divider" />

            <div>
              <strong>{totalServices}+</strong>
              <span>Listed Services</span>
            </div>

            <div className="indipay-services-stat-divider" />

            <div>
              <strong>One</strong>
              <span>Convenient Platform</span>
            </div>
          </div>
        </section>

        {/* CATEGORY SECTIONS */}
        <div className="indipay-services-list">

          {categories.map((category, index) => {
            const CategoryIcon = category.icon;

            return (
              <section
                className="indipay-detail-category"
                key={category.id}
                id={category.id}
              >
                <div className="indipay-detail-category-heading">

                  <div className="indipay-detail-category-icon">
                    <CategoryIcon size={27} strokeWidth={1.8} />
                  </div>

                  <div className="indipay-detail-category-heading-text">
                    <span className="indipay-detail-category-number">
                      CATEGORY 0{index + 1}
                    </span>

                    <h2>{category.title}</h2>
                    <p>{category.description}</p>
                  </div>

                  <span className="indipay-detail-category-count">
                    {category.comingSoon
                      ? "Coming Soon"
                      : `${category.services.length} Services`}
                  </span>

                </div>

                {category.comingSoon ? (
                  <div className="indipay-services-coming-soon">
                    <Newspaper size={28} />
                    <div>
                      <strong>Something exciting is coming.</strong>
                      <span>More services will be added here soon.</span>
                    </div>
                  </div>
                ) : (
                  <div className="indipay-detail-service-grid">
                    {category.services.map((service) => {
                      const ServiceIcon = service.icon;

                      return (
  <div
    className="indipay-detail-service-item"
    key={service.name}
    onClick={
      category.id === "financial-services"
        ? () => onSelectService?.(service)
        : undefined
    }
    role={
      category.id === "financial-services"
        ? "button"
        : undefined
    }
    tabIndex={
      category.id === "financial-services"
        ? 0
        : undefined
    }
    onKeyDown={(event) => {
      if (
        category.id === "financial-services" &&
        (event.key === "Enter" || event.key === " ")
      ) {
        event.preventDefault();
        onSelectService?.(service);
      }
    }}
  >
    <span className="indipay-detail-service-icon">
      <ServiceIcon size={24} strokeWidth={1.8} />
    </span>

    <h3>{service.name}</h3>

    <span className="indipay-detail-service-arrow">
      <ChevronRight size={17} />
    </span>
  </div>
);
                    })}
                  </div>
                )}

              </section>
            );
          })}

        </div>

        <div className="indipay-services-bottom">
          <p>Can't find what you're looking for?</p>
          <span>Contact our team for assistance with our services.</span>
          <button type="button" onClick={onBack}>
            Back to Indipay Home
            <ArrowRight size={17} />
          </button>
        </div>

      </main>

      <footer className="indipay-footer" id="about">
        <p>© 2026 Indipay. All rights reserved.</p>
      </footer>

    </div>
  );
}

export default DetailedServices;
