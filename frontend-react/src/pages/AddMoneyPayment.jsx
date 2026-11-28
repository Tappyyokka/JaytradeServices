import { useState, useEffect, useEffectEvent, useRef } from "react";

import {
  ArrowLeft,
  QrCode,
  UploadCloud,
  ShieldCheck,
  Clock3,
  LoaderCircle,
  Info,
  Smartphone,
} from "lucide-react";

import { SiGooglepay, SiPaytm, SiPhonepe } from "react-icons/si";
import { registrationRequest } from "../wallet/registrationDemo";
import { formatPaise } from "../wallet/walletData";
import "./AddMoney.css";

const upiApps = [
  { name: "Google Pay", id: "gpay", Icon: SiGooglepay },
  { name: "PhonePe", id: "phonepe", Icon: SiPhonepe },
  { name: "Paytm", id: "paytm", Icon: SiPaytm },
  { name: "BHIM", id: "bhim", Icon: Smartphone },
];

const validReference = (value) => /^[a-zA-Z0-9]{8,26}$/.test(value.trim());

export default function AddMoneyPayment({
  amountPaise,
  applicationId,
  superstore,
  darkMode,
  onBack,
  onComplete,
  onResultScreen,
}) {
  const [accepted, setAccepted] = useState(false);
  const [reference, setReference] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [screenshot, setScreenshot] = useState(null);

  const fileInputRef = useRef(null);
  const fileReader = useRef(null);
  const submission = useRef(null);
  const resultHeading = useRef(null);
  const complete = useEffectEvent(() => onComplete());
  const formattedAmount = formatPaise(amountPaise);
  const showingResult = status !== "idle";

  useEffect(() => {
    onResultScreen(showingResult);
    if (showingResult) resultHeading.current?.focus();
    return () => onResultScreen(false);
  }, [showingResult, onResultScreen]);

  useEffect(() => () => {
    submission.current?.abort();
    if (fileReader.current?.readyState === FileReader.LOADING) fileReader.current.abort();
  }, []);

  useEffect(() => {
    if (status !== "success") return;
    resultHeading.current?.focus();
    const timer = setTimeout(() => complete(), 3500);
    return () => clearTimeout(timer);
  }, [status]);

  function handleScreenshotUpload(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || submission.current) return;

    if (!accepted || !validReference(reference)) {
      setError("Accept the terms and enter a transaction reference with 8 to 26 characters.");
      return;
    }
    if (fileReader.current?.readyState === FileReader.LOADING) fileReader.current.abort();
    setScreenshot(null);
    if (!["image/jpeg", "image/png"].includes(file.type) || file.size > 819200 || file.size < 32) {
      setError("Choose a valid PNG or JPEG screenshot up to 800 KB.");
      return;
    }

    setError("");
    const reader = new FileReader();
    fileReader.current = reader;
    reader.onload = () => setScreenshot({ mime: file.type, dataUrl: reader.result });
    reader.onerror = () => setError("Could not read the screenshot.");
    reader.readAsDataURL(file);
  }

  async function submitEvidence() {
    if (!screenshot || !accepted || !validReference(reference) || submission.current) return;
    const controller = new AbortController();
    submission.current = controller;
    setError("");
    setStatus("loading");

    try {
      const result = await registrationRequest("/credits", {
        amountPaise, applicationId, utr: reference.trim(), mime: screenshot.mime,
        data: screenshot.dataUrl.split(",")[1], ...(superstore && { purpose: "superstore" }),
      }, controller.signal);
      if (controller.signal.aborted) return;
      if (!result.credit?.id || result.credit.status !== "pending") {
        throw new Error("The server did not confirm receipt of the request.");
      }
      setStatus("success");
    } catch (failure) {
      if (!controller.signal.aborted) {
        setError(failure.message || "Could not submit your payment screenshot.");
        setStatus("idle");
      }
    } finally {
      submission.current = null;
    }
  }

  const themeClass = `ip-add-money ${
    darkMode ? "dark-mode" : ""
  }`;

  /* Loading screen */

  if (status === "loading") {
    return (
      <div className={`${themeClass} ip-money-result-screen`}>
        <LoaderCircle
          size={64}
          className="ip-money-spinner"
        />

        <h2 ref={resultHeading} tabIndex={-1}>Submitting Payment…</h2>

        <p>Please do not close this page.</p>
      </div>
    );
  }

  /* Success screen */

  if (status === "success") {
    return (
      <div className={`${themeClass} ip-money-result-screen`}>

        <div className="ip-money-success-circle">
          <Clock3 size={42} strokeWidth={2} aria-hidden="true" />
        </div>

        <h2 ref={resultHeading} tabIndex={-1}>Pending verification</h2>

        <strong className="ip-money-success-amount">
          {formattedAmount}
        </strong>

        <div className="ip-money-credit-message">
          Your payment screenshot has been submitted successfully. Your payment will be reviewed by our team. Once verified, the amount is expected to be credited to your Indipay wallet within 24 hours.
        </div>

        <small>Returning to the previous screen…</small>

      </div>
    );
  }

  /* Main payment screen */

  return (
    <div className={themeClass}>

      <header className="ip-money-header">
        <button
          type="button"
          onClick={onBack}
          aria-label="Go back"
        >
          <ArrowLeft size={23} />
        </button>

        <h1>Payment</h1>
      </header>

      <main className="ip-money-container">

        <div className="ip-money-demo-notice">
          <Info size={18} />
          Demo payment flow. Use sample transaction details and screenshots.
        </div>

        <section className="ip-money-payment-amount">
          <span>Amount Payable</span>
          <h2>{formattedAmount}</h2>
        </section>

        <section className="ip-money-qr-section">

          <h3>Demo UPI details</h3>

          <p>Use synthetic evidence and a sample reference. Do not transfer money.</p>

          <div className="ip-money-qr">

              <div className="ip-money-qr-placeholder">
                <QrCode size={100} />

                <span>Payment QR placeholder</span>

                <small>Not available for real payments</small>
              </div>

          </div>

          <div className="ip-money-upi-label">
            Supported UPI apps
          </div>

          <div className="ip-money-upi-apps">

            {upiApps.map(({ id, name, Icon }) => (
              <div
                className="ip-money-upi-app"
                key={id}
              >

                <div className={`ip-money-upi-icon ${id}`}>

                  <Icon size={24} aria-hidden="true" />

                </div>

                <span>{name}</span>

              </div>
            ))}

          </div>

        </section>

        <section className="ip-money-terms">

          <div className="ip-money-terms-heading">
            <ShieldCheck size={21} />
            <h3>Terms & Conditions</h3>
          </div>

          <ul>
            <li>
              Use the amount displayed on this page in your sample payment.
            </li>

            <li>
              Use test evidence for this submission.
            </li>

            <li>
              Enter the sample UPI reference and upload its screenshot.
            </li>

            <li>
              Your wallet will be credited only after the
              payment is verified by Indipay.
            </li>

            <li>
              Verification is expected to be completed
              within 24 hours.
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

        <div className="ip-money-reference">
          <label htmlFor="payment-reference">
            UPI Transaction Reference / UTR
          </label>

          <input
            id="payment-reference"
            type="text"
            placeholder="Enter transaction reference"
            value={reference}
            maxLength={26}
            autoComplete="off"
            onChange={(event) =>
              setReference(event.target.value)
            }
          />
        </div>

        {error && (
          <p className="ip-money-error" role="alert">
            {error}
          </p>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg"
          hidden
          onChange={handleScreenshotUpload}
        />

        <button
          type="button"
          className="ip-money-primary"
          disabled={!accepted || !validReference(reference)}
            data-action="upload"
            onClick={() => fileInputRef.current?.click()}
        >
          <UploadCloud size={21} />
          {screenshot ? "Replace Payment Screenshot" : "Choose Payment Screenshot"}
        </button>

        {screenshot && <>
          <img className="ip-money-evidence-preview" src={screenshot.dataUrl} alt="Selected demo screenshot preview" />
          <button type="button" className="ip-money-primary" disabled={!accepted || !validReference(reference)}
            onClick={submitEvidence}>Submit payment evidence</button>
        </>}

        <div className="ip-money-footer-note">
          PNG or JPEG · Maximum 800 KB
        </div>

      </main>
    </div>
  );
}
