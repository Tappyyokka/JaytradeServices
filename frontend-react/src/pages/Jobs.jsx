
import {
  ArrowLeft,
  ArrowRight,
  Check,
  BriefcaseBusiness,
  Building2,
  GraduationCap,
  UserRound,
  Users,
  Gift,
  BookOpen,
  Headset,
} from "lucide-react";

import "./Jobs.css";
import { useState } from "react";

const industries = [
  "Optics",
  "Banking & Finance",
  "Automotive",
  "Insurance",
  "Textile",
  "Luxury Hotel",
  "Furniture",
  "Supermarket",
  "Real Estate",
  "Investments",
];

const candidatePackages = [
  {
    name: "Udyog Registration",
    serviceName: "Udyog Registration",
    description: "Build your career with professional job assistance.",
    features: [
      "CV creation and updation",
      "1 year job assistance",
      "Interview training",
      "12+ guaranteed opportunities",
      "Up-to-date job notifications",
      "Minimum 4 job migrations",
    ],
  },
  {
    name: "Udyog+ Registration",
    serviceName: "Udyog Plus Registration",
    description: "A complete package for long-term career support.",
    featured: true,
    features: [
      "Unlimited CV creation and updation",
      "5 year job assistance",
      "Certificate and professional kit",
      "Career advice and mock interviews",
      "Part-time job opportunities",
      "Free legal and financial assistance",
    ],
  },
];

const employerPackages = [
  {
    name: "Standard",
    serviceName: "Standard Registration",
    description: "Find verified candidates for your hiring needs.",
    features: [
      "Unlimited verified candidates for 1 year",
      "Up-to-date candidate notifications",
      "15 days replacement",
      "Part-time and full-time hiring",
      "Professional documentation and verification",
      "Free legal assistance",
    ],
  },
  {
    name: "Corporate Plus",
    serviceName: "Corporate Plus",
    description: "Advanced hiring and business support for employers.",
    featured: true,
    badge: "Corporate +",
    features: [
      "Unlimited verified candidates for 5 years",
      "International selection opportunity",
      "Up to 1 lakh consumer loan",
      "Free financial assistance, 1 lakh to 1 cr",
      "20% offer on digital banking",
      "1 page commercial ad",
    ],
  },
];

function PackageCard({ item, type, onApplyNow }) {
  return (
    <article
      className={`jobs-package-card ${
        item.featured ? "jobs-package-featured" : ""
      }`}
    >
      {item.badge && (
        <span className="jobs-package-badge">{item.badge}</span>
      )}

      {item.featured && !item.badge && (
        <span className="jobs-package-badge">Most complete</span>
      )}

      <div className="jobs-package-icon">
        {type === "candidate" ? (
          <GraduationCap size={27} />
        ) : (
          <Building2 size={27} />
        )}
      </div>

      <h3>{item.name}</h3>
      <p className="jobs-package-description">{item.description}</p>

      <div className="jobs-package-divider" />

      <ul className="jobs-feature-list">
        {item.features.map((feature) => (
          <li key={feature}>
            <span className="jobs-feature-check">
              <Check size={15} />
            </span>
            {feature}
          </li>
        ))}
      </ul>

      <button
        className={`jobs-package-button ${
          item.featured ? "jobs-package-button-featured" : ""
        }`}
        onClick={() =>
          onApplyNow?.({
            name: item.serviceName,
            packageName: item.name,
            packageType: type,
          })
        }
      >
        {type === "candidate" ? "Register Now" : "Hire Now"}
        <ArrowRight size={17} />
      </button>
    </article>
  );
}

function Jobs({ onBack, onApplyNow, onLogin, onOpenAboutUs }) {
  const [activeTab, setActiveTab] = useState("Me");

  const handleBottomNavigation = (label) => {
  setActiveTab(label);

  if (label === "Me") {
    onLogin?.();
  } else if (label === "About Us") {
    onOpenAboutUs?.();
  }
};

  return (
    <div className="jobs-page">
      <main className="jobs-container">
        <button className="jobs-back-button" onClick={onBack}>
          <ArrowLeft size={17} />
          Back
        </button>

        {/* INDUSTRIES */}
        <section className="jobs-industries-section">
          <div className="jobs-section-heading">
            <span className="jobs-eyebrow">
              <BriefcaseBusiness size={16} />
              CAREER OPPORTUNITIES
            </span>

            <h1>
              Hire from <span>Every Industry</span>
            </h1>

            <p>
              Jay-Trade works with employers across sectors.
              Explore the industries where opportunities are available.
            </p>
          </div>

          <div className="jobs-industries-grid">
            {industries.map((industry) => (
              <div className="jobs-industry-card" key={industry}>
                <span className="jobs-industry-icon">
                  <Building2 size={21} />
                </span>
                <strong>{industry}</strong>
              </div>
            ))}
          </div>
        </section>

        {/* CANDIDATE PACKAGES */}
        <section className="jobs-packages-section">
          <div className="jobs-section-heading">
            <span className="jobs-eyebrow">
              <GraduationCap size={16} />
              FOR JOB SEEKERS
            </span>

            <h2>
              Candidate <span>Packages</span>
            </h2>

            <p>
              Choose the registration that fits your career plan.
            </p>
          </div>

          <div className="jobs-packages-grid">
            {candidatePackages.map((item) => (
              <PackageCard
                key={item.name}
                item={item}
                type="candidate"
                onApplyNow={onApplyNow}
              />
            ))}
          </div>
        </section>

        {/* EMPLOYER PACKAGES */}
        <section className="jobs-packages-section jobs-employer-section">
          <div className="jobs-section-heading">
            <span className="jobs-eyebrow">
              <Building2 size={16} />
              FOR EMPLOYERS
            </span>

            <h2>
              Employer <span>Packages</span>
            </h2>

            <p>
              Verified, trained candidates with a replacement guarantee.
            </p>
          </div>

          <div className="jobs-packages-grid">
            {employerPackages.map((item) => (
              <PackageCard
                key={item.name}
                item={item}
                type="employer"
                onApplyNow={onApplyNow}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default Jobs;
