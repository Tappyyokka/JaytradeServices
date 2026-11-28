import { useEffect, useId, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Landmark,
  UserRound,
  Users,
  Bell,
  ChevronDown,
  ClipboardPenLine,
  FileSearch,
  ListChecks,
} from "lucide-react";

import "./Home.css";
import "./ServiceDetail.css";

const asset = (path) => `${import.meta.env.BASE_URL}images/${path}`;

const financialServices = {
  "Take Over Loan": {},
  "MSME Loan": {},
  "Mudra Loan": {
    subtitle: "Support for your small business plans.",
    description:
      "Explore Mudra loan application support for eligible business needs. We can help you understand the documents and project report needed to apply.",
  },
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
    description:
      "Get assistance with accessing your CIBIL credit report and understanding your credit profile for better financial planning.",
  },

  "MSME": {
    description:
      "Get assistance with MSME registration to establish your business identity and access applicable government schemes and business opportunities.",
  },

  "Mudra Project Report (up to ₹5 lakh)": {
    description:
      "Get a professionally prepared project report to support your Mudra loan application for funding requirements up to ₹5 lakh.",
  },

  "Mudra Project Report (above ₹5 lakh)": {
    description:
      "Get assistance preparing a detailed project report for Mudra loan applications involving funding requirements above ₹5 lakh.",
  },

  "GST Registration": {
    description:
      "Get assistance with GST registration and the documentation required to register your business under the Goods and Services Tax system.",
  },

  "ITR – Income Tax Filing": {
    description:
      "Get assistance preparing and filing your income tax return with the relevant financial and supporting documents.",
  },

  "FSSAI Registration Fee": {
    description:
      "Get assistance with the application process for FSSAI registration for eligible food businesses.",
  },

  "FSSAI License Fee": {
    description:
      "Get assistance with applying for the appropriate FSSAI licence for your food business.",
  },

  "FSSAI Registration Modification": {
    description:
      "Get assistance updating or modifying the details associated with your existing FSSAI registration.",
  },

  "FSSAI License Modification": {
    description:
      "Get assistance modifying the details of your existing FSSAI licence.",
  },

  "FSSAI Manufacture Registration": {
    description:
      "Get assistance with FSSAI registration requirements for eligible food manufacturing businesses.",
  },

  "FSSAI Manufacture License": {
    description:
      "Get assistance with the FSSAI licensing process for eligible food manufacturing operations.",
  },

  "Import Export Code": {
    description:
      "Get assistance obtaining an Import Export Code (IEC), which is generally required for businesses undertaking import or export activities.",
  },

  "ISO Certificate": {
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
    description:
      "Get assistance with trademark application requirements for individuals and eligible MSMEs without prior track records.",
  },

  "Trademark - Individual, MSME (With Track Records)": {
    description:
      "Get assistance with trademark application requirements for individuals and eligible MSMEs with track records.",
  },

  "Trademark - LLP/Co/PS (Other Than MSME Without Track Records)": {
    description:
      "Get assistance with trademark applications for LLPs, companies and other eligible entities outside the MSME category without track records.",
  },

  "Trademark - LLP/Co/PS (Other Than MSME With Track Records)": {
    description:
      "Get assistance with trademark applications for LLPs, companies and other eligible entities outside the MSME category with track records.",
  },

  "Trademark - Ownership Change": {
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
      image: asset("storyboards/housing-1.jpeg"),
      alt: "Housing Loan storyboard 1",
    },
    {
      image: asset("storyboards/housing-2.jpeg"),
      alt: "Housing Loan storyboard 2",
    },
     {
      image: asset("storyboards/housing-3.jpeg"),
      alt: "Housing Loan storyboard 3",
    },

  ],

  "Property Loan": [
    {
      image: asset("storyboards/property-1.jpeg"),
      alt: "Property Loan storyboard 1",
    },
    {
      image: asset("storyboards/property-2.jpeg"),
      alt: "Property Loan storyboard 2",
    },
  ],

  "Personal Loan": [
    {
      image: asset("storyboards/personal-1.jpeg"),
      alt: "Personal Loan storyboard 1",
    },
    {
      image: asset("storyboards/personal-2.jpeg"),
      alt: "Personal Loan storyboard 2",
    },
    {
      image: asset("storyboards/personal-3.jpeg"),
      alt: "Personal Loan storyboard 3",
    },
  ],

  "Business Loan – Secured": [
    {
      image: asset("storyboards/secured-1.jpeg"),
      alt: "Secured Business Loan storyboard 1",
    },
    {
      image: asset("storyboards/secured-2.jpeg"),
      alt: "Secured Business Loan storyboard 2",
    },
    {
      image: asset("storyboards/secured-3.jpeg"),
      alt: "Secured Business Loan storyboard 3",
    },
  ],

  "Business Loan – Unsecured": [
    {
      image: asset("storyboards/secured-1.jpeg"),
      alt: "Unsecured Business Loan storyboard 1",
    },
    {
      image: asset("storyboards/secured-2.jpeg"),
      alt: "Secured Business Loan storyboard 2",
    },
    {
      image: asset("storyboards/secured-3.jpeg"),
      alt: "Secured Business Loan storyboard 3",
    },
  ],
};

