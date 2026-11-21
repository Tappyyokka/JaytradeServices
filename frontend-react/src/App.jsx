import { useState, useEffect, useRef } from "react";


import Footer from "./components/common/Footer";
import API_BASE_URL from "./config/api";
import { MessageCircle, Phone, X, Bot } from "lucide-react";
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
import LegalDetails from "./pages/LegalDetails";
import Register from "./pages/Register";

import Home from "./pages/Home";
import DetailedServices from "./pages/DetailedServices";
import ServiceDetail from "./pages/ServiceDetail";

const PAGE_PATHS = {
  home: "/",
  login: "/login",
  register: "/register",
  services: "/services",
  "service-detail": "/services/detail",
  "legal-details": "/legal-services/detail",
  "application-form": "/apply",
  "customer-applications": "/applications",
  "application-status": "/admin/applications",
  announcements: "/announcements",
  wallet: "/wallet",
  rewards: "/rewards",
  refer: "/refer",
  jobs: "/jobs",
  times: "/times",
  "business-development": "/business-development",
  "learn-earn": "/learn-and-earn",
  "about-us": "/about-us",
};

function pageFromPath(pathname) {
  return (
    Object.entries(PAGE_PATHS).find(([, path]) => path === pathname)?.[0] ||
    "home"
  );
}

function App() {
  const [currentPage, setCurrentPage] = useState(() =>
    pageFromPath(window.location.pathname)
  );
  const [sessionLoading, setSessionLoading] = useState(true);
  const isHistoryNavigation = useRef(false);
  const [darkMode, setDarkMode] = useState(() => {
  return localStorage.getItem("indipay-theme") === "dark";
});

useEffect(() => {
  localStorage.setItem("indipay-theme", darkMode ? "dark" : "light");
}, [darkMode]);
  const [customer, setCustomer] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [applicationReturnPage, setApplicationReturnPage] = useState("service-detail");
  const [timesReturnPage, setTimesReturnPage] = useState("home");
  const [supportMenuOpen, setSupportMenuOpen] = useState(false);
const [chatOpenSignal, setChatOpenSignal] = useState(0);

  useEffect(() => {
    const handlePopState = () => {
      isHistoryNavigation.current = true;
      setCurrentPage(pageFromPath(window.location.pathname));
      window.scrollTo(0, 0);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    const path = PAGE_PATHS[currentPage] || PAGE_PATHS.home;

    if (isHistoryNavigation.current) {
      isHistoryNavigation.current = false;
      return;
    }

    if (window.location.pathname !== path) {
      window.history.pushState({ page: currentPage }, "", path);
    }
  }, [currentPage]);

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
  "customer-applications": "Me",
  "application-status": "Me",
  "application-form": "Me",
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
                `${API_BASE_URL}/api/auth/me`,
                {
                    method: "GET",
                    credentials: "include",
                }
            );

            const result = await response.json();

            if (response.ok && result.success) {
                setCustomer(result.user);
            }

        } catch (error) {
            console.error("Session check failed:", error);
        } finally {
            setSessionLoading(false);
        }
    };

    checkCustomerSession();
}, []);
  const handleSelectService = (service) => {
    setSelectedService(service);
    setCurrentPage("service-detail");
    window.scrollTo(0, 0);
  };
  const handleOpenLegalDetails = (service) => {
  setSelectedService(service);
  setCurrentPage("legal-details");
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

const protectedPages = [
  "customer-applications",
  "application-status",
  "application-form",
  "wallet",
  "rewards",
  "refer",
];

const isProtectedPage = protectedPages.includes(currentPage);
const requiresLogin = !sessionLoading && !customer && isProtectedPage;

   let pageContent;

  if (sessionLoading && isProtectedPage) {
  pageContent = (
    <div className="indipay-login-required" aria-live="polite">
      <div className="indipay-login-required-card">
        <h2>Checking your session…</h2>
        <p>Please wait while we securely load your account.</p>
      </div>
    </div>
  );
} else if (requiresLogin) {
  pageContent = (
    <div className="indipay-login-required">
      <div className="indipay-login-required-card">
        <h2>Login Required</h2>
        <p>
          Please log in to access this section of your Indipay account.
        </p>

        <button
          onClick={() => {
            setCurrentPage("login");
            window.scrollTo(0, 0);
          }}
        >
          Login to Continue
        </button>

        <button
          onClick={() => {
            setCurrentPage("register");
            window.scrollTo(0, 0);
          }}
        >
          Create Account
        </button>

        <button
          onClick={() => {
            setCurrentPage("home");
            window.scrollTo(0, 0);
          }}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
} else if (currentPage === "login") {
  pageContent = (
    <Login
      onBack={() => {
        setCurrentPage("home");
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
        setCurrentPage("home");
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

   } else if (currentPage === "legal-details") {
  pageContent = (
    <LegalDetails
      service={selectedService}
      onBack={() => {
        setCurrentPage("services");
        window.scrollTo(0, 0);
      }}
      onApplyNow={handleApplyNow}
      onLogin={() => {
        setCurrentPage("login");
        window.scrollTo(0, 0);
      }}
      onOpenAboutUs={handleOpenAboutUs}
    />
  );
} 
    
    else if (currentPage === "jobs") {
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
  onSelectLegalService={handleOpenLegalDetails}
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
  darkMode={darkMode}
  setDarkMode={setDarkMode}
    onLogout={async () => {
  try {
    await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
  } catch (error) {
    console.error("Logout failed:", error);
  }

  setCustomer(null);
  setCurrentPage("home");
  window.scrollTo(0, 0);
}}
onOpenRefer={() => {
  setCurrentPage("refer");
  window.scrollTo(0, 0);
}}
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
          await fetch(`${API_BASE_URL}/api/auth/logout`, {
            method: "POST",
            credentials: "include",
          });
        } catch (error) {
          console.error("Logout failed:", error);
        }

        setCustomer(null);
        setCurrentPage("home");
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
  pageContent = null;
}

  const isAuthPage =
  currentPage === "login" || currentPage === "register";

return (
  <div
    className={`indipay-app-shell${darkMode ? " dark-mode" : ""}`}
    data-theme={darkMode ? "dark" : "light"}
  >
    {pageContent}

  {!["login", "register"].includes(currentPage) && (
    <BottomNav
      activeTab={activeTab}
      onNavigate={handleBottomNavigation}
    />
  )}

   {!isAuthPage && (
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
 currentPage !== "about-us" &&
 currentPage !== "learn-earn" &&
  currentPage !== "announcements" &&
 currentPage !== "legal-details" && 
 currentPage !== "application-form" && 
 currentPage !== "jobs" && (
  <Footer onSelectService={handleSelectService} />
)}

    
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
    aria-label={
      supportMenuOpen ? "Close support options" : "Open support options"
    }
  >
    {supportMenuOpen ? <X size={25} /> : <MessageCircle size={25} />}
  </button>
</div>
   
      </>
    )}
    </div>
);
}

export default App;
