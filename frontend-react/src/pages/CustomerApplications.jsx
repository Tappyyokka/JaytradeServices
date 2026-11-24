
import { useEffect, useCallback, useState } from "react";
import {
  ArrowLeft,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  UserRound,
  Phone,
  Building2,
  BriefcaseBusiness,
  ChevronDown,
  ChevronUp,
  Search,
} from "lucide-react";

import "./CustomerApplications.css";
import API_BASE_URL from "../config/api";
import { EmptyState, LoadingSkeleton } from "../components/common/Feedback";

const API_URL = `${API_BASE_URL}/api/my-applications`;
const STATUS_API_URL = `${API_BASE_URL}/api/applications`;

const APPLICATION_STEPS = [
  "Submitted",
  "Transferred",
  "In Review",
  "Decision",
  "Completed",
];

function getResolvedStatus(application, jaytradeData) {
  return jaytradeData?.status || application.status || "Pending";
}

function getApplicationProgress(application, jaytradeData) {
  if (application.leadSyncStatus !== "SYNCED") {
    return { currentStep: 0, rejected: false };
  }

  const status = getResolvedStatus(application, jaytradeData).toLowerCase();

  if (status.includes("reject")) {
    return { currentStep: 3, rejected: true };
  }

  if (status.includes("complete")) {
    return { currentStep: 4, rejected: false };
  }

  if (status.includes("approv")) {
    return { currentStep: 3, rejected: false };
  }

  if (
    status.includes("review") ||
    status.includes("process") ||
    status.includes("assign")
  ) {
    return { currentStep: 2, rejected: false };
  }

  // Synced to Jaytrade, but no later status is available yet.
  return { currentStep: 1, rejected: false };
}

