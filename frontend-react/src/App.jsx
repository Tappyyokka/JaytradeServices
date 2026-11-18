import { useState, useEffect } from "react";

import Navbar from "./components/common/navbar";
import Footer from "./components/common/Footer";
import { MessageCircle, Phone, X, Bot } from "lucide-react";

import IndexHero from "./components/index/IndexHero";
import AboutSection from "./components/index/AboutSection";
import FeaturedStories from "./components/index/FeaturedStories";
import ServicesOverview from "./components/index/ServicesOverview";
import WhyChooseUs from "./components/index/WhyChooseUs";
import HowItWorks from "./components/index/HowItWorks";
import AuthBanner from "./components/index/AuthBanner";
import Chatbot from "./components/common/Chatbot";
import Announcements from "./pages/Announcements";
import ApplicationForm from "./pages/ApplicationForm";
import ApplicationStatus from "./pages/ApplicationStatus";
import BottomNav from "./components/common/BottomNav";
import LearnAndEarn from "./pages/LearnAndEarn";
import CustomerApplications from "./pages/CustomerApplications";
import Wallet from "./pages/Wallet";
import Rewards from "./pages/Rewards";
import Refer from "./pages/Refer";
import Jobs from "./pages/Jobs";
import Times from "./pages/Times";
import BusinessDevelopment from "./pages/BusinessDevelopment";
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
  const [supportMenuOpen, setSupportMenuOpen] = useState(false);
const [chatOpenSignal, setChatOpenSignal] = useState(0);

  const handleBottomNavigation = (page) => {
  if (page === "me") {
    setCurrentPage(customer ? "home" : "login");
  } else if (page === "refer") {
    setCurrentPage(customer ? "refer" : "login");
  } else {
    setCurrentPage(page);
  }

  window.scrollTo(0, 0);
};

useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const referralCode = params.get("ref");

  if (referralCode) {
    localStorage.setItem(
      "indipay_referral_code",
      referralCode.toUpperCase()
    );
  }
}, []);
const pageToTab = {
  home: "Me",
  login: "Me",
  refer: "Refer",
  rewards: "Rewards",
  times: "Learn & Earn",
  "learn-earn": "Learn & Earn",
  "about-us": "About Us",
};

