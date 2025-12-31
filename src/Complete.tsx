import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function Complete() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Try to get session_id from URL params or localStorage
  const urlSessionId = searchParams.get("session_id");
  const storedSessionId = localStorage.getItem("stripe_verification_session");
  const sessionId = urlSessionId || storedSessionId;

  const [status, setStatus] = useState<string>("loading");
  const [error, setError] = useState<string | null>(null);
  const [canNavigate, setCanNavigate] = useState(false);

  useEffect(() => {
    document.title = "Verification Status";

    // If no session_id, redirect home
    if (!sessionId) {
      navigate("/");
      return;
    }

    // Clear stored session after retrieval
    if (storedSessionId && !urlSessionId) {
      localStorage.removeItem("stripe_verification_session");
    }

    // Fetch verification status
    const fetchStatus = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/verification-status/${sessionId}`
        );

        if (!res.ok) {
          throw new Error("Failed to fetch verification status");
        }

        const data = await res.json();
        setStatus(data.status);

        // Stop polling if we reached a final state
        const finalStates = ["verified", "requires_input", "canceled"];
        if (finalStates.includes(data.status)) {
          // Start the 7-second navigation timer when we reach final status
          setTimeout(() => {
            setCanNavigate(true);
          }, 7000);
          return true; // Signal to stop polling
        }
        return false;
      } catch (err) {
        console.error("Error fetching status:", err);
        setError("Unable to retrieve verification status");
        setStatus("error");
        return true; // Stop polling on error
      }
    };

    // Initial fetch
    fetchStatus();

    // Poll for status updates every 3 seconds until final state
    const interval = setInterval(async () => {
      const shouldStop = await fetchStatus();
      if (shouldStop) {
        clearInterval(interval);
      }
    }, 3000);

    return () => {
      clearInterval(interval);
    };
  }, [sessionId, navigate]);

  // Render based on status
  const renderContent = () => {
    switch (status) {
      case "loading":
        return (
          <>
            <div style={{ fontSize: "64px", marginBottom: "20px" }}>🎉</div>
            <h1 style={{ fontSize: "32px", marginBottom: "15px", color: "#635bff", fontWeight: "bold" }}>
              Thank You for Verifying!
            </h1>
            <p style={{ fontSize: "18px", marginBottom: "30px", color: "#555" }}>
              Your verification is being processed. This will just take a moment...
            </p>
            <div
              style={{
                background: "#f8f9fa",
                padding: "20px",
                borderRadius: "12px",
                marginBottom: "20px",
                border: "2px solid #e9ecef",
              }}
            >
              <p style={{ fontSize: "16px", color: "#495057", margin: 0, lineHeight: 1.8 }}>
                ⏳ Verification in progress
                <br />
                ✓ Documents submitted successfully
                <br />
                ✓ You're all done - we'll take it from here!
              </p>
            </div>
          </>
        );

      case "verified":
        return (
          <>
            <div style={{ fontSize: "64px", marginBottom: "20px", animation: "bounce 0.6s ease" }}>
              ✅
            </div>
            <h1
              style={{
                fontSize: "32px",
                marginBottom: "15px",
                color: "#10b981",
                fontWeight: "bold"
              }}
            >
              Verification Successful!
            </h1>
            <p style={{ fontSize: "18px", marginBottom: "30px", color: "#555" }}>
              Your identity has been successfully verified.
            </p>
            <div
              style={{
                background: "#f0fdf4",
                padding: "20px",
                borderRadius: "12px",
                marginBottom: "20px",
                border: "2px solid #10b981",
              }}
            >
              <p style={{ fontSize: "16px", color: "#15803d", margin: 0, lineHeight: 1.8 }}>
                ✓ Document verified
                <br />
                ✓ Identity confirmed
                <br />
                ✓ Ready to proceed
              </p>
            </div>
          </>
        );

      case "processing":
        return (
          <>
            <div style={{ fontSize: "48px", marginBottom: "20px" }}>🔄</div>
            <h1 style={{ fontSize: "28px", marginBottom: "10px" }}>
              Verification In Progress
            </h1>
            <p style={{ fontSize: "16px", marginBottom: "25px", color: "#555" }}>
              Your documents are being reviewed. This usually takes a few
              moments.
            </p>
            <div
              style={{
                background: "#fef9c3",
                padding: "15px",
                borderRadius: "8px",
                marginBottom: "20px",
              }}
            >
              <p style={{ fontSize: "14px", color: "#854d0e", margin: 0 }}>
                ⏳ Processing your documents...
                <br />
                Please don't close this page.
              </p>
            </div>
          </>
        );

      case "requires_input":
        return (
          <>
            <div style={{ fontSize: "48px", marginBottom: "20px" }}>⚠️</div>
            <h1
              style={{ fontSize: "28px", marginBottom: "10px", color: "#f59e0b" }}
            >
              Additional Information Required
            </h1>
            <p style={{ fontSize: "16px", marginBottom: "25px", color: "#555" }}>
              We couldn't verify your documents. Please try again with clearer
              photos.
            </p>
            <div
              style={{
                background: "#fef3c7",
                padding: "15px",
                borderRadius: "8px",
                marginBottom: "20px",
              }}
            >
              <p style={{ fontSize: "14px", color: "#92400e", margin: 0 }}>
                Common issues:
                <br />• Photo too blurry or dark
                <br />• Document edges cut off
                <br />• Glare on the document
              </p>
            </div>
            <button
              onClick={() => navigate("/")}
              style={{
                padding: "12px 24px",
                background: "#f59e0b",
                border: "none",
                borderRadius: "6px",
                color: "#fff",
                fontSize: "15px",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Try Again
            </button>
          </>
        );

      case "canceled":
        return (
          <>
            <div style={{ fontSize: "48px", marginBottom: "20px" }}>❌</div>
            <h1
              style={{ fontSize: "28px", marginBottom: "10px", color: "#ef4444" }}
            >
              Verification Canceled
            </h1>
            <p style={{ fontSize: "16px", marginBottom: "25px", color: "#555" }}>
              The verification process was canceled.
            </p>
            <button
              onClick={() => navigate("/")}
              style={{
                padding: "12px 24px",
                background: "#635bff",
                border: "none",
                borderRadius: "6px",
                color: "#fff",
                fontSize: "15px",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Start New Verification
            </button>
          </>
        );

      case "error":
        return (
          <>
            <div style={{ fontSize: "48px", marginBottom: "20px" }}>⚠️</div>
            <h1
              style={{ fontSize: "28px", marginBottom: "10px", color: "#ef4444" }}
            >
              Error
            </h1>
            <p style={{ fontSize: "16px", marginBottom: "25px", color: "#555" }}>
              {error || "An error occurred while checking verification status."}
            </p>
            <button
              onClick={() => navigate("/")}
              style={{
                padding: "12px 24px",
                background: "#635bff",
                border: "none",
                borderRadius: "6px",
                color: "#fff",
                fontSize: "15px",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Go Home
            </button>
          </>
        );

      default:
        return (
          <>
            <div style={{ fontSize: "48px", marginBottom: "20px" }}>❓</div>
            <h1 style={{ fontSize: "28px", marginBottom: "10px" }}>
              Unknown Status
            </h1>
            <p style={{ fontSize: "16px", marginBottom: "25px", color: "#555" }}>
              Status: {status}
            </p>
          </>
        );
    }
  };

  return (
    <div
      style={{
        padding: "40px",
        maxWidth: "500px",
        margin: "0 auto",
        textAlign: "center",
        fontFamily: "Inter, sans-serif",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      {renderContent()}

      {status !== "error" && status !== "canceled" && status !== "loading" && (
        <button
          onClick={() => canNavigate && navigate("/")}
          disabled={!canNavigate}
          style={{
            padding: "12px 24px",
            background: canNavigate ? "#635bff" : "#94a3b8",
            border: "none",
            borderRadius: "6px",
            color: "#fff",
            fontSize: "15px",
            cursor: canNavigate ? "pointer" : "not-allowed",
            marginTop: "30px",
            fontWeight: 600,
            opacity: canNavigate ? 1 : 0.7,
            transition: "all 0.3s ease",
          }}
        >
          {canNavigate ? "Return to Home" : "Please wait..."}
        </button>
      )}

      {!canNavigate && status !== "loading" && (
        <p style={{ marginTop: "15px", fontSize: "14px", color: "#64748b" }}>
          You can return home in a few seconds...
        </p>
      )}

      {sessionId && (
        <p
          style={{
            marginTop: "30px",
            fontSize: "12px",
            color: "#94a3b8",
            fontFamily: "monospace",
          }}
        >
          Session ID: {sessionId}
        </p>
      )}
    </div>
  );
}
