import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Wallet,
  ShieldCheck,
} from "lucide-react";

import AddMoneyPayment from "./AddMoneyPayment";
import API_BASE_URL from "../config/api";
import { formatPaise } from "../wallet/walletData";
import "./AddMoney.css";

const requestStatuses = { pending: "Pending Verification", approved: "Approved", rejected: "Rejected" };

export default function AddMoney({
  onBack,
  onResume,
  onResultScreen,
  darkMode,
  additional,
  applicationId,
  requestId,
  superstore,
  returnToWallet,
}) {
  const [amount, setAmount] = useState(() => {
    if (!additional) return "";
    const minimum = superstore ? Math.ceil(additional / 100) * 100 : additional;
    return (Math.min(10_000_000, Math.max(100, minimum)) / 100).toFixed(2);
  });
  const [accepted, setAccepted] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [wallet, setWallet] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [refreshCount, setRefreshCount] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API_BASE_URL}/api/customer-money`, { credentials: "include", signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Customer Money is temporarily unavailable.");
        const result = await response.json();
        return { balancePaise: result.wallet.balancePaise,
          credits: result.creditRequests.filter((entry) => !superstore || entry.purpose === "superstore"),
          paymentsAvailable: result.registrationDemoAvailable === true };
      })
      .then((result) => { if (!controller.signal.aborted) setWallet(result); })
      .catch((error) => { if (!controller.signal.aborted) setLoadError(error.message); });
    return () => controller.abort();
  }, [superstore, refreshCount]);

  const amountPaise = Math.round(Number(amount) * 100);
  const validAmount =
    /^\d{1,6}(\.\d{1,2})?$/.test(amount) &&
    amountPaise >= 100 && amountPaise <= 10_000_000 &&
    (!superstore || amountPaise % 100 === 0);

  function returnToAmount() {
    setShowPayment(false);
    window.scrollTo(0, 0);
  }

  if (showPayment) {
    return (
      <AddMoneyPayment
        amountPaise={amountPaise}
        applicationId={applicationId}
        superstore={superstore}
        darkMode={darkMode}
        onBack={returnToAmount}
        onComplete={onBack}
        onResultScreen={onResultScreen}
      />
    );
  }

  return (
    <div className={`ip-add-money ${darkMode ? "dark-mode" : ""}`}>
      <header className="ip-money-header">
        <button
          type="button"
          aria-label="Go back"
          onClick={onBack}
        >
          <ArrowLeft size={23} />
        </button>

        <h1>Add Money</h1>
      </header>

      <main className="ip-money-container">

        <div className="ip-money-amount-card">

          <div className="ip-money-wallet-icon">
            <Wallet size={32} />
          </div>

          <h2>Enter Amount</h2>

          <p>{wallet ? `Current Customer Money balance ${formatPaise(wallet.balancePaise)}` : "Add money to your Indipay wallet"}</p>
          {additional > 0 && <p>Additional amount required {formatPaise(additional)}. You can submit multiple requests if needed.</p>}

          <div className="ip-money-amount-input">
            <span>₹</span>

            <input
              type="text"
              inputMode="decimal"
              placeholder="0"
              value={amount}
              aria-label="Amount to add"
              maxLength={12}
              onChange={(event) => {
                const value = event.target.value;

                if (/^\d*(\.\d{0,2})?$/.test(value)) {
                  setAmount(value);
                }
              }}
            />
          </div>
          <p>{superstore ? "Enter a whole rupee amount from ₹1 to ₹1,00,000." : "Enter an amount from ₹1 to ₹1,00,000."}</p>

          <div className="ip-money-quick-amounts">
            {[100, 500, 1000, 2000].map((value) => (
              <button
                type="button"
                key={value}
                className={
                  Number(amount) === value ? "selected" : ""
                }
                onClick={() => setAmount(String(value))}
              >
                ₹{value.toLocaleString("en-IN")}
              </button>
            ))}
          </div>

        </div>

        <section className="ip-money-terms">

          <div className="ip-money-terms-heading">
            <ShieldCheck size={21} />
            <h3>Terms & Conditions</h3>
          </div>

          <ul>
            <li>
              Enter the correct amount before proceeding to payment.
            </li>

            <li>
              Wallet credits are subject to payment verification
              by the Indipay team.
            </li>

            <li>
              The amount is expected to be credited within
              24 hours, subject to successful verification.
            </li>

            <li>
              Keep your payment receipt and transaction reference
              until verification is completed.
            </li>
          </ul>

          <label className="ip-money-checkbox">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(event) =>
                setAccepted(event.target.checked)
              }
            />

            <span>
              I have read and agree to the Terms & Conditions.
            </span>
          </label>

        </section>

        <button
          type="button"
          className="ip-money-primary"
          disabled={!validAmount || !accepted || !wallet?.paymentsAvailable || Boolean(loadError)}
          onClick={() => {
            setShowPayment(true);
            window.scrollTo(0, 0);
          }}
        >
          {validAmount ? `Pay ${formatPaise(amountPaise)}` : "Pay Amount"}
          <ArrowRight size={20} />
        </button>

        <p className="ip-money-payment-status" role="status" aria-live="polite">
          {!wallet && !loadError
            ? "Checking wallet and payment availability…"
            : loadError
              ? "Customer Money could not be loaded. Retry to continue."
              : !validAmount
                ? "Enter an amount between ₹1 and ₹1,00,000."
                : !accepted
                  ? "Accept the Terms & Conditions to continue."
                  : !wallet.paymentsAvailable
                    ? "Demo payment requests are currently unavailable."
                    : "Ready to continue to payment."}
        </p>

        <section className="ip-money-terms ip-money-history" aria-labelledby="ip-money-history-heading">
          <h2 id="ip-money-history-heading">Wallet credit requests</h2>
          <button type="button" onClick={() => {
            setLoadError("");
            setRefreshCount((count) => count + 1);
          }}>Refresh request status</button>
          {wallet && !wallet.paymentsAvailable && <p role="status">Wallet payment requests are currently unavailable.</p>}
          {loadError && <p role="alert">{loadError}</p>}
          {!wallet && !loadError && <p role="status">Loading request history…</p>}
          {wallet?.credits.length === 0 && <p>No credit requests yet.</p>}
          {wallet?.credits.length > 0 && <ul>{wallet.credits.map((entry) =>
            <li key={entry.id} aria-current={entry.id === requestId ? "true" : undefined}>
              <strong>{requestStatuses[entry.status] ?? entry.status} · {formatPaise(entry.amountPaise)}</strong>
              <p>{entry.purpose === "superstore" ? "Super Store" : "Indipay"} · {entry.id} · {new Date(entry.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</p>
              {entry.remarks && <p>Review remarks: {entry.remarks}</p>}
              {entry.applicationId && <button type="button" onClick={() => onResume(entry.applicationId)}>Resume {entry.applicationId}</button>}
            </li>)}</ul>}
          {applicationId && <button type="button" onClick={() => onResume(applicationId)}>Resume application registration</button>}
          {superstore && !returnToWallet && <button type="button" onClick={onBack}>Resume Super Store checkout</button>}
        </section>

        <div className="ip-money-footer-note">
          <ShieldCheck size={16} />
          Indipay Money
        </div>

      </main>
    </div>
  );
}
