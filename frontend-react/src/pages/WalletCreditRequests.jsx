import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { formatPaise } from "../wallet/walletData";
import { demoRegistrationBase, registrationRequest } from "../wallet/registrationDemo";
import "./ApplicationRegistration.css";

const statuses = { pending: "Pending Verification", approved: "Approved", rejected: "Rejected" };

function timestamp(value) {
  return new Date(value).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
}

function CreditReview({ row, onReviewed }) {
  const [image, setImage] = useState("");
  const [decision, setDecision] = useState("approved");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let source;
    const controller = new AbortController();
    fetch(demoRegistrationBase + "/admin/credits/" + encodeURIComponent(row.id) + "/evidence", { credentials: "include", signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Could not load the screenshot.");
        return response.blob();
      }).then((body) => {
        if (controller.signal.aborted) return;
        source = URL.createObjectURL(body);
        setImage(source);
      }).catch((failure) => { if (!controller.signal.aborted) setError(failure.message); });
    return () => { controller.abort(); if (source) URL.revokeObjectURL(source); };
  }, [row.id]);

  async function review(event) {
    event.preventDefault();
    if (busy) return;
    const fields = new FormData(event.currentTarget);
    setBusy(true);
    setError("");
    try {
      await registrationRequest("/admin/credits/" + encodeURIComponent(row.id) + "/review", {
        decision, remarks: fields.get("remarks"), reference: fields.get("reference"),
        verified: fields.has("verified"), confirmed: fields.has("confirmed"),
      });
      onReviewed();
    } catch (failure) { setError(failure.message); }
    finally { setBusy(false); }
  }

  return <div>
    {image && <img className="registration-evidence" src={image} alt="Submitted demo evidence" />}
    {error && <p role="alert">{error}</p>}
    {row.status === "pending" && <form onSubmit={review}>
      <label className="registration-field">Decision<select value={decision} onChange={(event) => setDecision(event.target.value)}>
        <option value="approved">Approve demo credit</option><option value="rejected">Reject request</option>
      </select></label>
      {decision === "approved" && <>
        <label className="registration-field">Reference from simulated payment record<input name="reference" required maxLength={26} /></label>
        <label className="registration-check"><input type="checkbox" name="verified" required /> I independently matched the amount and reference against the simulated payment record.</label>
      </>}
      <label className="registration-field">Administrator remarks<textarea name="remarks" required maxLength={1000} /></label>
      <label className="registration-check"><input type="checkbox" name="confirmed" required /> I confirm this demo decision.</label>
      <button type="submit" disabled={busy}>{busy ? "Saving…" : "Save demo decision"}</button>
    </form>}
  </div>;
}

export function CreditRequestsAdmin({ onBack, embedded = false }) {
  const [status, setStatus] = useState("pending");
  const [data, setData] = useState(null);
  const [revision, setRevision] = useState(0);
  const [selected, setSelected] = useState(null);
  useEffect(() => {
    const controller = new AbortController();
    registrationRequest("/admin/credits?status=" + status, undefined, controller.signal)
      .then(({ credits }) => setData({ status, credits }))
      .catch((failure) => { if (!controller.signal.aborted) setData({ status, error: failure.message }); });
    return () => controller.abort();
  }, [status, revision]);

  const active = data?.status === status ? data : null;
  const Container = embedded ? "section" : "main";
  return <Container className={embedded ? "registration-screen admin-credit-requests" : "registration-screen"}>
    {!embedded && <>
      <button type="button" onClick={onBack}><ArrowLeft size={16} /> Admin Control Centre</button>
      <h1>Wallet Credit Requests</h1>
    </>}
    <p className="registration-eyebrow">Indipay Money · Demo</p>
    <p>Approve only after independently matching a simulated payment record. A screenshot alone is insufficient.</p>
    <label className="registration-field">Verification status<select value={status} onChange={(event) => {
      setStatus(event.target.value); setSelected(null);
    }}>
      {Object.entries(statuses).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
    </select></label>
    {!active && <p role="status">Loading requests…</p>}
    {active?.error && <p role="alert">{active.error}</p>}
    {active?.credits?.length === 0 && <p>No requests with this status.</p>}
    {active?.credits?.map((row) => <article className="registration-card" key={row.id}>
      <h2>{row.customer?.name ?? "Customer"} · {formatPaise(row.amountPaise)}</h2>
      <p>Account {row.customer?.accountId ?? "—"} · {statuses[row.status]}</p>
      {row.purpose === "superstore" && <p>Super Store Customer Money · Demo</p>}
      <p>Reference {row.utr} · {timestamp(row.createdAt)}</p>
      {row.applicationId && <p>Application {row.applicationId}</p>}
      {row.reviewedAt && <p>Reviewed {timestamp(row.reviewedAt)}{row.reviewer ? " by " + row.reviewer : ""}</p>}
      {row.remarks && <p>Review remarks: {row.remarks}</p>}
      <button type="button" aria-expanded={selected === row.id} onClick={() => setSelected(selected === row.id ? null : row.id)}>Review evidence</button>
      {selected === row.id && <CreditReview key={row.id} row={row} onReviewed={() => { setSelected(null); setRevision((value) => value + 1); }} />}
    </article>)}
  </Container>;
}
