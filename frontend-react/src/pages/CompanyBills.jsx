import { useEffect, useRef, useState } from "react";
import API_BASE_URL from "../config/api";
import { formatPaise } from "../wallet/walletData";
import { serviceProcessingRequest } from "../wallet/serviceProcessing";
import "./CompanyBills.css";

function fileUrl(path, id) {
  return API_BASE_URL + "/api/service-processing" + path + "/" + encodeURIComponent(id) + "/file";
}

function BillPreview({ bill, url, onClose }) {
  const dialog = useRef(null);
  const [image, setImage] = useState(null);
  const [error, setError] = useState("");
  const isImage = ["image/png", "image/jpeg"].includes(bill.mime);

  useEffect(() => {
    const element = dialog.current;
    element.showModal();
    return () => element.close();
  }, []);

  useEffect(() => {
    if (!isImage) return;
    const controller = new AbortController();
    let temporaryUrl;
    fetch(url, { credentials: "include", signal: controller.signal }).then(async (response) => {
      if (!response.ok) throw new Error("This bill is currently unavailable.");
      const document = await response.blob();
      if (document.type !== bill.mime) throw new Error("The preview could not be loaded.");
      if (controller.signal.aborted) return;
      temporaryUrl = URL.createObjectURL(document);
      setImage(temporaryUrl);
    }).catch((failure) => { if (!controller.signal.aborted) setError(failure.message); });
    return () => {
      controller.abort();
      if (temporaryUrl) URL.revokeObjectURL(temporaryUrl);
    };
  }, [url, isImage, bill.mime]);

  return <dialog ref={dialog} className="company-bill-preview" aria-labelledby="bill-preview-title" onCancel={(event) => {
    event.preventDefault(); onClose();
  }}>
    <div className="company-bill-actions">
      <h3 id="bill-preview-title">{bill.type} {bill.number}</h3>
      <button type="button" onClick={onClose}>Close preview</button>
    </div>
    {error && <p role="alert">{error}</p>}
    {isImage && !error && !image && <p role="status">Loading bill preview…</p>}
    {image && !error && <img src={image} alt={`Preview of ${bill.type.toLowerCase()} ${bill.number}`}
      onError={() => setError("The image preview could not be displayed.")} />}
    {!isImage && <p>{bill.filename}. Download this PDF to view it in your PDF reader.</p>}
    <a className="company-bill-download" href={url}>Download Bill</a>
  </dialog>;
}

export default function CompanyBills({ applicationId, targetBillId }) {
  const [open, setOpen] = useState(Boolean(targetBillId));
  const [bills, setBills] = useState(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [preview, setPreview] = useState(null);
  const target = useRef(null);
  const previewTrigger = useRef(null);
  const path = "/" + encodeURIComponent(applicationId) + "/bills";

  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    serviceProcessingRequest(path, { signal: controller.signal }).then((result) => {
      if (!controller.signal.aborted) setBills(result.bills);
    }).catch((failure) => { if (!controller.signal.aborted) setError(failure.message); });
    return () => controller.abort();
  }, [open, attempt, path]);

  useEffect(() => {
    if (targetBillId && bills) target.current?.scrollIntoView({ block: "nearest" });
  }, [targetBillId, bills]);

  return <details className="registration-card company-bills" open={open} onToggle={(event) => {
    const next = event.currentTarget.open;
    if (next !== open) {
      if (next) { setBills(null); setError(""); }
      setOpen(next);
    }
  }}>
    <summary>Bills &amp; Invoices</summary>
    {!bills && !error && <p role="status">Loading bills…</p>}
    {error && <div>
      <p role="alert">{error}</p>
      <button type="button" onClick={() => { setError(""); setAttempt((count) => count + 1); }}>Retry</button>
    </div>}
    {bills?.length === 0 && <p>No bills have been issued for this application yet.</p>}
    {bills?.map((bill) => <article className="company-bill" key={bill.id}
      aria-current={bill.id === targetBillId ? "true" : undefined} ref={bill.id === targetBillId ? target : null}>
      <h4>{bill.type} {bill.number}{bill.version > 1 && ` · Version ${bill.version}`}</h4>
      <p><time dateTime={bill.date}>{bill.date}</time> · {formatPaise(bill.amountPaise)}</p>
      <p>Published <time dateTime={bill.publishedAt}>{new Date(bill.publishedAt).toLocaleDateString("en-IN")}</time></p>
      {bill.description && <p>{bill.description}</p>}
      <div className="company-bill-actions">
        <button type="button" onClick={(event) => { previewTrigger.current = event.currentTarget; setPreview(bill); }}>View Bill</button>
        <a className="company-bill-download" href={fileUrl(path, bill.id)}>Download Bill</a>
      </div>
    </article>)}
    {preview && <BillPreview bill={preview} url={fileUrl(path, preview.id)} onClose={() => {
      setPreview(null);
      requestAnimationFrame(() => previewTrigger.current?.focus());
    }} />}
  </details>;
}
