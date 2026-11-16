
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Newspaper,
  Megaphone,
  UserRound,
  Users,
  Gift,
  BookOpen,
  Headset,
  Video,
  BriefcaseBusiness,
} from "lucide-react";

import "./Times.css";
import { useState } from "react";

const packages = [
  {
    name: "Grow Up Package",
    serviceName: "Growup Package",
    price: "₹15,000",
    description: "Build your brand visibility with promotional media services.",
    features: [
      "Anchoring video promotion",
      "One page story",
      "2 copy magazine",
      "Online portal promotion",
    ],
  },
  {
    name: "Standard Package",
    serviceName: "Standard Package",
    price: "₹25,000",
    description: "Get your business featured across digital and media platforms.",
    features: [
      "1 page story",
      "1 week social media promotion",
      "Anchoring video",
      "1 year free financial and legal assistance",
      "1 year subscription",
      "1 year valid reporter code and BA code",
    ],
  },
  {
    name: "Premium Package",
    serviceName: "Premium Package",
    price: "₹50,000",
    description: "Expand your reach with premium media and business benefits.",
    features: [
      "2 page story",
      "15 days social media promotion",
      "Interview video",
      "2 year subscription",
      "2 year financial and legal assistance",
      "2 year valid reporter code and BA code",
    ],
  },
  {
    name: "Corporate Package",
    serviceName: "Corporate Package",
    price: "₹1,00,000",
    description: "A complete promotional and business support package.",
    features: [
      "2 page story",
      "1 month social media promotion",
      "Corporate business video coverage",
      "Lifetime subscription",
      "Free lifetime financial and legal assistance",
      "2 year valid reporter code and BA code",
      "100 franchise business plan",
    ],
  },
];

function Times({ onBack, onSelectPackage, onLogin, onOpenAboutUs,onOpenRewards }) {
  const [activeTab, setActiveTab] = useState("Me");

  const handleBottomNavigation = (label) => {
  setActiveTab(label);

  if (label === "Me") {
    onLogin?.();
  } else if (label === "About Us") {
    onOpenAboutUs?.();
  }else if (label === "Rewards") {
    onOpenRewards?.();
  }
};

  return (
    <div className="times-page">
      <main className="times-container">
        <button className="times-back-button" onClick={onBack}>
          <ArrowLeft size={17} />
          Back
        </button>

        <section className="times-hero">
          <div className="times-hero-content">
            <span className="times-eyebrow">
              <Newspaper size={16} />
              JAYTRADE TIMES & TECHNOLOGIES
            </span>

            <h1>
              Your Business.
              <span> Your Story.</span>
              Your Growth.
            </h1>

            <p>
              Promote your business, build your brand presence,
              and explore media and business support packages
              from Jaytrade Times.
            </p>

            <a href="#times-packages" className="times-hero-button">
              Explore Packages
              <ArrowRight size={18} />
            </a>
          </div>

          <div className="times-hero-visual">
            <div className="times-hero-icon">
              <Megaphone size={65} />
            </div>
            <div className="times-hero-floating times-float-one">
              <Video size={24} />
            </div>
            <div className="times-hero-floating times-float-two">
              <Newspaper size={24} />
            </div>
            <div className="times-hero-floating times-float-three">
              <BriefcaseBusiness size={24} />
            </div>
          </div>
        </section>

        <section className="times-intro">
          <span>OUR MEDIA SOLUTIONS</span>
          <h2>Choose Your Package</h2>
          <p>
            From promotional stories to corporate media coverage,
            find the package that matches your business goals.
          </p>
        </section>

        <section className="times-packages-grid" id="times-packages">
          {packages.map((item, index) => (
            <article className="times-package-card" key={item.name}>

              <div className="times-package-content">
                <span className="times-package-number">
                  PACKAGE 0{index + 1}
                </span>

                <h3>{item.name}</h3>
                <p className="times-package-description">
                  {item.description}
                </p>

                <div className="times-package-price">
                  <span>Offer Price</span>
                  <strong>{item.price}</strong>
                </div>

                <div className="times-feature-heading">
                  Package includes
                </div>

                <ul className="times-feature-list">
                  {item.features.map((feature) => (
                    <li key={feature}>
                      <CheckCircle2 size={17} />
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  className="times-package-button"
                  onClick={() =>
                    onSelectPackage?.({
                      name: item.serviceName,
                      packageName: item.name,
                      packageType: "times",
                    })
                  }
                >
                  Enquire Now
                  <ArrowRight size={17} />
                </button>
              </div>
            </article>
          ))}
        </section>

        <section className="times-bottom-banner">
          <div>
            <span>LET'S GROW TOGETHER</span>
            <h2>Ready to promote your business?</h2>
            <p>
              Choose a package and connect with the Jaytrade Times team.
            </p>
          </div>
          <button
            onClick={() =>
              onSelectPackage?.({
                name: "Growup Package",
                packageName: "Grow Up Package",
                packageType: "times",
              })
            }
          >
            Get Started <ArrowRight size={17} />
          </button>
        </section>
      </main>

    </div>
  );
}

export default Times;
