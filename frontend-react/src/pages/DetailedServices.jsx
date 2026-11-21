import { useState } from "react";

import {
  FaHouse,
  FaBuilding,
  FaUser,
  FaBriefcase,
  FaArrowRightArrowLeft,
  FaFileLines,
  FaChartLine,
  FaReceipt,
  FaShieldHalved,
  FaGlobe,
  FaUsers,
  FaRegistered,
  FaCertificate,
  FaStore,
  FaGraduationCap,
  FaNewspaper,
  FaTableCellsLarge,
  FaBell,
  FaBars,
  FaXmark,
  FaArrowRight,
  FaLandmark,
  FaCircleInfo,
  FaCircleQuestion,
  FaRightToBracket,
  FaUserPlus,
  FaGear,
  FaRightFromBracket,
  FaGift,
  FaBookOpen,
} from "react-icons/fa6";

import indipayLogo from "../assets/images/logo-transparent2.png";
import "./Home.css";
import "./DetailedServices.css";

// All icons in this component use react-useanimations.
// Reuse the closest available animation for concepts without a dedicated asset.
const icons = {
  home: FaHouse,
  bank: FaLandmark,
  building: FaBuilding,
  user: FaUser,
  briefcase: FaBriefcase,
  exchange: FaArrowRightArrowLeft,
  file: FaFileLines,
  report: FaChartLine,
  receipt: FaReceipt,
  shield: FaShieldHalved,
  world: FaGlobe,
  users: FaUsers,
  trademark: FaRegistered,
  certificate: FaCertificate,
  store: FaStore,
  school: FaGraduationCap,
  news: FaNewspaper,
  grid: FaTableCellsLarge,
  bell: FaBell,
  menu: FaBars,
  close: FaXmark,
  arrow: FaArrowRight,
  info: FaCircleInfo,
  question: FaCircleQuestion,
  login: FaRightToBracket,
  register: FaUserPlus,
  settings: FaGear,
  logout: FaRightFromBracket,
  gift: FaGift,
  book: FaBookOpen,
};

function AnimatedIcon({
  name = "file",
  size = 22,
  className,
  strokeColor = "currentColor",
}) {
  const Icon = icons[name] || FaFileLines;

  return (
    <span className={className} aria-hidden="true">
      <Icon size={size} color={strokeColor} />
    </span>
  );
}

function DetailedServices({
  onBack,
  onSelectService,
  onSelectLegalService,
  onOpenApplicationStatus,
  onOpenAnnouncements,
  onOpenJobs,
  onOpenTimes,
  onLogin,
  onRegister,
}) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Me");
  const [menuOpen, setMenuOpen] = useState(false);


  
