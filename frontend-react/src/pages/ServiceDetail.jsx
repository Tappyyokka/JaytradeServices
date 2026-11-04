import { useState, useEffect } from "react";
import{
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileText,
  Clock3,
  ShieldCheck,
  Headset,
  Landmark,
  Hammer,
  House,
  Building2,
  Paintbrush,
} from "lucide-react";

import "./Home.css";
import "./ServiceDetail.css";

const financialServices = {
  "Housing Loan": {
    subtitle: "Find a place to call home.",
    description:
      "Make your dream home a reality with Jay Trade.Explore housing loan options of up to ₹1 Crore, with interest rates starting at 7.5%, and get the financial support you need to build or purchase your dream home.",
    highlights: [
      "Add your first service benefit here.",
      "Add your second service benefit here.",
      "Add your third service benefit here.",
    ],
    documents: {
      "KYC Documents": [
        "Passport Size Photo - 2",
        "Aadhar Card",
        "Pancard",
      ],
      "Construction Documents": [
        "Plan & Estimate",
        "Construction Permit",
        "Building Tax in case of purchase or repair loan",
      ],
      "Income Proof": [
        "Salary Certificate / Salary Slip / D&O License",
        "One Year Bank Statement",
      ],
      "Land Documents": [
        "Deed",
        "Prior Deed",
        "Encumbrance Certificate",
        "Possession Certificate",
        "Location Sketch",
        "Location Certificate",
        "Pattaya if any",
        "Land Tax",
        "Sale Agreement in case of purchase loan",
      ],
    },
  },

  
  "Property Loan": {
    subtitle: "Unlock the value of your property.",
    description:
      "Unlock the financial potential of your property with Jay Trade. Explore property loan options by leveraging eligible property assets to meet your personal or business financial requirements.",

    highlights: [
      "Add your first service benefit here.",
      "Add your second service benefit here.",
      "Add your third service benefit here.",
    ],

    documents: {
  "KYC Documents": [
    "Passport Size Photo - 2",
    "Aadhar Card",
    "Pancard",
  ],

  "Income Proof": [
    "Salary Certificate / Salary Slip / D&O License",
    "One Year Bank Statement",
  ],

  "Land Documents": [
    "Deed",
    "Prior Deed",
    "Encumbrance Certificate",
    "Possession Certificate",
    "Location Sketch",
    "Location Certificate",
    "Land Tax",
    "Building Tax",
    "Pattaya if any",
  ],
},
  },

  "Personal Loan": {
    subtitle: "Financial support for your personal needs.",
    description:
      "Meet your personal financial needs with Jay Trade. Explore personal loan options for medical expenses, education, family requirements and other important life needs.",

    highlights: [
      "Add your first service benefit here.",
      "Add your second service benefit here.",
      "Add your third service benefit here.",
    ],

    documents: {
  "KYC Documents": [
    "Photo - 2",
    "Aadhar Card",
    "Pancard",
    "Voters ID / Passport / Driving License",
  ],

  "Income Proof": [
    "Salary Slip (3 Months)",
    "Employee ID",
    "Form 16",
    "Salary Account Statement (One Year)",
  ],
},
  },

  "Business Loan – Secured": {
    subtitle: "Build your business with secured financing.",
    description:
      "Grow your business with financial support from Jay Trade. Explore secured business loan options using eligible assets or property as collateral to support your business expansion and financial needs.",

    highlights: [
      "Add your first service benefit here.",
      "Add your second service benefit here.",
      "Add your third service benefit here.",
    ],
documents: {
  "KYC Documents": [
    "Photo (2)",
    "Aadhar Card",
    "Pancard",
    "Passport / Driving License / Voters ID",
  ],

  "Income Proof": [
    "D&O License",
    "GST Registration and Filing",
    "IT with Computation",
    "Bank Statement (One Year)",
    "Vintage Proof for 3 Years",
    "MSME Registration Certificate (if any)",
  ],

  "Land Documents": [
    "Deed",
    "Prior Deed",
    "Encumbrance Certificate",
    "Possession Certificate",
    "Location Sketch",
    "Location Certificate",
    "Pattaya if any",
    "Land Tax",
    "Building Tax",
  ],
},
    
  },

  "Business Loan – Unsecured": {
    subtitle: "Funding solutions to move your business forward.",
    description:
      "Take your business forward with Jay Trade. Explore unsecured business loan options to meet your business expenses, manage working capital and support future growth without property collateral.",

    highlights: [
      "Add your first service benefit here.",
      "Add your second service benefit here.",
      "Add your third service benefit here.",
    ],

    documents: {
  "KYC Documents": [
    "Photo (2)",
    "Aadhar Card",
    "Pancard",
    "Passport / Driving License / Voters ID",
  ],

  "Income Proof": [
    "D&O License",
    "GST Registration and Filing",
    "IT with Computation",
    "Bank Statement (One Year)",
    "Vintage Proof for 3 Years",
    "MSME Registration Certificate (if any)",
  ],
},
  },

};



