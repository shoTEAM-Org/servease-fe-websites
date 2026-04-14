import { useState, useEffect } from "react";
import { User, Bell, Lock, Shield, Eye, EyeOff, ChevronRight, CreditCard, MapPin, Clock, DollarSign, Settings as SettingsIcon, Moon, Sun, HelpCircle, FileText, Users, LogOut, Mail, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router";

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(to bottom right, #f9fafb, #f0fdf4)",
    padding: "32px",
  } as React.CSSProperties,
  maxWidthContainer: {
    maxWidth: "1280px",
    margin: "0 auto",
  } as React.CSSProperties,
  pageHeader: {
    marginBottom: "32px",
  } as React.CSSProperties,
  pageTitle: {
    fontSize: "36px",
    fontWeight: "bold",
    color: "#111827",
    marginBottom: "12px",
    letterSpacing: "-0.025em",
  } as React.CSSProperties,
  subtitle: {
    fontSize: "18px",
    color: "#6B7280",
  } as React.CSSProperties,
  gridTwoCol: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "24px",
    marginBottom: "24px",
  } as React.CSSProperties,
  card: {
    backgroundColor: "white",
    borderRadius: "16px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    border: "1px solid #F3F4F6",
    padding: "32px",
    transition: "box-shadow 0.2s",
  } as React.CSSProperties,
  fullWidthCard: {
    backgroundColor: "white",
    borderRadius: "16px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    border: "1px solid #F3F4F6",
    padding: "32px",
    marginBottom: "24px",
    transition: "box-shadow 0.2s",
  } as React.CSSProperties,
  sectionTitle: {
    fontSize: "20px",
    fontWeight: "bold",
    color: "#111827",
    marginBottom: "24px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  } as React.CSSProperties,
  accentBar: {
    height: "4px",
    width: "32px",
    background: "#00BF63",
    borderRadius: "4px",
  } as React.CSSProperties,
  linkItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 16px",
    borderRadius: "10px",
    border: "1px solid #F3F4F6",
    backgroundColor: "#FAFAFA",
    cursor: "pointer",
    transition: "all 0.2s ease",
    textDecoration: "none",
    color: "inherit",
    marginBottom: "12px",
  } as React.CSSProperties,
  toggle: {
    width: "48px",
    height: "28px",
    borderRadius: "14px",
    cursor: "pointer",
    position: "relative" as const,
    transition: "background-color 0.3s ease",
  } as React.CSSProperties,
  toggleDot: {
    width: "20px",
    height: "20px",
    borderRadius: "50%",
    backgroundColor: "white",
    position: "absolute" as const,
    top: "4px",
    transition: "transform 0.3s ease",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
  } as React.CSSProperties,
  input: {
    padding: "12px 16px",
    borderRadius: "10px",
    border: "2px solid #E5E7EB",
    fontSize: "14px",
    color: "#374151",
    transition: "border-color 0.3s ease",
    outline: "none",
    width: "100%",
  } as React.CSSProperties,
  label: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "8px",
    display: "block",
  } as React.CSSProperties,
  button: {
    padding: "12px 24px",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    border: "none",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  } as React.CSSProperties,
  primaryButton: {
    backgroundColor: "#00BF63",
    color: "white",
    boxShadow: "0 4px 16px rgba(0, 191, 99, 0.25)",
  } as React.CSSProperties,
};

