
import { useState } from "react";

import Navbar from "./components/common/navbar";
import Footer from "./components/common/Footer";
import { MessageCircle } from "lucide-react";
import { Phone } from "lucide-react";

import IndexHero from "./components/index/IndexHero";
import AboutSection from "./components/index/AboutSection";
import FeaturedStories from "./components/index/FeaturedStories";
import ServicesOverview from "./components/index/ServicesOverview";
import WhyChooseUs from "./components/index/WhyChooseUs";
import HowItWorks from "./components/index/HowItWorks";
import AuthBanner from "./components/index/AuthBanner";
import Announcements from "./pages/Announcements";

import Home from "./pages/Home";
import DetailedServices from "./pages/DetailedServices";
import ServiceDetail from "./pages/ServiceDetail";

function App() {
  const [currentPage, setCurrentPage] = useState("existing");
  const [selectedService, setSelectedService] = useState(null);

  const handleSelectService = (service) => {
    setSelectedService(service);
    setCurrentPage("service-detail");
    window.scrollTo(0, 0);
  };

  let pageContent;

  if (currentPage === "announcements") {
  pageContent = (
    <Announcements
      onBack={() => {
        setCurrentPage("home");
        window.scrollTo(0, 0);
      }}
    />
  );
} else

  if (currentPage === "service-detail") {
    pageContent = (
      <ServiceDetail
        service={selectedService}
        onBack={() => setCurrentPage("services")}
      />
    );
  } else if (currentPage === "services") {
    pageContent = (
      <DetailedServices
        onBack={() => setCurrentPage("home")}
        onSelectService={handleSelectService}
      />
    );
  } else if (currentPage === "home") {
    pageContent = (
      <Home
  onBack={() => setCurrentPage("existing")}
  onOpenServices={() => {
    setCurrentPage("services");
    window.scrollTo(0, 0);
  }}
  onOpenAnnouncements={() => {
    setCurrentPage("announcements");
    window.scrollTo(0, 0);
  }}
  onSelectService={handleSelectService}
/>
    );
  } else {
    pageContent = (
      <>
        <button
          onClick={() => {
            setCurrentPage("home");
            window.scrollTo(0, 0);
          }}
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            zIndex: 9999,
            padding: "12px 20px",
            background: "#0866f5",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "600",
            boxShadow: "0 3px 12px rgba(0,0,0,0.2)",
          }}
        >
          Open New Home Page →
        </button>

        <Navbar />
        <IndexHero />
        <AboutSection />
        <FeaturedStories />
        <ServicesOverview />
        <WhyChooseUs />
        <HowItWorks />
        <AuthBanner />
      </>
    );
  }

  return (
  <>
    {pageContent}

    <Footer onSelectService={handleSelectService} />

    <a
      href="https://wa.me/916238398343?text=Hello%20Jay%20Trade,%20I'm%20interested%20in%20your%20services.%20Could%20you%20please%20assist%20me?"
      className="whatsapp-float"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Jay Trade on WhatsApp"
    >
      <span className="whatsapp-icon">
  <MessageCircle size={32} strokeWidth={2.2} />
  <Phone size={15} strokeWidth={3} className="whatsapp-phone" />
</span>
    </a>
  </>
);
}

export default App;
