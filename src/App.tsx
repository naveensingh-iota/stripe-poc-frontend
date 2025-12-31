import { useState } from "react";
import "./index.css";

export default function App() {
  const [loading, setLoading] = useState(false);
  const startVerification = async () => {
    setLoading(true);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/create-session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        }
      );

      const data = await res.json();

      if (data.url && data.session_id) {
        // Store session_id in localStorage so we can retrieve it after redirect
        localStorage.setItem("stripe_verification_session", data.session_id);
        window.location.href = data.url;
      } else {
        console.error("No verification URL returned from backend.");
      }
    } catch (err) {
      console.error("Error starting verification:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="verify-container">
      <h1 className="verify-title">Start Stripe Identity Verification</h1>

      <button
        className="verify-button"
        onClick={startVerification}
        disabled={loading}
      >
        {loading ? "Loading…" : "Verify Identity"}
      </button>
    </div>
  );
}
