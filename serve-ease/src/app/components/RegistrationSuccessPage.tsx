import { useNavigate } from "react-router";

export function RegistrationSuccessPage() {
  const navigate = useNavigate();

  return (
    <div style={styles.page}>
      <div style={styles.shell}>
        <div style={styles.card}>
          <div style={styles.contentWrap}>
            <div style={styles.iconWrap}>
              <div style={styles.ringOuter}>
                <div style={styles.ringMid}>
                  <div style={styles.ringInner}>
                    <div style={styles.checkCircle}>✓</div>
                  </div>
                </div>
              </div>
            </div>

            <h1 style={styles.title}>Application Submitted!</h1>
            <p style={styles.subtitle}>
              Thank you for signing up as a service provider. Your application is now under review. You will receive
              an email notification once your account has been approved and activated.
            </p>

            <div style={styles.infoBox}>
              <div style={styles.infoIcon} aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={styles.infoSvg}>
                  <rect x="3" y="6" width="18" height="12" rx="2" />
                  <path d="M3.5 7.5 12 13l8.5-5.5" />
                </svg>
              </div>
              <div>
                <p style={styles.infoTitle}>Check your email</p>
                <p style={styles.infoText}>
                  We will send you an account activation link once your application has been reviewed and approved.
                  This process may take 1-3 business days.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div style={styles.footerWrap}>
          <button style={styles.loginButton} onClick={() => navigate("/login")} type="button">
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    backgroundColor: "#F4F4F4",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px 18px",
  },
  shell: {
    width: "100%",
    maxWidth: "560px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    padding: "0",
  },
  card: {
    width: "100%",
    borderRadius: "18px",
    border: "1px solid #E5E7EB",
    backgroundColor: "#FFFFFF",
    padding: "34px 44px 36px",
    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.06)",
  },
  contentWrap: {
    width: "100%",
  },
  iconWrap: {
    display: "flex",
    justifyContent: "center",
    margin: "2px 0 18px",
  },
  ringOuter: {
    width: "84px",
    height: "84px",
    borderRadius: "999px",
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  ringMid: {
    width: "62px",
    height: "62px",
    borderRadius: "999px",
    backgroundColor: "rgba(16, 185, 129, 0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  ringInner: {
    width: "46px",
    height: "46px",
    borderRadius: "999px",
    backgroundColor: "rgba(16, 185, 129, 0.28)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  checkCircle: {
    width: "22px",
    height: "22px",
    borderRadius: "999px",
    backgroundColor: "#10B981",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    fontSize: "14px",
    lineHeight: 1,
  },
  title: {
    color: "#0B1731",
    fontWeight: 800,
    fontSize: "42px",
    lineHeight: 1.02,
    letterSpacing: "-0.02em",
    margin: "0 0 12px",
    whiteSpace: "nowrap",
  },
  subtitle: {
    color: "#55607A",
    fontSize: "14px",
    lineHeight: 1.5,
    margin: "0 auto 22px",
    maxWidth: "100%",
  },
  infoBox: {
    border: "1px solid #A8DEBF",
    backgroundColor: "#DFF3E6",
    borderRadius: "16px",
    textAlign: "left",
    padding: "16px 18px 15px",
    display: "grid",
    gridTemplateColumns: "36px 1fr",
    gap: "14px",
    marginBottom: "4px",
    maxWidth: "100%",
    marginLeft: "auto",
    marginRight: "auto",
  },
  infoIcon: {
    width: "34px",
    height: "34px",
    borderRadius: "999px",
    backgroundColor: "#CFEFD9",
    color: "#19B35E",
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "1px",
  },
  infoSvg: {
    width: "18px",
    height: "18px",
    display: "block",
  },
  infoTitle: {
    margin: "0 0 6px",
    color: "#10223F",
    fontSize: "17px",
    fontWeight: 600,
  },
  infoText: {
    margin: 0,
    color: "#4F5F75",
    fontSize: "14px",
    lineHeight: 1.48,
  },
  footerWrap: {
    width: "100%",
    paddingBottom: "2px",
    paddingTop: "22px",
    display: "flex",
    justifyContent: "center",
  },
  loginButton: {
    width: "100%",
    maxWidth: "270px",
    border: "none",
    borderRadius: "999px",
    background: "#08C166",
    color: "white",
    fontWeight: 700,
    fontSize: "14px",
    lineHeight: 1,
    padding: "12px 18px",
    cursor: "pointer",
    boxShadow: "0 8px 16px rgba(8, 193, 102, 0.24)",
    margin: "0 auto",
    display: "block",
  },
};
