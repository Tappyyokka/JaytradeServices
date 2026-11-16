import { useMemo, useState } from "react";
import {
  ArrowLeft, BookOpen, GraduationCap, Search, PlayCircle, Clock,
  FileText, CheckCircle2, ChevronRight, Video, Lightbulb,
  BriefcaseBusiness, Scale, Landmark, Megaphone, Users, HelpCircle,
  ExternalLink, X, ListChecks, ShieldCheck
} from "lucide-react";
import "./LearnAndEarn.css";

const categories = [
  { id: "all", label: "All categories" },
  { id: "financial", label: "Financial Services" },
  { id: "legal", label: "Legal Services" },
  { id: "business", label: "Business Development" },
  { id: "jobs", label: "Jaytrade Jobs" },
  { id: "times", label: "Jaytrade Times" },
];

// Add a YouTube embed URL to videoUrl when an approved tutorial is ready.
const learningItems = [
  {
    id: "gst-registration", name: "GST Registration", category: "legal", type: "howto",
    summary: "Understand the information and documents commonly needed to apply for GST registration.",
    duration: "5–8 min read", videoUrl: "", videoLabel: "GST registration walkthrough",
    steps: ["Check whether GST registration applies to your business.", "Keep PAN, identity, address and business details ready.", "Review the business constitution and place-of-business details.", "Submit the application through the appropriate official process.", "Save the acknowledgement and track the application status."],
    documents: ["PAN details", "Identity and address proof", "Business address proof", "Business constitution documents, where applicable"],
    overview: "GST is India's indirect tax framework for the supply of goods and services. Registration requirements depend on the nature of the business, turnover, location and applicable rules.",
    benefits: ["Enables eligible businesses to collect GST", "May allow eligible input tax credit", "Supports formal invoicing and business compliance"],
    considerations: ["Registration requirements vary by business and state.", "A GST registration does not remove ongoing return-filing obligations.", "Confirm current rules and applicability before applying."],
    faqs: [{ q: "Does every business need GST registration?", a: "No. Applicability depends on turnover thresholds, business activity, location and specific compulsory-registration rules." }]
  },
  {
    id: "itr-filing", name: "ITR Filing", category: "legal", type: "howto",
    summary: "Prepare income details and supporting records before filing an income tax return.",
    duration: "4–7 min read", videoUrl: "", videoLabel: "Income tax return filing guide",
    steps: ["Identify the correct assessment year and applicable return type.", "Collect salary, business, interest and other income information.", "Review Form 16, AIS/TIS and other available tax records.", "Check eligible deductions, taxes paid and tax credits.", "Submit the return and complete e-verification within the applicable time."],
    documents: ["PAN and Aadhaar details", "Form 16, where applicable", "Bank and income statements", "Investment and deduction proofs, where applicable"],
    overview: "An income tax return reports a taxpayer's income, deductions, tax payments and final tax position for a financial year.",
    benefits: ["Creates a record of reported income", "Can support certain loan and visa applications", "May help claim an eligible refund"],
    considerations: ["The correct ITR form depends on income sources and taxpayer circumstances.", "Filing and verification deadlines can change by assessment year.", "Keep supporting records in case clarification is required."],
    faqs: [{ q: "Is filing an ITR always mandatory?", a: "Not in every case. The requirement depends on income, specified conditions and the tax rules for that year." }]
  },
  {
    id: "msme-udyam", name: "MSME / Udyam Registration", category: "legal", type: "howto",
    summary: "Learn the basic information needed for Udyam registration and how to keep the details accurate.",
    duration: "4–6 min read", videoUrl: "", videoLabel: "Udyam registration walkthrough",
    steps: ["Check the current MSME classification criteria.", "Keep Aadhaar, PAN and business information ready.", "Enter the enterprise and activity details carefully.", "Review the information before submitting through the official portal.", "Save the Udyam Registration Number and certificate."],
    documents: ["Aadhaar details of the proprietor or authorised signatory", "PAN details", "Business and activity information", "GSTIN, where applicable"],
    overview: "Udyam Registration is the Government of India's process for recognising eligible micro, small and medium enterprises.",
    benefits: ["Provides formal MSME recognition", "Can help establish eligibility for certain MSME schemes", "May support access to applicable credit and procurement benefits"],
    considerations: ["Benefits depend on scheme-specific eligibility and current rules.", "Use accurate enterprise and activity information.", "Registration is made through the official Udyam portal."],
    faqs: [{ q: "Is Udyam registration the same as a business licence?", a: "No. It is MSME recognition and does not replace other licences or registrations that a business may need." }]
  },
  {
    id: "fssai", name: "FSSAI Registration", category: "legal", type: "howto",
    summary: "Explore the basic steps for food-business registration or licensing.",
    duration: "4–6 min read", videoUrl: "", videoLabel: "FSSAI application guide",
    steps: ["Identify the type and scale of food business activity.", "Check which FSSAI registration or licence category applies.", "Prepare the business, premises and food-activity details.", "Complete the application with the required supporting information.", "Track the application and display the issued registration or licence as required."],
    documents: ["Applicant identity details", "Business address and premises details", "Food-business activity information", "Additional documents based on licence category"],
    overview: "FSSAI registration and licensing relate to food business operators under India's food safety framework.",
    benefits: ["Supports compliance with food safety requirements", "Helps establish food-business identity", "Can build customer and supplier confidence"],
    considerations: ["The correct category depends on the activity, capacity and applicable rules.", "Food safety obligations continue after registration.", "Check current requirements with FSSAI before applying."],
    faqs: [{ q: "Does every food business need the same FSSAI licence?", a: "No. Registration or licence type depends on the food business category and applicable eligibility criteria." }]
  },
  {
    id: "iso", name: "ISO Certification", category: "legal", type: "howto",
    summary: "Understand the preparation involved in pursuing an ISO management-system certification.",
    duration: "5–7 min read", videoUrl: "", videoLabel: "ISO certification process explained",
    steps: ["Identify the relevant ISO standard and business scope.", "Review existing processes and identify gaps.", "Develop and implement the required management-system documentation.", "Conduct internal checks and management review as appropriate.", "Choose an appropriately accredited certification body and complete its audit process."],
    documents: ["Business and scope details", "Process and policy documents", "Operational records relevant to the chosen standard", "Internal audit and review records, where applicable"],
    overview: "ISO standards provide internationally recognised frameworks. Certification, where sought, is assessed by a certification body against the relevant standard.",
    benefits: ["Can improve process consistency", "May strengthen customer confidence", "Can support tender or supplier requirements where specified"],
    considerations: ["ISO itself does not certify organisations.", "The standard must match the organisation's scope and needs.", "Certification does not guarantee contracts or regulatory approval."],
    faqs: [{ q: "Does ISO certification guarantee business growth?", a: "No. It can support credibility and process improvement, but business outcomes depend on many other factors." }]
  },
  {
    id: "trademark", name: "Trademark Registration", category: "legal", type: "howto",
    summary: "Learn the broad stages of protecting a brand name, logo or other eligible mark.",
    duration: "5–7 min read", videoUrl: "", videoLabel: "Trademark application guide",
    steps: ["Identify the mark and the goods or services it will cover.", "Search for similar existing marks before applying.", "Select the appropriate class or classes.", "Prepare applicant details and a clear representation of the mark.", "File the application and monitor examination, publication and any objections."],
    documents: ["Applicant identity and address details", "Brand name or logo representation", "Goods or services description", "Use details or supporting documents, where applicable"],
    overview: "A trademark can distinguish one business's goods or services from those of others. Registration is subject to examination and the applicable legal process.",
    benefits: ["Can provide statutory rights in the registered mark", "Helps distinguish a brand in the market", "Can support licensing and brand protection"],
    considerations: ["A search reduces risk but cannot guarantee acceptance.", "Rights depend on the mark, class, territory and registration status.", "Legal objections or oppositions may affect the timeline."],
    faqs: [{ q: "Does filing mean the trademark is registered?", a: "No. Filing starts the process. Registration follows only if the application proceeds successfully through the required stages." }]
  },
  {
    id: "cibil-report", name: "CIBIL Report", category: "financial", type: "learn",
    summary: "Understand what a credit report contains and why lenders may review it.", duration: "3 min read",
    overview: "A credit report summarises credit-account and repayment information reported by lenders to a credit information company. A credit score is one part of the overall credit profile.",
    benefits: ["Helps you review reported credit accounts", "Can help identify errors or unfamiliar accounts", "Provides insight into repayment history and credit utilisation"],
    considerations: ["A credit score does not guarantee loan approval.", "Lenders use their own eligibility and underwriting criteria.", "Dispute inaccurate information with the relevant credit bureau and lender."],
    faqs: [{ q: "Does checking my own credit report reduce my score?", a: "A self-check is generally treated as a soft enquiry, but check the bureau's current explanation of enquiry types." }]
  },
  {
    id: "personal-loan", name: "Personal Loan", category: "financial", type: "learn",
    summary: "Learn how unsecured personal loans generally work and what to compare before applying.", duration: "3 min read",
    overview: "A personal loan is generally an unsecured loan offered based on a lender's assessment of income, credit history, existing obligations and other criteria.",
    benefits: ["May provide funds for eligible personal needs", "Often has a defined repayment schedule", "Can be compared across lenders for cost and terms"],
    considerations: ["Compare the annualised cost, fees and total repayment.", "Check prepayment, late-payment and other charges.", "Borrow only what you can reasonably repay."],
    faqs: [{ q: "Does a higher credit score guarantee approval?", a: "No. Lenders consider several factors, including income, existing debt and their own policies." }]
  },
  {
    id: "takeover-loan", name: "Loan Takeover", category: "financial", type: "learn",
    summary: "Understand how refinancing or transferring an existing loan may work.", duration: "3 min read",
    overview: "A loan takeover usually involves a new lender settling an eligible existing loan and replacing it with a new facility, subject to both lenders' terms and approval.",
    benefits: ["May offer a lower interest rate in some cases", "Could change the repayment period or structure", "May consolidate certain eligible borrowing arrangements"],
    considerations: ["Compare processing fees, foreclosure charges and total interest.", "A lower EMI can mean a longer tenure and higher total cost.", "Approval depends on lender assessment and documentation."],
    faqs: [{ q: "Is a loan takeover always cheaper?", a: "No. Compare the complete cost over the remaining and proposed loan periods before deciding." }]
  },
  {
    id: "housing-loan", name: "Housing Loan", category: "financial", type: "learn",
    summary: "Explore the basic structure, costs and considerations of a home loan.", duration: "3 min read",
    overview: "A housing loan is credit provided for eligible property-related purposes, secured against the property as per the lender's agreement.",
    benefits: ["Can spread a property purchase cost over time", "Offers structured repayment options", "May have tax implications depending on current law and eligibility"],
    considerations: ["Review interest type, tenure, fees and insurance requirements.", "Account for down payment, stamp duty and other purchase costs.", "Understand the consequences of missed payments."],
    faqs: [{ q: "Does the bank finance the entire property price?", a: "Usually not. Loan-to-value limits and lender policies determine the eligible loan amount." }]
  },
  {
    id: "business-development", name: "Business Development", category: "business", type: "learn",
    summary: "Explore ways businesses can build partnerships, reach customers and develop opportunities.", duration: "3 min read",
    overview: "Business development includes activities that create long-term value through partnerships, customer relationships, market opportunities and service growth.",
    benefits: ["Can help identify new customer segments", "Builds strategic partnerships", "Supports sustainable business growth"],
    considerations: ["Set clear goals and track qualified opportunities.", "Use transparent customer communication.", "Confirm commercial terms and responsibilities before entering partnerships."],
    faqs: [{ q: "Is business development only sales?", a: "No. It can include partnerships, market research, relationship management and strategic planning." }]
  },
  {
    id: "jaytrade-jobs", name: "Jaytrade Jobs", category: "jobs", type: "learn",
    summary: "Learn about the job-related services and support available through Jaytrade.", duration: "2 min read",
    overview: "This section introduces Jaytrade Jobs services. Specific eligibility, process steps and deliverables should be confirmed against the current package details.",
    benefits: ["A central place to understand available job-related services", "Clearer view of the information needed to get started", "A way to explore relevant support options"],
    considerations: ["Service availability and outcomes depend on the selected package.", "No job placement or employment outcome is guaranteed unless expressly stated in written terms.", "Review the service scope before applying."],
    faqs: [{ q: "Does registering guarantee a job?", a: "No. A registration or support service does not itself guarantee employment." }]
  },
  {
    id: "jaytrade-times", name: "Jaytrade Times & Technologies", category: "times", type: "learn",
    summary: "Discover advertising, media and technology-related services offered through Jaytrade Times.", duration: "2 min read",
    overview: "This section introduces Jaytrade Times & Technologies and its media, advertising and technology-related service area. Confirm the current package scope before purchasing.",
    benefits: ["Explore available promotional and media options", "Understand the information needed to plan a campaign", "Compare services against your business goals"],
    considerations: ["Audience reach and campaign outcomes can vary.", "Confirm placement, duration, creative requirements and reporting in writing.", "Advertising performance is not guaranteed."],
    faqs: [{ q: "Will every advertising package guarantee leads?", a: "No. Leads and conversions depend on the campaign, audience, offer and other factors." }]
  }
];