const normalizeService = (name = "") => name.normalize("NFKC")
  .toLowerCase()
  .replace(/[‐‑‒–—−-]/g, "-")
  .replace(/\s*-\s*/g, "-")
  .trim();

const byServiceName = (entries) => new Map(
  Object.entries(entries).map(([name, value]) => [normalizeService(name), value]),
);

const loanDetails = byServiceName(financialServices);
const legalDetails = byServiceName(legalServices);
const storyboards = byServiceName(serviceStoryboards);
const additionalCategories = byServiceName({
  "Business Associate": "Business Development",
  "Premium Franchise": "Business Development",
  "Normal Franchise": "Business Development",
  "Virtual Franchise": "Business Development",
  "Udyog Registration": "Jaytrade Jobs",
  "Udyog Plus Registration": "Jaytrade Jobs",
  "Standard Registration": "Jaytrade Jobs",
  "Corporate Plus": "Jaytrade Jobs",
  "Growup Package": "Jaytrade Times & Technologies",
  "Standard Package": "Jaytrade Times & Technologies",
  "Premium Package": "Jaytrade Times & Technologies",
  "Corporate Package": "Jaytrade Times & Technologies",
});

const relatedServices = [
  { name: "GST Registration", icon: "receipt", image: asset("icons/GST.png") },
  { name: "ITR – Income Tax Filing", icon: "file", image: asset("icons/ITR.png") },
  { name: "MSME", icon: "building", image: asset("icons/MSME.png") },
  { name: "CIBIL Report", icon: "report", image: asset("icons/Cibil.png") },
];

const maximumAmount = 100_000_000;
const rupees = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const units = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const quickAmounts = [
  { value: 500_000, label: "₹5L" },
  { value: 1_000_000, label: "₹10L" },
  { value: 2_500_000, label: "₹25L" },
];

