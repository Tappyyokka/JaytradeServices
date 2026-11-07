
import { useState } from "react";
import indipayLogo from "../assets/images/logo-transparent2.png";

import {
  Home as HomeIcon,
  LayoutGrid,
  Wallet,
  Info,
  Bell,
  UserRound,
  ChevronDown,
  LogIn,
  UserPlus,
  Settings,
  LogOut,
  Menu,
  CircleHelp,
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
  BookOpen,
Gift,
  Star,
} from "lucide-react";

import "./Home.css";
import "./DetailedServices.css";

function DetailedServices({
  onBack,
  onSelectService,
  onOpenApplicationStatus,
  onOpenAnnouncements,
  onLogin,
  onRegister,
}) {
  

  

  const navItems = [
    { label: "Home", href: "#home", icon: HomeIcon },
    { label: "Services", href: "#financial-services", icon: LayoutGrid },
    { label: "Wallet", href: "#wallet", icon: Wallet },
    { label: "About Us", href: "#about", icon: Info },
  ];

  const [profileOpen, setProfileOpen] = useState(false);
const [activeTab, setActiveTab] = useState("Me");
const [menuOpen, setMenuOpen] = useState(false);

const handleBottomTab = (label) => {
  setActiveTab(label);

  if (label === "Me") {
    setProfileOpen(true);
  }
};

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
{
  name: "Take Over Loan",
  icon: Building2,
},
{
  name: "MSME Loan",
  icon: Building2,
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
       { name: "Private Limited Company Registration", icon: Building2 },
      { name: "Partnership Registration Only", icon: FileText },
      { name: "Partnership Without Registration (PAN + Deed)", icon: FileText },
      { name: "Partnership With Registration (REG + PAN + Deed)", icon: FileCheck },
      { name: "Limited Liability Partnership Registration (LLP)", icon: Building2 },

      { name: "Trademark - Individual, MSME (Without Track Records)", icon: BadgeCheck },
      { name: "Trademark - Individual, MSME (With Track Records)", icon: BadgeCheck },
      { name: "Trademark - LLP/Co/PS (Other Than MSME Without Track Records)", icon: ShieldCheck },
      { name: "Trademark - LLP/Co/PS (Other Than MSME With Track Records)", icon: ShieldCheck },
      { name: "Trademark - Ownership Change", icon: FileCheck },

      { name: "PCC - Police Clearance Certificate", icon: FileCheck },
      { name: "Vyapar Mithra", icon: BriefcaseBusiness },
      { name: "Vyapar Mithra Plus", icon: BriefcaseBusiness },
      { name: "Vyapar Mithra All In One", icon: BriefcaseBusiness },
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

      <header className="indipay-services-plain-header">

  {/* LEFT: BURGER MENU */}
  <button
    className="indipay-app-menu"
    type="button"
    aria-label="Open menu"
    aria-expanded={menuOpen}
    onClick={() => setMenuOpen((open) => !open)}
  >
    {menuOpen ? <X size={24} /> : <Menu size={25} />}
  </button>

  {/* RIGHT: HEADER ACTIONS */}
  <div className="indipay-services-header-actions">

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
      aria-label="Application Status"
      onClick={onOpenApplicationStatus}
    >
      <FileText size={21} />
    </button>

  </div>
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
        <img src={indipayLogo} alt="Jaytrade Logo" />
      </div>

      <button onClick={() => {
        setMenuOpen(false);
        onBack?.();
      }}>
        <HomeIcon size={18} /> Home
      </button>

      <button onClick={() => setMenuOpen(false)}>
        <LayoutGrid size={18} /> All Services
      </button>

      <button onClick={() => {
        setMenuOpen(false);
        onOpenApplicationStatus?.();
      }}>
        <FileText size={18} /> My Applications
      </button>

      <button onClick={() => {
        setMenuOpen(false);
        onOpenAnnouncements?.();
      }}>
        <Bell size={18} /> Notifications
      </button>

      <button onClick={() => {
        setMenuOpen(false);
        onLogin?.();
      }}>
        <LogIn size={18} /> Login
      </button>

      <button onClick={() => {
        setMenuOpen(false);
        onRegister?.();
      }}>
        <UserPlus size={18} /> Create Account
      </button>
    </nav>
  </div>
)}

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
  {service.image ? (
    <img
      src={service.image}
      alt={service.name}
      className="indipay-detail-service-image"
    />
  ) : (
    <ServiceIcon size={24} strokeWidth={1.8} />
  )}
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

      {activeTab !== "Me" && (
  <div className="indipay-tab-placeholder">
    <CircleHelp size={20} />
    <div>
      <strong>{activeTab}</strong>
      <span>This section will be connected in a later update.</span>
    </div>
  </div>
)}

{profileOpen && (
  <div
    className="indipay-profile-overlay"
    onClick={() => setProfileOpen(false)}
  >
    <section
      className="indipay-profile-sheet"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="indipay-profile-sheet-handle" />

      <div className="indipay-profile-sheet-heading">
        <span><UserRound size={25} /></span>
        <div>
          <strong>Welcome to Indipay</strong>
          <small>Sign in to access your account</small>
        </div>
        <button
          onClick={() => setProfileOpen(false)}
          aria-label="Close profile"
        >
          <X size={20} />
        </button>
      </div>

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

      <button onClick={() => {
        setProfileOpen(false);
        setActiveTab("My Profile");
      }}>
        <Settings size={18} /> My Profile <ChevronRight size={17} />
      </button>
    </section>
  </div>
)}

      <nav className="indipay-bottom-nav" aria-label="Main navigation">
  {[
    { label: "Me", icon: UserRound },
    { label: "My Customers", icon: Users },
    { label: "Rewards", icon: Gift },
    { label: "Learn & Earn", icon: BookOpen },
    { label: "About Us", icon: Info },
  ].map((item) => {
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

export default DetailedServices;
