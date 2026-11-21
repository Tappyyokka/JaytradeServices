import { useState, useEffect } from "react";
import{
  ArrowLeft,
  ArrowRight,
  Landmark,
  UserRound,
  Users,
  Bell,
ChevronDown,
CircleHelp,
X,
LogOut,
ChevronRight,
Settings,
} from "lucide-react";

import "./Home.css";
import "./ServiceDetail.css";
import "./LegalDetails.css";

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


const legalServices = {
  "CIBIL Report": {
    image: `${import.meta.env.BASE_URL}images/icons/Cibil.png`,
    description:
      "Get assistance with accessing your CIBIL credit report and understanding your credit profile for better financial planning.",
  },

  "MSME": {
    image: `${import.meta.env.BASE_URL}images/icons/MSME.png`,
    description:
      "Get assistance with MSME registration to establish your business identity and access applicable government schemes and business opportunities.",
  },

  "Mudra Project Report (up to ₹5 lakh)": {
    description:
      "Get a professionally prepared project report to support your Mudra loan application for funding requirements up to ₹5 lakh.",
  },

  "Mudra Project Report (above ₹5 lakh)": {
    image: `${import.meta.env.BASE_URL}images/icons/PR-above5.png`,
    description:
      "Get assistance preparing a detailed project report for Mudra loan applications involving funding requirements above ₹5 lakh.",
  },

  "GST Registration": {
    image: `${import.meta.env.BASE_URL}images/icons/GST.png`,
    description:
      "Get assistance with GST registration and the documentation required to register your business under the Goods and Services Tax system.",
  },

  "ITR – Income Tax Filing": {
    image: `${import.meta.env.BASE_URL}images/icons/ITR.png`,
    description:
      "Get assistance preparing and filing your income tax return with the relevant financial and supporting documents.",
  },

  "FSSAI Registration Fee": {
    image: `${import.meta.env.BASE_URL}images/icons/FSSAI.png`,
    description:
      "Get assistance with the application process for FSSAI registration for eligible food businesses.",
  },

  "FSSAI License Fee": {
    image: `${import.meta.env.BASE_URL}images/icons/FSSAI.png`,
    description:
      "Get assistance with applying for the appropriate FSSAI licence for your food business.",
  },

  "FSSAI Registration Modification": {
    image: `${import.meta.env.BASE_URL}images/icons/FSSAI.png`,
    description:
      "Get assistance updating or modifying the details associated with your existing FSSAI registration.",
  },

  "FSSAI License Modification": {
    image: `${import.meta.env.BASE_URL}images/icons/FSSAI.png`,
    description:
      "Get assistance modifying the details of your existing FSSAI licence.",
  },

  "FSSAI Manufacture Registration": {
    image: `${import.meta.env.BASE_URL}images/icons/FSSAI.png`,
    description:
      "Get assistance with FSSAI registration requirements for eligible food manufacturing businesses.",
  },

  "FSSAI Manufacture License": {
    image: `${import.meta.env.BASE_URL}images/icons/FSSAI.png`,
    description:
      "Get assistance with the FSSAI licensing process for eligible food manufacturing operations.",
  },

  "Import Export Code": {
    description:
      "Get assistance obtaining an Import Export Code (IEC), which is generally required for businesses undertaking import or export activities.",
  },

  "ISO Certificate": {
    image: `${import.meta.env.BASE_URL}images/icons/ISO.png`,
    description:
      "Get assistance understanding ISO certification requirements and coordinating the certification process for your business.",
  },

  "Private Limited Company Registration": {
    description:
      "Get assistance with incorporating a Private Limited Company, including the required documentation and registration process.",
  },

  "Partnership Registration Only": {
    description:
      "Get assistance with registering your partnership firm and preparing the required registration documentation.",
  },

  "Partnership Without Registration (PAN + Deed)": {
    description:
      "Get assistance preparing the partnership deed and PAN-related documentation for a partnership operating without formal firm registration.",
  },

  "Partnership With Registration (REG + PAN + Deed)": {
    description:
      "Get assistance with partnership firm registration, PAN application and partnership deed documentation.",
  },

  "Limited Liability Partnership Registration (LLP)": {
    description:
      "Get assistance incorporating a Limited Liability Partnership (LLP), including documentation and statutory registration requirements.",
  },

  "Trademark - Individual, MSME (Without Track Records)": {
    image: `${import.meta.env.BASE_URL}images/icons/Trademark.png`,
    description:
      "Get assistance with trademark application requirements for individuals and eligible MSMEs without prior track records.",
  },

  "Trademark - Individual, MSME (With Track Records)": {
    image: `${import.meta.env.BASE_URL}images/icons/Trademark.png`,
    description:
      "Get assistance with trademark application requirements for individuals and eligible MSMEs with track records.",
  },

  "Trademark - LLP/Co/PS (Other Than MSME Without Track Records)": {
    image: `${import.meta.env.BASE_URL}images/icons/Trademark.png`,
    description:
      "Get assistance with trademark applications for LLPs, companies and other eligible entities outside the MSME category without track records.",
  },

  "Trademark - LLP/Co/PS (Other Than MSME With Track Records)": {
    image: `${import.meta.env.BASE_URL}images/icons/Trademark.png`,
    description:
      "Get assistance with trademark applications for LLPs, companies and other eligible entities outside the MSME category with track records.",
  },

  "Trademark - Ownership Change": {
    image: `${import.meta.env.BASE_URL}images/icons/Trademark.png`,
    description:
      "Get assistance with trademark ownership transfer and updating the relevant ownership details with the trademark authorities.",
  },

  "PCC - Police Clearance Certificate": {
    description:
      "Get assistance with the application process and documentation required to obtain a Police Clearance Certificate.",
  },

  "Vyapar Mithra": {
    description:
      "Explore Vyapar Mithra, a business assistance service designed to help entrepreneurs with their business-related requirements.",
  },

  "Vyapar Mithra Plus": {
    description:
      "Explore Vyapar Mithra Plus for additional business assistance and support with your business requirements.",
  },

  "Vyapar Mithra All In One": {
    description:
      "Explore the Vyapar Mithra All In One package for a broader range of business assistance services through one platform.",
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

function LegalDetails({ service,
  onBack,
  onApplyNow,
  onOpenAnnouncements,
  onLogin,
  onRegister,}) {
  const [activeStoryboard, setActiveStoryboard] = useState(0);
  const [amount, setAmount] = useState("");
const [termsAccepted, setTermsAccepted] = useState(false);
const [activeTab, setActiveTab] = useState("Me");
const [profileMenuOpen, setProfileMenuOpen] = useState(false);
const [profileOpen, setProfileOpen] = useState(false);
const [previousServiceName, setPreviousServiceName] = useState(service?.name);

if (service?.name !== previousServiceName) {
  setPreviousServiceName(service?.name);
  setActiveStoryboard(0);
  setAmount("");
  setTermsAccepted(false);
}

 const details =
  financialServices[service?.name] ||
  legalServices[service?.name];

  const isLegalService = Boolean(legalServices[service?.name]);
  const storyboardSlides = serviceStoryboards[service?.name] || (
    isLegalService && service?.image
      ? [{ image: service.image, alt: `${service.name} service visual` }]
      : []
  );

  useEffect(() => {
  if (storyboardSlides.length <= 1) return;

  const interval = setInterval(() => {
    setActiveStoryboard((current) => (current + 1) % storyboardSlides.length);
  }, 5000);

  return () => clearInterval(interval);
}, [storyboardSlides.length, service?.name]);

  
  const ServiceIcon = typeof service?.icon === "function" ? service.icon : Landmark;

  const description =
    details?.description ||
    `Explore ${service?.name || "this service"} with Jay Trade. Our team is here to help you understand the available options and guide you through the process.`;

  return (
    <div className="indipay-home indipay-service-detail-page">
      {/* HEADER */}

      <header className="indipay-detail-header">
  <button
    type="button"
    className="indipay-detail-back"
    onClick={onBack}
  >
    <ArrowLeft size={18} />
    <span>Back to Services</span>
  </button>

  <div className="indipay-detail-header-actions">
    <button
      type="button"
      className="indipay-detail-header-icon"
      aria-label="Notifications"
      onClick={onOpenAnnouncements}
    >
      <Bell size={21} />
    </button>

    <div className="indipay-detail-profile">
      <button
        type="button"
        className="indipay-detail-profile-trigger"
        onClick={() => setProfileMenuOpen((open) => !open)}
        aria-expanded={profileMenuOpen}
      >
        <UserRound size={20} />
        <span>Profile</span>
        <ChevronDown size={15} />
      </button>

      {profileMenuOpen && (
        <div className="indipay-detail-profile-menu">
          <button
            onClick={() => {
              setProfileMenuOpen(false);
              onLogin?.();
            }}
          >
            <UserRound size={17} />
            Login
          </button>

          <button
            onClick={() => {
              setProfileMenuOpen(false);
              onRegister?.();
            }}
          >
            <Users size={17} />
            Create Account
          </button>
        </div>
      )}
    </div>
  </div>
</header>
      
      <main className="indipay-detail-container">

        {/* SERVICE INTRODUCTION */}
        <section className="indipay-simple-service-intro">
          <div className="indipay-simple-service-icon">
            <ServiceIcon size={30} />
          </div>

          <div>
            <span className="indipay-simple-eyebrow">
              JAY TRADE SERVICES
            </span>
            <h1>{service?.name}</h1>
            <p>{description}</p>
          </div>
        </section>

        {/* APPLICATION AMOUNT */}
        <section className="indipay-simple-application">

          {isLegalService ? (
            <div className="indipay-legal-apply-copy">
              <strong>Ready to get started?</strong>
              <p>Agree to the terms and continue with your {service?.name} application.</p>
            </div>
          ) : (
            <>
              <label htmlFor="service-amount">Enter the amount</label>
              <div className="indipay-amount-input">
                <span>₹</span>
                <input
                  id="service-amount"
                  type="number"
                  min="1"
                  placeholder="Enter your amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            </>
          )}

          {/* TERMS AND CONDITIONS */}
          <label className="indipay-simple-terms">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
            />

            <span>
              I agree to the{" "}
              <a href="#terms-and-conditions">
                Terms and Conditions
              </a>
            </span>
          </label>

          {/* APPLY BUTTON */}
          <button
            type="button"
            className="indipay-simple-apply"
            disabled={(!isLegalService && (!amount || Number(amount) <= 0)) || !termsAccepted}
            onClick={() =>
              onApplyNow?.({
                ...service,
                ...(isLegalService ? {} : { amount: Number(amount) }),
              })
            }
          >
            Apply Now
            <ArrowRight size={18} />
          </button>
        </section>

        {/* STORYBOARD / BANNERS */}
        <section className="indipay-simple-storyboard">

          <div className="indipay-simple-storyboard-heading">
            <h2>{isLegalService ? `About ${service?.name}` : "Explore Our Services"}</h2>
            <p>{isLegalService ? "A visual overview of the selected legal service." : "Discover more about our offerings."}</p>
          </div>

          {storyboardSlides.length > 0 ? (
            <div
  className={`indipay-simple-storyboard-slider ${
  "legal-storyboard"
}`}
>

              <img
                src={storyboardSlides[activeStoryboard].image}
                alt={storyboardSlides[activeStoryboard].alt}
              />

              
            </div>
          ) : (
            <div className="indipay-simple-storyboard-placeholder">
              <Landmark size={35} />
              <span>Our Banners / Storyboards</span>
            </div>
          )}

        </section>

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

    </div>
  );

}

export default LegalDetails;
