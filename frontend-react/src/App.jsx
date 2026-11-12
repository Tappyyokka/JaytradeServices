import { useState, useEffect } from "react";

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
import ApplicationForm from "./pages/ApplicationForm";
import ApplicationStatus from "./pages/ApplicationStatus";
import Jobs from "./pages/Jobs";
import Times from "./pages/Times";
import AboutUs from "./pages/AboutUs";
import Login from "./pages/Login";
import Register from "./pages/Register";

import Home from "./pages/Home";
import DetailedServices from "./pages/DetailedServices";
import ServiceDetail from "./pages/ServiceDetail";

function App() {
  const [currentPage, setCurrentPage] = useState("existing");
  const [customer, setCustomer] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [applicationReturnPage, setApplicationReturnPage] = useState("service-detail");
  const [timesReturnPage, setTimesReturnPage] = useState("home");

  useEffect(() => {
    const checkCustomerSession = async () => {
        try {
            const response = await fetch(
                "http://localhost:5000/api/auth/me",
                {
                    method: "GET",
                    credentials: "include",
                }
            );

            const result = await response.json();

            if (response.ok && result.success) {
                setCustomer(result.user);
                setCurrentPage("home");
            }

        } catch (error) {
            console.error("Session check failed:", error);
        }
    };

    checkCustomerSession();
}, []);
  const handleSelectService = (service) => {
    setSelectedService(service);
    setCurrentPage("service-detail");
    window.scrollTo(0, 0);
  };
  const handleOpenJobs = () => {
  setCurrentPage("jobs");
  window.scrollTo(0, 0);
};
const handleOpenAboutUs = () => {
  setCurrentPage("about-us");
  window.scrollTo(0, 0);
};
const handleOpenTimes = () => {
  setTimesReturnPage(currentPage);
  setCurrentPage("times");
  window.scrollTo(0, 0);
};
  const handleApplyNow = (service) => {
  setSelectedService(service);
  setApplicationReturnPage(currentPage);
  setCurrentPage("application-form");
  window.scrollTo(0, 0);
};

   let pageContent;

   if (currentPage === "login") {
  pageContent = (
    <Login
      onBack={() => {
        setCurrentPage("existing");
        window.scrollTo(0, 0);
      }}
      onRegister={() => {
        setCurrentPage("register");
        window.scrollTo(0, 0);
      }}
      onSuccess={(user) => {
    setCustomer(user);
    setCurrentPage("home");
    window.scrollTo(0, 0);
}}
    />
  );
} else if (currentPage === "register") {
  pageContent = (
    <Register
      onBack={() => {
        setCurrentPage("existing");
        window.scrollTo(0, 0);
      }}
      onLogin={() => {
        setCurrentPage("login");
        window.scrollTo(0, 0);
      }}
      onSuccess={(user) => {
    setCustomer(user);
    setCurrentPage("home");
    window.scrollTo(0, 0);
}}
    />
  );
} else if (currentPage === "announcements"){
    pageContent = (
      <Announcements
        onBack={() => {
          setCurrentPage("home");
          window.scrollTo(0, 0);
        }}
      />
    );

      } else if (currentPage === "application-status") {
    pageContent = (
      <ApplicationStatus
        onBack={() => {
          setCurrentPage("home");
          window.scrollTo(0, 0);
        }}
      />
    );
  } else if (currentPage === "application-form") {
    pageContent = (
      <ApplicationForm
        initialService={selectedService?.name || ""}
        onBack={() => {
  setCurrentPage(applicationReturnPage);
  window.scrollTo(0, 0);
}}
      />
      
    );

    } else if (currentPage === "jobs") {
  pageContent = (
    <Jobs
      onBack={() => {
        setCurrentPage("services");
        window.scrollTo(0, 0);
      }}
      onApplyNow={(packageItem) => {
        setSelectedService(packageItem);
        setCurrentPage("application-form");
        window.scrollTo(0, 0);
      }}
       onLogin={() => {
    setCurrentPage("login");
    window.scrollTo(0, 0);
  }}
  onOpenAboutUs={handleOpenAboutUs}
    />
  );
  } else if (currentPage === "service-detail") {
    pageContent = (
      <ServiceDetail
  service={selectedService}
  onBack={() => {
    setCurrentPage("services");
    window.scrollTo(0, 0);
  }}
  onApplyNow={handleApplyNow}
  onOpenAnnouncements={() => {
    setCurrentPage("announcements");
    window.scrollTo(0, 0);
  }}
  onLogin={() => {
    setCurrentPage("login");
    window.scrollTo(0, 0);
  }}
  onRegister={() => {
    setCurrentPage("register");
    window.scrollTo(0, 0);
  }}
  onOpenAboutUs={handleOpenAboutUs}
/>
    );
  } else if (currentPage === "services") {
    pageContent = (
      <DetailedServices
  onBack={() => {
    setCurrentPage("home");
    window.scrollTo(0, 0);
  }}
  onSelectService={handleSelectService}
  onOpenApplicationStatus={() => {
    setCurrentPage("application-status");
    window.scrollTo(0, 0);
  }}
  onLogin={() => {
    setCurrentPage("login");
    window.scrollTo(0, 0);
  }}
  onRegister={() => {
    setCurrentPage("register");
    window.scrollTo(0, 0);
  }}
  onOpenAnnouncements={() => {
  setCurrentPage("announcements");
  window.scrollTo(0, 0);
  
}}
onOpenJobs={handleOpenJobs}
onOpenTimes={handleOpenTimes}
onOpenAboutUs={handleOpenAboutUs}
/>
    );
    
  } else if (currentPage === "home") {
  pageContent = (
    <Home
    customer={customer}
    onLogout={async () => {
  try {
    await fetch("http://localhost:5000/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
  } catch (error) {
    console.error("Logout failed:", error);
  }

  setCustomer(null);
  setCurrentPage("existing");
  window.scrollTo(0, 0);
}}
      onBack={() => {
        setCurrentPage("existing");
        window.scrollTo(0, 0);
      }}
      onOpenServices={() => {
        setCurrentPage("services");
        window.scrollTo(0, 0);
      }}
      onOpenAnnouncements={() => {
        setCurrentPage("announcements");
        window.scrollTo(0, 0);
      }}
      onSelectService={handleSelectService}
      onOpenApplicationStatus={() => {
        setCurrentPage("application-status");
        window.scrollTo(0, 0);
      }}
      onLogin={() => {
        setCurrentPage("login");
        window.scrollTo(0, 0);
      }}
      onRegister={() => {
        setCurrentPage("register");
        window.scrollTo(0, 0);
      }}
      onOpenJobs={handleOpenJobs}
      onOpenTimes={handleOpenTimes}
      onOpenAboutUs={handleOpenAboutUs}
    />
  );
  
} 
else if (currentPage === "times") {
  pageContent = (
    <Times
      onBack={() => {
        setCurrentPage(timesReturnPage);
        window.scrollTo(0, 0);
      }}
      onSelectPackage={handleApplyNow}
      onLogin={() => {
  setCurrentPage("login");
  window.scrollTo(0, 0);
}}
onOpenAboutUs={handleOpenAboutUs}
    />
  );
}

else if (currentPage === "about-us") {
  pageContent = (
    <AboutUs
      onBack={() => {
        setCurrentPage("home");
        window.scrollTo(0, 0);
      }}
    />
  );
}
else {
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

        <Navbar
  onLogin={() => {
    setCurrentPage("login");
    window.scrollTo(0, 0);
  }}
  onRegister={() => {
    setCurrentPage("register");
    window.scrollTo(0, 0);
  }}
/>
        <IndexHero />
        <AboutSection />
        <FeaturedStories />
        <ServicesOverview />
        <WhyChooseUs />
        <HowItWorks />
        <AuthBanner
  onRegister={() => {
    setCurrentPage("register");
    window.scrollTo(0, 0);
  }}
  onLogin={() => {
    setCurrentPage("login");
    window.scrollTo(0, 0);
  }}
/>
      </>
    );
  }

  const isAuthPage =
  currentPage === "login" || currentPage === "register";

return (
  <>
    {pageContent}

    {!isAuthPage && (
      <>
        {currentPage !== "home" &&
 currentPage !== "service-detail" &&
 currentPage !== "services" &&
 currentPage !== "times" && 
 currentPage !== "about-us" &&
 currentPage !== "jobs" && (
  <Footer onSelectService={handleSelectService} />
)}

        <a
          href="https://wa.me/916238398343?text=Hello%20Jay%20Trade,%20I'm%20interested%20in%20your%20services.%20Could%20you%20please%20assist%20me?"
          className="whatsapp-float"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with Jay Trade on WhatsApp"
        >
          <span className="whatsapp-icon">
            <MessageCircle size={32} strokeWidth={2.2} />
            <Phone
              size={15}
              strokeWidth={3}
              className="whatsapp-phone"
            />
          </span>
        </a>
      </>
    )}
  </>
);
}

export default App;
