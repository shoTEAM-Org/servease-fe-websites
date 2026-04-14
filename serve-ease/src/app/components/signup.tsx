import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { AlertTriangle, Camera, Check as CheckIcon, ChevronDown, CloudUpload, Eye, EyeOff, FileText, X } from "lucide-react";

const categories = [
  "Home Maintenance & Repair",
  "Beauty, Wellness & Personal Care",
  "Education & Professional Services",
  "Domestic & Cleaning Services",
  "Pet Services",
  "Events & Entertainment",
  "Automotive & Tech Support",
];

const subCategories: Record<string, string[]> = {
  "Home Maintenance & Repair": ["Plumbing", "Electrical", "Carpentry", "Painting", "Other"],
  "Beauty, Wellness & Personal Care": ["Hair Styling", "Makeup Artist", "Massage Therapy", "Nails", "Other"],
  "Education & Professional Services": ["Academic Tutor", "Language Teacher", "Music Lessons", "Other"],
  "Domestic & Cleaning Services": ["House Cleaning", "Laundry", "Ironing", "Deep Cleaning", "Other"],
  "Pet Services": ["Pet Grooming", "Dog Walking", "Pet Sitting", "Other"],
  "Events & Entertainment": ["Photography", "Hosting/MC", "Catering", "DJ/Live Music", "Other"],
  "Automotive & Tech Support": ["Car Repair", "Car Wash", "PC/Laptop Repair", "Phone/Tablet Repair", "Other"],
};

const expLevels = ["Less than 1 year", "1-2 years", "3-5 years", "5-10 years", "More than 10 years"];
const idTypes = ["UMID", "Driver's License", "Philippine National ID (PhilID)", "Passport", "Postal ID"];

function hasAllowedEmailDomain(email: string) {
  return /^[^\s@]+@(gmail|yahoo)\.com$/i.test(email.trim());
}

function isAtLeast18(dob: string) {
  if (!dob) {
    return false;
  }

  const birthDate = new Date(dob);

  if (Number.isNaN(birthDate.getTime())) {
    return false;
  }

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDelta = today.getMonth() - birthDate.getMonth();

  if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }

  return age >= 18;
}