const categoryMeta = {
  financial: { title: "Financial Services", icon: Landmark },
  legal: { title: "Legal Services", icon: Scale },
  business: { title: "Business Development", icon: BriefcaseBusiness },
  jobs: { title: "Jaytrade Jobs", icon: Users },
  times: { title: "Jaytrade Times", icon: Megaphone },
};

function DetailPanel({ item, mode, onClose, onWatch, onApplyNow }) {
  const isHowTo = mode === "howto";
  return (
    <div className="le-modal-backdrop" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <section className="le-detail-panel" role="dialog" aria-modal="true" aria-labelledby="le-detail-title">
        <div className="le-detail-topline">
          <span className="le-eyebrow">{isHowTo ? "HOW TO GUIDE" : "SERVICE KNOWLEDGE"}</span>
          <button className="le-icon-button" onClick={onClose} aria-label="Close details"><X size={20} /></button>
        </div>
        <h2 id="le-detail-title">{item.name}</h2>
        <p className="le-detail-intro">{item.summary}</p>
        {isHowTo ? (
          <>
            {item.videoUrl ? (
              <div className="le-video-frame"><iframe src={item.videoUrl} title={item.videoLabel || item.name} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen /></div>
            ) : (
              <div className="le-video-placeholder"><span className="le-play-circle"><PlayCircle size={30} /></span><strong>Video tutorial coming soon</strong><small>Add an approved YouTube embed URL to this tutorial to activate the video player.</small></div>
            )}
            <h3><ListChecks size={19} /> Step-by-step process</h3>
            <ol className="le-step-list">{(item.steps || []).map((step, i) => <li key={i}><span>{i + 1}</span><p>{step}</p></li>)}</ol>
            <h3><FileText size={19} /> Documents and information to prepare</h3>
            <ul className="le-check-list">{(item.documents || []).map((doc) => <li key={doc}><CheckCircle2 size={16} />{doc}</li>)}</ul>
            <p className="le-disclaimer">This is a general preparation guide, not an official filing instruction. Requirements may vary by applicant and change over time. Verify the latest requirements on the relevant official portal.</p>
            <button className="le-primary-button" onClick={() => onApplyNow?.({ name: item.name })}>Apply for this service <ChevronRight size={17} /></button>
          </>
        ) : (
          <>
            <h3><BookOpen size={19} /> About this service</h3>
            <p className="le-body-copy">{item.overview}</p>
            <h3><ShieldCheck size={19} /> Potential benefits</h3>
            <ul className="le-check-list">{(item.benefits || []).map((benefit) => <li key={benefit}><CheckCircle2 size={16} />{benefit}</li>)}</ul>
            <h3><Lightbulb size={19} /> Things to consider</h3>
            <ul className="le-bullet-list">{(item.considerations || []).map((point) => <li key={point}>{point}</li>)}</ul>
            {!!item.faqs?.length && <><h3><HelpCircle size={19} /> Frequently asked question</h3>{item.faqs.map((faq) => <div className="le-faq" key={faq.q}><strong>{faq.q}</strong><p>{faq.a}</p></div>)}</>}
            <div className="le-detail-actions">
              <button className="le-primary-button" onClick={onWatch}>Watch how-to <PlayCircle size={17} /></button>
              <button className="le-secondary-button" onClick={() => onApplyNow?.({ name: item.name })}>Apply for this service <ChevronRight size={17} /></button>
            </div>
            <p className="le-disclaimer">Information is a general introduction, not financial, tax or legal advice. Eligibility, benefits and requirements depend on current rules and the relevant provider's assessment.</p>
          </>
        )}
      </section>
    </div>
  );
}