export function ProviderSettingsPage() {
  const navigate = useNavigate();
  const [pushNotifications, setPushNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Initialize theme from localStorage or default to light, safely checking for window (SSR)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem('servease-theme') as 'light' | 'dark') || 'light';
    }
    return 'light';
  });

  // Apply dark mode filter globally and persist to localStorage
  useEffect(() => {
    localStorage.setItem('servease-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
  }, [theme]);

  return (
    <div style={styles.container}>
      <div style={styles.maxWidthContainer}>
        {/* Page Header */}
        <div style={styles.pageHeader}>
          <h1 style={styles.pageTitle}>Settings</h1>
          <p style={styles.subtitle}>
            Manage your account settings and preferences
          </p>
        </div>

        {/* Row 1: Account Settings & Notifications */}
        <div style={styles.gridTwoCol}>
          {/* Account Settings Card */}
          <div style={styles.card}>
            <div style={styles.sectionTitle}>
              <User style={{ width: "22px", height: "22px", color: "#00BF63" }} />
              <span>Account Settings</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <Link
                to="/provider/edit-profile"
                style={styles.linkItem}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#F0FDF4";
                  e.currentTarget.style.borderColor = "#00BF63";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#FAFAFA";
                  e.currentTarget.style.borderColor = "#F3F4F6";
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <User style={{ width: "18px", height: "18px", color: "#6B7280" }} />
                  <span style={{ fontSize: "14px", fontWeight: "600", color: "#111827" }}>Edit Profile</span>
                </div>
                <ChevronRight style={{ width: "18px", height: "18px", color: "#9CA3AF" }} />
              </Link>

              <Link
                to="/provider/edit-services"
                style={styles.linkItem}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#F0FDF4";
                  e.currentTarget.style.borderColor = "#00BF63";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#FAFAFA";
                  e.currentTarget.style.borderColor = "#F3F4F6";
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <DollarSign style={{ width: "18px", height: "18px", color: "#6B7280" }} />
                  <span style={{ fontSize: "14px", fontWeight: "600", color: "#111827" }}>Services & Pricing</span>
                </div>
                <ChevronRight style={{ width: "18px", height: "18px", color: "#9CA3AF" }} />
              </Link>

              <div
                style={styles.linkItem}
                onClick={() => alert("Navigate to Service Area")}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#F0FDF4";
                  e.currentTarget.style.borderColor = "#00BF63";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#FAFAFA";
                  e.currentTarget.style.borderColor = "#F3F4F6";
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <MapPin style={{ width: "18px", height: "18px", color: "#6B7280" }} />
                  <span style={{ fontSize: "14px", fontWeight: "600", color: "#111827" }}>Service Area</span>
                </div>
                <ChevronRight style={{ width: "18px", height: "18px", color: "#9CA3AF" }} />
              </div>

              <Link
                to="/provider/availability"
                style={styles.linkItem}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#F0FDF4";
                  e.currentTarget.style.borderColor = "#00BF63";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#FAFAFA";
                  e.currentTarget.style.borderColor = "#F3F4F6";
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <Clock style={{ width: "18px", height: "18px", color: "#6B7280" }} />
                  <span style={{ fontSize: "14px", fontWeight: "600", color: "#111827" }}>Availability</span>
                </div>
                <ChevronRight style={{ width: "18px", height: "18px", color: "#9CA3AF" }} />
              </Link>

              <Link
                to="/provider/payout"
                style={styles.linkItem}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#F0FDF4";
                  e.currentTarget.style.borderColor = "#00BF63";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#FAFAFA";
                  e.currentTarget.style.borderColor = "#F3F4F6";
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <CreditCard style={{ width: "18px", height: "18px", color: "#6B7280" }} />
                  <span style={{ fontSize: "14px", fontWeight: "600", color: "#111827" }}>Payout Method</span>
                </div>
                <ChevronRight style={{ width: "18px", height: "18px", color: "#9CA3AF" }} />
              </Link>
            </div>
          </div>

          {/* Notifications Card */}
          <div style={styles.card}>
            <div style={styles.sectionTitle}>
              <Bell style={{ width: "22px", height: "22px", color: "#00BF63" }} />
              <span>Notifications</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Push Notifications */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ fontSize: "14px", fontWeight: "600", color: "#111827", marginBottom: "4px" }}>
                    Push Notifications
                  </p>
                  <p style={{ fontSize: "13px", color: "#6B7280" }}>
                    Receive push notifications for bookings
                  </p>
                </div>
                <div
                  onClick={() => setPushNotifications(!pushNotifications)}
                  style={{
                    ...styles.toggle,
                    backgroundColor: pushNotifications ? "#00BF63" : "#E5E7EB",
                  }}
                >
                  <div
                    style={{
                      ...styles.toggleDot,
                      transform: pushNotifications ? "translateX(20px)" : "translateX(4px)",
                    }}
                  />
                </div>
              </div>

              {/* SMS Notifications */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ fontSize: "14px", fontWeight: "600", color: "#111827", marginBottom: "4px" }}>
                    SMS Notifications
                  </p>
                  <p style={{ fontSize: "13px", color: "#6B7280" }}>
                    Receive text messages for important updates
                  </p>
                </div>
                <div
                  onClick={() => setSmsNotifications(!smsNotifications)}
                  style={{
                    ...styles.toggle,
                    backgroundColor: smsNotifications ? "#00BF63" : "#E5E7EB",
                  }}
                >
                  <div
                    style={{
                      ...styles.toggleDot,
                      transform: smsNotifications ? "translateX(20px)" : "translateX(4px)",
                    }}
                  />
                </div>
              </div>

              {/* Email Notifications */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ fontSize: "14px", fontWeight: "600", color: "#111827", marginBottom: "4px" }}>
                    Email Notifications
                  </p>
                  <p style={{ fontSize: "13px", color: "#6B7280" }}>
                    Receive email alerts and summaries
                  </p>
                </div>
                <div
                  onClick={() => setEmailNotifications(!emailNotifications)}
                  style={{
                    ...styles.toggle,
                    backgroundColor: emailNotifications ? "#00BF63" : "#E5E7EB",
                  }}
                >
                  <div
                    style={{
                      ...styles.toggleDot,
                      transform: emailNotifications ? "translateX(20px)" : "translateX(4px)",
                    }}
                  />
                </div>
              </div>

              {/* Link to detailed preferences */}
              <Link
                to="/provider/notification-preferences"
                style={{
                  ...styles.linkItem,
                  marginTop: "8px",
                  marginBottom: "0",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#F0FDF4";
                  e.currentTarget.style.borderColor = "#00BF63";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#FAFAFA";
                  e.currentTarget.style.borderColor = "#F3F4F6";
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <SettingsIcon style={{ width: "18px", height: "18px", color: "#6B7280" }} />
                  <span style={{ fontSize: "14px", fontWeight: "600", color: "#111827" }}>Notification Preferences</span>
                </div>
                <ChevronRight style={{ width: "18px", height: "18px", color: "#9CA3AF" }} />
              </Link>
            </div>
          </div>
        </div>

        {/* Row 2: Privacy & Security and App Preferences */}
        <div style={styles.gridTwoCol}>
          {/* Privacy & Security Card */}
          <div style={styles.card}>
            <div style={styles.sectionTitle}>
              <Lock style={{ width: "22px", height: "22px", color: "#00BF63" }} />
              <span>Privacy & Security</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Change Password Section */}
              <div>
                <p style={{ fontSize: "14px", fontWeight: "600", color: "#111827", marginBottom: "12px" }}>
                  Change Password
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div>
                    <label style={styles.label}>Current Password</label>
                    <div style={{ position: "relative" }}>
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        placeholder="Enter current password"
                        style={styles.input}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = "#00BF63";
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = "#E5E7EB";
                        }}
                      />
                      <button
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        style={{
                          position: "absolute",
                          right: "12px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: "4px",
                        }}
                      >
                        {showCurrentPassword ? (
                          <EyeOff style={{ width: "18px", height: "18px", color: "#6B7280" }} />
                        ) : (
                          <Eye style={{ width: "18px", height: "18px", color: "#6B7280" }} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label style={styles.label}>New Password</label>
                    <div style={{ position: "relative" }}>
                      <input
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Enter new password"
                        style={styles.input}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = "#00BF63";
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = "#E5E7EB";
                        }}
                      />
                      <button
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        style={{
                          position: "absolute",
                          right: "12px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: "4px",
                        }}
                      >
                        {showNewPassword ? (
                          <EyeOff style={{ width: "18px", height: "18px", color: "#6B7280" }} />
                        ) : (
                          <Eye style={{ width: "18px", height: "18px", color: "#6B7280" }} />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    style={{
                      ...styles.button,
                      ...styles.primaryButton,
                      marginTop: "4px",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#059669";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#00BF63";
                    }}
                  >
                    Update Password
                  </button>
                </div>
              </div>

              {/* Two-Factor Authentication */}
              <div style={{ paddingTop: "20px", borderTop: "1px solid #F3F4F6" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <p style={{ fontSize: "14px", fontWeight: "600", color: "#111827", marginBottom: "4px" }}>
                      Two-Factor Authentication
                    </p>
                    <p style={{ fontSize: "13px", color: "#6B7280" }}>
                      Add an extra layer of security
                    </p>
                  </div>
                  <div
                    onClick={() => setTwoFactorAuth(!twoFactorAuth)}
                    style={{
                      ...styles.toggle,
                      backgroundColor: twoFactorAuth ? "#00BF63" : "#E5E7EB",
                    }}
                  >
                    <div
                      style={{
                        ...styles.toggleDot,
                        transform: twoFactorAuth ? "translateX(20px)" : "translateX(4px)",
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Login Activity Link */}
              <div
                style={styles.linkItem}
                onClick={() => alert("View login activity")}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#F0FDF4";
                  e.currentTarget.style.borderColor = "#00BF63";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#FAFAFA";
                  e.currentTarget.style.borderColor = "#F3F4F6";
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <Shield style={{ width: "18px", height: "18px", color: "#6B7280" }} />
                  <span style={{ fontSize: "14px", fontWeight: "600", color: "#111827" }}>Login Activity</span>
                </div>
                <ChevronRight style={{ width: "18px", height: "18px", color: "#9CA3AF" }} />
              </div>

              {/* Privacy Settings Link */}
              <div
                style={{ ...styles.linkItem, marginBottom: "0" }}
                onClick={() => alert("Privacy settings")}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#F0FDF4";
                  e.currentTarget.style.borderColor = "#00BF63";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#FAFAFA";
                  e.currentTarget.style.borderColor = "#F3F4F6";
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <Eye style={{ width: "18px", height: "18px", color: "#6B7280" }} />
                  <span style={{ fontSize: "14px", fontWeight: "600", color: "#111827" }}>Privacy Settings</span>
                </div>
                <ChevronRight style={{ width: "18px", height: "18px", color: "#9CA3AF" }} />
              </div>
            </div>
          </div>

          {/* App Preferences Card */}
          <div style={styles.card}>
            <div style={styles.sectionTitle}>
              <SettingsIcon style={{ width: "22px", height: "22px", color: "#00BF63" }} />
              <span>App Preferences</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Language */}
              <div>
                <label style={styles.label}>Language</label>
                <select
                  defaultValue="en"
                  style={{
                    ...styles.input,
                    cursor: "pointer",
                    appearance: "none",
                    WebkitAppearance: "none",
                    backgroundImage: `url('data:image/svg+xml;utf8,<svg fill="none" stroke="%236B7280" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M6 9l6 6 6-6"></path></svg>')`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 14px center",
                    backgroundSize: "16px",
                    paddingRight: "40px",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#00BF63";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#E5E7EB";
                  }}
                >
                  <option value="en">English</option>
                  <option value="fil">Filipino</option>
                  <option value="es">Spanish</option>
                </select>
              </div>

              {/* Currency */}
              <div>
                <label style={styles.label}>Currency</label>
                <select
                  defaultValue="php"
                  style={{
                    ...styles.input,
                    cursor: "pointer",
                    appearance: "none",
                    WebkitAppearance: "none",
                    backgroundImage: `url('data:image/svg+xml;utf8,<svg fill="none" stroke="%236B7280" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M6 9l6 6 6-6"></path></svg>')`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 14px center",
                    backgroundSize: "16px",
                    paddingRight: "40px",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#00BF63";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#E5E7EB";
                  }}
                >
                  <option value="php">PHP (₱)</option>
                  <option value="usd">USD ($)</option>
                  <option value="eur">EUR (€)</option>
                </select>
              </div>

              {/* Distance Unit */}
              <div>
                <label style={styles.label}>Distance Unit</label>
                <select
                  defaultValue="km"
                  style={{
                    ...styles.input,
                    cursor: "pointer",
                    appearance: "none",
                    WebkitAppearance: "none",
                    backgroundImage: `url('data:image/svg+xml;utf8,<svg fill="none" stroke="%236B7280" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M6 9l6 6 6-6"></path></svg>')`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 14px center",
                    backgroundSize: "16px",
                    paddingRight: "40px",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#00BF63";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#E5E7EB";
                  }}
                >
                  <option value="km">Kilometers (km)</option>
                  <option value="mi">Miles (mi)</option>
                </select>
              </div>

              {/* Theme Toggle */}
              <div style={{ paddingTop: "12px", borderTop: "1px solid #F3F4F6" }}>
                <label style={styles.label}>Theme</label>
                <div style={{ display: "flex", gap: "12px" }}>
                  <button
                    onClick={() => setTheme('light')}
                    style={{
                      flex: 1,
                      padding: "12px",
                      borderRadius: "10px",
                      border: theme === 'light' ? "2px solid #00BF63" : "2px solid #E5E7EB",
                      backgroundColor: theme === 'light' ? "#F0FDF4" : "white",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                    }}
                  >
                    <Sun style={{ width: "18px", height: "18px", color: theme === 'light' ? "#00BF63" : "#6B7280" }} />
                    <span style={{ fontSize: "14px", fontWeight: "600", color: theme === 'light' ? "#00BF63" : "#6B7280" }}>Light</span>
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    style={{
                      flex: 1,
                      padding: "12px",
                      borderRadius: "10px",
                      border: theme === 'dark' ? "2px solid #00BF63" : "2px solid #E5E7EB",
                      backgroundColor: theme === 'dark' ? "#F0FDF4" : "white",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                    }}
                  >
                    <Moon style={{ width: "18px", height: "18px", color: theme === 'dark' ? "#00BF63" : "#6B7280" }} />
                    <span style={{ fontSize: "14px", fontWeight: "600", color: theme === 'dark' ? "#00BF63" : "#6B7280" }}>Dark</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Row 3: Legal and Support */}
        <div style={styles.gridTwoCol}>
          {/* Legal Card */}
          <div style={styles.card}>
            <div style={styles.sectionTitle}>
              <FileText style={{ width: "22px", height: "22px", color: "#00BF63" }} />
              <span>Legal</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div
                style={styles.linkItem}
                onClick={() => navigate("/provider-agreement")}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#F0FDF4";
                  e.currentTarget.style.borderColor = "#00BF63";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#FAFAFA";
                  e.currentTarget.style.borderColor = "#F3F4F6";
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <FileText style={{ width: "18px", height: "18px", color: "#6B7280" }} />
                  <span style={{ fontSize: "14px", fontWeight: "600", color: "#111827" }}>Provider Agreement</span>
                </div>
                <ChevronRight style={{ width: "18px", height: "18px", color: "#9CA3AF" }} />
              </div>

              <div
                style={styles.linkItem}
                onClick={() => navigate("/terms-and-conditions")}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#F0FDF4";
                  e.currentTarget.style.borderColor = "#00BF63";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#FAFAFA";
                  e.currentTarget.style.borderColor = "#F3F4F6";
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <FileText style={{ width: "18px", height: "18px", color: "#6B7280" }} />
                  <span style={{ fontSize: "14px", fontWeight: "600", color: "#111827" }}>Terms & Conditions</span>
                </div>
                <ChevronRight style={{ width: "18px", height: "18px", color: "#9CA3AF" }} />
              </div>

              <div
                style={{ ...styles.linkItem, marginBottom: "0" }}
                onClick={() => navigate("/privacy-policy")}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#F0FDF4";
                  e.currentTarget.style.borderColor = "#00BF63";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#FAFAFA";
                  e.currentTarget.style.borderColor = "#F3F4F6";
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <Shield style={{ width: "18px", height: "18px", color: "#6B7280" }} />
                  <span style={{ fontSize: "14px", fontWeight: "600", color: "#111827" }}>Privacy Policy</span>
                </div>
                <ChevronRight style={{ width: "18px", height: "18px", color: "#9CA3AF" }} />
              </div>
            </div>
          </div>

          {/* Support Card */}
          <div style={styles.card}>
            <div style={styles.sectionTitle}>
              <HelpCircle style={{ width: "22px", height: "22px", color: "#00BF63" }} />
              <span>Support</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <Link
                to="/provider/help-center"
                style={styles.linkItem}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#F0FDF4";
                  e.currentTarget.style.borderColor = "#00BF63";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#FAFAFA";
                  e.currentTarget.style.borderColor = "#F3F4F6";
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <HelpCircle style={{ width: "18px", height: "18px", color: "#6B7280" }} />
                  <span style={{ fontSize: "14px", fontWeight: "600", color: "#111827" }}>Help Center</span>
                </div>
                <ChevronRight style={{ width: "18px", height: "18px", color: "#9CA3AF" }} />
              </Link>

              <div
                style={styles.linkItem}
                onClick={() => navigate("/provider/contact-support")}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#F0FDF4";
                  e.currentTarget.style.borderColor = "#00BF63";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#FAFAFA";
                  e.currentTarget.style.borderColor = "#F3F4F6";
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <Mail style={{ width: "18px", height: "18px", color: "#6B7280" }} />
                  <span style={{ fontSize: "14px", fontWeight: "600", color: "#111827" }}>Contact Support</span>
                </div>
                <ChevronRight style={{ width: "18px", height: "18px", color: "#9CA3AF" }} />
              </div>

              <div
                style={{ ...styles.linkItem, marginBottom: "0" }}
                onClick={() => navigate("/provider/community")}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#F0FDF4";
                  e.currentTarget.style.borderColor = "#00BF63";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#FAFAFA";
                  e.currentTarget.style.borderColor = "#F3F4F6";
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <Users style={{ width: "18px", height: "18px", color: "#6B7280" }} />
                  <span style={{ fontSize: "14px", fontWeight: "600", color: "#111827" }}>Provider Community</span>
                </div>
                <ChevronRight style={{ width: "18px", height: "18px", color: "#9CA3AF" }} />
              </div>
            </div>
          </div>
        </div>

        {/* Row 4: Log Out and Danger Zone */}
        <div style={styles.gridTwoCol}>
          {/* Log Out Button */}
          <div style={{ ...styles.card, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px" }}>
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: "bold", color: "#111827", marginBottom: "4px" }}>Log Out</h3>
              <p style={{ fontSize: "14px", color: "#6B7280", margin: 0 }}>Sign out of your account on this device</p>
            </div>
            <button
              style={{
                ...styles.button,
                backgroundColor: "white",
                color: "#6B7280",
                border: "1px solid #E5E7EB",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#F9FAFB";
                e.currentTarget.style.borderColor = "#D1D5DB";
                e.currentTarget.style.color = "#111827";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "white";
                e.currentTarget.style.borderColor = "#E5E7EB";
                e.currentTarget.style.color = "#6B7280";
              }}
              onClick={() => setIsLogoutModalOpen(true)}
            >
              <LogOut style={{ width: "18px", height: "18px" }} />
              Log Out
            </button>
          </div>

          {/* Danger Zone */}
          <div style={{ ...styles.card, borderColor: "#FCA5A5", backgroundColor: "#FEF2F2", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px" }}>
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: "bold", color: "#DC2626", marginBottom: "4px" }}>Delete Account</h3>
              <p style={{ fontSize: "14px", color: "#DC2626", margin: 0 }}>Permanently remove your account</p>
            </div>
            <button
              style={{
                ...styles.button,
                backgroundColor: "#DC2626",
                color: "white",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#B91C1C";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#DC2626";
              }}
              onClick={() => setIsDeleteModalOpen(true)}
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Logout Modal */}
      {isLogoutModalOpen && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: theme === 'dark' ? "#1F2937" : "white",
            padding: "32px",
            borderRadius: "16px",
            maxWidth: "400px",
            width: "90%",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            textAlign: "center"
          }}>
            <div style={{
              width: "64px",
              height: "64px",
              backgroundColor: "#FEF2F2",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px"
            }}>
              <LogOut style={{ width: "32px", height: "32px", color: "#EF4444" }} />
            </div>

            <h2 style={{
              fontSize: "24px",
              fontWeight: "700",
              color: theme === 'dark' ? "white" : "#111827",
              marginBottom: "12px"
            }}>
              Log Out
            </h2>

            <p style={{
              fontSize: "15px",
              color: theme === 'dark' ? "#9CA3AF" : "#6B7280",
              marginBottom: "32px",
              lineHeight: "1.5"
            }}>
              Are you sure you want to log out?
            </p>

            <div style={{
              display: "flex",
              gap: "16px"
            }}>
              <button
                style={{
                  ...styles.button,
                  flex: 1,
                  backgroundColor: theme === 'dark' ? "#374151" : "white",
                  color: theme === 'dark' ? "#D1D5DB" : "#4B5563",
                  border: `1px solid ${theme === 'dark' ? "#4B5563" : "#D1D5DB"}`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme === 'dark' ? "#4B5563" : "#F3F4F6";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = theme === 'dark' ? "#374151" : "white";
                }}
                onClick={() => setIsLogoutModalOpen(false)}
              >
                Cancel
              </button>

              <button
                style={{
                  ...styles.button,
                  flex: 1,
                  backgroundColor: "#EF4444",
                  color: "white",
                  boxShadow: "0 4px 12px rgba(239, 68, 68, 0.25)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#DC2626";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#EF4444";
                }}
                onClick={() => {
                  setIsLogoutModalOpen(false);
                  navigate('/login');
                }}
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {isDeleteModalOpen && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: theme === 'dark' ? "#1F2937" : "white",
            padding: "32px",
            borderRadius: "16px",
            maxWidth: "400px",
            width: "90%",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            textAlign: "center"
          }}>
            <div style={{
              width: "64px",
              height: "64px",
              backgroundColor: "#FEF2F2",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px"
            }}>
              <Trash2 style={{ width: "32px", height: "32px", color: "#EF4444" }} />
            </div>

            <h2 style={{
              fontSize: "24px",
              fontWeight: "700",
              color: theme === 'dark' ? "white" : "#111827",
              marginBottom: "12px"
            }}>
              Delete Account
            </h2>

            <p style={{
              fontSize: "15px",
              color: theme === 'dark' ? "#9CA3AF" : "#6B7280",
              marginBottom: "8px",
              lineHeight: "1.5"
            }}>
              Are you sure you want to delete your account?
            </p>
            <p style={{
              fontSize: "14px",
              color: theme === 'dark' ? "#9CA3AF" : "#6B7280",
              marginBottom: "32px",
              lineHeight: "1.5",
            }}>
              This action cannot be undone.
            </p>

            <div style={{
              display: "flex",
              gap: "16px"
            }}>
              <button
                style={{
                  ...styles.button,
                  flex: 1,
                  backgroundColor: theme === 'dark' ? "#374151" : "white",
                  color: theme === 'dark' ? "#D1D5DB" : "#4B5563",
                  border: `1px solid ${theme === 'dark' ? "#4B5563" : "#D1D5DB"}`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme === 'dark' ? "#4B5563" : "#F3F4F6";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = theme === 'dark' ? "#374151" : "white";
                }}
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </button>

              <button
                style={{
                  ...styles.button,
                  flex: 1,
                  backgroundColor: "#DC2626",
                  color: "white",
                  boxShadow: "0 4px 12px rgba(220, 38, 38, 0.25)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#B91C1C";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#DC2626";
                }}
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  alert("Account deletion initiated");
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}