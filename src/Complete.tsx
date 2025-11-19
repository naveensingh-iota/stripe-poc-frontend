import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Complete() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Verification in Progress";

    const timer = setTimeout(() => {
      navigate("/");
    }, 7000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div
      style={{
        padding: "40px",
        maxWidth: "500px",
        margin: "0 auto",
        textAlign: "center",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <h1 style={{ fontSize: "28px", marginBottom: "10px" }}>
        Verification In Progress
      </h1>

      <p style={{ fontSize: "16px", marginBottom: "25px", color: "#555" }}>
        Your documents have been submitted. Stripe is currently verifying them.
      </p>

      <button
        onClick={() => navigate("/")}
        style={{
          padding: "10px 18px",
          background: "#4a34f0",
          border: "none",
          borderRadius: "6px",
          color: "#fff",
          fontSize: "15px",
          cursor: "pointer",
        }}
      >
        Go to Home
      </button>

      <p style={{ marginTop: "20px", fontSize: "14px", color: "#777" }}>
        You will be redirected automatically in 7 seconds...
      </p>
    </div>
  );
}