const serviceStoryboards = {
  "Housing Loan": [
    {
      image: `${import.meta.env.BASE_URL}images/storyboards/housing-1.jpeg`,
      alt: "Housing Loan storyboard 1",
    },
    {
      image: `${import.meta.env.BASE_URL}images/storyboards/housing-2.jpeg`,
      alt: "Housing Loan storyboard 2",
    },
     {
      image: `${import.meta.env.BASE_URL}images/storyboards/housing-3.jpeg`,
      alt: "Housing Loan storyboard 3",
    },

  ],

  "Property Loan": [
    {
      image: `${import.meta.env.BASE_URL}images/storyboards/property-1.jpeg`,
      alt: "Property Loan storyboard 1",
    },
    {
      image: `${import.meta.env.BASE_URL}images/storyboards/property-2.jpeg`,
      alt: "Property Loan storyboard 2",
    },
  ],

  "Personal Loan": [
    {
      image: `${import.meta.env.BASE_URL}images/storyboards/personal-1.jpeg`,
      alt: "Personal Loan storyboard 1",
    },
    {
      image: `${import.meta.env.BASE_URL}images/storyboards/personal-2.jpeg`,
      alt: "Personal Loan storyboard 2",
    },
    {
      image: `${import.meta.env.BASE_URL}images/storyboards/personal-3.jpeg`,
      alt: "Personal Loan storyboard 3",
    },
  ],

  "Business Loan – Secured": [
    {
      image: `${import.meta.env.BASE_URL}images/storyboards/secured-1.jpeg`,
      alt: "Secured Business Loan storyboard 1",
    },
    {
      image: `${import.meta.env.BASE_URL}images/storyboards/secured-2.jpeg`,
      alt: "Secured Business Loan storyboard 2",
    },
    {
      image: `${import.meta.env.BASE_URL}images/storyboards/secured-3.jpeg`,
      alt: "Secured Business Loan storyboard 3",
    },
  ],

  "Business Loan – Unsecured": [
    {
      image: `${import.meta.env.BASE_URL}images/storyboards/secured-1.jpeg`,
      alt: "Unsecured Business Loan storyboard 1",
    },
    {
      image: `${import.meta.env.BASE_URL}images/storyboards/secured-2.jpeg`,
      alt: "Secured Business Loan storyboard 2",
    },
    {
      image: `${import.meta.env.BASE_URL}images/storyboards/secured-3.jpeg`,
      alt: "Secured Business Loan storyboard 3",
    },
  ],
};

