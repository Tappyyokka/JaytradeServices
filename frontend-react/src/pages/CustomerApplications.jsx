
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
} from "lucide-react";

import "./CustomerApplications.css";
import API_BASE_URL from "../config/api";

const API_URL = `${API_BASE_URL}/api/my-applications`;
const STATUS_API_URL = `${API_BASE_URL}/api/applications`;

function CustomerApplications({ onBack }) {
  const [applications, setApplications] = useState([]);
  const [jaytradeStatuses, setJaytradeStatuses] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshingStatuses, setRefreshingStatuses] = useState(false);

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

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusIcon = (status) => {
    if (status === "Approved" || status === "Completed") {
      return <CheckCircle2 size={19} />;
    }

    if (status === "Rejected") {
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

        <div className="customer-applications-heading">
          <span>YOUR INDIPAY ACCOUNT</span>
          <h1>My Applications</h1>
          <p>Track the progress of services you've applied for.</p>
        </div>

        <section className="customer-applications-list">

          <div className="customer-applications-toolbar">
            <h2>Your Submitted Applications</h2>

            <button
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="customer-applications-empty">
              Loading your applications...
            </div>
          ) : error ? (
            <div className="customer-applications-empty">
              <p>{error}</p>
              <button onClick={handleRefresh}>Try Again</button>
            </div>
          ) : applications.length === 0 ? (
            <div className="customer-applications-empty">
              <FileText size={42} />
              <h3>No applications yet</h3>
              <p>Your submitted applications will appear here.</p>
            </div>
          ) : (
            <div className="customer-applications-cards">

              {applications.map((application) => {
                const jaytrade = getJaytradeStatus(application);
const jaytradeData = jaytrade?.jaytrade;
const employee = jaytradeData?.assigned_employee;
const customerStatus = jaytradeData?.customer_status;

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
                        className={`customer-application-status status-${application.status?.toLowerCase().replaceAll(" ", "-")}`}
                      >
                        {getStatusIcon(application.status)}
                        {application.status || "Pending"}
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

                    {/* JAYTRADE LIVE TRACKING */}
                    <div className="customer-jaytrade-tracking">

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
