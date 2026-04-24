export type ProviderApplicationStatus = "pending" | "approved" | "rejected";

export interface ProviderApplicationSummary {
  applicationId: string;
  businessName: string;
  ownerName: string;
  category: string;
  dateApplied: string;
  location: string;
  status: ProviderApplicationStatus;
  providerId: string;
  reviewedAt?: string | null;
  rejectionReason?: string | null;
}

const STORAGE_KEY = "servease_admin_provider_applications";
const CHANGE_EVENT = "servease-admin-provider-applications-change";

const providerApplicationSeed: ProviderApplicationSummary[] = [
  {
    applicationId: "APP-2026-0234",
    businessName: "Tutor Excellence Hub",
    ownerName: "Roberto Miguel Cruz",
    category: "Education & Professional Services",
    dateApplied: "2026-03-01",
    location: "Taguig City, Metro Manila",
    status: "pending",
    providerId: "SE-ED-003",
  },
  {
    applicationId: "APP-2026-0235",
    businessName: "Wellness Massage Therapy",
    ownerName: "Carmen Grace Alvarez",
    category: "Beauty Wellness & Personal Care",
    dateApplied: "2026-03-03",
    location: "Manila City, Metro Manila",
    status: "pending",
    providerId: "SE-BW-009",
  },
  {
    applicationId: "APP-2026-0236",
    businessName: "Prime Cleaning Solutions",
    ownerName: "Fernando Jose Santos",
    category: "Domestic & Cleaning Services",
    dateApplied: "2026-03-02",
    location: "Quezon City, Metro Manila",
    status: "pending",
    providerId: "SE-DC-016",
  },
  {
    applicationId: "APP-2026-0237",
    businessName: "AutoCare Express",
    ownerName: "Leonardo David Reyes",
    category: "Automotive & Tech Support",
    dateApplied: "2026-03-04",
    location: "Makati City, Metro Manila",
    status: "pending",
    providerId: "SE-AT-017",
  },
  {
    applicationId: "APP-2026-0238",
    businessName: "PetCare Veterinary Services",
    ownerName: "Victoria Anne Lopez",
    category: "Pet Services",
    dateApplied: "2026-03-03",
    location: "Pasig City, Metro Manila",
    status: "pending",
    providerId: "SE-PS-018",
  },
  {
    applicationId: "APP-2026-0239",
    businessName: "EventMasters Pro",
    ownerName: "Christopher James Diaz",
    category: "Events & Entertainment",
    dateApplied: "2026-03-01",
    location: "Pasay City, Metro Manila",
    status: "pending",
    providerId: "SE-EE-019",
  },
  {
    applicationId: "APP-2026-0240",
    businessName: "HandyFix Home Services",
    ownerName: "Michelle Anne Garcia",
    category: "Home Maintenance & Repair",
    dateApplied: "2026-03-02",
    location: "Mandaluyong City, Metro Manila",
    status: "pending",
    providerId: "SE-HM-020",
  },
  {
    applicationId: "APP-2026-0228",
    businessName: "ElectroPro Electricians",
    ownerName: "Antonio Carlos Rivera",
    category: "Home Maintenance & Repair",
    dateApplied: "2024-01-20",
    location: "Malabon City, Metro Manila",
    status: "approved",
    providerId: "SE-HM-015",
  },
  {
    applicationId: "APP-2026-0215",
    businessName: "HomeFixPro Manila",
    ownerName: "Juan Carlos Reyes",
    category: "Home Maintenance & Repair",
    dateApplied: "2024-01-10",
    location: "Makati City, Metro Manila",
    status: "approved",
    providerId: "SE-HM-001",
  },
  {
    applicationId: "APP-2026-0221",
    businessName: "Glow Beauty Spa",
    ownerName: "Maria Elena Santos",
    category: "Beauty Wellness & Personal Care",
    dateApplied: "2024-02-15",
    location: "Quezon City, Metro Manila",
    status: "approved",
    providerId: "SE-BW-002",
  },
  {
    applicationId: "APP-2026-0198",
    businessName: "QuickTech Repairs",
    ownerName: "Santiago Miguel Torres",
    category: "Automotive & Tech Support",
    dateApplied: "2023-12-05",
    location: "Valenzuela City, Metro Manila",
    status: "rejected",
    providerId: "SE-AT-021",
  },
  {
    applicationId: "APP-2026-0205",
    businessName: "CleanSwift Services",
    ownerName: "Angelica Rose Mendoza",
    category: "Domestic & Cleaning Services",
    dateApplied: "2024-01-08",
    location: "Paranaque City, Metro Manila",
    status: "rejected",
    providerId: "SE-DC-022",
  },
];