export default function LearnAndEarn({ customer, onBack, onSelectService, onApplyNow }) {
  const [activeTab, setActiveTab] = useState("howto");
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);

  const visibleItems = useMemo(() => learningItems.filter((item) => {
    const matchesMode = item.type === activeTab || (activeTab === "howto" && item.steps);
    const matchesCategory = activeCategory === "all" || item.category === activeCategory;
    const query = search.trim().toLowerCase();
    const matchesSearch = !query || `${item.name} ${item.summary} ${categoryMeta[item.category]?.title || ""}`.toLowerCase().includes(query);
    return matchesMode && matchesCategory && matchesSearch;
  }), [activeTab, activeCategory, search]);

  const handleWatchFromLearn = (item) => {
    setActiveTab("howto");
    setActiveCategory(item.category);
    setSearch(item.name);
    setSelectedItem(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleApply = (service) => {
    setSelectedItem(null);
    if (onApplyNow) onApplyNow(service);
    else if (onSelectService) onSelectService(service);
  };

  return (
    <main className="le-page">
      <header className="le-header">
        <button className="le-back-button" onClick={onBack} aria-label="Go back"><ArrowLeft size={21} /></button>
        <div><strong>Learn & Earn</strong><span>Indipay Knowledge Centre</span></div>
        <span className="le-header-icon"><GraduationCap size={25} /></span>
      </header>

      <div className="le-container">
        <section className="le-hero">
          <div className="le-hero-copy">
            <span className="le-hero-kicker">INDIPAY KNOWLEDGE CENTRE</span>
            <h1>Learn more.<br /><em>Do more.</em></h1>
            <p>{customer?.name ? `Welcome, ${customer.name}. ` : "Build your knowledge with "}Explore practical guides, understand services and take your next step with confidence.</p>
            <div className="le-hero-pills"><span><PlayCircle size={14} /> Video guides</span><span><BookOpen size={14} /> Service insights</span></div>
          </div>
          <div className="le-hero-art"><div className="le-art-circle"><GraduationCap size={65} /></div><span className="le-art-sparkle sparkle-one">✦</span><span className="le-art-sparkle sparkle-two">✧</span></div>
        </section>

        <section className="le-tabs-wrap" aria-label="Learning sections">
          <button className={`le-tab ${activeTab === "howto" ? "active" : ""}`} onClick={() => { setActiveTab("howto"); setSelectedItem(null); }}><span className="le-tab-icon"><PlayCircle size={21} /></span><span><strong>HOW TO</strong><small>Videos & step-by-step guides</small></span></button>
          <button className={`le-tab ${activeTab === "learn" ? "active" : ""}`} onClick={() => { setActiveTab("learn"); setSelectedItem(null); }}><span className="le-tab-icon"><BookOpen size={21} /></span><span><strong>LEARN</strong><small>Services, details & benefits</small></span></button>
        </section>

        <section className="le-content-section">
          <div className="le-section-heading">
            <div><span className="le-eyebrow">{activeTab === "howto" ? "FOLLOW THE PROCESS" : "KNOW WHAT YOU CHOOSE"}</span><h2>{activeTab === "howto" ? "How can we help you?" : "Explore our services"}</h2><p>{activeTab === "howto" ? "Choose a service to see its preparation steps and tutorial." : "Understand what each service does and the benefits it may offer."}</p></div>
            <span className="le-heading-mark">{activeTab === "howto" ? <Video size={25} /> : <Lightbulb size={25} />}</span>
          </div>

          <label className="le-search"><Search size={18} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search services or topics..." /><kbd>/</kbd></label>

          <div className="le-category-filters" aria-label="Filter by category">
            {categories.map((category) => <button key={category.id} className={activeCategory === category.id ? "active" : ""} onClick={() => setActiveCategory(category.id)}>{category.label}</button>)}
          </div>

          {visibleItems.length ? (
            <div className="le-card-grid">
              {visibleItems.map((item) => {
                const meta = categoryMeta[item.category];
                const Icon = meta.icon;
                return (
                  <article className="le-card" key={item.id}>
                    <div className={`le-card-icon le-${item.category}`}><Icon size={24} /></div>
                    <div className="le-card-meta"><span>{meta.title}</span>{activeTab === "howto" ? <span><Clock size={12} /> {item.duration}</span> : <span><BookOpen size={12} /> Overview</span>}</div>
                    <h3>{item.name}</h3>
                    <p>{item.summary}</p>
                    <div className="le-card-bottom"><span>{activeTab === "howto" ? <><PlayCircle size={15} /> Tutorial & steps</> : <><ShieldCheck size={15} /> Details & benefits</>}</span><button onClick={() => setSelectedItem(item)} aria-label={`Open ${item.name}`}><span>{activeTab === "howto" ? "View guide" : "Learn more"}</span><ChevronRight size={17} /></button></div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="le-empty"><Search size={30} /><strong>No matching content found</strong><p>Try another search term or choose a different category.</p><button onClick={() => { setSearch(""); setActiveCategory("all"); }}>Clear filters</button></div>
          )}
        </section>

        <section className="le-help-strip"><div className="le-help-icon"><HelpCircle size={22} /></div><div><strong>Need help choosing a service?</strong><p>Contact the Indipay team for guidance about the available services and application process.</p></div><a href="https://wa.me/916238398343" target="_blank" rel="noreferrer">Get help <ExternalLink size={15} /></a></section>
        <p className="le-page-note">Learning content is for general guidance. Always verify current eligibility, fees, documents and procedures with the relevant official authority or service provider.</p>
      </div>

      {selectedItem && <DetailPanel item={selectedItem} mode={activeTab} onClose={() => setSelectedItem(null)} onWatch={() => handleWatchFromLearn(selectedItem)} onApplyNow={handleApply} />}
    </main>
  );
}
