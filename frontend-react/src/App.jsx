
import { useState } from "react";

import Navbar from "./components/common/navbar";
import IndexHero from "./components/index/IndexHero";
import AboutSection from "./components/index/AboutSection";
import FeaturedStories from "./components/index/FeaturedStories";
import ServicesOverview from "./components/index/ServicesOverview";
import WhyChooseUs from "./components/index/WhyChooseUs";
import HowItWorks from "./components/index/HowItWorks";
import AuthBanner from "./components/index/AuthBanner";
import Footer from "./components/common/Footer";
import ServiceDetail from "./pages/ServiceDetail";

import Home from "./pages/Home";
import DetailedServices from "./pages/DetailedServices";

function App() {
  const [currentPage, setCurrentPage] = useState("existing");
  const [selectedService, setSelectedService] = useState(null);

  if (currentPage === "service-detail") {
  return (
    <ServiceDetail
      service={selectedService}
      onBack={() => setCurrentPage("services")}
    />
  );
}

  if (currentPage === "services") {
  return (
    <DetailedServices
      onBack={() => setCurrentPage("home")}
      onSelectService={(service) => {
        setSelectedService(service);
        setCurrentPage("service-detail");
      }}
    />
  );
}

  if (currentPage === "home") {
    return (
      <Home
  onBack={() => setCurrentPage("existing")}
  onOpenServices={() => setCurrentPage("services")}
  onSelectService={(service) => {
    setSelectedService(service);
    setCurrentPage("service-detail");
  }}
/>
    );
  }

  return (
    <>
      <button
        onClick={() => setCurrentPage("home")}
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
      <Footer />
    </>
  );
}

export default App;
