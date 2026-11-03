
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileText,
  Clock3,
  ShieldCheck,
  Headset,
  Landmark,
} from "lucide-react";

import "./Home.css";
import "./ServiceDetail.css";

const financialServices = {
  "Housing Loan": {
    subtitle: "Find a place to call home.",
    description:
      "Add your housing loan service description here. Explain what the service offers and how Indipay helps customers.",
    highlights: [
      "Add your first service benefit here.",
      "Add your second service benefit here.",
      "Add your third service benefit here.",
    ],
    documents: [
      "Identity and address proof",
      "Income-related documents",
      "Property-related documents",
    ],
  },

  "Property Loan": {
    subtitle: "Explore financial solutions for your property.",
    description:
      "Add your property loan description here.",
    highlights: [
      "Add your first service benefit here.",
      "Add your second service benefit here.",
      "Add your third service benefit here.",
    ],
    documents: [
      "Identity and address proof",
      "Income-related documents",
      "Property ownership documents",
    ],
  },

  "Personal Loan": {
    subtitle: "Financial assistance for your personal needs.",
    description:
      "Add your personal loan description here.",
    highlights: [
      "Add your first service benefit here.",
      "Add your second service benefit here.",
      "Add your third service benefit here.",
    ],
    documents: [
      "Identity and address proof",
      "Income-related documents",
      "Bank statements",
    ],
  },

  "Business Loan – Secured": {
    subtitle: "Support your business with secured financing.",
    description:
      "Add your secured business loan description here.",
    highlights: [
      "Add your first service benefit here.",
      "Add your second service benefit here.",
      "Add your third service benefit here.",
    ],
    documents: [
      "Business registration documents",
      "Financial statements",
      "Security or collateral-related documents",
    ],
  },

  "Business Loan – Unsecured": {
    subtitle: "Explore financing options for your business.",
    description:
      "Add your unsecured business loan description here.",
    highlights: [
      "Add your first service benefit here.",
      "Add your second service benefit here.",
      "Add your third service benefit here.",
    ],
    documents: [
      "Business registration documents",
      "Financial statements",
      "Bank statements",
    ],
  },
};

function ServiceDetail({ service, onBack }) {
  const details = financialServices[service?.name];

  if (!details) {
    return (
      <div className="indipay-service-detail-page">
        <p>Service details are not available yet.</p>
        <button onClick={onBack}>Back to Services</button>
      </div>
    );
  }

  return (
    <div className="indipay-home indipay-service-detail-page">

      {/* HEADER */}
      <header className="indipay-topbar">
        <button
          type="button"
          className="indipay-detail-back"
          onClick={onBack}
        >
          <ArrowLeft size={18} />
          <span>Back to Services</span>
        </button>

        <img
          src={`${import.meta.env.BASE_URL}images/logo-blue.jpeg`}
          alt="Indipay"
          className="indipay-logo-image"
        />
      </header>

      <main className="indipay-detail-container">

        {/* HERO */}
        <section className="indipay-detail-hero">
          <div className="indipay-detail-hero-copy">
            <span className="indipay-detail-eyebrow">
              <Landmark size={16} />
              FINANCIAL SERVICES
            </span>

            <h1>{service.name}</h1>

            <h2>{details.subtitle}</h2>

            <p>{details.description}</p>

            <button
              type="button"
              className="indipay-detail-primary"
              onClick={onBack}
            >
              Explore Other Services
              <ArrowRight size={18} />
            </button>
          </div>

          <div className="indipay-detail-hero-art">
            <div className="indipay-detail-art-circle">
              <Landmark size={75} strokeWidth={1.3} />
            </div>

            <span className="indipay-detail-art-icon detail-art-one">
              <ShieldCheck size={27} />
            </span>

            <span className="indipay-detail-art-icon detail-art-two">
              <FileText size={27} />
            </span>
          </div>
        </section>

        {/* SERVICE OVERVIEW */}
        <section className="indipay-detail-section">
          <div className="indipay-detail-section-heading">
            <span>01 / OVERVIEW</span>
            <h2>About This Service</h2>
            <p>
              Learn more about the service and how our team can assist you.
            </p>
          </div>

          <div className="indipay-detail-overview-card">
            <div className="indipay-detail-overview-icon">
              <FileText size={28} />
            </div>

            <div>
              <h3>{service.name}</h3>
              <p>{details.description}</p>
            </div>
          </div>
        </section>

        {/* HIGHLIGHTS */}
        <section className="indipay-detail-section">
          <div className="indipay-detail-section-heading">
            <span>02 / BENEFITS</span>
            <h2>Key Highlights</h2>
            <p>Important features of this service.</p>
          </div>

          <div className="indipay-detail-highlights">
            {details.highlights.map((item, index) => (
              <div className="indipay-detail-highlight" key={index}>
                <CheckCircle2 size={22} />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>

        {/* DOCUMENTS */}
        <section className="indipay-detail-section">
          <div className="indipay-detail-section-heading">
            <span>03 / PREPARATION</span>
            <h2>Documents to Prepare</h2>
            <p>
              These are editable placeholders. Confirm the exact requirements
              for each service before publishing.
            </p>
          </div>

          <div className="indipay-detail-documents">
            {details.documents.map((item, index) => (
              <div className="indipay-detail-document" key={index}>
                <FileText size={20} />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>

        {/* PROCESS */}
        <section className="indipay-detail-process">
          <div className="indipay-detail-section-heading">
            <span>04 / THE PROCESS</span>
            <h2>How It Works</h2>
            <p>A simple overview of the service journey.</p>
          </div>

          <div className="indipay-detail-steps">
            <div>
              <span>01</span>
              <h3>Submit Enquiry</h3>
              <p>Share your requirements with our team.</p>
            </div>

            <div>
              <span>02</span>
              <h3>Initial Review</h3>
              <p>Our team reviews the information provided.</p>
            </div>

            <div>
              <span>03</span>
              <h3>Service Assistance</h3>
              <p>Proceed with the next steps after confirmation.</p>
            </div>
          </div>
        </section>

        {/* SUPPORT */}
        <section className="indipay-detail-support">
          <div className="indipay-detail-support-icon">
            <Headset size={30} />
          </div>

          <div>
            <h2>Need Help With This Service?</h2>
            <p>
              Our team can help you understand the service and its requirements.
            </p>
          </div>

          <button type="button" onClick={onBack}>
            Back to Services
            <ArrowRight size={17} />
          </button>
        </section>

      </main>

      <footer className="indipay-footer">
        <p>© 2026 Indipay. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default ServiceDetail;
