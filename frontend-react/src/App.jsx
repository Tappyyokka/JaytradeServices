import { lazy, Suspense, useState, useEffect, useRef } from "react";


import Footer from "./components/common/Footer";
import { LoadingSkeleton } from "./components/common/Feedback";
import API_BASE_URL from "./config/api";
import useMarketplaceWallet from "./wallet/useMarketplaceWallet";
import { MessageCircle, Phone, X, Bot } from "lucide-react";
import Chatbot from "./components/common/Chatbot";
import Announcements from "./pages/Announcements";
import ApplicationForm from "./pages/ApplicationForm";
import AdminCentre from "./pages/AdminCentre";
import BottomNav from "./components/common/BottomNav";
import LearnAndEarn from "./pages/LearnAndEarn";
import CustomerApplications from "./pages/CustomerApplications";
import ApplicationRegistrationPayment from "./pages/ApplicationRegistration";
import AddMoney from "./pages/AddMoney";
import Wallet from "./pages/Wallet";
import { accountIdentity } from "./auth/accountIdentity";
import { canonicalAccountUrl, safeReturnUrl, SUPERSTORE_PATH } from "./auth/accountRoutes";
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
import "./pages/Marketplace/Marketplace.css";

const Marketplace = lazy(() =>
  import("./pages/Marketplace/MarketplacePreview")
);

const PAGE_PATHS = {
  marketplace: SUPERSTORE_PATH,
  "merchant-plans": "/merchant/plans",
  "merchant-register": "/merchant/register",
  "seller-dashboard": SUPERSTORE_PATH + "/seller/dashboard",
  home: "/",
  login: "/login",
  "admin-login": "/admin/login",
  admin: "/admin",
  register: "/register",
  services: "/services",
  "service-detail": "/services/detail",
  "legal-details": "/legal-services/detail",
  "application-form": "/apply",
  "customer-applications": "/applications",
  "application-payment": "/applications/payment",
  "wallet-add-money": "/wallet/add-money",
  "wallet-credit-admin": "/admin/wallet-credit-requests",
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
    pageFromPath(canonicalAccountUrl(window.location.href).pathname)
  );
  const [, updateLocation] = useState(0);
  const [sessionLoading, setSessionLoading] = useState(true);
  const isHistoryNavigation = useRef(false);
  const [darkMode, setDarkMode] = useState(() => {
  return localStorage.getItem("indipay-theme") === "dark";
});

useEffect(() => {
  localStorage.setItem("indipay-theme", darkMode ? "dark" : "light");
}, [darkMode]);
  const [customer, setCustomer] = useState(null);
  const marketplaceWallet = useMarketplaceWallet(customer);
  const refreshWallet = marketplaceWallet.refresh;
  useEffect(() => {
    if (customer?.id) void refreshWallet();
  }, [currentPage, customer?.id, refreshWallet]);
  const identity = accountIdentity(customer, marketplaceWallet.account);
  const [selectedService, setSelectedService] = useState(null);
  const [serviceOverrides, setServiceOverrides] = useState({});
  useEffect(() => {
    const controller = new AbortController();
    fetch(API_BASE_URL + "/api/admin-centre/service-catalogue", { signal: controller.signal })
      .then((response) => response.ok ? response.json() : [])
      .then((rows) => { if (Array.isArray(rows) && !controller.signal.aborted) setServiceOverrides(Object.fromEntries(rows.map((row) => [row.id, row]))); })
      .catch(() => {});
    return () => controller.abort();
  }, []);
  const [applicationReturnPage, setApplicationReturnPage] = useState("service-detail");
  const [timesReturnPage, setTimesReturnPage] = useState("home");
  const [supportMenuOpen, setSupportMenuOpen] = useState(false);
  const [addMoneyResultScreen, setAddMoneyResultScreen] = useState(false);
