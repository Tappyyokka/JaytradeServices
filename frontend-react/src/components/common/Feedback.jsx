import "./Feedback.css";

export function Toast({ message, tone = "success", onDismiss }) {
  if (!message) return null;

  return (
    <div className={`indipay-toast indipay-toast-${tone}`} role="status" aria-live="polite">
      <span>{message}</span>
      <button type="button" onClick={onDismiss} aria-label="Dismiss notification">
        ×
      </button>
    </div>
  );
}

export function LoadingSkeleton({ className = "", lines = 3 }) {
  return (
    <div className={`indipay-skeleton ${className}`} aria-label="Loading" role="status">
      {Array.from({ length: lines }, (_, index) => (
        <span key={index} className="indipay-skeleton-line" />
      ))}
      <span className="sr-only">Loading…</span>
    </div>
  );
}

export function EmptyState({ icon, title, description, actionLabel, onAction }) {
  return (
    <div className="indipay-empty-state">
      {icon && <div className="indipay-empty-state-icon">{icon}</div>}
      <h3>{title}</h3>
      <p>{description}</p>
      {actionLabel && onAction && (
        <button type="button" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
