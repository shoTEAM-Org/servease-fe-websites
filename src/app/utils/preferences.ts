export type AdminTheme = "light" | "dark" | "auto";
export type AdminLanguage = "en" | "fil";

export interface AdminPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  bookingAlerts: boolean;
  paymentAlerts: boolean;
  disputeAlerts: boolean;
  language: AdminLanguage;
  timezone: string;
  theme: AdminTheme;
  dataRetention: string;
}

export const ADMIN_PREFERENCES_STORAGE_KEY = "servease_admin_preferences";
export const ADMIN_PREFERENCES_CHANGED_EVENT = "servease-admin-preferences-changed";

export function defaultAdminPreferences(): AdminPreferences {
  return {
    emailNotifications: true,
    pushNotifications: false,
    bookingAlerts: true,
    paymentAlerts: true,
    disputeAlerts: true,
    language: "en",
    timezone: "Asia/Manila",
    theme: "light",
    dataRetention: "90",
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function isBooleanLike(value: unknown): value is boolean {
  return typeof value === "boolean";
}

function toBoolean(value: unknown, fallback: boolean): boolean {
  if (isBooleanLike(value)) return value;
  if (typeof value === "string") {
    if (value.toLowerCase() === "true") return true;
    if (value.toLowerCase() === "false") return false;
  }
  return fallback;
}

function toStringValue(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value : fallback;
}

export function normalizeAdminPreferences(value: unknown): AdminPreferences {
  const fallback = defaultAdminPreferences();
  if (!isRecord(value)) return fallback;

  return {
    emailNotifications: toBoolean(value.emailNotifications, fallback.emailNotifications),
    pushNotifications: toBoolean(value.pushNotifications, fallback.pushNotifications),
    bookingAlerts: toBoolean(value.bookingAlerts, fallback.bookingAlerts),
    paymentAlerts: toBoolean(value.paymentAlerts, fallback.paymentAlerts),
    disputeAlerts: toBoolean(value.disputeAlerts, fallback.disputeAlerts),
    language: value.language === "fil" ? "fil" : "en",
    timezone: toStringValue(value.timezone, fallback.timezone),
    theme: value.theme === "dark" || value.theme === "auto" ? value.theme : "light",
    dataRetention: toStringValue(value.dataRetention, fallback.dataRetention),
  };
}

export function readAdminPreferences(): AdminPreferences | null {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(ADMIN_PREFERENCES_STORAGE_KEY);
  if (!raw) return null;

  try {
    return normalizeAdminPreferences(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function persistAdminPreferences(preferences: AdminPreferences) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ADMIN_PREFERENCES_STORAGE_KEY, JSON.stringify(preferences));
  window.dispatchEvent(new CustomEvent(ADMIN_PREFERENCES_CHANGED_EVENT, { detail: preferences }));
}

export function applyAdminPreferences(preferences: AdminPreferences) {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  const resolvedTheme =
    preferences.theme === "auto"
      ? window.matchMedia?.("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : preferences.theme;

  root.classList.toggle("dark", resolvedTheme === "dark");
  root.lang = preferences.language;
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(ADMIN_PREFERENCES_CHANGED_EVENT, { detail: preferences }));
  }
}