export function SignupPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [timeLeft, setTimeLeft] = useState(295);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showStepOneErrors, setShowStepOneErrors] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<"primary" | "sub" | "exp" | "idType" | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const otpInputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    dob: "",
    password: "",
    confirmPassword: "",
    primaryCategory: "",
    subCategory: "",
    experienceLevel: "",
    streetAddress: "",
    city: "",
    province: "",
    zipCode: "",
    radius: 10,
    idType: "",
    idDocument: "" as string,
    otp: ["", "", "", "", "", ""],
  });

  useEffect(() => {
    if (step !== 5 || timeLeft <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [step, timeLeft]);

  useEffect(() => {
    setOpenDropdown(null);
  }, [step]);

  const passwordCriteria = useMemo(
    () => ({
      length: formData.password.length >= 8,
      uppercase: /[A-Z]/.test(formData.password),
      lowercase: /[a-z]/.test(formData.password),
      number: /[0-9]/.test(formData.password),
    }),
    [formData.password],
  );

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const isStepInvalid =
    (step === 1 &&
      (!formData.fullName ||
        !formData.email ||
        !formData.phone ||
        !formData.dob ||
        !formData.password ||
        !hasAllowedEmailDomain(formData.email) ||
        !isAtLeast18(formData.dob) ||
        formData.password !== formData.confirmPassword)) ||
    (step === 2 && (!formData.primaryCategory || !formData.subCategory || !formData.experienceLevel)) ||
    (step === 3 && (!formData.streetAddress || !formData.city || !formData.province || !formData.zipCode)) ||
    (step === 4 && (!formData.idType || !formData.idDocument)) ||
    (step === 5 && formData.otp.some((digit) => !digit));

  const next = () => {
    if (step === 1) {
      setShowStepOneErrors(true);
    }

    if (isStepInvalid) {
      return;
    }

    if (step < 5) {
      setStep((prev) => prev + 1);
      return;
    }

    navigate("/registration-success");
  };

  const setOtpValue = (index: number, value: string) => {
    setFormData((prev) => {
      const nextOtp = [...prev.otp];
      nextOtp[index] = value;
      return { ...prev, otp: nextOtp };
    });
  };

  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    setOtpValue(index, digit);

    if (digit && index < formData.otp.length - 1) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !formData.otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }

    if (event.key === "ArrowLeft" && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }

    if (event.key === "ArrowRight" && index < formData.otp.length - 1) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (index: number, event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();

    const pastedDigits = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, formData.otp.length - index);

    if (!pastedDigits) {
      return;
    }

    setFormData((prev) => {
      const nextOtp = [...prev.otp];

      for (let i = 0; i < pastedDigits.length; i += 1) {
        nextOtp[index + i] = pastedDigits[i];
      }

      return { ...prev, otp: nextOtp };
    });

    const nextFocusIndex = Math.min(index + pastedDigits.length, formData.otp.length - 1);
    otpInputRefs.current[nextFocusIndex]?.focus();
  };

  const shouldShowDobAgeError =
    step === 1 &&
    (showStepOneErrors || formData.dob.length > 0) &&
    formData.dob.length > 0 &&
    !isAtLeast18(formData.dob);

  const subCategoryOptions = subCategories[formData.primaryCategory.trim()] ?? [];
  const radiusPercent = ((formData.radius - 1) / 49) * 100;
  const verificationEmail = formData.email.trim() || "user@example.com";

  return (
    <div style={styles.page}>
      <style>
        {`
          .service-radius-range {
            -webkit-appearance: none;
            appearance: none;
            width: 100%;
            height: 8px;
            border-radius: 999px;
            outline: none;
          }

          .service-radius-range::-webkit-slider-runnable-track {
            height: 8px;
            border-radius: 999px;
            background: transparent;
          }

          .service-radius-range::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 26px;
            height: 26px;
            border-radius: 50%;
            background: #ffffff;
            border: 3px solid #00b761;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
            margin-top: -9px;
            cursor: pointer;
          }

          .service-radius-range::-moz-range-track {
            height: 8px;
            border-radius: 999px;
            background: transparent;
          }

          .service-radius-range::-moz-range-thumb {
            width: 26px;
            height: 26px;
            border-radius: 50%;
            background: #ffffff;
            border: 3px solid #00b761;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
            cursor: pointer;
          }
        `}
      </style>
      <div style={styles.header}>
        <div style={{ ...styles.shell, ...styles.shellHeader }}>
          <button
            onClick={() => (step > 1 ? setStep((prev) => prev - 1) : navigate("/login"))}
            style={styles.backButton}
            type="button"
          >
            ←
          </button>
          <div>
            <h1 style={styles.headerTitle}>{headerTitle(step)}</h1>
            <p style={styles.headerSub}>Step {step} of 5</p>
          </div>
          <div style={{ width: 56 }} />
        </div>
      </div>

      <div style={styles.progressTrack}>
        <div style={{ ...styles.progressFill, width: `${(step / 5) * 100}%` }} />
      </div>

      <div style={styles.mainArea}>
        <div style={styles.shell}>
          <div style={styles.card}>
            {step === 1 && (
              <>
                <h2 style={styles.title}>Create your account</h2>
                <p style={styles.subtitle}>Fill in your personal details to get started.</p>

                <Label text="Full Name *" />
                <input
                  style={styles.input}
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />

                <Label text="Email Address *" />
                <input
                  style={styles.input}
                  type="email"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                <p style={styles.helperText}>Required for account creation</p>

                <Label text="Contact Number *" />
                <div style={styles.rowInput}>
                  <span style={styles.prefix}>+63</span>
                  <input
                    style={styles.inlineInput}
                    placeholder="9XX XXX XXXX"
                    value={formData.phone}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
                      setFormData({ ...formData, phone: digits.startsWith("9") ? digits : `9${digits.slice(0, 9)}` });
                    }}
                  />
                </div>
                <p style={styles.helperText}>Philippine mobile number (e.g. 9171234567)</p>

                <Label text="Date of Birth *" />
                <input
                  style={{
                    ...styles.input,
                    color: formData.dob ? "#0f172a" : "#9CA3AF",
                  }}
                  type="date"
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                />
                {shouldShowDobAgeError && (
                  <p style={styles.errorText}>You must be at least 18 years old to sign up.</p>
                )}

                <Label text="Password *" />
                <div style={styles.rowInput}>
                  {showPassword ? (
                    <input
                      key="password-visible"
                      style={styles.inlineInput}
                      type="text"
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      autoComplete="new-password"
                    />
                  ) : (
                    <input
                      key="password-hidden"
                      style={styles.inlineInput}
                      type="password"
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      autoComplete="new-password"
                    />
                  )}
                  <button
                    type="button"
                    style={styles.inlineButton}
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>

                <div style={styles.criteriaWrap}>
                  <p style={styles.criteriaTitle}>Password must contain:</p>
                  <Check met={passwordCriteria.length} label="At least 8 characters" />
                  <Check met={passwordCriteria.uppercase} label="One uppercase letter (A-Z)" />
                  <Check met={passwordCriteria.lowercase} label="One lowercase letter (a-z)" />
                  <Check met={passwordCriteria.number} label="One number (0-9)" />
                </div>

                <Label text="Confirm Password *" />
                <div style={styles.rowInput}>
                  {showConfirmPassword ? (
                    <input
                      key="confirm-password-visible"
                      style={styles.inlineInput}
                      type="text"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      autoComplete="new-password"
                    />
                  ) : (
                    <input
                      key="confirm-password-hidden"
                      style={styles.inlineInput}
                      type="password"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      autoComplete="new-password"
                    />
                  )}
                  <button
                    type="button"
                    style={styles.inlineButton}
                    onClick={() => setShowConfirmPassword((s) => !s)}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>
              </>
            )}

            {step === 2 && (
            <>
              <h2 style={styles.title}>Your Service Profile</h2>
              <p style={styles.subtitle}>Tell us what type of service you offer and your experience level.</p>

              <Label text="Primary Category *" />
              <div style={styles.dropdownWrap}>
                <button
                  type="button"
                  style={styles.dropdownTrigger}
                  onClick={() => setOpenDropdown((prev) => (prev === "primary" ? null : "primary"))}
                  aria-expanded={openDropdown === "primary"}
                >
                  <span style={formData.primaryCategory ? styles.dropdownValueSelected : styles.dropdownValuePlaceholder}>
                    {formData.primaryCategory || "Select your service category"}
                  </span>
                  <ChevronDown
                    size={18}
                    style={{
                      ...styles.dropdownChevron,
                      transform: openDropdown === "primary" ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                  />
                </button>
                {openDropdown === "primary" && (
                  <div style={styles.dropdownMenu}>
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        style={styles.dropdownOption}
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, primaryCategory: cat, subCategory: "" }));
                          setOpenDropdown(null);
                        }}
                      >
                        <span style={formData.primaryCategory === cat ? styles.dropdownOptionSelected : styles.dropdownOptionText}>
                          {cat}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <Label text="Sub-category *" />
              <div style={styles.dropdownWrap}>
                <button
                  type="button"
                  style={{
                    ...styles.dropdownTrigger,
                    ...(formData.primaryCategory && subCategoryOptions.length > 0 ? null : styles.dropdownTriggerDisabled),
                  }}
                  onClick={() => {
                    if (!formData.primaryCategory || subCategoryOptions.length === 0) {
                      return;
                    }
                    setOpenDropdown((prev) => (prev === "sub" ? null : "sub"));
                  }}
                  aria-expanded={openDropdown === "sub"}
                  disabled={!formData.primaryCategory || subCategoryOptions.length === 0}
                >
                  <span style={formData.subCategory ? styles.dropdownValueSelected : styles.dropdownValuePlaceholder}>
                    {formData.subCategory || "Select a sub-category"}
                  </span>
                  <ChevronDown
                    size={18}
                    style={{
                      ...styles.dropdownChevron,
                      transform: openDropdown === "sub" ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                  />
                </button>
                {openDropdown === "sub" && formData.primaryCategory && subCategoryOptions.length > 0 && (
                  <div style={styles.dropdownMenu}>
                    {subCategoryOptions.map((sub) => (
                      <button
                        key={sub}
                        type="button"
                        style={styles.dropdownOption}
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, subCategory: sub }));
                          setOpenDropdown(null);
                        }}
                      >
                        <span style={formData.subCategory === sub ? styles.dropdownOptionSelected : styles.dropdownOptionText}>
                          {sub}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <Label text="Experience Level *" />
              <div style={styles.dropdownWrap}>
                <button
                  type="button"
                  style={styles.dropdownTrigger}
                  onClick={() => setOpenDropdown((prev) => (prev === "exp" ? null : "exp"))}
                  aria-expanded={openDropdown === "exp"}
                >
                  <span style={formData.experienceLevel ? styles.dropdownValueSelected : styles.dropdownValuePlaceholder}>
                    {formData.experienceLevel || "Select years of experience"}
                  </span>
                  <ChevronDown
                    size={18}
                    style={{
                      ...styles.dropdownChevron,
                      transform: openDropdown === "exp" ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                  />
                </button>
                {openDropdown === "exp" && (
                  <div style={styles.dropdownMenu}>
                    {expLevels.map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        style={styles.dropdownOption}
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, experienceLevel: lvl }));
                          setOpenDropdown(null);
                        }}
                      >
                        <span style={formData.experienceLevel === lvl ? styles.dropdownOptionSelected : styles.dropdownOptionText}>
                          {lvl}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

            {step === 3 && (
            <>
              <h2 style={styles.title}>Where do you work?</h2>
              <p style={styles.subtitle}>Set your service area so customers can find you.</p>

              <Label text="Street Address / Landmark *" />
              <input
                style={styles.input}
                placeholder="e.g. 123 Rizal St, near SM"
                value={formData.streetAddress}
                onChange={(e) => setFormData({ ...formData, streetAddress: e.target.value })}
              />

              <Label text="City *" />
              <input
                style={styles.input}
                placeholder="Your City"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />

              <Label text="Province *" />
              <input
                style={styles.input}
                placeholder="Your Province"
                value={formData.province}
                onChange={(e) => setFormData({ ...formData, province: e.target.value })}
              />

              <Label text="ZIP Code *" />
              <input
                style={styles.input}
                placeholder="e.g. 1000"
                value={formData.zipCode}
                onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
              />

              <div style={styles.radiusLabelRow}>
                <p style={styles.radiusLabel}>
                  Maximum Service Radius
                  <span style={styles.requiredStar}> *</span>
                </p>
                <p style={styles.radiusValue}>
                  <span style={styles.radiusValueNumber}>{formData.radius}</span>
                  <span style={styles.radiusValueUnit}> km</span>
                </p>
              </div>
              <div style={styles.rangeTrackWrap}>
                <input
                  className="service-radius-range"
                  style={{
                    ...styles.rangeInput,
                    background: `linear-gradient(to right, #00B761 0%, #00B761 ${radiusPercent}%, #E5E7EB ${radiusPercent}%, #E5E7EB 100%)`,
                  }}
                  type="range"
                  min={1}
                  max={50}
                  value={formData.radius}
                  onChange={(e) => setFormData({ ...formData, radius: Number(e.target.value) })}
                />
              </div>
              <p style={styles.helperText}>How far are you willing to travel for service calls?</p>
            </>
          )}

            {step === 4 && (
            <>
              <h2 style={styles.title}>Verify your identity</h2>
              <p style={styles.subtitle}>Upload a valid Philippine government-issued ID.</p>

              <div style={styles.idWarningBox}>
                <AlertTriangle size={18} style={styles.idWarningIcon} />
                <p style={styles.idWarningText}>Please ensure your ID is clear, valid, and all details are visible.</p>
              </div>

              <Label text="Choose your ID Type *" bold={true} />
              <div style={styles.dropdownWrap}>
                <button
                  type="button"
                  style={styles.dropdownTrigger}
                  onClick={() => setOpenDropdown((prev) => (prev === "idType" ? null : "idType"))}
                  aria-expanded={openDropdown === "idType"}
                >
                  <span style={formData.idType ? styles.dropdownValueSelected : styles.dropdownValuePlaceholder}>
                    {formData.idType || "Select ID type"}
                  </span>
                  <ChevronDown
                    size={18}
                    style={{
                      ...styles.dropdownChevron,
                      transform: openDropdown === "idType" ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                  />
                </button>
                {openDropdown === "idType" && (
                  <div style={styles.dropdownMenu}>
                    {idTypes.map((idType) => (
                      <button
                        key={idType}
                        type="button"
                        style={styles.dropdownOption}
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, idType }));
                          setOpenDropdown(null);
                        }}
                      >
                        <span style={formData.idType === idType ? styles.dropdownOptionSelected : styles.dropdownOptionText}>
                          {idType}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <Label text="Upload your selected ID *" bold={false} />
              <input
                ref={fileInputRef}
                type="file"
                accept=".png,.jpg,.jpeg,.pdf"
                style={{ display: "none" }}
                onChange={(e) => {
                  const fileName = e.target.files?.[0]?.name ?? "";
                  setFormData((prev) => ({ ...prev, idDocument: fileName }));
                }}
              />

              {formData.idDocument ? (
                <div style={styles.uploadedDocBox}>
                  <div style={styles.uploadedDocIconWrap}>
                    <FileText size={18} color="#00B761" />
                  </div>
                  <div style={styles.uploadedDocMeta}>
                    <p style={styles.uploadedDocName}>{formData.idDocument}</p>
                    <p style={styles.uploadedDocSize}>File selected</p>
                  </div>
                  <button
                    type="button"
                    style={styles.removeDocButton}
                    onClick={() => setFormData((prev) => ({ ...prev, idDocument: "" }))}
                    aria-label="Remove selected document"
                  >
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <div style={styles.uploadDropzone}>
                  <div style={styles.uploadIconCircle}>
                    <CloudUpload size={28} color="#00B761" />
                  </div>
                  <p style={styles.uploadDropTitle}>Upload your selected ID</p>
                  <p style={styles.uploadDropSubtitle}>PNG, JPG or PDF • Max 5MB</p>

                  <div style={styles.uploadActionRow}>
                    <button
                      type="button"
                      style={styles.uploadBrowseButton}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <FileText size={16} />
                      <span>Browse</span>
                    </button>
                    <button
                      type="button"
                      style={styles.uploadScanButton}
                      onClick={() => setFormData((prev) => ({ ...prev, idDocument: "scanned_id.jpg" }))}
                    >
                      <Camera size={16} />
                      <span>Scan</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

            {step === 5 && (
            <>
              <h2 style={styles.title}>Verify your email</h2>
              <div style={styles.verificationMessageBox}>
                <p style={styles.verificationMessageText}>
                  We sent a 6-digit code to <span style={styles.verificationMessageEmail}>{verificationEmail}</span>. Enter it below to
                  complete your registration.
                </p>
              </div>

              <div style={styles.otpWrap}>
                {formData.otp.map((digit, index) => (
                  <input
                    key={index}
                    style={styles.otpInput}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    onPaste={(e) => handleOtpPaste(index, e)}
                    ref={(element) => {
                      otpInputRefs.current[index] = element;
                    }}
                    maxLength={1}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete="one-time-code"
                  />
                ))}
              </div>

              <div style={styles.verificationTimerCard}>
                <p style={styles.verificationTimerText}>Code expires in {formatTime(timeLeft)}</p>
                <div style={styles.verificationTimerNotice}>
                  <p style={styles.verificationTimerNoticeText}>The code must be used within its 5-minute validity period.</p>
                </div>
              </div>
            </>
            )}
          </div>
        </div>
      </div>

      <div style={styles.footer}>
        <div style={styles.shell}>
          <button type="button" style={{ ...styles.nextButton, ...(isStepInvalid ? styles.nextButtonDisabled : {}) }} onClick={next}>
            {step === 5 ? "Complete Registration" : "Next Step"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Label({ text, bold = true }: { text: string; bold?: boolean }) {
  const required = text.includes("*");
  const labelText = text.replace("*", "").trimEnd();

  return (
    <label style={{ ...styles.label, ...(bold ? null : styles.labelRegular) }}>
      {labelText}
      {required ? <span style={styles.requiredStar}> *</span> : null}
    </label>
  );
}

function Check({ label, met }: { label: string; met: boolean }) {
  return (
    <div style={styles.criteriaItem}>
      {met ? <CheckIcon size={14} style={styles.criteriaCheckIcon} /> : <span style={styles.criteriaDot} />}
      <p style={{ ...styles.criteriaText, ...(met ? styles.criteriaTextActive : {}) }}>{label}</p>
    </div>
  );
}

function headerTitle(step: number) {
  switch (step) {
    case 1:
      return "Personal Information";
    case 2:
      return "Provider Profile";
    case 3:
      return "Service Location";
    case 4:
      return "Document Upload";
    case 5:
      return "Email Verification";
    default:
      return "Provider Profile";
  }
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    background: "#F5F5F5",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
  },
  shell: {
    width: "100%",
    maxWidth: "760px",
    margin: "0 auto",
    padding: "0 20px",
  },
  header: {
    background: "#F5F5F5",
    borderBottom: "1px solid #E4E4E4",
    padding: "14px 0 10px",
    position: "sticky",
    top: 0,
    zIndex: 5,
  },
  shellHeader: {
    alignItems: "center",
    display: "flex",
    justifyContent: "space-between",
  },
  backButton: {
    background: "transparent",
    border: "none",
    color: "#0f172a",
    cursor: "pointer",
    fontSize: "24px",
    lineHeight: 1,
    padding: "4px 0",
  },
  headerTitle: {
    color: "#0f172a",
    fontSize: "18px",
    fontWeight: 700,
    margin: 0,
    textAlign: "center",
  },
  headerSub: {
    color: "#6b7280",
    fontSize: "12px",
    margin: "2px 0 0",
    textAlign: "center",
  },
  progressTrack: {
    background: "#E5E5E5",
    height: "6px",
  },
  progressFill: {
    background: "#00B761",
    borderRadius: "999px",
    height: "6px",
  },
  mainArea: {
    flex: 1,
    overflowY: "auto",
    paddingBottom: "120px",
  },
  card: {
    padding: "28px 0",
  },
  title: {
    color: "#0f172a",
    fontSize: "28px",
    fontWeight: 800,
    margin: "0 0 12px",
  },
  subtitle: {
    color: "#6b7280",
    fontSize: "16px",
    margin: "0 0 36px",
  },
  label: {
    color: "#111827",
    display: "block",
    fontSize: "14px",
    fontWeight: 700,
    marginBottom: "14px",
    marginTop: "20px",
  },
  labelRegular: {
    fontWeight: 500,
  },
  input: {
    background: "#EFEFEF",
    border: "1px solid #EFEFEF",
    borderRadius: "16px",
    marginBottom: "8px",
    padding: "16px 20px",
    fontSize: "15px",
    color: "#0f172a",
    width: "100%",
  },
  dropdownWrap: {
    position: "relative",
    marginBottom: "8px",
  },
  dropdownTrigger: {
    alignItems: "center",
    background: "#EFEFEF",
    border: "1px solid #EFEFEF",
    borderRadius: "16px",
    cursor: "pointer",
    display: "flex",
    justifyContent: "space-between",
    minHeight: "52px",
    padding: "14px 16px",
    textAlign: "left",
    width: "100%",
  },
  dropdownTriggerDisabled: {
    cursor: "not-allowed",
    opacity: 0.7,
  },
  dropdownValuePlaceholder: {
    color: "#9CA3AF",
    fontSize: "15px",
  },
  dropdownValueSelected: {
    color: "#1F2937",
    fontSize: "15px",
    fontWeight: 400,
  },
  dropdownChevron: {
    color: "#6B7280",
    flexShrink: 0,
    marginLeft: "12px",
    transition: "transform 0.25s ease",
  },
  dropdownMenu: {
    background: "#FFFFFF",
    border: "1px solid #E5E7EB",
    borderRadius: "12px",
    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.08)",
    left: 0,
    marginTop: "8px",
    maxHeight: "220px",
    overflowY: "auto",
    position: "absolute",
    right: 0,
    zIndex: 20,
  },
  dropdownOption: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    display: "block",
    padding: "11px 14px",
    textAlign: "left",
    width: "100%",
  },
  dropdownOptionText: {
    color: "#6B7280",
    fontSize: "14px",
    lineHeight: 1.4,
  },
  dropdownOptionSelected: {
    color: "#1F2937",
    fontSize: "14px",
    fontWeight: 600,
    lineHeight: 1.4,
  },
  rowInput: {
    alignItems: "center",
    background: "#EFEFEF",
    border: "1px solid #EFEFEF",
    borderRadius: "16px",
    display: "flex",
    marginBottom: "8px",
    overflow: "hidden",
  },
  inlineInput: {
    flex: 1,
    background: "transparent",
    border: "none",
    fontSize: "15px",
    color: "#0f172a",
    padding: "16px 20px",
    outline: "none",
  },
  prefix: {
    borderRight: "1px solid #D3D3D3",
    color: "#6b7280",
    fontSize: "15px",
    fontWeight: 600,
    padding: "0 16px",
  },
  inlineButton: {
    background: "transparent",
    border: "none",
    color: "#667085",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "13px",
    padding: "0 18px",
  },
  requiredStar: {
    color: "#EF4444",
  },
  helperText: {
    color: "#9CA3AF",
    fontSize: "12px",
    margin: "6px 0 4px",
  },
  radiusLabelRow: {
    alignItems: "center",
    display: "flex",
    justifyContent: "space-between",
    marginTop: "20px",
    marginBottom: "10px",
  },
  radiusLabel: {
    color: "#111827",
    fontSize: "14px",
    fontWeight: 700,
    margin: 0,
  },
  radiusValue: {
    margin: 0,
  },
  radiusValueNumber: {
    color: "#00B761",
    fontSize: "18px",
    fontWeight: 800,
    lineHeight: 1,
  },
  radiusValueUnit: {
    color: "#6B7280",
    fontSize: "12px",
    marginLeft: "4px",
    fontWeight: 500,
  },
  rangeTrackWrap: {
    marginTop: "2px",
    marginBottom: "4px",
  },
  rangeInput: {
    margin: 0,
    width: "100%",
  },
  idWarningBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "#F3ECD9",
    border: "1px solid #E8D7A8",
    borderRadius: "10px",
    padding: "12px 14px",
    marginBottom: "14px",
  },
  idWarningIcon: {
    color: "#B78300",
    flexShrink: 0,
  },
  idWarningText: {
    margin: 0,
    color: "#8A5A00",
    fontSize: "12px",
    lineHeight: 1.4,
  },
  uploadDropzone: {
    border: "1.5px dashed #18C56F",
    borderRadius: "14px",
    background: "#F8FFFB",
    minHeight: "210px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "22px",
    marginTop: "2px",
  },
  uploadIconCircle: {
    width: "64px",
    height: "64px",
    borderRadius: "999px",
    background: "#E6F8EE",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "12px",
  },
  uploadDropTitle: {
    margin: "0 0 4px",
    color: "#0F172A",
    fontSize: "18px",
    fontWeight: 800,
    textAlign: "center",
  },
  uploadDropSubtitle: {
    margin: "0 0 16px",
    color: "#7A7A7A",
    fontSize: "12px",
    textAlign: "center",
  },
  uploadActionRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  uploadBrowseButton: {
    border: "1px solid #00B761",
    background: "white",
    color: "#00B761",
    borderRadius: "999px",
    height: "38px",
    padding: "0 16px",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "14px",
  },
  uploadScanButton: {
    border: "none",
    background: "#00B761",
    color: "white",
    borderRadius: "999px",
    height: "38px",
    padding: "0 16px",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "14px",
  },
  uploadedDocBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    border: "1px solid #BFEED4",
    background: "#F7FFFB",
    borderRadius: "12px",
    padding: "10px 12px",
  },
  uploadedDocIconWrap: {
    width: "34px",
    height: "34px",
    borderRadius: "8px",
    background: "#E6F8EE",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },
  uploadedDocMeta: {
    flex: 1,
    minWidth: 0,
  },
  uploadedDocName: {
    margin: 0,
    color: "#0F172A",
    fontSize: "13px",
    fontWeight: 600,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  uploadedDocSize: {
    margin: "2px 0 0",
    color: "#7A7A7A",
    fontSize: "11px",
  },
  removeDocButton: {
    border: "none",
    background: "transparent",
    color: "#EF4444",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "4px",
  },
  errorText: {
    color: "#DC2626",
    fontSize: "12px",
    margin: "6px 0 0",
  },
  criteriaWrap: {
    margin: "14px 0 12px",
  },
  criteriaTitle: {
    color: "#71717A",
    fontSize: "13px",
    margin: "0 0 10px",
  },
  criteriaItem: {
    alignItems: "center",
    display: "flex",
    gap: "14px",
    margin: "10px 0",
  },
  criteriaDot: {
    width: "18px",
    height: "18px",
    borderRadius: "999px",
    border: "1px solid #CFCFCF",
    background: "transparent",
  },
  criteriaCheckIcon: {
    color: "#00B761",
    flexShrink: 0,
  },
  criteriaText: {
    color: "#71717A",
    fontSize: "14px",
    margin: 0,
  },
  criteriaTextActive: {
    color: "#14532D",
  },
  otpWrap: {
    display: "grid",
    gap: "8px",
    gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
    marginTop: "16px",
    marginBottom: "18px",
  },
  otpInput: {
    border: "1px solid #d1d5db",
    borderRadius: "10px",
    fontSize: "22px",
    fontWeight: 700,
    padding: "12px 0",
    textAlign: "center",
  },
  verificationMessageBox: {
    background: "transparent",
    border: "none",
    borderRadius: 0,
    padding: "0",
  },
  verificationMessageText: {
    margin: 0,
    color: "#7A7A7A",
    fontSize: "14px",
    lineHeight: 1.4,
  },
  verificationMessageEmail: {
    color: "#4B5563",
    fontWeight: 700,
  },
  verificationTimerCard: {
    border: "none",
    borderRadius: 0,
    overflow: "visible",
    background: "transparent",
  },
  verificationTimerText: {
    margin: 0,
    color: "#10B764",
    fontWeight: 700,
    fontSize: "17px",
    textAlign: "center",
    padding: "8px 0 10px",
    background: "transparent",
  },
  verificationTimerNotice: {
    background: "transparent",
    borderTop: "none",
    padding: "0",
  },
  verificationTimerNoticeText: {
    margin: 0,
    color: "#6B7280",
    fontSize: "14px",
    textAlign: "center",
    lineHeight: 1.4,
  },
  footer: {
    background: "#F5F5F5",
    borderTop: "1px solid #E4E4E4",
    bottom: 0,
    left: 0,
    padding: "14px 0 18px",
    position: "fixed",
    right: 0,
  },
  nextButton: {
    background: "#00B761",
    border: "none",
    borderRadius: "999px",
    color: "white",
    cursor: "pointer",
    fontSize: "18px",
    fontWeight: 700,
    padding: "16px 18px",
    width: "100%",
  },
  nextButtonDisabled: {
    background: "#9adfb9",
    cursor: "not-allowed",
  },
};