const [chatOpenSignal, setChatOpenSignal] = useState(0);

  useEffect(() => {
    const handlePopState = () => {
      const route = canonicalAccountUrl(window.location.href);
      if (route.href !== window.location.href) window.history.replaceState(window.history.state, "", route.href);
      const nextPage = pageFromPath(route.pathname);
      if (nextPage !== currentPage) {
        isHistoryNavigation.current = true;
        setCurrentPage(nextPage);
      }
      updateLocation((value) => value + 1);
      window.scrollTo(0, 0);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [currentPage]);

  useEffect(() => {
    const path = PAGE_PATHS[currentPage] || PAGE_PATHS.home;
    const route = canonicalAccountUrl(window.location.href);
    if (route.href !== window.location.href && route.pathname === path) {
      window.history.replaceState({ page: currentPage }, "", route.href);
    }

    if (isHistoryNavigation.current) {
      isHistoryNavigation.current = false;
      return;
    }

    if (window.location.pathname !== path) {
      window.history.pushState({ page: currentPage }, "", path);
    }
  }, [currentPage]);

  const route = canonicalAccountUrl(window.location.href);
  const params = route.pathname === PAGE_PATHS[currentPage] ? route.searchParams : new URLSearchParams();
  const returnTo = safeReturnUrl(params.get("next") ?? params.get("returnTo"), window.location.origin, PAGE_PATHS);
  const loginMode = currentPage === "admin-login" ? "admin" : params.get("mode") === "merchant" ? "merchant" : "customer";

  function visitUrl(url, replace = false) {
    const page = pageFromPath(new URL(url, window.location.origin).pathname);
    const currentUrl = window.location.pathname + window.location.search + window.location.hash;
    if (currentUrl !== url) {
      if (replace) window.history.replaceState({ page }, "", url);
      else window.history.pushState({ page }, "", url);
    }
    setCurrentPage(page);
    updateLocation((value) => value + 1);
    window.scrollTo(0, 0);
  }

  function visitPage(page, options = {}, hash = "", replace = false) {
    const query = new URLSearchParams(Object.entries(options).filter(([, value]) => value)).toString();
    visitUrl(PAGE_PATHS[page] + (query ? "?" + query : "") + hash, replace);
  }

  function openLogin(next, mode = "customer", replace = false) {
    visitPage(mode === "admin" ? "admin-login" : "login", { next, mode: mode === "merchant" ? mode : null }, "", replace);
  }

  function finishAuthentication(user, next = returnTo) {
    setCustomer(user);
    visitUrl(next ?? PAGE_PATHS.home, true);
  }

  const openMerchantPlans = () => visitPage("marketplace");
const openMyStore = () => visitPage("marketplace");

  function activeUrl() {
    return window.location.pathname + window.location.search + window.location.hash;
  }

  const handleBottomNavigation = (page) => {
  if (page === "me") {
    setCurrentPage(customer ? "home" : "login");
  } else if (page === "refer") {
    if (!customer) { openLogin(PAGE_PATHS.refer); return; }
    setCurrentPage("refer");
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
};

const activeTab = pageToTab[currentPage] || "";

  function openMarketplaceWallet(view) {
    visitPage("marketplace", {}, "#wallet?" + new URLSearchParams({ view }));
  }

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
  "application-payment",
  "wallet-add-money",
  "wallet-credit-admin",
  "application-status",
  "admin",
  "application-form",
  "wallet",
  "rewards",
  "refer",
];

const isProtectedPage = protectedPages.includes(currentPage);
const requiresLogin = !sessionLoading && !customer && isProtectedPage;

   let pageContent;

  if (sessionLoading && (isProtectedPage || ["merchant-plans", "merchant-register", "seller-dashboard", "login", "admin-login"].includes(currentPage))) {
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
          onClick={() => openLogin(activeUrl(), ["admin", "application-status", "wallet-credit-admin"].includes(currentPage) ? "admin" : "customer")}
        >
          Login to Continue
        </button>

        <button
          onClick={() => visitPage("register", { next: activeUrl() })}
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
} else if (currentPage === "login" || currentPage === "admin-login") {
  pageContent = (
    <Login
      mode={loginMode}
      onModeChange={(mode) => openLogin(returnTo, mode, true)}
      onBack={() => visitPage("home")}
      onRegister={() => visitPage("register", { next: returnTo })}
      onMerchantRegister={openMerchantPlans}
      onPlans={openMerchantPlans}
      onAdmin={() => openLogin(null, "admin")}
      onSuccess={(user) => finishAuthentication(user, returnTo ?? (loginMode === "admin" ? PAGE_PATHS.admin : null))}
    />
  );
} else if (currentPage === "register") {
  pageContent = (
    <Register
      onBack={() => {
        setCurrentPage("home");
        window.scrollTo(0, 0);
      }}
      onLogin={() => openLogin(returnTo)}
      onSuccess={finishAuthentication}
    />
  );
} else if (currentPage === "announcements"){
    pageContent = (
      <Announcements
        customer={customer}
        onOpenRegistrationActivity={({ id, section, billId }) => {
          if (section === "superstore-credit") visitPage("wallet-add-money", { request: id, purchase: "checkout" });
          else if (section === "credit") visitPage("wallet-add-money", { request: id });
          else if (section === "bill") visitPage("customer-applications", { id, view: "completed", bill: billId });
          else visitPage("customer-applications", { id, view: section === "completed" ? "completed" : null });
        }}
        onOpenSuperstoreActivity={({ id, seller, feed, storeId, productId }) => {
          if (feed) visitPage("marketplace", {}, "#following");
          else if (storeId) visitPage("marketplace", {}, "#store/live-" + encodeURIComponent(storeId));
          else if (productId) visitPage("marketplace", {}, "#details?" + new URLSearchParams({ id: productId }) + "&reviews=1");
          else visitPage("marketplace", {}, (seller ? "#seller?" : "#orders?") + new URLSearchParams({ id }));
        }}
        onBack={() => {
          setCurrentPage("home");
          window.scrollTo(0, 0);
        }}
      />
    );

 } else if (currentPage === "customer-applications") {
    pageContent = (
      <CustomerApplications
        key={params.get("view") + ":" + params.get("id") + ":" + params.get("bill")}
        initialFilter={params.get("view") === "completed" ? "completed" : "all"}
        targetId={params.get("id")}
        targetBillId={params.get("bill")}
        onPay={(id) => visitPage("application-payment", { id })}
        onAddMoney={(id, additional) => visitPage("wallet-add-money", { id, additional })}
        onBack={() => {
          setCurrentPage("home");
          window.scrollTo(0, 0);
        }}
        onBrowseServices={() => {
          setCurrentPage("services");
          window.scrollTo(0, 0);
        }}
      />
    );
  } else if (currentPage === "application-payment") {
    const id = params.get("id") ?? "";
    pageContent = <ApplicationRegistrationPayment key={id} id={id}
      onBack={() => visitPage("customer-applications", { id })}
      onComplete={() => visitPage("customer-applications", { id, view: "completed" }, "", true)}
      onAddMoney={(applicationId, additional) => visitPage("wallet-add-money", { id: applicationId, additional })} />;
  } else if (currentPage === "wallet-add-money") {
    const id = params.get("id");
    const requestId = params.get("request");
    const purchase = params.get("purchase");
    const superstore = purchase === "wallet" || (typeof purchase === "string" && /^checkout(?:\?[A-Za-z0-9_%&=+-]+)?$/.test(purchase));
    const amount = Number(params.get("additional"));
    const nearestPaise = Math.round(amount);
    const additional = (id || superstore) && Math.abs(amount - nearestPaise) < 0.000001 &&
      nearestPaise > 0 && nearestPaise <= (superstore ? 1_000_000_000 : 10_000_000) ? nearestPaise : 0;
    pageContent = <AddMoney key={id + ":" + requestId + ":" + purchase + ":" + additional} applicationId={superstore ? null : id}
      additional={additional} requestId={requestId} superstore={superstore} returnToWallet={purchase === "wallet"}
      darkMode={darkMode} onResultScreen={setAddMoneyResultScreen}
      onBack={() => superstore ? visitPage("marketplace", {}, purchase === "wallet" ? "#wallet" : "#" + purchase)
        : id ? visitPage("application-payment", { id }) : visitPage("wallet")}
      onResume={(applicationId) => visitPage("application-payment", { id: applicationId })} />;
  } else if (["admin", "wallet-credit-admin", "application-status"].includes(currentPage)) {
    const initial = currentPage === "application-status" ? "applications" : currentPage === "wallet-credit-admin" ? "credits" : "dashboard";
    pageContent = customer.role === "ADMIN" ? <AdminCentre key={currentPage} initial={initial} onExit={() => visitPage("home")}
      onLogout={async () => {
        await fetch(API_BASE_URL + "/api/auth/logout", { method: "POST", credentials: "include" });
        setCustomer(null);
        visitPage("admin-login");
      }} /> : <main className="registration-screen"><h1>Administrator access required</h1>
        <button type="button" onClick={() => openLogin(PAGE_PATHS.admin, "admin")}>Admin sign in</button></main>;
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
  service={selectedService && { ...selectedService, publicDescription: serviceOverrides[selectedService.name?.toLowerCase()]?.description }}
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
  serviceOverrides={serviceOverrides}
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
    
  } else if (["merchant-plans", "merchant-register"].includes(currentPage)) {
    pageContent = (
      <Suspense fallback={<LoadingSkeleton />}>
        <Marketplace
          onBack={() => visitPage("home")}
        />
      </Suspense>
    );
  } else if (currentPage === "marketplace" || currentPage === "seller-dashboard") {
    pageContent = (
      <Suspense fallback={<LoadingSkeleton />}>
        <Marketplace
          key={customer?.id ?? "guest"}
          initialTab={currentPage === "seller-dashboard" ? "my-store" : "shop"}
          customer={customer}
          identity={identity}
          walletState={{ ...marketplaceWallet, loading: sessionLoading || marketplaceWallet.loading }}
          darkMode={darkMode}
          onThemeChange={setDarkMode}
          onOpenMerchantPlans={openMerchantPlans}
          onOpenWallet={() => { setCurrentPage("wallet"); window.scrollTo(0, 0); }}
          onAddMoney={(additional, purchase) => visitPage("wallet-add-money", { additional, purchase })}
          onOpenIndipayPage={handleBottomNavigation}
          onBack={() => { setCurrentPage("home"); window.scrollTo(0, 0); }}
          onLogin={(mode) => openLogin(activeUrl(), mode === "merchant" ? "merchant" : "customer")}
        />
      </Suspense>
    );
  } else if (currentPage === "home") {
  pageContent = (
    <Home
  serviceOverrides={serviceOverrides}
  onOpenMarketplace={() => handleBottomNavigation("marketplace")}
  onOpenAboutUs={handleOpenAboutUs}
  customer={customer}
  wallet={marketplaceWallet.wallet}
  identity={identity}
  onOpenMerchantPlans={openMerchantPlans}
  onOpenMyStore={openMyStore}
  onOpenWalletHistory={() => visitPage("wallet", { view: "statements" })}
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
      onSelectLegalService={handleOpenLegalDetails}
      onAddMoney={() => visitPage("wallet-add-money")}
      onOpenRewards={() => visitPage("rewards")}
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
    />
  );
  
}
else if (currentPage === "rewards") {
  pageContent = (
    <Rewards
      customer={customer}
      wallet={marketplaceWallet.wallet}
      onOpenMarketplaceWallet={() => openMarketplaceWallet("overview")}
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
      onAddMoney={() => visitPage("wallet-add-money")}
      identity={identity}
      onOpenMerchantPlans={openMerchantPlans}
      onOpenMyStore={openMyStore}
      wallet={marketplaceWallet.wallet}
      walletLoading={marketplaceWallet.loading}
      walletError={marketplaceWallet.error}
      creditRequests={marketplaceWallet.account?.creditRequests}
      view={["history", "statements"].includes(params.get("view")) ? params.get("view") : "overview"}
      onView={(view) => visitPage("wallet", view === "overview" ? {} : { view })}
      onOpenWalletHistory={() => visitPage("wallet", { view: "history" })}
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
    ["login", "admin-login", "register", "merchant-plans", "merchant-register", "seller-dashboard"].includes(currentPage);
  const hideAppChrome = isAuthPage || ["admin", "application-status", "wallet-credit-admin"].includes(currentPage) || (currentPage === "wallet-add-money" && addMoneyResultScreen);

return (
  <div
    className={`indipay-app-shell${darkMode ? " dark-mode" : ""}`}
    data-theme={darkMode ? "dark" : "light"}
    data-customer-ui={!["admin", "admin-login", "application-status", "wallet-credit-admin"].includes(currentPage) || undefined}
  >
    {pageContent}

  {!hideAppChrome && !["marketplace", "seller-dashboard"].includes(currentPage) && (
    <BottomNav
      activeTab={activeTab}
      onNavigate={handleBottomNavigation}
    />
  )}

   {!hideAppChrome && !["marketplace", "seller-dashboard"].includes(currentPage) && (
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
        onOpenWallet={() => {
  setCurrentPage("wallet");
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

    {!hideAppChrome && (
      <>
        {currentPage !== "home" &&
 currentPage !== "service-detail" &&
 currentPage !== "services" &&
 currentPage !== "times" && 
 currentPage !== "customer-applications" &&
 currentPage !== "business-development" &&
 currentPage !== "wallet" &&
 !["marketplace", "seller-dashboard"].includes(currentPage) &&
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

    
{!["marketplace", "seller-dashboard"].includes(currentPage) && <div className="indipay-support-float">
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
</div>}
   
      </>
    )}
    </div>
);
}

export default App;