const categories = [
  {
    id: "financial-services",
    title: "Financial Services",
    description: "Financial solutions for your needs",
    icon: "bank",
    services: [
      {
        name: "Housing Loan",
        icon: "home",
        image: `${import.meta.env.BASE_URL}images/icons/housing-loan.jpeg`,
      },
      {
        name: "Property Loan",
        icon: "building",
        image: `${import.meta.env.BASE_URL}images/icons/property-loan.jpeg`,
      },
      {
        name: "Personal Loan",
        icon: "user",
        image: `${import.meta.env.BASE_URL}images/icons/personal-loan.jpeg`,
      },
      {
        name: "Business Loan – Secured",
        icon: "briefcase",
        image: `${import.meta.env.BASE_URL}images/icons/bl-secured.jpeg`,
      },
      {
        name: "Business Loan – Unsecured",
        icon: "briefcase",
        image: `${import.meta.env.BASE_URL}images/icons/bl-unsecured.jpeg`,
      },
      {
        name: "Take Over Loan",
        icon: "exchange",
        image: `${import.meta.env.BASE_URL}images/icons/Takeover-loan.png`,
      },
      {
        name: "MSME Loan",
        icon: "building",
      },
    ],
  },
  {
    id: "legal-services",
    title: "Legal Services",
    description: "Documentation, registration and compliance services.",
    icon: "file",
    services: [
      {
        name: "CIBIL Report",
        icon: "report",
        image: `${import.meta.env.BASE_URL}images/icons/Cibil.png`,
      },
      {
        name: "MSME",
        icon: "building",
        image: `${import.meta.env.BASE_URL}images/icons/MSME.png`,
      },
      {
        name: "Mudra Project Report (up to ₹5 lakh)",
        icon: "file",
      },
      {
        name: "Mudra Project Report (above ₹5 lakh)",
        icon: "file",
        image: `${import.meta.env.BASE_URL}images/icons/PR-above5.png`,
      },
      {
        name: "GST Registration",
        icon: "receipt",
        image: `${import.meta.env.BASE_URL}images/icons/GST.png`,
      },
      {
        name: "ITR – Income Tax Filing",
        icon: "file",
        image: `${import.meta.env.BASE_URL}images/icons/ITR.png`,
      },
      {
        name: "FSSAI Registration Fee",
        icon: "certificate",
        image: `${import.meta.env.BASE_URL}images/icons/FSSAI.png`,
      },
      {
        name: "FSSAI License Fee",
        icon: "shield",
        image: `${import.meta.env.BASE_URL}images/icons/FSSAI.png`,
      },
      {
        name: "FSSAI Registration Modification",
        icon: "file",
        image: `${import.meta.env.BASE_URL}images/icons/FSSAI.png`,
      },
      {
        name: "FSSAI License Modification",
        icon: "shield",
        image: `${import.meta.env.BASE_URL}images/icons/FSSAI.png`,
      },
      {
        name: "FSSAI Manufacture Registration",
        icon: "certificate",
        image: `${import.meta.env.BASE_URL}images/icons/FSSAI.png`,
      },
      {
        name: "FSSAI Manufacture License",
        icon: "shield",
        image: `${import.meta.env.BASE_URL}images/icons/FSSAI.png`,
      },
      {
        name: "Import Export Code",
        icon: "world",
      },
      {
        name: "ISO Certificate",
        icon: "certificate",
        image: `${import.meta.env.BASE_URL}images/icons/ISO.png`,
      },
      {
        name: "Private Limited Company Registration",
        icon: "building",
      },
      {
        name: "Partnership Registration Only",
        icon: "users",
      },
      {
        name: "Partnership Without Registration (PAN + Deed)",
        icon: "file",
      },
      {
        name: "Partnership With Registration (REG + PAN + Deed)",
        icon: "report",
      },
      {
        name: "Limited Liability Partnership Registration (LLP)",
        icon: "building",
      },
      {
        name: "Trademark - Individual, MSME (Without Track Records)",
        icon: "trademark",
        image: `${import.meta.env.BASE_URL}images/icons/Trademark.png`,
      },
      {
        name: "Trademark - Individual, MSME (With Track Records)",
        icon: "trademark",
        image: `${import.meta.env.BASE_URL}images/icons/Trademark.png`,
      },
      {
        name: "Trademark - LLP/Co/PS (Other Than MSME Without Track Records)",
        icon: "trademark",
        image: `${import.meta.env.BASE_URL}images/icons/Trademark.png`,
      },
      {
        name: "Trademark - LLP/Co/PS (Other Than MSME With Track Records)",
        icon: "trademark",
        image: `${import.meta.env.BASE_URL}images/icons/Trademark.png`,
      },
      {
        name: "Trademark - Ownership Change",
        icon: "trademark",
        image: `${import.meta.env.BASE_URL}images/icons/Trademark.png`,
      },
      {
        name: "PCC - Police Clearance Certificate",
        icon: "shield",
      },
      {
        name: "Vyapar Mithra",
        icon: "user",
      },
      {
        name: "Vyapar Mithra Plus",
        icon: "user",
      },
      {
        name: "Vyapar Mithra All In One",
        icon: "user",
      },
    ],
  },
  {
    id: "business-development",
    title: "Business Development",
    description: "Business opportunities and partnership programmes.",
    icon: "briefcase",
    services: [
      {
        name: "Business Associate",
        icon: "users",
        image: `${import.meta.env.BASE_URL}images/icons/BA.png`,
      },
      {
        name: "Premium Franchise",
        icon: "store",
        image: `${import.meta.env.BASE_URL}images/icons/PF.png`,
      },
      {
        name: "Normal Franchise",
        icon: "building",
        image: `${import.meta.env.BASE_URL}images/icons/NF.png`,
      },
      {
        name: "Virtual Franchise",
        icon: "world",
        image: `${import.meta.env.BASE_URL}images/icons/VF.png`,
      },
    ],
  },
  {
    id: "jaytrade-jobs",
    title: "Jaytrade Jobs",
    description: "Explore our registration and employment-related services.",
    icon: "school",
    services: [
      {
        name: "Udyog Registration",
        icon: "report",
        image: `${import.meta.env.BASE_URL}images/icons/Udyog.png`,
      },
      {
        name: "Udyog Plus Registration",
        icon: "shield",
        image: `${import.meta.env.BASE_URL}images/icons/Udplus.png`,
      },
      {
        name: "Standard Registration",
        icon: "file",
        image: `${import.meta.env.BASE_URL}images/icons/Standard.png`,
      },
      {
        name: "Corporate Plus",
        icon: "building",
        image: `${import.meta.env.BASE_URL}images/icons/Corporate.png`,
      },
    ],
  },
  {
    id: "jaytrade-times",
    title: "Jaytrade Times & Technologies",
    description: "Media, advertising and technology solutions.",
    icon: "news",
    services: [
      {
        name: "Growup Package",
        icon: "briefcase",
        image: `${import.meta.env.BASE_URL}images/icons/growup.png`,
      },
      {
        name: "Standard Package",
        icon: "file",
        image: `${import.meta.env.BASE_URL}images/icons/ST.png`,
      },
      {
        name: "Premium Package",
        icon: "certificate",
        image: `${import.meta.env.BASE_URL}images/icons/premium.png`,
      },
      {
        name: "Corporate Package",
        icon: "building",
        image: `${import.meta.env.BASE_URL}images/icons/Corp.png`,
      },
    ],
  },
];


  const totalServices = categories.reduce(
    (total, category) => total + category.services.length,
    0
  );

 const clickableCategories = [
  "financial-services",
  "legal-services",
  "business-development",
  "jaytrade-jobs",
  "jaytrade-times",
];

  const handleServiceClick = (category, service) => {
  if (category.id === "legal-services") {
    onSelectLegalService?.(service);
  } else if (
    category.id === "financial-services" ||
    category.id === "business-development"
  ) {
    onSelectService?.(service);
  } else if (category.id === "jaytrade-jobs") {
    onOpenJobs?.();
  } else if (category.id === "jaytrade-times") {
    onOpenTimes?.();
  }
};

  const handleServiceKeyDown = (event, category, service) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleServiceClick(category, service);
    }
  };

  return (
    <div className="indipay-home indipay-detailed-services">
      <header className="indipay-services-plain-header">
        <button
          className="indipay-app-menu"
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <AnimatedIcon name={menuOpen ? "close" : "menu"} size={25} />
        </button>

        <div className="indipay-services-header-actions">
          <button
            className="indipay-header-icon"
            type="button"
            aria-label="Notifications"
            onClick={onOpenAnnouncements}
          >
            <AnimatedIcon name="bell" size={21} />
          </button>

          <button
            className="indipay-header-icon"
            type="button"
            aria-label="Application Status"
            onClick={onOpenApplicationStatus}
          >
            <AnimatedIcon name="file" size={21} />
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

            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                onBack?.();
              }}
            >
              <AnimatedIcon name="home" size={19} /> Home
            </button>

            <button type="button" onClick={() => setMenuOpen(false)}>
              <AnimatedIcon name="grid" size={19} /> All Services
            </button>

            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                onOpenApplicationStatus?.();
              }}
            >
              <AnimatedIcon name="file" size={19} /> My Applications
            </button>

            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                onOpenAnnouncements?.();
              }}
            >
              <AnimatedIcon name="bell" size={19} /> Notifications
            </button>

            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                onLogin?.();
              }}
            >
              <AnimatedIcon name="login" size={19} /> Login
            </button>

            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                onRegister?.();
              }}
            >
              <AnimatedIcon name="register" size={19} /> Create Account
            </button>
          </nav>
        </div>
      )}

      <main className="indipay-services-page-container">
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
              From financial solutions to business opportunities, explore the
              services available through Indipay.
            </p>

            <a href="#financial-services" className="indipay-services-explore">
              Explore All Services
              <AnimatedIcon
                name="arrow"
                size={22}
                strokeColor="#F28C28"
              />
            </a>
          </div>

          <div className="indipay-services-hero-visual">
            <div className="indipay-services-visual-circle">
              <AnimatedIcon name="grid" size={58} />
            </div>

            <div className="indipay-services-floating-icon services-float-one">
              <AnimatedIcon name="bank" size={25} />
            </div>

            <div className="indipay-services-floating-icon services-float-two">
              <AnimatedIcon name="file" size={24} />
            </div>

            <div className="indipay-services-floating-icon services-float-three">
              <AnimatedIcon name="briefcase" size={25} />
            </div>
          </div>

          <div className="indipay-services-hero-stats">
            <div>
              <strong>{categories.length}</strong>
              <span>Service Categories</span>
            </div>

            <div className="indipay-services-stat-divider" />

            <div>
              <strong>{totalServices}</strong>
              <span>Listed Services</span>
            </div>

            <div className="indipay-services-stat-divider" />

            <div>
              <strong>One</strong>
              <span>Convenient Platform</span>
            </div>
          </div>
        </section>

        <div className="indipay-services-list">
          {categories.map((category, index) => {
            const isClickable = clickableCategories.includes(category.id);

            return (
              <section
                className={`indipay-detail-category detail-${category.id}`}
                key={category.id}
                id={category.id}
              >
                <div className="indipay-detail-category-heading">
                  <div className="indipay-detail-category-icon">
                    <AnimatedIcon name={category.icon} size={27} />
                  </div>

                  <div className="indipay-detail-category-heading-text">
                    <span className="indipay-detail-category-number">
                      CATEGORY {String(index + 1).padStart(2, "0")}
                    </span>
                    <h2>{category.title}</h2>
                    <p>{category.description}</p>
                  </div>

                  <span className="indipay-detail-category-count">
                    {category.services.length} Services
                  </span>
                </div>

                <div className="indipay-detail-service-grid">
                  {category.services.map((service) => (
                    <button
                      type="button"
                      className="indipay-detail-service-item"
                      key={service.name}
                      onClick={() => handleServiceClick(category, service)}
                      onKeyDown={(event) =>
                        handleServiceKeyDown(event, category, service)
                      }
                      disabled={!isClickable}
                      aria-label={`Open ${service.name}`}
                    >
                      <span className="indipay-detail-service-icon">
  {service.image ? (
    <img
      src={service.image}
      alt={service.name}
      className="indipay-detail-service-image"
    />
  ) : (
    <AnimatedIcon
      name={service.icon}
      size={21}
      className="indipay-detail-service-symbol"
    />
  )}
</span>

                      <span className="indipay-detail-service-name">
                        {service.name}
                      </span>

                      {isClickable && (
                        <span className="indipay-detail-service-arrow">
                          <AnimatedIcon name="arrow" size={18} />
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        <div className="indipay-services-bottom">
          <p>Can't find what you're looking for?</p>
          <span>Contact our team for assistance with our services.</span>
          <button type="button" onClick={onBack}>
            Back to Indipay Home
            <AnimatedIcon name="arrow" size={17} />
          </button>
        </div>
      </main>

      {activeTab !== "Me" && (
        <div className="indipay-tab-placeholder">
          <AnimatedIcon name="question" size={20} />
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
              <span>
                <AnimatedIcon name="user" size={25} />
              </span>
              <div>
                <strong>Welcome to Indipay</strong>
                <small>Sign in to access your account</small>
              </div>
              <button
                type="button"
                onClick={() => setProfileOpen(false)}
                aria-label="Close profile"
              >
                <AnimatedIcon name="close" size={20} />
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setProfileOpen(false);
                onLogin?.();
              }}
            >
              <AnimatedIcon name="logout" size={18} /> Login
              <AnimatedIcon name="arrow" size={17} />
            </button>

            <button
              type="button"
              onClick={() => {
                setProfileOpen(false);
                onRegister?.();
              }}
            >
              <AnimatedIcon name="register" size={18} /> Create Account
              <AnimatedIcon name="arrow" size={17} />
            </button>

            <button
              type="button"
              onClick={() => {
                setProfileOpen(false);
                setActiveTab("My Profile");
              }}
            >
              <AnimatedIcon name="settings" size={18} /> My Profile
              <AnimatedIcon name="arrow" size={17} />
            </button>
          </section>
        </div>
      )}
    </div>
  );
}

export default DetailedServices;
