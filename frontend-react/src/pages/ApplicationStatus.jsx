
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Search,
  FileText,
  Eye,
  X,
  Download,
} from "lucide-react";
import "./ApplicationStatus.css";

const API_URL = "http://localhost:5000/api/applications";

const statusOptions = [
  "Pending",
  "Under Review",
  "Approved",
  "Rejected",
];

function ApplicationStatus({ onBack }) {
  const [applications, setApplications] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedApplication, setSelectedApplication] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  // Fetch applications from PostgreSQL through Node.js
  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to load applications."
        );
      }

      setApplications(result.applications || []);
    } catch (err) {
      console.error("Application loading error:", err);
      setError(
        err.message || "Could not connect to the Indipay backend."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  // Update application status in PostgreSQL
  const updateStatus = async (applicationId, status) => {
    try {
      setUpdatingId(applicationId);
      setError("");

      const response = await fetch(
        `${API_URL}/${encodeURIComponent(applicationId)}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Could not update application status."
        );
      }

      const updatedApplication = result.application;

      setApplications((previous) =>
        previous.map((application) =>
          application.applicationId === applicationId
            ? updatedApplication
            : application
        )
      );

      setSelectedApplication((previous) =>
        previous?.applicationId === applicationId
          ? updatedApplication
          : previous
      );

    } catch (err) {
      console.error("Status update error:", err);
      setError(err.message || "Status update failed.");
    } finally {
      setUpdatingId(null);
    }
  };

  // Search applications
  const filteredApplications = applications.filter((application) => {
    const searchText = search.toLowerCase();

    return (
      application.fullName?.toLowerCase().includes(searchText) ||
      application.mobile?.includes(searchText) ||
      application.service?.toLowerCase().includes(searchText) ||
      application.applicationId?.toLowerCase().includes(searchText)
    );
  });

  // Count applications by status
  const countStatus = (status) =>
    applications.filter(
      (application) => application.status === status
    ).length;

  // Format database date
  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <main className="application-status-page">
      <div className="application-status-container">

        <button
          className="application-status-back"
          onClick={onBack}
        >
          <ArrowLeft size={18} /> Back to Home
        </button>

        <div className="application-status-heading">
          <div>
            <span>INDIPAY ADMINISTRATION</span>
            <h1>Application Management</h1>
            <p>View and manage all customer applications.</p>
          </div>

          <span className="admin-view-label">Admin View</span>
        </div>

        {/* APPLICATION STATISTICS */}
        <div className="application-status-stats">
          <div>
            <span>Total Applications</span>
            <strong>{applications.length}</strong>
          </div>

          <div>
            <span>Pending</span>
            <strong>{countStatus("Pending")}</strong>
          </div>

          <div>
            <span>Under Review</span>
            <strong>{countStatus("Under Review")}</strong>
          </div>

          <div>
            <span>Approved</span>
            <strong>{countStatus("Approved")}</strong>
          </div>

          <div>
            <span>Rejected</span>
            <strong>{countStatus("Rejected")}</strong>
          </div>
        </div>

        {/* APPLICATION LIST */}
        <section className="application-status-list">

          <div className="application-status-toolbar">
            <h2>All Applications</h2>

            <label className="application-status-search">
              <Search size={18} />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search by name, mobile, service or ID"
              />
            </label>
          </div>

          {error && (
            <div className="application-status-empty">
              <p>{error}</p>

              <button
                type="button"
                onClick={fetchApplications}
              >
                Try Again
              </button>
            </div>
          )}

          {loading ? (
            <div className="application-status-empty">
              <p>Loading applications...</p>
            </div>
          ) : !error && filteredApplications.length === 0 ? (
            <div className="application-status-empty">
              <FileText size={38} />
              <h3>No applications found</h3>
              <p>
                Submitted applications will appear here.
              </p>
            </div>
          ) : !error && (
            <div className="application-status-table-wrap">
              <table className="application-status-table">

                <thead>
                  <tr>
                    <th>Application ID</th>
                    <th>Customer</th>
                    <th>Service</th>
                    <th>Submitted</th>
                    <th>Status</th>
                    <th>Details</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredApplications.map((application) => (
                    <tr key={application.applicationId}>

                      <td>{application.applicationId}</td>

                      <td>
                        <strong>{application.fullName}</strong>
                        <small>{application.mobile}</small>
                      </td>

                      <td>{application.service}</td>

                      <td>{formatDate(application.submittedAt)}</td>

                      <td>
                        <select
                          className={`application-status-select status-${application.status?.toLowerCase().replaceAll(" ", "-")}`}
                          value={application.status || "Pending"}
                          disabled={
                            updatingId === application.applicationId
                          }
                          onChange={(event) =>
                            updateStatus(
                              application.applicationId,
                              event.target.value
                            )
                          }
                        >
                          {statusOptions.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td>
                        <button
                          className="application-status-view"
                          onClick={() =>
                            setSelectedApplication(application)
                          }
                        >
                          <Eye size={16} /> View
                        </button>
                      </td>

                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          )}
        </section>
      </div>

      {/* APPLICATION DETAILS POPUP */}
      {selectedApplication && (
        <div
          className="application-detail-overlay"
          onClick={() => setSelectedApplication(null)}
        >
          <section
            className="application-detail-modal"
            onClick={(event) => event.stopPropagation()}
          >

            <div className="application-detail-header">
              <div>
                <span>APPLICATION DETAILS</span>
                <h2>{selectedApplication.applicationId}</h2>
              </div>

              <button
                onClick={() => setSelectedApplication(null)}
              >
                <X size={22} />
              </button>
            </div>

            <div className="application-detail-content">

              {[
                ["Full Name", selectedApplication.fullName],
                ["Mobile", selectedApplication.mobile],
                ["Email", selectedApplication.email],
                ["Service", selectedApplication.service],
                ["Address", selectedApplication.address],
                ["District", selectedApplication.district],
                ["State", selectedApplication.state],
                ["PIN Code", selectedApplication.pincode],
                ["Remarks", selectedApplication.remarks || "Not provided"],
                ["Submitted", formatDate(selectedApplication.submittedAt)],
              ].map(([label, value]) => (
                <div
                  className="application-detail-field"
                  key={label}
                >
                  <span>{label}</span>
                  <strong>{value || "—"}</strong>
                </div>
              ))}

              <div className="application-detail-field">
                <span>JAYTRADE Lead Sync</span>
                <strong>
                  {selectedApplication.leadSyncStatus || "Unknown"}
                </strong>
              </div>

              <div className="application-detail-field">
                <span>Documents</span>

                <div className="application-detail-files">
                  <strong>
                    Document storage is not connected yet.
                  </strong>
                </div>
              </div>

              <label className="application-detail-status">
                Update Application Status

                <select
                  value={selectedApplication.status || "Pending"}
                  disabled={
                    updatingId === selectedApplication.applicationId
                  }
                  onChange={(event) =>
                    updateStatus(
                      selectedApplication.applicationId,
                      event.target.value
                    )
                  }
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>

            </div>
          </section>
        </div>
      )}

    </main>
  );
}

export default ApplicationStatus;
