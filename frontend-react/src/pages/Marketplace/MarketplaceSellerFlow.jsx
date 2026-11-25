import { ArrowLeft } from "lucide-react";
import MarketplaceLogin from "./MarketplaceLogin";
import MarketplaceRegister from "./MarketplaceRegister";
import { getDirectory, registerStore, sampleAccounts, selectStore } from "./storeDirectory";
import "./SellerDashboard.css";

export default function MarketplaceSellerFlow({ page, navigate, customer }) {
  function login(value, remember) {
    const sample = Object.hasOwn(sampleAccounts, value) ? sampleAccounts[value] : null;
    const store = getDirectory().stores.find((item) => sample
      ? item.id === "sample-" + sample
      : item.id.startsWith("store-") && (item.email === value || item.mobile === value));
    if (!store || !value) throw new Error("Choose a sample account or enter the contact details of a store registered in this browser.");
    selectStore(store, customer, remember);
    navigate("marketplace");
  }
  return <main className="indipay-marketplace mp-seller-flow">
    <div className="mp-wrap">
      <button className="mp-seller-back" onClick={() => navigate("marketplace")}><ArrowLeft size={18} /> Back to Marketplace</button>
      {page === "seller-register"
        ? <MarketplaceRegister navigate={navigate} onRegister={(details, plan) => registerStore(customer, details, plan)} />
        : <MarketplaceLogin navigate={navigate} onLogin={login} />}
    </div>
  </main>;
}