const activeTab = pageToTab[currentPage] || "";

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

 } else if (currentPage === "customer-applications") {
    pageContent = (
      <CustomerApplications
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
onApplicationSubmitted={() => {
  setCurrentPage("customer-applications");
  window.scrollTo(0, 0);
}}
  customer={customer}

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
  if (customer?.role === "ADMIN") {
    setCurrentPage("application-status");
  } else {
    setCurrentPage("customer-applications");
  }

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
onOpenRefer={() => {
  setCurrentPage("refer");
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
    if (customer?.role === "ADMIN") {
        setCurrentPage("application-status");
    } else {
        setCurrentPage("customer-applications");
    }

    window.scrollTo(0, 0);
}}

onOpenBusinessDevelopment={() => {
    setCurrentPage("business-development");
    window.scrollTo(0, 0);
}}
onOpenWallet={() => {
  setCurrentPage("wallet");
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
else if (currentPage === "rewards") {
  pageContent = (
    <Rewards
      customer={customer}
      onBack={() => {
        setCurrentPage("wallet");
        window.scrollTo(0, 0);
      }}
    />
  );
}

else if (currentPage === "wallet") {
  pageContent = (
    <Wallet
      customer={customer}
      onBack={() => {
        setCurrentPage("home");
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
      onLogin={() => {
        setCurrentPage("login");
        window.scrollTo(0, 0);
      }}
      onOpenRewards={() => {
  setCurrentPage("rewards");
  window.scrollTo(0, 0);
}}
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
      onOpenProfile={() => {
        setCurrentPage("home");
        window.scrollTo(0, 0);
      }}
    />
  );
}

else if (currentPage === "business-development") {
  pageContent = (
    <BusinessDevelopment
      onBack={() => {
        setCurrentPage("home");
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

else if (currentPage === "learn-earn") {
  pageContent = (
    <LearnAndEarn
      customer={customer}
      onBack={() => {
        setCurrentPage("home");
        window.scrollTo(0, 0);
      }}
      onSelectService={handleSelectService}
      onApplyNow={handleApplyNow}
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

else if (currentPage === "refer") {
  pageContent = <Refer customer={customer} />;
}
else if (currentPage === "about-us") {
  pageContent = (
    <AboutUs
      onBack={() => {
        setCurrentPage("home");
        window.scrollTo(0, 0);
      }}
      onOpenServices={() => {
        setCurrentPage("services");
        window.scrollTo(0, 0);
      }}
      onOpenApplicationStatus={() => {
        if (customer?.role === "ADMIN") {
          setCurrentPage("application-status");
        } else {
          setCurrentPage("customer-applications");
        }
        window.scrollTo(0, 0);
      }}
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

  {!["existing", "login", "register"].includes(currentPage) && (
    <BottomNav
      activeTab={activeTab}
      onNavigate={handleBottomNavigation}
    />
  )}

    {["home", "services", "service-detail"].includes(currentPage) && (
      <Chatbot
        customer={customer}
        hideLauncher
        externalOpenSignal={chatOpenSignal}
        currentService={
          currentPage === "service-detail" ? selectedService : null
        }
        onOpenApplications={() => {
          if (customer?.role === "ADMIN") {
            setCurrentPage("application-status");
          } else {
            setCurrentPage("customer-applications");
          }
          window.scrollTo(0, 0);
        }}
        onLogin={() => {
          setCurrentPage("login");
          window.scrollTo(0, 0);
        }}
        onOpenCategory={(categoryId) => {
  setCurrentPage("services");

  setTimeout(() => {
    document.getElementById(categoryId)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, 200);
}}
      />
    )}

    {!isAuthPage && (
      <>
        {currentPage !== "home" &&
 currentPage !== "service-detail" &&
 currentPage !== "services" &&
 currentPage !== "times" && 
 currentPage !== "customer-applications" &&
 currentPage !== "business-development" &&
 currentPage !== "wallet" &&
 currentPage !== "refer" &&
 currentPage !== "rewards" &&
 currentPage !== "learn-earn" &&
 currentPage !== "jobs" && (
  <Footer onSelectService={handleSelectService} />
)}

        {["home", "services", "service-detail"].includes(currentPage) ? (
  <div className="indipay-support-float">
    {supportMenuOpen && (
      <div className="indipay-support-options">
        <button
          type="button"
          onClick={() => {
            setSupportMenuOpen(false);
            setChatOpenSignal((value) => value + 1);
          }}
        >
          <Bot size={19} />
          Ask the AI Assistant
        </button>

        <a
          href="https://wa.me/916238398343?text=Hello%20Jay%20Trade,%20I'm%20interested%20in%20your%20services.%20Could%20you%20please%20assist%20me?"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="support-whatsapp-icon">
            <MessageCircle size={17} />
            <Phone size={9} />
          </span>
          Chat on WhatsApp
        </a>
      </div>
    )}

    <button
      type="button"
      className="indipay-support-main"
      onClick={() => setSupportMenuOpen((open) => !open)}
      aria-expanded={supportMenuOpen}
      aria-label={supportMenuOpen ? "Close support options" : "Open support options"}
    >
      {supportMenuOpen ? <X size={25} /> : <MessageCircle size={25} />}
    </button>
  </div>
) : (
  <a
    href="https://wa.me/916238398343?text=Hello%20Jay%20Trade,%20I'm%20interested%20in%20your%20services.%20Could%20you%20please%20assist%20me?"
    className="whatsapp-float"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Chat with Jay Trade on WhatsApp"
  >
    <span className="whatsapp-icon">
      <MessageCircle size={32} />
      <Phone size={15} className="whatsapp-phone" />
    </span>
  </a>
)}
      </>
    )}
  </>
);
}

export default App;