function DetailHeader({ onBack, onOpenAnnouncements, onLogin, onRegister }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const profile = useRef(null);
  const trigger = useRef(null);
  const menu = useRef(null);
  const menuId = useId();

  useEffect(() => {
    if (!menuOpen) return;
    menu.current.querySelector("button")?.focus();
    function closeOutside(event) {
      if (!profile.current?.contains(event.target)) setMenuOpen(false);
    }
    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, [menuOpen]);

  function handleMenuKey(event) {
    const items = Array.from(menu.current.querySelectorAll("button"));
    const current = items.indexOf(document.activeElement);
    if (event.key === "Escape") {
      event.preventDefault();
      setMenuOpen(false);
      trigger.current.focus();
    } else if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
      event.preventDefault();
      const next = {
        ArrowDown: (current + 1) % items.length,
        ArrowUp: (current - 1 + items.length) % items.length,
        Home: 0,
        End: items.length - 1,
      }[event.key];
      items[next]?.focus();
    }
  }

  return (
    <header className="indipay-detail-header">
      <button type="button" className="indipay-detail-back" onClick={onBack}>
        <ArrowLeft size={18} aria-hidden="true" /> Back to Services
      </button>
      <div className="indipay-detail-header-actions">
        <button type="button" className="indipay-detail-header-icon" aria-label="Notifications" onClick={onOpenAnnouncements}>
          <Bell size={21} aria-hidden="true" />
        </button>
        <div className="indipay-detail-profile" ref={profile} onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setMenuOpen(false);
        }}>
          <button type="button" className="indipay-detail-profile-trigger" ref={trigger}
            aria-haspopup="menu" aria-expanded={menuOpen} aria-controls={menuOpen ? menuId : undefined}
            onClick={() => setMenuOpen((open) => !open)}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") {
                event.preventDefault();
                setMenuOpen(true);
              } else if (event.key === "Escape") {
                setMenuOpen(false);
              }
            }}>
            <UserRound size={20} aria-hidden="true" /><span>Profile</span><ChevronDown size={15} aria-hidden="true" />
          </button>
          {menuOpen && (
            <div className="indipay-detail-profile-menu" ref={menu} id={menuId} role="menu" aria-label="Profile"
              onKeyDown={handleMenuKey}>
              <button type="button" role="menuitem" tabIndex={-1} onClick={() => { setMenuOpen(false); onLogin?.(); }}>
                <UserRound size={17} aria-hidden="true" /> Login
              </button>
              <button type="button" role="menuitem" tabIndex={-1} onClick={() => { setMenuOpen(false); onRegister?.(); }}>
                <Users size={17} aria-hidden="true" /> Create Account
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function DetailDialog({ title, children, onClose }) {
  const dialog = useRef(null);
  const headingId = useId();

  useEffect(() => {
    const element = dialog.current;
    element.showModal();
    return () => { if (element.open) element.close(); };
  }, []);

  return (
    <dialog className="service-detail-dialog" ref={dialog} aria-labelledby={headingId}
      onCancel={(event) => { event.preventDefault(); onClose(); }}>
      <h2 id={headingId}>{title}</h2>
      {children}
    </dialog>
  );
}

function ServiceIcon({ image }) {
  const [failed, setFailed] = useState(false);
  return (
    <span className="indipay-simple-service-icon" aria-hidden="true">
      {image && !failed
        ? <img src={image} alt="" width={58} height={58} onError={() => setFailed(true)} />
        : <Landmark size={30} />}
    </span>
  );
}

function Storyboard({ slides }) {
  const region = useRef(null);
  const [active, setActive] = useState(0);
  const [animate, setAnimate] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [touching, setTouching] = useState(false);
  const [missingImages, setMissingImages] = useState({});
  const [reduceMotion, setReduceMotion] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const change = (event) => setReduceMotion(event.matches);
    preference.addEventListener("change", change);
    return () => preference.removeEventListener("change", change);
  }, []);

  const autoAdvance = slides.length > 1 && animate && !reduceMotion && !hovered && !focused && !touching;
  useEffect(() => {
    if (!autoAdvance) return;
    const timer = window.setTimeout(() => {
      if (!region.current?.contains(document.activeElement)) setActive((active + 1) % slides.length);
    }, 5000);
    return () => window.clearTimeout(timer);
  }, [active, autoAdvance, slides.length]);

  const slide = slides[active];
  const controls = slides.length > 1;
  function move(delta) {
    setActive((current) => (current + delta + slides.length) % slides.length);
  }

  return (
    <section className="indipay-simple-storyboard" ref={region} aria-label="Service storyboard"
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)} onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
      }} onTouchStart={() => setTouching(true)} onTouchEnd={() => setTouching(false)}
      onTouchCancel={() => setTouching(false)}>
      <div className="indipay-simple-storyboard-heading">
        <h2>Explore Our Services</h2>
      </div>
      <div className="indipay-simple-storyboard-slider financial-storyboard">
        <div className="service-detail-slide" aria-live={autoAdvance ? "off" : "polite"}>
          {missingImages[slide.image] ? <p>Storyboard image unavailable</p> : (
            <img key={slide.image} src={slide.image} alt={slide.alt} loading="lazy" width={520} height={520}
              onError={() => setMissingImages((current) => ({ ...current, [slide.image]: true }))} />
          )}
        </div>
        {controls && (
          <>
            <button type="button" className="indipay-simple-storyboard-arrow prev" aria-label="Previous storyboard slide" onClick={() => move(-1)}>
              <ArrowLeft size={19} aria-hidden="true" />
            </button>
            <button type="button" className="indipay-simple-storyboard-arrow next" aria-label="Next storyboard slide" onClick={() => move(1)}>
              <ArrowRight size={19} aria-hidden="true" />
            </button>
          </>
        )}
      </div>
      {controls && (
        <div className="service-detail-storyboard-controls">
          <div className="indipay-simple-storyboard-dots" aria-label="Storyboard slides">
            {slides.map(({ image }, index) => (
              <button key={image} type="button" className={index === active ? "active" : ""}
                aria-label={`Show storyboard slide ${index + 1}`} aria-current={index === active ? "true" : undefined}
                onClick={() => setActive(index)} />
            ))}
          </div>
          {!reduceMotion && (
            <button type="button" className="service-detail-secondary" onClick={() => setAnimate((current) => !current)}>
              {animate ? "Pause slides" : "Resume slides"}
            </button>
          )}
        </div>
      )}
    </section>
  );
}

