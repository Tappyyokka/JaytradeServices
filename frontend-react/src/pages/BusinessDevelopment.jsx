
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  BriefcaseBusiness,
  Building2,
  Globe,
  GraduationCap,
  Store,
  Users,
} from "lucide-react";

import "./BusinessDevelopment.css";

const packages = [
  {
    name: "Business Associate",
    serviceName: "Business Associate",
    percentage: "20%",
    icon: Users,
    description: "Explore business opportunities with attractive profit sharing.",
    features: [
      "High profit margin",
      "PAN India business opportunity",
      "Online and offline training",
      "₹5,000/- travelling allowance*",
      "Digital visiting card",
    ],
  },
  {
    name: "Virtual Franchise",
    serviceName: "Virtual Franchise",
    percentage: "30%",
    icon: Globe,
    description: "Build your business without the requirement of an office space.",
    features: [
      "High profit margin",
      "Online and offline training",
      "PAN India business opportunity",
      "₹10,000/- rent support*",
      "₹5,000/- travelling allowance*",
      "₹5,000/- staff salary*",
      "Digital visiting card",
      "Do business without office space",
    ],
  },
  {
    name: "Normal Franchise",
    serviceName: "Normal Franchise",
    percentage: "40%",
    icon: Store,
    description: "Grow your business with corporate office support and facilities.",
    features: [
      "High profit margin",
      "Online and offline training",
      "PAN India business opportunity",
      "₹10,000/- rent support*",
      "₹5,000/- travelling allowance*",
      "₹10,000/- salary support*",
      "Digital visiting card",
      "Cabin facility available in corporate office",
    ],
  },
  {
    name: "Premium Franchise",
    serviceName: "Premium Franchise",
    percentage: "62%",
    icon: Building2,
    featured: true,
    description: "A premium business partnership with extended support and facilities.",
    features: [
      "Free digital banking",
      "Company one number of share holder",
      "High profit margin",
      "Online and offline training",
      "PAN India business opportunity",
      "₹10,000/- administration cost support*",
      "₹10,000/- rent support*",
      "₹10,000/- salary support*",
      "Administration and marketing support",
      "Digital visiting card",
      "Lifetime one staff can use corporate office facility",
    ],
  },
];

function BusinessPackageCard({ item, index, onApplyNow }) {
  const Icon = item.icon;

  return (
    <article
      className={`bd-package-card ${
        item.featured ? "bd-package-featured" : ""
      }`}
    >
      {item.featured && (
        <span className="bd-package-badge">Premium Partnership</span>
      )}

      <div className="bd-package-number">
        PACKAGE 0{index + 1}
      </div>

      <div className="bd-package-icon">
        <Icon size={27} />
      </div>

      <h3>{item.name}</h3>

      <p className="bd-package-description">
        {item.description}
      </p>

      <div className="bd-profit-share">
        <span>UP TO</span>
        <strong>{item.percentage}</strong>
        <small>PROFIT SHARING</small>
      </div>

      <div className="bd-feature-heading">
        Partnership benefits
      </div>

      <ul className="bd-feature-list">
        {item.features.map((feature) => (
          <li key={feature}>
            <CheckCircle2 size={17} />
            {feature}
          </li>
        ))}
      </ul>

      <button
        className="bd-package-button"
        onClick={() =>
          onApplyNow?.({
            name: item.serviceName,
            packageName: item.name,
            packageType: "business-development",
          })
        }
      >
        Enquire Now
        <ArrowRight size={17} />
      </button>
    </article>
  );
}

function BusinessDevelopment({
  onBack,
  onSelectPackage,
}) {
  return (
    <div className="bd-page">
      <main className="bd-container">

        <button className="bd-back-button" onClick={onBack}>
          <ArrowLeft size={17} />
          Back
        </button>

        {/* HERO */}
        <section className="bd-hero">
          <div className="bd-hero-content">
            <span className="bd-eyebrow">
              <BriefcaseBusiness size={16} />
              JAYTRADE BUSINESS DEVELOPMENT
            </span>

            <h1>
              Build Your Business.
              <span> Share Your Success.</span>
            </h1>

            <p>
              Discover business associate and franchise opportunities
              with Jaytrade. Choose your partnership model and grow
              with our business support network.
            </p>

            <a href="#bd-packages" className="bd-hero-button">
              Explore Partnerships
              <ArrowRight size={18} />
            </a>
          </div>

          <div className="bd-hero-visual">
            <div className="bd-hero-main-icon">
              <BriefcaseBusiness size={65} />
            </div>

            <div className="bd-hero-floating bd-float-one">
              <Users size={24} />
            </div>

            <div className="bd-hero-floating bd-float-two">
              <Building2 size={24} />
            </div>

            <div className="bd-hero-floating bd-float-three">
              <GraduationCap size={24} />
            </div>
          </div>
        </section>

        {/* INTRO */}
        <section className="bd-intro">
          <span>OUR BUSINESS OPPORTUNITIES</span>
          <h2>Choose Your Partnership</h2>
          <p>
            From business associate opportunities to premium
            franchises, find the partnership that matches your goals.
          </p>
        </section>

        {/* PACKAGES */}
        <section className="bd-packages-grid" id="bd-packages">
          {packages.map((item, index) => (
            <BusinessPackageCard
              key={item.name}
              item={item}
              index={index}
              onApplyNow={onSelectPackage}
            />
          ))}
        </section>

        {/* BOTTOM BANNER */}
        <section className="bd-bottom-banner">
          <div>
            <span>GROW WITH JAYTRADE</span>
            <h2>Ready to start your business journey?</h2>
            <p>
              Choose your partnership package and connect with
              the Jaytrade Business Development team.
            </p>
          </div>

          <button
            onClick={() =>
              onSelectPackage?.({
                name: "Business Associate",
                packageName: "Business Associate",
                packageType: "business-development",
              })
            }
          >
            Get Started
            <ArrowRight size={17} />
          </button>
        </section>

      </main>
    </div>
  );
}

export default BusinessDevelopment;