function CustomerApplications({ onBack, onBrowseServices }) {
  const [applications, setApplications] = useState([]);
  const [jaytradeStatuses, setJaytradeStatuses] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshingStatuses, setRefreshingStatuses] = useState(false);
  const [expandedTrackingIds, setExpandedTrackingIds] = useState(() => new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchJaytradeStatuses = useCallback(async (applicationList) => {
  setRefreshingStatuses(true);

  try {
    const syncedApplications = applicationList.filter(
      (application) => application.leadSyncStatus === "SYNCED"
    );

    const statusResults = await Promise.all(
      syncedApplications.map(async (application) => {
        try {
          const response = await fetch(
            `${STATUS_API_URL}/${encodeURIComponent(
              application.applicationId
            )}/jaytrade-status`,
            {
              credentials: "include",
            }
          );

          const result = await response.json();

          if (!response.ok || !result.success) {
            throw new Error(
              result.message || "Unable to retrieve Jaytrade status."
            );
          }

          return {
            applicationId: application.applicationId,
            data: result,
          };
        } catch (err) {
          console.error(
            `Jaytrade status error for ${application.applicationId}:`,
            err
          );

          return {
            applicationId: application.applicationId,
            data: {
              success: false,
              message: "Could not retrieve the latest status.",
            },
          };
        }
      })
    );

    const updatedStatuses = {};

    statusResults.forEach(({ applicationId, data }) => {
      updatedStatuses[applicationId] = data;
    });

    setJaytradeStatuses(updatedStatuses);
  } finally {
    setRefreshingStatuses(false);
  }
}, []);

const fetchApplications = useCallback(async () => {
  try {
    const response = await fetch(API_URL, {
      credentials: "include",
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Unable to load applications.");
    }

    const applicationList = result.applications || [];

    setApplications(applicationList);
    setError("");

    await fetchJaytradeStatuses(applicationList);
    setLastUpdated(new Date());
  } catch (err) {
    setError(err.message || "Could not load your applications.");
  } finally {
    setLoading(false);
  }
}, [fetchJaytradeStatuses]);

useEffect(() => {
  const timeoutId = window.setTimeout(() => {
    fetchApplications();
  }, 0);

  return () => window.clearTimeout(timeoutId);
}, [fetchApplications]);

const handleRefresh = () => {
  setLoading(true);
  setError("");
  fetchApplications();
};

  const toggleTrackingDetails = (applicationId) => {
    setExpandedTrackingIds((current) => {
      const next = new Set(current);

      if (next.has(applicationId)) {
        next.delete(applicationId);
      } else {
        next.add(applicationId);
      }

      return next;
    });
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusIcon = (status) => {
    const normalizedStatus = String(status || "").toLowerCase();

    if (normalizedStatus.includes("approv") || normalizedStatus.includes("complete")) {
      return <CheckCircle2 size={19} />;
    }

    if (normalizedStatus.includes("reject")) {
      return <XCircle size={19} />;
    }

    return <Clock size={19} />;
  };

  const getJaytradeStatus = (application) => {
    if (application.leadSyncStatus !== "SYNCED") {
      return null;
    }

    return jaytradeStatuses[application.applicationId];
  };

  const getStatusCategory = (status) => {
    const normalizedStatus = String(status || "").toLowerCase();

    if (normalizedStatus.includes("reject")) return "rejected";
    if (normalizedStatus.includes("approv") || normalizedStatus.includes("complete")) {
      return "completed";
    }

    return "in-progress";
  };

  const filteredApplications = [...applications]
    .filter((application) => {
      const jaytradeData = getJaytradeStatus(application)?.jaytrade;
      const resolvedStatus = getResolvedStatus(application, jaytradeData);
      const searchText = [
        application.service,
        application.applicationId,
        application.fullName,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = searchText.includes(searchQuery.trim().toLowerCase());
      const matchesStatus =
        statusFilter === "all" ||
        getStatusCategory(resolvedStatus) === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((first, second) => {
      const firstDate = new Date(first.submittedAt || 0).getTime();
      const secondDate = new Date(second.submittedAt || 0).getTime();

      return sortOrder === "oldest" ? firstDate - secondDate : secondDate - firstDate;
    });

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setSortOrder("newest");
  };

  const getLastUpdatedText = () => {
    if (!lastUpdated) return "";

    return `Updated at ${lastUpdated.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
    })}`;
  };

  return (
    <main className="customer-applications-page">
      <div className="customer-applications-container">

        <button
          className="customer-applications-back"
          onClick={onBack}
        >
          <ArrowLeft size={18} />
          Back to Home
        </button>

        <section className="customer-applications-list">

          <div className="customer-applications-toolbar">
            <div>
              <h2>Your Submitted Applications</h2>
              {!loading && !error && (
                <p className="customer-applications-count">
                  Showing {filteredApplications.length} of {applications.length}
                </p>
              )}
            </div>

            <button
              onClick={handleRefresh}
              disabled={loading}
              aria-label={loading ? "Refreshing applications" : "Refresh applications"}
            >
              <RefreshCw size={16} className={loading ? "is-refreshing" : ""} />
              {loading ? "Refreshing…" : "Refresh"}
            </button>
          </div>

          <p className="customer-applications-updated" aria-live="polite">
            {loading ? "Refreshing applications and tracking updates…" : getLastUpdatedText()}
          </p>

          {!loading && !error && applications.length > 0 && (
            <div className="customer-applications-controls">
              <label className="customer-applications-search">
                <Search size={17} />
                <span className="sr-only">Search applications</span>
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search service or application ID"
                />
              </label>

              <div className="customer-applications-filter-chips" aria-label="Filter applications by status">
                {[
                  ["all", "All"],
                  ["in-progress", "In progress"],
                  ["completed", "Completed"],
                  ["rejected", "Rejected"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    className={statusFilter === value ? "is-active" : ""}
                    onClick={() => setStatusFilter(value)}
                    aria-pressed={statusFilter === value}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <label className="customer-applications-sort">
                Sort by
                <select value={sortOrder} onChange={(event) => setSortOrder(event.target.value)}>
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                </select>
              </label>
            </div>
          )}

          {loading ? (
            <div className="customer-applications-loading" aria-busy="true">
              <LoadingSkeleton lines={4} />
            </div>
          ) : error ? (
            <div className="customer-applications-empty">
              <p>{error}</p>
              <button onClick={handleRefresh}>Try Again</button>
            </div>
          ) : applications.length === 0 ? (
            <EmptyState
              icon={<FileText size={29} />}
              title="No applications yet"
              description="Start with a service and your submitted applications will appear here."
              actionLabel="Explore services"
              onAction={onBrowseServices}
            />
          ) : filteredApplications.length === 0 ? (
            <EmptyState
              icon={<Search size={29} />}
              title="No matching applications"
              description="Try a different search term or clear the active filters."
              actionLabel="Clear filters"
              onAction={clearFilters}
            />
          ) : (
            <div className="customer-applications-cards">

              {filteredApplications.map((application) => {
                const jaytrade = getJaytradeStatus(application);
const jaytradeData = jaytrade?.jaytrade;
const employee = jaytradeData?.assigned_employee;
const progress = getApplicationProgress(application, jaytradeData);
const customerStatus = jaytradeData?.customer_status;
const resolvedStatus = getResolvedStatus(application, jaytradeData);
const isTrackingExpanded = expandedTrackingIds.has(application.applicationId);
const trackingDetailsId = `tracking-${application.applicationId}`;

                return (
                  <article
                    className="customer-application-card"
                    key={application.applicationId}
                  >
                    <div className="customer-application-card-top">
                      <div className="customer-application-icon">
                        <FileText size={22} />
                      </div>

                      <span
                        className={`customer-application-status status-${resolvedStatus.toLowerCase().replaceAll(" ", "-")}`}
                      >
                        {getStatusIcon(resolvedStatus)}
                        {resolvedStatus}
                      </span>
                    </div>

                    <h3>{application.service}</h3>

                    <p className="customer-application-id">
                      {application.applicationId}
                    </p>

                    <div className="customer-application-meta">
                      <span>Submitted</span>
                      <strong>{formatDate(application.submittedAt)}</strong>
                    </div>

                    <div
  className={`application-progress ${
    progress.rejected ? "is-rejected" : ""
  }`}
  aria-label={`Application progress: ${
    progress.rejected ? "Rejected" : APPLICATION_STEPS[progress.currentStep]
  }`}
>
  {APPLICATION_STEPS.map((step, index) => {
    const isComplete = index < progress.currentStep;
    const isCurrent = index === progress.currentStep;

    return (
      <div
        className={[
          "application-progress-step",
          isComplete ? "is-complete" : "",
          isCurrent ? "is-current" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        key={step}
      >
        <div className="application-progress-marker">
          {isComplete ? <CheckCircle2 size={16} /> : index + 1}
        </div>

        <span>{step}</span>
      </div>
    );
  })}
</div>

{progress.rejected && (
  <p className="application-progress-note">
    This application was rejected.
  </p>
)}

                    <div className="customer-application-meta">
                      <span>Applicant</span>
                      <strong>{application.fullName}</strong>
                    </div>

                    <div className="customer-application-sync">
                      <span>Jaytrade transfer</span>
                      <strong>
                        {application.leadSyncStatus === "SYNCED"
                          ? "Transferred successfully"
                          : "Awaiting transfer"}
                      </strong>
                    </div>

                    <button
                      type="button"
                      className="customer-tracking-toggle"
                      onClick={() => toggleTrackingDetails(application.applicationId)}
                      aria-expanded={isTrackingExpanded}
                      aria-controls={trackingDetailsId}
                    >
                      <span>
                        <Building2 size={17} />
                        {isTrackingExpanded ? "Hide tracking details" : "View tracking details"}
                      </span>
                      {isTrackingExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>

                    {isTrackingExpanded && (
                    <div className="customer-jaytrade-tracking" id={trackingDetailsId}>

                      <div className="customer-jaytrade-heading">
                        <Building2 size={19} />
                        <h4>Jaytrade Application Tracking</h4>
                      </div>
                      {/* CUSTOMER APPLICATION MESSAGES */}
{customerStatus === "Customer Follow-up" ? (
  <div className="customer-jaytrade-message">
    <CheckCircle2 size={20} />
    <strong>
      Congratulations! Your application has been taken.
      We are working our best for you.
    </strong>
  </div>
) : employee ? (
  <div className="customer-jaytrade-message">
    <Phone size={20} />
    <strong>Our executive will call you now!</strong>
  </div>
) : null}

                      {application.leadSyncStatus !== "SYNCED" ? (
                        <p className="customer-jaytrade-message">
                          Your application is waiting to be transferred
                          to Jaytrade.
                        </p>
                      ) : refreshingStatuses && !jaytrade ? (
                        <p className="customer-jaytrade-message">
                          Fetching the latest application status...
                        </p>
                      ) : jaytrade?.success === false ? (
                        <p className="customer-jaytrade-message">
                          {jaytrade.message || "Unable to retrieve status."}
                        </p>
                      ) : !jaytrade?.synced ? (
                        <p className="customer-jaytrade-message">
                          Your application has not yet been transferred
                          to Jaytrade.
                        </p>
                      ) : (
                        <>
                          <div className="customer-jaytrade-detail">
                            <span>Current status</span>
                            <strong>
                              {jaytradeData?.status || "Processing"}
                            </strong>
                          </div>

                          <div className="customer-jaytrade-detail">
                            <span>Department</span>
                            <strong>
                              {jaytradeData?.department || "Not assigned yet"}
                            </strong>
                          </div>

                          <div className="customer-jaytrade-employee">

                            {employee ? (
                              <>
                                <div className="customer-jaytrade-employee-heading">
                                  <UserRound size={18} />
                                  <strong>Your Assigned Employee</strong>
                                </div>

                                <div className="customer-jaytrade-employee-info">
                                  <span>Name</span>
                                  <strong>{employee.name || "—"}</strong>
                                </div>

                                <div className="customer-jaytrade-employee-info">
                                  <span>Designation</span>
                                  <strong>{employee.designation || "—"}</strong>
                                </div>
                                {employee.phone && (
  <div className="customer-jaytrade-employee-info">
    <span>Phone</span>
    <a href={`tel:${employee.phone}`}>
      <Phone size={14} />
      {employee.phone}
    </a>
  </div>
)}

{employee.email && (
  <div className="customer-jaytrade-employee-info">
    <span>Email</span>
    <a href={`mailto:${employee.email}`}>
      {employee.email}
    </a>
  </div>
)}

                                {employee.phone && (
                                  <div className="customer-jaytrade-employee-info">
                                    <span>Contact</span>
                                    <a href={`tel:${employee.phone}`}>
                                      <Phone size={14} />
                                      {employee.phone}
                                    </a>
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className="customer-jaytrade-waiting">
                                <BriefcaseBusiness size={20} />
                                <div>
                                  <strong>Waiting for employee assignment</strong>
                                  <p>
                                    Your application has reached the
                                    department. An employee will be
                                    assigned to handle your request.
                                  </p>
                                </div>
                              </div>
                            )}

                          </div>
                        </>
                      )}
                    </div>
                    )}

                  </article>
                );
              })}

            </div>
          )}

        </section>
      </div>

    </main>
  );
}

export default CustomerApplications;