function cloneApplications(applications: ProviderApplicationSummary[]) {
  return applications.map((application) => ({ ...application }));
}

function isBrowser() {
  return typeof window !== "undefined";
}

function dispatchApplicationsChange() {
  if (!isBrowser()) {
    return;
  }

  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function subscribeProviderApplications(listener: () => void) {
  if (!isBrowser()) {
    return () => undefined;
  }

  const handleChange = () => listener();
  window.addEventListener(CHANGE_EVENT, handleChange);
  window.addEventListener("storage", handleChange);

  return () => {
    window.removeEventListener(CHANGE_EVENT, handleChange);
    window.removeEventListener("storage", handleChange);
  };
}

function normalizeApplicationStatus(value: unknown): ProviderApplicationStatus {
  if (value === "approved" || value === "rejected") {
    return value;
  }
  return "pending";
}

function normalizeApplications(rawApplications: unknown): ProviderApplicationSummary[] {
  if (!Array.isArray(rawApplications)) {
    return cloneApplications(providerApplicationSeed);
  }

  const normalizedApplications = rawApplications
    .map((application) => {
      if (!application || typeof application !== "object") {
        return null;
      }

      const record = application as Partial<ProviderApplicationSummary>;
      if (
        typeof record.applicationId !== "string" ||
        typeof record.businessName !== "string" ||
        typeof record.ownerName !== "string" ||
        typeof record.category !== "string" ||
        typeof record.dateApplied !== "string" ||
        typeof record.location !== "string" ||
        typeof record.providerId !== "string"
      ) {
        return null;
      }

      return {
        applicationId: record.applicationId,
        businessName: record.businessName,
        ownerName: record.ownerName,
        category: record.category,
        dateApplied: record.dateApplied,
        location: record.location,
        status: normalizeApplicationStatus(record.status),
        providerId: record.providerId,
        reviewedAt: record.reviewedAt ?? null,
        rejectionReason: record.rejectionReason ?? null,
      } satisfies ProviderApplicationSummary;
    })
    .filter(Boolean) as ProviderApplicationSummary[];

  return normalizedApplications.length > 0
    ? normalizedApplications
    : cloneApplications(providerApplicationSeed);
}

function readApplications(): ProviderApplicationSummary[] {
  if (!isBrowser()) {
    return cloneApplications(providerApplicationSeed);
  }

  const storedApplications = window.localStorage.getItem(STORAGE_KEY);
  if (!storedApplications) {
    return cloneApplications(providerApplicationSeed);
  }

  try {
    return normalizeApplications(JSON.parse(storedApplications));
  } catch {
    return cloneApplications(providerApplicationSeed);
  }
}

function writeApplications(applications: ProviderApplicationSummary[]) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
  dispatchApplicationsChange();
}

export function getProviderApplications() {
  return readApplications();
}

export function getProviderApplicationById(applicationId: string) {
  const normalizedApplicationId = String(applicationId || "").trim();
  if (!normalizedApplicationId) {
    return null;
  }

  return (
    readApplications().find(
      (application) => application.applicationId === normalizedApplicationId,
    ) || null
  );
}

export function getProviderApplicationStatus(applicationId: string) {
  return getProviderApplicationById(applicationId)?.status ?? null;
}

export function updateProviderApplicationStatus(
  applicationId: string,
  status: ProviderApplicationStatus,
  rejectionReason?: string,
) {
  const normalizedApplicationId = String(applicationId || "").trim();
  if (!normalizedApplicationId) {
    return null;
  }

  const normalizedStatus = normalizeApplicationStatus(status);
  const applications = readApplications();
  const currentApplication = applications.find(
    (application) => application.applicationId === normalizedApplicationId,
  );

  if (!currentApplication || currentApplication.status !== "pending" || normalizedStatus === "pending") {
    return currentApplication ?? null;
  }

  const nextApplications = applications.map((application) => {
    if (application.applicationId !== normalizedApplicationId) {
      return application;
    }

    return {
      ...application,
      status: normalizedStatus,
      reviewedAt: new Date().toISOString(),
      rejectionReason:
        normalizedStatus === "rejected"
          ? String(rejectionReason || "").trim() || null
          : null,
    };
  });

  writeApplications(nextApplications);
  return (
    nextApplications.find(
      (application) => application.applicationId === normalizedApplicationId,
    ) || null
  );
}

export function resetProviderApplications() {
  const resetApplications = cloneApplications(providerApplicationSeed);
  writeApplications(resetApplications);
  return resetApplications;
}
