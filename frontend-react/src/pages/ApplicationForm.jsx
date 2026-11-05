
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  FileText,
  UploadCloud,
  CheckCircle2,
} from "lucide-react";

import { serviceOptions } from "../data/serviceOptions";
import "./ApplicationForm.css";

function ApplicationForm({ initialService, onBack }) {
  const [formData, setFormData] = useState({
    fullName: "",
    mobile: "",
    email: "",
    service: initialService || "",
    address: "",
    district: "",
    state: "",
    pincode: "",
    remarks: "",
  });

  const [files, setFiles] = useState([]);
  const [message, setMessage] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  
  
const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("Submitting your application...");

    try {
        const response = await fetch(
            "http://localhost:5000/api/applications",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(
                result.message || "Application submission failed."
            );
        }

        setMessage(
            `Application submitted successfully! Reference: ${result.applicationId}`
        );

    } catch (error) {
        console.error(error);
        setMessage(
            error.message || "Unable to submit your application. Please try again."
        );
    }
};



  return (
    <div className="indipay-home indipay-application-page">

      <header className="indipay-topbar">
        <button
          type="button"
          className="indipay-application-back"
          onClick={onBack}
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <img
          src={`${import.meta.env.BASE_URL}images/logo-blue.jpeg`}
          alt="Indipay"
          className="indipay-logo-image"
        />
      </header>

      <main className="indipay-application-container">

        <div className="indipay-application-heading">
          <span>INDIPAY APPLICATION</span>
          <h1>Let's Get Started.</h1>
          <p>
            Share your details and our team will assist you with
            your selected service.
          </p>
        </div>

        <form
          className="indipay-application-form"
          onSubmit={handleSubmit}
        >

          <div className="indipay-application-form-title">
            <div>
              <FileText size={23} />
            </div>

            <section>
              <h2>Application Details</h2>
              <p>Please provide the following information.</p>
            </section>
          </div>

          {/* PERSONAL INFORMATION */}
          <div className="indipay-application-section">
            <h3>Personal Information</h3>

            <div className="indipay-application-grid">

              <label>
                Full Name *
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                />
              </label>

              <label>
                Mobile Number *
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  placeholder="Enter your mobile number"
                  pattern="[0-9]{10}"
                  maxLength="10"
                  required
                />
              </label>

              <label>
                Email Address *
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email address"
                  required
                />
              </label>

            </div>
          </div>

          {/* SERVICE SELECTION */}
          <div className="indipay-application-section">
            <h3>Service Selection</h3>

            <label>
              Select Service *
              <select
                name="service"
                value={formData.service}
                onChange={handleChange}
                required
              >
                <option value="" disabled>
                  Choose a service
                </option>

                {serviceOptions.map((service) => (
                  <option key={service} value={service}>
                    {service}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {/* ADDRESS */}
          <div className="indipay-application-section">
            <h3>Address Information</h3>

            <label>
              Full Address *
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter your complete address"
                rows="3"
                required
              />
            </label>

            <div className="indipay-application-grid">

              <label>
                District *
                <input
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  placeholder="Enter district"
                  required
                />
              </label>

              <label>
                State *
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="Enter state"
                  required
                />
              </label>

              <label>
                PIN Code *
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  placeholder="6-digit PIN code"
                  pattern="[0-9]{6}"
                  maxLength="6"
                  required
                />
              </label>

            </div>
          </div>

          {/* ADDITIONAL INFORMATION */}
          <div className="indipay-application-section">
            <h3>Additional Information</h3>

            <label>
              Remarks
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                placeholder="Tell us more about your requirements (optional)"
                rows="4"
              />
            </label>
          </div>

          {/* DOCUMENT UPLOAD */}
          <div className="indipay-application-section">
            <h3>Upload Documents</h3>

            <label className="indipay-application-upload">
              <UploadCloud size={28} />
              <strong>Choose files to upload</strong>
              <span>Attach relevant documents (optional)</span>

              <input
                type="file"
                multiple
                onChange={(event) =>
                  setFiles(Array.from(event.target.files || []))
                }
              />
            </label>

            {files.length > 0 && (
              <div className="indipay-application-files">
                {files.map((file, index) => (
                  <div key={`${file.name}-${index}`}>
                    <FileText size={16} />
                    <span>{file.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {message && (
            <div className="indipay-application-message">
              <CheckCircle2 size={19} />
              {message}
            </div>
          )}

          <div className="indipay-application-submit">
            <button type="submit">
              Submit Application
              <ArrowRight size={18} />
            </button>

            <p>
              Your information will be handled securely.
            </p>
          </div>

        </form>
      </main>
    </div>
  );
}

export default ApplicationForm;