function ServiceDetail({ service, onBack }) {
  const [activeStoryboard, setActiveStoryboard] = useState(0);
  const [activeDocumentCategory, setActiveDocumentCategory] = useState("");
  const [checkedDocuments, setCheckedDocuments] = useState({});
  const [isStoryboardPaused, setIsStoryboardPaused] = useState(false);

  const details = financialServices[service?.name];

  const storyboardSlides = serviceStoryboards[service?.name] || [];

  useEffect(() => {
    setActiveStoryboard(0);
  }, [service?.name]);
  useEffect(() => {
  if (storyboardSlides.length <= 1 || isStoryboardPaused) return;

  const interval = setInterval(() => {
    setActiveStoryboard((current) =>
      (current + 1) % storyboardSlides.length
    );
  }, 5000);

  return () => clearInterval(interval);
}, [storyboardSlides.length, isStoryboardPaused, service?.name]);

  if (!details) {
    return (
      <div className="indipay-service-detail-page">
        <p>Service details are not available yet.</p>
        <button onClick={onBack}>Back to Services</button>
      </div>
    );
  }

  // DOCUMENT CHECKLIST DATA
  const documentCategories = Object.entries(details.documents);

  const allDocuments = documentCategories.flatMap(
    ([category, documents]) =>
      documents.map((document) => ({
        category,
        document,
        key: `${service.name}::${category}::${document}`,
      }))
  );

  const readyCount = allDocuments.filter(
    (item) => checkedDocuments[item.key]
  ).length;

  const totalCount = allDocuments.length;

  const selectedCategory =
    documentCategories.find(
      ([category]) => category === activeDocumentCategory
    )?.[0] || documentCategories[0]?.[0];

  const selectedDocuments =
    documentCategories.find(
      ([category]) => category === selectedCategory
    )?.[1] || [];

  const toggleDocument = (key) => {
    setCheckedDocuments((previous) => ({
      ...previous,
      [key]: !previous[key],
    }));
  };

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
        {/* THREE-PANEL STORYBOARD CAROUSEL */}
<section className="indipay-storyboard-section">

  {storyboardSlides.length > 0 && (
    <div
      className="indipay-storyboard-slider"
      onMouseEnter={() => setIsStoryboardPaused(true)}
      onMouseLeave={() => setIsStoryboardPaused(false)}
    >

      <div className="indipay-storyboard-panels">

        {/* LEFT PANEL */}
        <div className="indipay-storyboard-panel side-panel">
          <img
            src={
              storyboardSlides[
                (activeStoryboard - 1 + storyboardSlides.length) %
                storyboardSlides.length
              ].image
            }
            alt="Previous storyboard"
          />
        </div>

        {/* CENTER PANEL */}
        <div className="indipay-storyboard-panel center-panel">
          <img
            src={storyboardSlides[activeStoryboard].image}
            alt={storyboardSlides[activeStoryboard].alt}
          />
        </div>

        {/* RIGHT PANEL */}
        <div className="indipay-storyboard-panel side-panel">
          <img
            src={
              storyboardSlides[
                (activeStoryboard + 1) % storyboardSlides.length
              ].image
            }
            alt="Next storyboard"
          />
        </div>

      </div>

      {/* PREVIOUS BUTTON */}
      {storyboardSlides.length > 1 && (
        <>
          <button
            type="button"
            className="indipay-storyboard-arrow storyboard-prev"
            aria-label="Previous storyboard"
            onClick={() =>
              setActiveStoryboard(
                (activeStoryboard - 1 + storyboardSlides.length) %
                storyboardSlides.length
              )
            }
          >
            <ArrowLeft size={22} />
          </button>

          {/* NEXT BUTTON */}
          <button
            type="button"
            className="indipay-storyboard-arrow storyboard-next"
            aria-label="Next storyboard"
            onClick={() =>
              setActiveStoryboard(
                (activeStoryboard + 1) % storyboardSlides.length
              )
            }
          >
            <ArrowRight size={22} />
          </button>
        </>
      )}

      {/* NAVIGATION DOTS */}
      <div className="indipay-storyboard-dots">
        {storyboardSlides.map((slide, index) => (
          <button
            key={index}
            type="button"
            aria-label={`Go to storyboard ${index + 1}`}
            className={activeStoryboard === index ? "active" : ""}
            onClick={() => setActiveStoryboard(index)}
          />
        ))}
      </div>

    </div>
  )}

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

        
        {/* HOUSING LOAN TYPES */}
        {service.name === "Housing Loan" && (
          <section className="indipay-detail-section">
            <div className="indipay-detail-section-heading">
              <span>02 / LOAN OPTIONS</span>
              <h2>Choose Your Housing Loan</h2>
              <p>
                Explore different housing loan options to find the
                right solution for your needs.
              </p>
            </div>

            <div className="indipay-housing-types">
              <div className="indipay-housing-type-card">
                <div className="indipay-housing-type-icon">
                  <Hammer size={32} />
                </div>
                <span className="indipay-housing-type-number">01</span>
                <h3>Construction Loan</h3>
                <p>
                  Financial support for constructing your
                  dream home on your own land.
                </p>
              </div>

              <div className="indipay-housing-type-card">
                <div className="indipay-housing-type-icon">
                  <House size={32} />
                </div>
                <span className="indipay-housing-type-number">02</span>
                <h3>Purchase Loan</h3>
                <p>
                  Get financial assistance to purchase
                  your dream home.
                </p>
              </div>

              <div className="indipay-housing-type-card">
                <div className="indipay-housing-type-icon">
                  <Building2 size={32} />
                </div>
                <span className="indipay-housing-type-number">03</span>
                <h3>Purchase + Construction Loan</h3>
                <p>
                  Financial assistance for purchasing land
                  and constructing a home.
                </p>
              </div>

              <div className="indipay-housing-type-card">
                <div className="indipay-housing-type-icon">
                  <Paintbrush size={32} />
                </div>
                <span className="indipay-housing-type-number">04</span>
                <h3>Repairing Loan</h3>
                <p>
                  Get support for repairing, renovating
                  and improving your existing home.
                </p>
              </div>
            </div>
          </section>
        )}


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


{/* INTERACTIVE DOCUMENT CHECKLIST */}
<section className="indipay-detail-section indipay-checklist-section">

  <div className="indipay-detail-section-heading">
    <span>03 / PREPARATION</span>
    <h2>Documents Required</h2>
    <p>
      Tick off what you already have. Keep a clear scan or photo
      of each document ready.
    </p>
  </div>

  {/* PROGRESS */}
  <div className="indipay-checklist-progress">
    <div className="indipay-checklist-progress-info">
      <strong>
        {readyCount} of {totalCount} ready
      </strong>
      <span>{totalCount - readyCount} to go</span>
    </div>

    <div className="indipay-checklist-progress-track">
      <div
        className="indipay-checklist-progress-fill"
        style={{
          width: `${totalCount ? (readyCount / totalCount) * 100 : 0}%`,
        }}
      />
    </div>
  </div>

  {/* CATEGORY NAVIGATION + DOCUMENT LIST */}
  <div className="indipay-checklist-layout">

    <nav className="indipay-checklist-nav">
      {documentCategories.map(([category, documents], index) => {
        const categoryReady = documents.filter((document) =>
          checkedDocuments[
            `${service.name}::${category}::${document}`
          ]
        ).length;

        return (
          <button
            key={category}
            type="button"
            className={`indipay-checklist-nav-item ${
              selectedCategory === category ? "active" : ""
            }`}
            onClick={() => setActiveDocumentCategory(category)}
          >
            <span>{category}</span>
            <small>
              {categoryReady}/{documents.length}
            </small>
          </button>
        );
      })}
    </nav>

    {/* ACTIVE CATEGORY */}
    <div className="indipay-checklist-panel">

      <div className="indipay-checklist-panel-heading">
        <div>
          <h3>{selectedCategory}</h3>
          <p>
            {selectedDocuments.length} documents in this category
          </p>
        </div>

        <span className="indipay-checklist-count">
          {selectedDocuments.filter((document) =>
            checkedDocuments[
              `${service.name}::${selectedCategory}::${document}`
            ]
          ).length}/{selectedDocuments.length}
        </span>
      </div>

      <div className="indipay-checklist-items">
        {selectedDocuments.map((document, index) => {
          const key =
            `${service.name}::${selectedCategory}::${document}`;

          const isChecked = !!checkedDocuments[key];
          const isOptional = /if any|optional/i.test(document);

          return (
            <label
              key={key}
              className={`indipay-checklist-item ${
                isChecked ? "checked" : ""
              }`}
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => toggleDocument(key)}
              />

              <span className="indipay-checklist-custom-check">
                {isChecked && <CheckCircle2 size={18} />}
              </span>

              <span className="indipay-checklist-document-name">
                {document}

                {isOptional && (
                  <small className="indipay-optional-tag">
                    Optional
                  </small>
                )}
              </span>
            </label>
          );
        })}
      </div>

      <div className="indipay-checklist-footer">
        <span>
          {readyCount === totalCount
            ? "All documents are ready!"
            : "Keep checking off the documents you have."}
        </span>
      </div>

    </div>
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

        
{/* APPLY NOW */}
<section className="indipay-apply-section">
  <button
    type="button"
    className="indipay-apply-button"
  >
    Apply Now
    <ArrowRight size={19} />
  </button>
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

      
    </div>
  );
}

export default ServiceDetail;
