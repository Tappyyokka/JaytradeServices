import { useEffect, useRef, useState } from "react";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import SlideToPay from "../components/common/SlideToPay";
import { formatPaise } from "../wallet/walletData";
import { applicationRegistrationPath, registrationRequest } from "../wallet/registrationDemo";
import "./ApplicationRegistration.css";

export function RegistrationDetails({ id, offer }) {
  return <dl className="registration-details">{[
    ["Application ID", id],
    ["Service", offer.service],
    ["Assigned department", offer.department],
    ["Assigned staff", offer.staff],
    ["Registration charge", formatPaise(offer.amountPaise ?? offer.amount_paise)],
  ].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>;
}

export function RegistrationReceipt({ record }) {
  function download() {
    const contents = [
      "INDIPAY APPLICATION REGISTRATION — DEMONSTRATION RECEIPT",
      "Application: " + record.applicationId,
      "Service: " + record.service,
      "Amount paid (demo): " + formatPaise(record.amountPaise),
      "Transaction: " + record.reference,
      "Terms: " + record.termsVersion,
      "Registration timestamp: " + new Date(record.acceptedAt).toLocaleString("en-IN"),
    ].join("\n");
    const url = URL.createObjectURL(new Blob([contents], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = record.reference + ".txt";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return <details>
    <summary>View registration receipt</summary>
    <RegistrationDetails id={record.applicationId} offer={record} />
    <p>Payment reference {record.reference}</p>
    <p>{new Date(record.acceptedAt).toLocaleString("en-IN")}</p>
    <button type="button" onClick={download}>Download demo receipt</button>
  </details>;
}

export function RegisterApplication({ id, offer, onPay, onAddMoney }) {
  const [quote, setQuote] = useState(null);
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const path = applicationRegistrationPath(id);

  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    registrationRequest(path, undefined, controller.signal).then(setQuote).catch((failure) => {
      if (!controller.signal.aborted) setError(failure.message);
    });
    return () => controller.abort();
  }, [open, attempt, path]);

  const shortfall = quote?.offer ? Math.max(0, quote.offer.amountPaise - quote.balancePaise) : 0;
  return <details className="registration-card" onToggle={(event) => {
    const opened = event.currentTarget.open;
    if (opened) { setQuote(null); setAccepted(false); setError(""); }
    setOpen(opened);
  }}>
    <summary>Register My Application</summary>
    <p className="registration-eyebrow">Demo registration</p>
    <RegistrationDetails id={id} offer={quote?.offer ?? offer} />
    {!quote && !error && <p role="status">Checking your registration and wallet balance…</p>}
    {error && <div><p role="alert">{error}</p><button type="button" onClick={() => {
      setError(""); setQuote(null); setAccepted(false); setAttempt((count) => count + 1);
    }}>Retry</button></div>}
    {quote?.registration && <div><p>Registration already completed.</p><RegistrationReceipt record={quote.registration} /></div>}
    {quote?.offer && !error && <>
      <h3>Registration terms</h3><p>{quote.terms.conditions}</p>
      <h3>Cancellation and refunds</h3><p>{quote.terms.cancellation}</p>
      <label className="registration-check"><input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} /> I accept the registration terms and cancellation conditions</label>
      <button type="button" disabled={!accepted || shortfall > 0} onClick={() => onPay(id)}>Pay Amount from Wallet</button>
      {shortfall > 0 && <div role="status">
        <strong>Insufficient demo wallet balance</strong>
        <p>Available Customer Money {formatPaise(quote.balancePaise)} · Additional amount required {formatPaise(shortfall)}</p>
        <button type="button" onClick={() => onAddMoney(id, shortfall)}>Add Money</button>
      </div>}
    </>}
  </details>;
}


export default function ApplicationRegistrationPayment({ id, onBack, onComplete, onAddMoney }) {
  const [quote, setQuote] = useState(null);
  const [paid, setPaid] = useState(null);
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  const path = applicationRegistrationPath(id);
  useEffect(() => {
    const controller = new AbortController();
    registrationRequest(path, undefined, controller.signal).then(setQuote).catch((failure) => {
      if (!controller.signal.aborted) setError(failure.message);
    });
    return () => controller.abort();
  }, [path]);

  useEffect(() => {
    if (!paid) return;
    const timer = setTimeout(onComplete, 2000);
    return () => clearTimeout(timer);
  }, [paid, onComplete]);

  async function pay() {
    if (!accepted || !quote?.offer || pending.current) return;
    pending.current = true;
    setBusy(true);
    setError("");
    try {
      const result = await registrationRequest(path + "/pay", {
        accepted, termsVersion: quote.terms.version, amountPaise: quote.offer.amountPaise,
      });
      if (!result.registration?.reference) throw new Error("Payment confirmation is unavailable.");
      setPaid(result.registration);
    } catch (failure) {
      setError(failure.message);
      try {
        const latest = await registrationRequest(path);
        setQuote(latest);
      } catch { /* Preserve the payment error. */ }
    } finally { pending.current = false; setBusy(false); }
  }

  if (paid) return <main className="registration-success" role="status">
    <CheckCircle2 size={65} aria-hidden="true" /><h1>Application Registered</h1>
    <p>Application {paid.applicationId}</p><p>Payment reference {paid.reference}</p>
    <p>{paid.syncedAt ? "Demo payment confirmed" : "Payment confirmed. Jaytrade synchronization is pending."}</p>
  </main>;

  const shortfall = quote?.offer ? Math.max(0, quote.offer.amountPaise - quote.balancePaise) : 0;
  return <main className="registration-screen">
    <button type="button" onClick={onBack} disabled={busy}><ArrowLeft size={16} /> My Applications</button>
    <h1>Application Payment</h1>
    <p className="registration-eyebrow">Demo wallet · No real charges</p>
    {error && <p role="alert">{error}</p>}
    {!quote && !error && <p role="status">Checking approved registration details…</p>}
    {quote?.registration && <section className="registration-card"><h2>Registration already complete</h2>
      <RegistrationReceipt record={quote.registration} /> <button type="button" onClick={onComplete}>Completed Applications</button></section>}
    {quote?.offer && <section className="registration-card">
      <RegistrationDetails id={id} offer={quote.offer} />
      <dl className="registration-details">
        <div><dt>Available Customer Money</dt><dd>{formatPaise(quote.balancePaise)}</dd></div>
        <div><dt>Total payable</dt><dd>{formatPaise(quote.offer.amountPaise)}</dd></div>
        <div><dt>Estimated remaining balance</dt><dd>{shortfall ? "—" : formatPaise(quote.balancePaise - quote.offer.amountPaise)}</dd></div>
      </dl>
      <details><summary>Terms and cancellation policy</summary><p>{quote.terms.conditions}</p><p>{quote.terms.cancellation}</p></details>
      {shortfall > 0 ? <>
        <p role="status">Additional amount required {formatPaise(shortfall)}</p>
        <button type="button" onClick={() => onAddMoney(id, shortfall)}>Add Money</button>
      </> : <>
        <label className="registration-check"><input type="checkbox" checked={accepted} disabled={busy}
          onChange={(event) => setAccepted(event.target.checked)} /> I accept the registration terms and cancellation policy</label>
        {accepted && <SlideToPay disabled={busy} onPay={pay} />}
        {busy && <p role="status">Processing demo wallet payment…</p>}
      </>}
    </section>}
  </main>;
}