function ServiceContent({ service, onBack, onApplyNow, onSelectService }) {
  const key = normalizeService(service.name);
  const isLoan = loanDetails.has(key);
  const details = loanDetails.get(key) ?? legalDetails.get(key);
  const slides = storyboards.get(key);
  const category = isLoan ? "Financial Services" : additionalCategories.get(key) ?? (
    legalDetails.has(key) ? "Legal Services" : "Other Services"
  );
  const description = service.publicDescription || details?.description || service.description
    || `Explore ${service.name} with Jay Trade.`;

  const [amount, setAmount] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [dialog, setDialog] = useState(null);
  const amountId = useId();
  const readoutId = useId();
  const feedbackId = useId();
  const headingId = useId();
  const applyCard = useRef(null);
  const amountNumber = Number(amount);
  const reason = isLoan && amountNumber < 1 ? "Enter an amount"
    : isLoan && amountNumber > maximumAmount ? `Enter ₹${rupees.format(maximumAmount)} or less`
      : !termsAccepted ? "Accept the terms to continue" : "";
  const amountLabel = amountNumber >= 10_000_000
    ? `${units.format(amountNumber / 10_000_000)} crore`
    : amountNumber >= 100_000 ? `${units.format(amountNumber / 100_000)} lakh` : "";
  const closeDialog = () => setDialog(null);

  function confirmApplication() {
    if (reason) return;
    const application = { ...service };
    if (isLoan) application.amount = amountNumber;
    else delete application.amount;
    closeDialog();
    onApplyNow?.(application);
  }

  function updateAmount(event) {
    const value = event.target.value;
    if (/[eE+.-]/.test(value)) return;
    setAmount(value.replace(/\D/g, "").replace(/^0+(?=\d)/, "").slice(0, 10));
  }

  return (
    <main className="indipay-detail-container">
      <nav className="service-detail-breadcrumb" aria-label="Breadcrumb">
        <button type="button" onClick={onBack}>Services</button>
        <span aria-hidden="true">›</span><span>{category}</span>
        <span aria-hidden="true">›</span><span aria-current="page">{service.name}</span>
      </nav>
      <div className="service-detail-layout">
        <div className="service-detail-overview">
          <section className="indipay-simple-service-intro">
            <ServiceIcon image={service.image} />
            <div>
              <span className="indipay-simple-eyebrow">Jay Trade Services</span>
              <h1>{service.name}</h1>
              <p>{description}</p>
            </div>
          </section>
          <section className="service-detail-process">
            <h2>How it works</h2>
            <ol role="list">
              <li>
                <span className="service-detail-process-marker" aria-hidden="true"><ClipboardPenLine size={20} /></span>
                <div><strong>Apply</strong><span>Share your details.</span></div>
              </li>
              <li>
                <span className="service-detail-process-marker" aria-hidden="true"><FileSearch size={20} /></span>
                <div><strong>Document check</strong><span>Provide documents if requested.</span></div>
              </li>
              <li>
                <span className="service-detail-process-marker" aria-hidden="true"><ListChecks size={20} /></span>
                <div><strong>Approval</strong><span>Check the outcome after review.</span></div>
              </li>
            </ol>
          </section>
        </div>
        <section className="indipay-simple-application" ref={applyCard} tabIndex={-1} aria-labelledby={headingId}>
          <h2 id={headingId}>Apply for this service</h2>
          {isLoan ? (
            <>
              <label className="service-detail-amount-label" htmlFor={amountId}>Enter the amount</label>
              <div className="indipay-amount-input">
                <span aria-hidden="true">₹</span>
                <input id={amountId} type="text" inputMode="numeric" placeholder="Enter your amount" value={amount}
                  aria-describedby={readoutId} aria-invalid={amount !== "" && (amountNumber < 1 || amountNumber > maximumAmount)}
                  onChange={updateAmount} onKeyDown={(event) => {
                    if (["e", "E", "+", "-", "."].includes(event.key)) event.preventDefault();
                  }} />
              </div>
              <p id={readoutId} className="service-detail-readout">
                {amountNumber > 0 ? `₹${rupees.format(amountNumber)}${amountLabel ? ` · ${amountLabel}` : ""}`
                  : `Enter a whole amount from ₹1 to ₹${rupees.format(maximumAmount)}.`}
              </p>
              <div className="service-detail-chips" role="group" aria-label="Quick amounts">
                {quickAmounts.map(({ value, label }) => (
                  <button key={value} type="button" className="service-detail-secondary" aria-pressed={amountNumber === value}
                    onClick={() => setAmount(String(value))}>{label}</button>
                ))}
              </div>
            </>
          ) : <p className="service-detail-fee">Fee confirmed during application</p>}
          <div className="indipay-simple-terms">
            <label className="service-detail-check">
              <input type="checkbox" aria-label="I agree to the Terms and Conditions" checked={termsAccepted}
                onChange={(event) => setTermsAccepted(event.target.checked)} />
              <span>I agree to the</span>
            </label>
            <button type="button" className="service-detail-terms-link" onClick={() => setDialog("terms")}>Terms and Conditions</button>
          </div>
          <button type="button" className="indipay-simple-apply" disabled={Boolean(reason)}
            aria-describedby={reason ? feedbackId : undefined} onClick={() => setDialog("confirm")}>
            Apply Now <ArrowRight size={18} aria-hidden="true" />
          </button>
          <p className="service-detail-feedback" id={feedbackId} aria-live="polite">{reason}</p>
        </section>
        {slides && <Storyboard slides={slides} />}
      </div>
      {onSelectService && (
        <section className="service-detail-related">
          <h2>You may also need</h2>
          <div className="service-detail-related-grid">
            {relatedServices.filter((related) => normalizeService(related.name) !== key).map((related) => (
              <button key={related.name} type="button" onClick={() => onSelectService(related)}>
                <ServiceIcon image={related.image} /><span>{related.name}</span><ArrowRight size={17} aria-hidden="true" />
              </button>
            ))}
          </div>
        </section>
      )}
      <div className="service-detail-mobile-bar">
        <button type="button" className="indipay-simple-apply" onClick={() => {
          applyCard.current.scrollIntoView({ block: "start", behavior: "instant" });
          applyCard.current.focus({ preventScroll: true });
        }}>
          Apply Now <ArrowRight size={18} aria-hidden="true" />
        </button>
      </div>
      {dialog === "terms" && (
        <DetailDialog title="Terms and Conditions" onClose={closeDialog}>
          <p>Placeholder terms. Review your service and application details before continuing.</p>
          <button type="button" className="service-detail-secondary" onClick={closeDialog}>Close</button>
        </DetailDialog>
      )}
      {dialog === "confirm" && (
        <DetailDialog title="Review your application" onClose={closeDialog}>
          <dl className="service-detail-summary">
            <div><dt>Service</dt><dd>{service.name}</dd></div>
            {isLoan && <div><dt>Amount</dt><dd>₹{rupees.format(amountNumber)}</dd></div>}
          </dl>
          <p>Confirm to open the application form and enter your details.</p>
          <div className="service-detail-dialog-actions">
            <button type="button" className="service-detail-secondary" onClick={closeDialog}>Edit</button>
            <button type="button" className="indipay-simple-apply" onClick={confirmApplication}>Confirm</button>
          </div>
        </DetailDialog>
      )}
    </main>
  );
}

export default function ServiceDetail({ service, onBack, onApplyNow, onOpenAnnouncements, onLogin, onRegister, onSelectService }) {
  return (
    <div key={service?.name} className="indipay-home indipay-service-detail-page">
      <DetailHeader onBack={onBack} onOpenAnnouncements={onOpenAnnouncements}
        onLogin={onLogin} onRegister={onRegister} />
      {service?.name ? (
        <ServiceContent service={service} onBack={onBack}
          onApplyNow={onApplyNow} onSelectService={onSelectService} />
      ) : (
        <main className="indipay-detail-container service-detail-not-found">
          <h1>Service not found</h1>
          <button type="button" className="service-detail-secondary" onClick={onBack}>Back</button>
        </main>
      )}
    </div>
  );
}
