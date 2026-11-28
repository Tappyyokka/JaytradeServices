import { useEffect, useState } from "react";
import { serviceProcessingRequest } from "../wallet/serviceProcessing";
import "./ServiceProgress.css";

const labels = {
  pending: "Pending", in_progress: "In progress", completed: "Completed", on_hold: "On hold",
  rejected: "Rejected", awaiting_customer: "Awaiting customer", requested: "Requested",
  uploaded: "Uploaded", under_review: "Under review", verified: "Verified", resubmission_required: "Requires resubmission",
};
const timestamp = (value) => new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });

export default function ServiceProgress({ applicationId }) {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [uploading, setUploading] = useState(null);
  const [message, setMessage] = useState("");
  const path = "/" + encodeURIComponent(applicationId);

  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    serviceProcessingRequest(path, { signal: controller.signal }).then(setResult).catch((failure) => {
      if (!controller.signal.aborted) setError(failure.message);
    });
    return () => controller.abort();
  }, [open, attempt, path]);

  async function upload(event, documentId) {
    event.preventDefault();
    if (uploading) return;
    const form = event.currentTarget;
    const file = new FormData(form).get("document");
    if (!file?.size || file.size > 4 * 1024 * 1024 ||
        !["application/pdf", "image/png", "image/jpeg"].includes(file.type)) {
      setMessage("Choose a PDF, PNG or JPEG file up to 4 MB.");
      return;
    }
    setUploading(documentId);
    setMessage("");
    try {
      const progress = await serviceProcessingRequest(path + "/documents/" + encodeURIComponent(documentId), { file });
      setResult(progress);
      form.reset();
      setMessage("Document uploaded for review.");
    } catch (failure) {
      setMessage(failure.message);
    } finally { setUploading(null); }
  }

  const completed = result?.stages.filter((stage) => stage.status === "completed").length ?? 0;
  return <details className="registration-card service-progress" onToggle={(event) => {
    const next = event.currentTarget.open;
    if (next) { setError(""); setResult(null); }
    setOpen(next);
  }}>
    <summary>Track service and documents</summary>
    {!error && !result && <p role="status">Loading service progress…</p>}
    {error && <p role="alert">{error}</p>}
    {result && <>
      <h4>{result.service}</h4>
      <p>{result.applicationId} · {result.department ?? "Department pending"}</p>
      <p>Registered {timestamp(result.registeredAt)}</p>
      <p><strong>Current stage:</strong> {result.currentStage} · {labels[result.state]}</p>
      <p>{completed} of {result.stages.length} stages completed</p>
      <progress aria-label="Service stages completed" max={result.stages.length} value={completed} />
      <ol>{result.stages.map((stage, index) => <li key={index}>
        <strong>{stage.name}</strong> · {labels[stage.status]} {stage.finished && <time dateTime={stage.finished}>{timestamp(stage.finished)}</time>}
      </li>)}</ol>
      <p>Last updated {timestamp(result.updatedAt)}</p>
      <h4>Requested documents</h4>
      {!result.documents.length && <p>No documents have been requested.</p>}
      {result.documents.map((document) => <article key={document.id} className="service-progress-document">
        <strong>{document.label}</strong><p>{document.required ? "Required" : "Optional"} · {labels[document.status]}</p>
        {document.uploadedAt && <p>Uploaded {timestamp(document.uploadedAt)}</p>}
        {document.reason && <p>Review reason: {document.reason}</p>}
        {document.canUpload && <form onSubmit={(event) => upload(event, document.id)}>
          <label>Upload {document.label}<input type="file" accept="application/pdf,image/png,image/jpeg" name="document" required /></label>
          <button type="submit" disabled={Boolean(uploading)}>{uploading === document.id ? "Uploading…" : "Submit document"}</button>
        </form>}
      </article>)}
      {message && <p role="status">{message}</p>}
      {!!result.events.length && <><h4>Updates</h4><ul>{result.events.map((event) => <li key={event.id}>
        {event.message} <time dateTime={event.date}>{timestamp(event.date)}</time>
      </li>)}</ul></>}
    </>}
    {(error || result) && <button type="button" disabled={Boolean(uploading)} onClick={() => {
      setError(""); setAttempt((value) => value + 1);
    }}>Refresh progress</button>}
  </details>;
}
