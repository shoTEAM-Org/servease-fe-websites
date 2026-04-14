import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Phone,
  Mail,
  MessageCircle,
  Star,
  CheckCircle2,
  Clock,
  History,
  User,
} from "lucide-react";

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#F9FAFB",
    paddingBottom: "80px",
  },
  button: {
    padding: "10px 18px",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "600" as const,
    cursor: "pointer",
    transition: "all 0.3s ease",
    border: "none",
    display: "inline-flex" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: "8px",
  },
  primaryButton: {
    backgroundColor: "#00BF63",
    color: "white",
    boxShadow: "0 4px 16px rgba(0, 191, 99, 0.25)",
  },
  secondaryButton: {
    backgroundColor: "white",
    color: "#374151",
    border: "1px solid #E5E7EB",
  },
  card: {
    backgroundColor: "white",
    borderRadius: "20px",
    boxShadow: "0 2px 12px rgba(0, 0, 0, 0.06)",
    border: "1px solid #F3F4F6",
    padding: "24px",
  } as React.CSSProperties,
};

export function CustomerProfilePage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const customerData: Record<string, { name: string; location: string; phone: string; email: string; since: string }> = {
    "1": { name: "Maria Santos",  location: "Quezon City, Metro Manila",  phone: "+63 912 345 6789", email: "mariasantos@email.com",  since: "January 2024" },
    "2": { name: "John Reyes",    location: "Makati City, Metro Manila",  phone: "+63 917 654 3210", email: "johnreyes@email.com",    since: "March 2024"   },
    "3": { name: "Anna Cruz",     location: "Pasig City, Metro Manila",   phone: "+63 920 111 2222", email: "annacruz@email.com",     since: "June 2023"    },
  };

  const customer = customerData[id ?? ""] ?? { name: "Client Profile", location: "Metro Manila", phone: "N/A", email: "N/A", since: "2024" };
  const initials = customer.name.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2);

  const stats = [
    { label: "Bookings",       value: "3", icon: CheckCircle2, bg: "#DCFCE7", color: "#059669"  },
    { label: "Reviews Given",  value: "2", icon: Star,         bg: "#FEF3C7", color: "#D97706"  },
    { label: "No Shows",       value: "0", icon: History,      bg: "#F3F4F6", color: "#6B7280"  },
  ];

  const bookings = [
    { type: "House Cleaning", date: "March 25, 2026",    status: "Confirmed", amount: "₱1,200", upcoming: true  },
    { type: "Deep Cleaning",  date: "February 10, 2026", status: "Completed", amount: "₱2,500", upcoming: false },
    { type: "Deep Cleaning",  date: "December 5, 2025",  status: "Completed", amount: "₱2,500", upcoming: false },
  ];

  return (
    <div style={styles.container}>

      {/* Page Header Bar */}
      <div style={{
        backgroundColor: "white",
        borderBottom: "1px solid #E5E7EB",
        padding: "16px 32px",
        display: "flex",
        alignItems: "center",
        gap: "16px",
      }}>
        <button
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "14px",
            fontWeight: "600",
            color: "#6B7280",
            padding: "4px 0",
            transition: "color 0.2s ease",
          }}
          onClick={() => navigate("/provider/messages")}
          onMouseEnter={(e) => { e.currentTarget.style.color = "#111827"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "#6B7280"; }}
        >
          <ArrowLeft style={{ width: "16px", height: "16px" }} />
          Back to Messages
        </button>
        <span style={{ fontSize: "20px", fontWeight: "700", color: "#111827" }}>Client Profile</span>
      </div>

      {/* Content */}
      <div style={{ maxWidth: "1100px", margin: "40px auto", padding: "0 32px", display: "grid", gridTemplateColumns: "320px 1fr", gap: "28px", alignItems: "start" }}>

        {/* ——— Left Column ——— */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* Identity Card */}
          <div style={{ ...styles.card, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>

            {/* Avatar */}
            <div style={{
              width: "100px",
              height: "100px",
              borderRadius: "24px",
              backgroundColor: "#00BF63",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "36px",
              fontWeight: "bold",
              boxShadow: "0 8px 24px rgba(0, 191, 99, 0.3)",
              marginBottom: "16px",
            }}>
              {initials}
            </div>

            <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#111827", margin: "0 0 8px 0" }}>
              {customer.name}
            </h1>

            <span style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              backgroundColor: "#F3F4F6", padding: "5px 12px", borderRadius: "20px",
              fontSize: "13px", color: "#4B5563", fontWeight: "500", marginBottom: "20px",
            }}>
              <Calendar style={{ width: "13px", height: "13px" }} />
              Client since {customer.since}
            </span>

            <button
              style={{ ...styles.button, ...styles.primaryButton, width: "100%" }}
              onClick={() => navigate("/provider/messages")}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#059669"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#00BF63"; }}
            >
              <MessageCircle style={{ width: "17px", height: "17px" }} />
              Send Message
            </button>
          </div>

          {/* Contact Details Card */}
          <div style={styles.card}>
            <p style={{ fontSize: "13px", fontWeight: "600", color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 16px 0" }}>
              Contact Details
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

              {[
                { icon: MapPin,  label: "Location",     value: customer.location  },
                { icon: Phone,   label: "Phone Number", value: customer.phone     },
                { icon: Mail,    label: "Email Address", value: customer.email    },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "#F0FDF4", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon style={{ width: "15px", height: "15px", color: "#00BF63" }} />
                  </div>
                  <div>
                    <p style={{ fontSize: "11px", color: "#9CA3AF", margin: "0 0 2px 0", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</p>
                    <p style={{ fontSize: "14px", color: "#111827", margin: 0, fontWeight: "500" }}>{value}</p>
                  </div>
                </div>
              ))}

            </div>
          </div>

        </div>

        {/* ——— Right Column ——— */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

          {/* Stats Row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
            {stats.map((stat, i) => (
              <div key={i} style={{ ...styles.card, display: "flex", flexDirection: "column" as const, gap: "12px" }}>
                <div style={{ width: "44px", height: "44px", borderRadius: "14px", backgroundColor: stat.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <stat.icon style={{ width: "22px", height: "22px", color: stat.color }} />
                </div>
                <div>
                  <div style={{ fontSize: "30px", fontWeight: "800", color: "#111827", lineHeight: "1" }}>{stat.value}</div>
                  <div style={{ fontSize: "13px", color: "#6B7280", marginTop: "6px", fontWeight: "500" }}>{stat.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Booking History */}
          <div style={styles.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "16px", fontWeight: "700", color: "#111827", margin: 0 }}>
                Recent Interaction History
              </h2>
              <button
                style={{ ...styles.button, backgroundColor: "#F9FAFB", color: "#374151", fontSize: "13px", padding: "8px 14px" }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#F3F4F6"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#F9FAFB"; }}
              >
                View Full History
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {bookings.map((b, i) => (
                <div key={i} style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "14px 16px",
                  backgroundColor: b.upcoming ? "#F0FDF4" : "#F9FAFB",
                  borderRadius: "14px",
                  border: b.upcoming ? "1px solid #BBF7D0" : "1px solid #F3F4F6",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <div style={{
                      width: "44px", height: "44px", borderRadius: "12px",
                      backgroundColor: b.upcoming ? "#DCFCE7" : "white",
                      border: b.upcoming ? "none" : "1px solid #E5E7EB",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <Clock style={{ width: "19px", height: "19px", color: b.upcoming ? "#059669" : "#9CA3AF" }} />
                    </div>
                    <div>
                      <p style={{ fontSize: "15px", fontWeight: "600", color: "#111827", margin: "0 0 3px 0" }}>{b.type}</p>
                      <p style={{ fontSize: "13px", color: "#6B7280", margin: 0 }}>{b.date}</p>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" as const }}>
                    <p style={{ fontSize: "15px", fontWeight: "700", color: "#111827", margin: "0 0 4px 0" }}>{b.amount}</p>
                    <span style={{
                      fontSize: "12px", fontWeight: "600",
                      color: b.status === "Completed" ? "#4B5563" : "#059669",
                      backgroundColor: b.status === "Completed" ? "#E5E7EB" : "#D1FAE5",
                      padding: "3px 10px", borderRadius: "20px",
                    }}>
                      {b.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
