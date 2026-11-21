import { useEffect, useCallback, useState } from "react";
import {
  Users,
  Copy,
  Share2,
  UserRound,
  CalendarDays,
  Gift,
  RefreshCw,
} from "lucide-react";
import "./Refer.css";
import API_BASE_URL from "../config/api";

function Refer() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const referralLink = data?.referralCode
    ? `${window.location.origin}${import.meta.env.BASE_URL}?ref=${data.referralCode}`
    : "";

  const fetchReferrals = useCallback(async () => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/auth/referrals`,
      {
        credentials: "include",
      }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Unable to load referrals.");
    }

    setData(result);
    setError("");
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
}, []);

useEffect(() => {
  const timeoutId = window.setTimeout(() => {
    fetchReferrals();
  }, 0);

  return () => window.clearTimeout(timeoutId);
}, [fetchReferrals]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      alert("Referral link copied!");
    } catch {
      alert("Unable to copy the link. Please copy it manually.");
    }
  };

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join Indipay",
          text: `Join Indipay using my referral link!`,
          url: referralLink,
        });
      } catch (err) {
        if (err.name !== "AbortError") {
          copyLink();
        }
      }
    } else {
      copyLink();
    }
  };

  return (
    <div className="indipay-refer-page">
      <header className="refer-header">
        <div>
          <span className="refer-eyebrow">INDIPAY COMMUNITY</span>
          <h1>Refer & Earn</h1>
          <p>Invite friends and family to discover Indipay.</p>
        </div>

        <div className="refer-header-icon">
          <Gift size={30} />
        </div>
      </header>

      {loading ? (
        <div className="refer-loading">
          <RefreshCw className="refer-spin" />
          <p>Loading your referral details...</p>
        </div>
      ) : error ? (
        <div className="refer-error">
          <p>{error}</p>
          <button
  onClick={() => {
    setLoading(true);
    fetchReferrals();
  }}
>
  Try Again
</button>
        </div>
      ) : (
        <>
          <section className="refer-stats">
            <div className="refer-stat-card">
              <div className="refer-stat-icon">
                <Users size={22} />
              </div>
              <span>Total Referrals</span>
              <strong>{data.totalReferrals}</strong>
            </div>

            <div className="refer-stat-card">
              <div className="refer-stat-icon">
                <UserRound size={22} />
              </div>
              <span>Successful Registrations</span>
              <strong>{data.totalReferrals}</strong>
            </div>
          </section>

          <section className="refer-link-card">
            <div className="refer-card-heading">
              <div>
                <span className="refer-eyebrow">YOUR PERSONAL LINK</span>
                <h2>Invite someone to Indipay</h2>
              </div>
              <Share2 size={25} />
            </div>

            <p>
              Share this link with friends. When they register through it,
              they will appear in your referral list.
            </p>

            <div className="refer-link-box">
              <span>{referralLink || "Referral link unavailable"}</span>
              <button
                onClick={copyLink}
                disabled={!referralLink}
                aria-label="Copy referral link"
              >
                <Copy size={19} />
              </button>
            </div>

            <button
              className="refer-share-button"
              onClick={shareLink}
              disabled={!referralLink}
            >
              <Share2 size={19} />
              Share Referral Link
            </button>
          </section>

          <section className="refer-list-section">
            <div className="refer-list-heading">
              <div>
                <h2>Your Referrals</h2>
                <p>People who registered using your link</p>
              </div>

              <button
                className="refer-refresh-button"
                onClick={() => {
  setLoading(true);
  fetchReferrals();
}}
                aria-label="Refresh referrals"
              >
                <RefreshCw size={18} />
              </button>
            </div>

            {data.referrals.length === 0 ? (
              <div className="refer-empty">
                <Users size={38} />
                <h3>No referrals yet</h3>
                <p>
                  Share your referral link and your successful registrations
                  will appear here.
                </p>
              </div>
            ) : (
              <div className="refer-list">
                {data.referrals.map((person, index) => (
                  <article
                    className="refer-person"
                    key={person.accountId || index}
                  >
                    <div className="refer-person-avatar">
                      <UserRound size={21} />
                    </div>

                    <div className="refer-person-info">
                      <strong>{person.name}</strong>
                      <span>
                        ID: {person.accountId || "Not available"}
                      </span>
                    </div>

                    <div className="refer-person-date">
                      <CalendarDays size={15} />
                      {new Date(person.createdAt).toLocaleDateString("en-IN")}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

export default Refer;
