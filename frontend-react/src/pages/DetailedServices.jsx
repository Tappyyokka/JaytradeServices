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
  FaMagnifyingGlass,
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
import { selectCatalogService, serviceCatalog as categories } from "./serviceCatalog";
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
  search: FaMagnifyingGlass,
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
  serviceOverrides = {},
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
  const [serviceSearch, setServiceSearch] = useState("");


  

const normalizedSearch = serviceSearch.trim().toLowerCase();

const filteredCategories = categories
  .map((category) => {
    const categoryMatches = category.title
      .toLowerCase()
      .includes(normalizedSearch);

    const available = category.services.filter((service) => serviceOverrides[service.name.toLowerCase()]?.available !== false);
    const matchingServices = available.filter((service) =>
      service.name.toLowerCase().includes(normalizedSearch)
    );

    return {
      ...category,
      services:
        !normalizedSearch || categoryMatches
          ? available
          : matchingServices,
    };
  })
  .filter((category) => category.services.length > 0);


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

  const handleServiceClick = (category, service) => selectCatalogService(category.id, service, {
    onSelectService, onSelectLegalService, onOpenJobs, onOpenTimes,
  });

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

        <div className="indipay-services-header-search">
          <span className="indipay-services-search-icon" aria-hidden="true">
            <AnimatedIcon name="search" size={19} />
          </span>

          <input
            type="search"
            value={serviceSearch}
            onChange={(event) => setServiceSearch(event.target.value)}
            placeholder="Search services, loans, registrations..."
            aria-label="Search services"
          />
        </div>
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
          {normalizedSearch && filteredCategories.length === 0 && (
            <div className="indipay-services-no-results" role="status">
              <strong>No services found</strong>
              <p>Try another service name or category.</p>
            </div>
          )}
          {filteredCategories.map((category) => {
            const isClickable = clickableCategories.includes(category.id);

            return (
              <section
                className={`indipay-detail-category detail-${category.id}`}
                key={category.id}
                id={category.id}
              >
                <div className="indipay-detail-category-heading">
                  <div className="indipay-detail-category-heading-text">
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
