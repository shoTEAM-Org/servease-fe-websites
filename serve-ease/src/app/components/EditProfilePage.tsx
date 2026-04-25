import { useState } from "react";
import { Camera, ChevronRight, Save } from "lucide-react";
import { useNavigate } from "react-router";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useProviderData } from "../context/ProviderDataContext";

const styles = {
  container: { minHeight: "100vh", backgroundColor: "#F9FAFB", paddingBottom: "100px" } as React.CSSProperties,
  maxWidthContainer: { maxWidth: "960px", margin: "0 auto", padding: "32px" } as React.CSSProperties,
  pageHeader: { marginBottom: "32px" } as React.CSSProperties,
  pageTitle: { fontSize: "32px", fontWeight: "bold", color: "#111827", marginBottom: "12px" } as React.CSSProperties,
  card: {
    backgroundColor: "white",
    borderRadius: "16px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    border: "1px solid #F3F4F6",
    padding: "24px",
    marginBottom: "24px",
  } as React.CSSProperties,
  label: { fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "8px", display: "block" } as React.CSSProperties,
  input: {
    width: "100%",
    padding: "12px 16px",
    borderRadius: "10px",
    border: "2px solid #E5E7EB",
    fontSize: "14px",
    color: "#374151",
    outline: "none",
  } as React.CSSProperties,
  textarea: {
    width: "100%",
    minHeight: "120px",
    padding: "12px 16px",
    borderRadius: "10px",
    border: "2px solid #E5E7EB",
    fontSize: "14px",
    color: "#374151",
    outline: "none",
    resize: "vertical",
  } as React.CSSProperties,
  button: {
    padding: "12px 24px",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
    border: "none",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
  } as React.CSSProperties,
  primaryButton: { backgroundColor: "#00BF63", color: "white" } as React.CSSProperties,
  secondaryButton: { backgroundColor: "white", color: "#374151", border: "1px solid #E5E7EB" } as React.CSSProperties,
};

export function EditProfilePage() {
  const navigate = useNavigate();
  const { profile, updateProfile, services } = useProviderData();

  const [businessName, setBusinessName] = useState(profile.businessName);
  const [serviceDescription, setServiceDescription] = useState(profile.serviceDescription);
  const [yearsExperience, setYearsExperience] = useState(profile.yearsExperience);
  const [coverPhotoUrl, setCoverPhotoUrl] = useState(profile.coverPhotoUrl);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(profile.profilePhotoUrl);

  const pickImage = (onPicked: (url: string) => void) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) onPicked(URL.createObjectURL(file));
    };
    input.click();
  };

  const handleSave = () => {
    updateProfile({
      businessName,
      serviceDescription,
      yearsExperience,
      coverPhotoUrl,
      profilePhotoUrl,
    });
    navigate("/provider/profile");
  };

  return (
    <div style={styles.container}>
      <div style={styles.maxWidthContainer}>
        <div style={styles.pageHeader}>
          <h1 style={styles.pageTitle}>Edit Profile</h1>
          <p style={{ color: "#6B7280" }}>Manage the provider profile fields backed by ServEase.</p>
        </div>

        <div style={styles.card}>
          <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#111827", marginBottom: "20px" }}>
            Business Profile
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 120px", gap: "24px", alignItems: "start" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              <div>
                <label style={styles.label}>Business Name</label>
                <input style={styles.input} value={businessName} onChange={(event) => setBusinessName(event.target.value)} />
              </div>
              <div>
                <label style={styles.label}>Service Description</label>
                <textarea
                  style={styles.textarea}
                  maxLength={500}
                  value={serviceDescription}
                  onChange={(event) => setServiceDescription(event.target.value)}
                />
              </div>
              <div>
                <label style={styles.label}>Years of Experience</label>
                <input
                  style={styles.input}
                  value={yearsExperience}
                  onChange={(event) => setYearsExperience(event.target.value)}
                  inputMode="numeric"
                />
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "112px", height: "112px", borderRadius: "999px", overflow: "hidden", backgroundColor: "#E5E7EB" }}>
                <ImageWithFallback src={profilePhotoUrl} alt="Provider" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <button
                style={{ ...styles.button, ...styles.secondaryButton, padding: "10px 14px" }}
                onClick={() => pickImage(setProfilePhotoUrl)}
              >
                <Camera size={16} />
                Photo
              </button>
            </div>
          </div>
        </div>

        <div style={styles.card}>
          <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#111827", marginBottom: "20px" }}>
            Cover Photo
          </h2>
          <div style={{ height: "180px", borderRadius: "12px", overflow: "hidden", backgroundColor: "#E5E7EB", marginBottom: "16px" }}>
            <ImageWithFallback src={coverPhotoUrl} alt="Cover" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <button style={{ ...styles.button, ...styles.secondaryButton }} onClick={() => pickImage(setCoverPhotoUrl)}>
            <Camera size={16} />
            Change Cover
          </button>
        </div>

        <div style={styles.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", marginBottom: "16px" }}>
            <div>
              <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#111827", marginBottom: "4px" }}>
                Services & Pricing
              </h2>
              <p style={{ fontSize: "14px", color: "#6B7280" }}>Services are stored in provider_services.</p>
            </div>
            <button style={{ ...styles.button, ...styles.primaryButton }} onClick={() => navigate("/provider/edit-services")}>
              Edit Services
              <ChevronRight size={16} />
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
            {services.filter((service) => service.isActive).map((service) => (
              <div key={service.id} style={{ padding: "16px", backgroundColor: "#F9FAFB", borderRadius: "10px", border: "1px solid #E5E7EB" }}>
                <h3 style={{ fontSize: "15px", fontWeight: "700", color: "#111827", marginBottom: "4px" }}>{service.name}</h3>
                <p style={{ fontSize: "13px", color: "#6B7280", marginBottom: "8px" }}>{service.description}</p>
                <p style={{ fontSize: "14px", fontWeight: "700", color: "#00BF63" }}>PHP {service.baseRate} {service.priceUnit}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, backgroundColor: "white", borderTop: "1px solid #E5E7EB", padding: "16px 32px" }}>
        <div style={{ maxWidth: "960px", margin: "0 auto", display: "flex", justifyContent: "flex-end", gap: "12px" }}>
          <button style={{ ...styles.button, ...styles.secondaryButton }} onClick={() => navigate("/provider/profile")}>
            Cancel
          </button>
          <button style={{ ...styles.button, ...styles.primaryButton }} onClick={handleSave}>
            <Save size={16} />
            Save Profile
          </button>
        </div>
      </div>
    </div>
  );
}
