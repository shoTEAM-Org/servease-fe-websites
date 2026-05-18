import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ADMIN_PREFERENCES_CHANGED_EVENT,
  readAdminPreferences,
  type AdminLanguage,
  type AdminPreferences,
} from "../utils/preferences";

type TranslationKey =
  | "header.searchPlaceholder"
  | "header.notifications"
  | "header.markAllRead"
  | "header.loadingNotifications"
  | "header.noNotifications"
  | "header.viewAllNotifications"
  | "header.adminUser"
  | "header.superAdmin"
  | "header.viewProfile"
  | "header.settings"
  | "header.activityLog"
  | "header.signOut"
  | "sidebar.adminDashboard"
  | "sidebar.dashboard"
  | "sidebar.overview"
  | "sidebar.userManagement"
  | "sidebar.customers"
  | "sidebar.serviceProviders"
  | "sidebar.approvalQueue"
  | "sidebar.operations"
  | "sidebar.allBookings"
  | "sidebar.ongoingServices"
  | "sidebar.disputes"
  | "sidebar.support"
  | "sidebar.finance"
  | "sidebar.transactions"
  | "sidebar.providerEarnings"
  | "sidebar.payoutRequests"
  | "sidebar.refundManagement"
  | "sidebar.failedPayments"
  | "sidebar.marketplaceMarketing"
  | "sidebar.categories"
  | "sidebar.services"
  | "sidebar.serviceAreas"
  | "sidebar.promotions"
  | "sidebar.broadcasts"
  | "sidebar.reportsAnalytics"
  | "sidebar.revenue"
  | "sidebar.bookingAnalytics"
  | "sidebar.businessReports"
  | "sidebar.financialReports"
  | "sidebar.userReports"
  | "sidebar.performanceReports"
  | "sidebar.complianceReports"
  | "sidebar.platformSettings"
  | "sidebar.commission"
  | "sidebar.adminRolesPermissions"
  | "sidebar.securitySettings"
  | "sidebar.notificationSettings"
  | "sidebar.logsAuditTrail"
  | "sidebar.integrations"
  | "sidebar.expandSidebar"
  | "sidebar.collapseSidebar"
  | "sidebar.collapse"
  | "settings.pageTitle"
  | "settings.pageSubtitle"
  | "settings.failedLoad"
  | "settings.notifications"
  | "settings.emailNotifications"
  | "settings.emailNotificationsDesc"
  | "settings.pushNotifications"
  | "settings.pushNotificationsDesc"
  | "settings.bookingAlerts"
  | "settings.bookingAlertsDesc"
  | "settings.paymentAlerts"
  | "settings.paymentAlertsDesc"
  | "settings.disputeAlerts"
  | "settings.disputeAlertsDesc"
  | "settings.regionalPreferences"
  | "settings.language"
  | "settings.selectLanguage"
  | "settings.filipino"
  | "settings.timezone"
  | "settings.selectTimezone"
  | "settings.appearance"
  | "settings.theme"
  | "settings.selectTheme"
  | "settings.light"
  | "settings.dark"
  | "settings.autoSystem"
  | "settings.themeDesc"
  | "settings.dataPrivacy"
  | "settings.dataRetentionPeriod"
  | "settings.selectPeriod"
  | "settings.dataRetentionDesc"
  | "settings.saveSettings"
  | "settings.saveSuccess"
  | "settings.saveFailed";

type Dictionary = Record<TranslationKey, string>;

const en: Dictionary = {
  "header.searchPlaceholder": "Search bookings, providers, customers...",
  "header.notifications": "Notifications",
  "header.markAllRead": "Mark all as read",
  "header.loadingNotifications": "Loading notifications...",
  "header.noNotifications": "No notifications",
  "header.viewAllNotifications": "View all notifications",
  "header.adminUser": "Admin User",
  "header.superAdmin": "Super Admin",
  "header.viewProfile": "View Profile",
  "header.settings": "Settings",
  "header.activityLog": "Activity Log",
  "header.signOut": "Sign Out",
  "sidebar.adminDashboard": "Admin Dashboard",
  "sidebar.dashboard": "Dashboard",
  "sidebar.overview": "Overview",
  "sidebar.userManagement": "User Management",
  "sidebar.customers": "Customers",
  "sidebar.serviceProviders": "Service Providers",
  "sidebar.approvalQueue": "Approval Queue",
  "sidebar.operations": "Operations",
  "sidebar.allBookings": "All Bookings",
  "sidebar.ongoingServices": "Ongoing Services",
  "sidebar.disputes": "Disputes",
  "sidebar.support": "Support",
  "sidebar.finance": "Finance",
  "sidebar.transactions": "Transactions",
  "sidebar.providerEarnings": "Provider Earnings",
  "sidebar.payoutRequests": "Payout Requests",
  "sidebar.refundManagement": "Refund Management",
  "sidebar.failedPayments": "Failed Payments",
  "sidebar.marketplaceMarketing": "Marketplace & Marketing",
  "sidebar.categories": "Categories",
  "sidebar.services": "Services",
  "sidebar.serviceAreas": "Service Areas",
  "sidebar.promotions": "Promotions",
  "sidebar.broadcasts": "Broadcasts",
  "sidebar.reportsAnalytics": "Reports & Analytics",
  "sidebar.revenue": "Revenue",
  "sidebar.bookingAnalytics": "Booking Analytics",
  "sidebar.businessReports": "Business Reports",
  "sidebar.financialReports": "Financial Reports",
  "sidebar.userReports": "User Reports",
  "sidebar.performanceReports": "Performance Reports",
  "sidebar.complianceReports": "Compliance Reports",
  "sidebar.platformSettings": "Platform Settings",
  "sidebar.commission": "Commission",
  "sidebar.adminRolesPermissions": "Admin Roles & Permissions",
  "sidebar.securitySettings": "Security Settings",
  "sidebar.notificationSettings": "Notification Settings",
  "sidebar.logsAuditTrail": "Logs & Audit Trail",
  "sidebar.integrations": "Integrations",
  "sidebar.expandSidebar": "Expand Sidebar",
  "sidebar.collapseSidebar": "Collapse Sidebar",
  "sidebar.collapse": "Collapse",
  "settings.pageTitle": "Account Settings",
  "settings.pageSubtitle": "Manage your account preferences and notification settings",
  "settings.failedLoad": "Failed to load settings API",
  "settings.notifications": "Notifications",
  "settings.emailNotifications": "Email Notifications",
  "settings.emailNotificationsDesc": "Receive email updates about platform activity",
  "settings.pushNotifications": "Push Notifications",
  "settings.pushNotificationsDesc": "Get real-time browser notifications",
  "settings.bookingAlerts": "Booking Alerts",
  "settings.bookingAlertsDesc": "Notify about new bookings and updates",
  "settings.paymentAlerts": "Payment Alerts",
  "settings.paymentAlertsDesc": "Get notified about payments and payouts",
  "settings.disputeAlerts": "Dispute Alerts",
  "settings.disputeAlertsDesc": "Alert when disputes are filed",
  "settings.regionalPreferences": "Regional & Preferences",
  "settings.language": "Language",
  "settings.selectLanguage": "Select language",
  "settings.filipino": "Filipino",
  "settings.timezone": "Timezone",
  "settings.selectTimezone": "Select timezone",
  "settings.appearance": "Appearance",
  "settings.theme": "Theme",
  "settings.selectTheme": "Select theme",
  "settings.light": "Light",
  "settings.dark": "Dark",
  "settings.autoSystem": "Auto (System)",
  "settings.themeDesc": "Choose your preferred color theme",
  "settings.dataPrivacy": "Data & Privacy",
  "settings.dataRetentionPeriod": "Data Retention Period",
  "settings.selectPeriod": "Select period",
  "settings.dataRetentionDesc": "How long to keep historical data",
  "settings.saveSettings": "Save Settings",
  "settings.saveSuccess": "Settings saved successfully",
  "settings.saveFailed": "Failed to save settings",
};

const fil: Dictionary = {
  "header.searchPlaceholder": "Maghanap ng booking, provider, customer...",
  "header.notifications": "Mga Abiso",
  "header.markAllRead": "Markahan lahat bilang nabasa",
  "header.loadingNotifications": "Nilo-load ang mga abiso...",
  "header.noNotifications": "Walang abiso",
  "header.viewAllNotifications": "Tingnan lahat ng abiso",
  "header.adminUser": "Admin User",
  "header.superAdmin": "Super Admin",
  "header.viewProfile": "Tingnan ang Profile",
  "header.settings": "Settings",
  "header.activityLog": "Activity Log",
  "header.signOut": "Mag-sign out",
  "sidebar.adminDashboard": "Admin Dashboard",
  "sidebar.dashboard": "Dashboard",
  "sidebar.overview": "Pangkalahatang Tanaw",
  "sidebar.userManagement": "Pamamahala ng User",
  "sidebar.customers": "Mga Customer",
  "sidebar.serviceProviders": "Mga Service Provider",
  "sidebar.approvalQueue": "Pila ng Approval",
  "sidebar.operations": "Operasyon",
  "sidebar.allBookings": "Lahat ng Booking",
  "sidebar.ongoingServices": "Mga Kasalukuyang Serbisyo",
  "sidebar.disputes": "Mga Alitan",
  "sidebar.support": "Suporta",
  "sidebar.finance": "Pananalapi",
  "sidebar.transactions": "Mga Transaksyon",
  "sidebar.providerEarnings": "Kita ng Provider",
  "sidebar.payoutRequests": "Mga Hiling na Payout",
  "sidebar.refundManagement": "Pamamahala ng Refund",
  "sidebar.failedPayments": "Mga Nabigong Bayad",
  "sidebar.marketplaceMarketing": "Marketplace at Marketing",
  "sidebar.categories": "Mga Kategorya",
  "sidebar.services": "Mga Serbisyo",
  "sidebar.serviceAreas": "Mga Service Area",
  "sidebar.promotions": "Mga Promosyon",
  "sidebar.broadcasts": "Mga Broadcast",
  "sidebar.reportsAnalytics": "Mga Ulat at Analytics",
  "sidebar.revenue": "Kita",
  "sidebar.bookingAnalytics": "Booking Analytics",
  "sidebar.businessReports": "Mga Ulat Pangnegosyo",
  "sidebar.financialReports": "Mga Ulat Pinansyal",
  "sidebar.userReports": "Mga Ulat ng User",
  "sidebar.performanceReports": "Mga Ulat sa Performance",
  "sidebar.complianceReports": "Mga Ulat sa Compliance",
  "sidebar.platformSettings": "Platform Settings",
  "sidebar.commission": "Komisyon",
  "sidebar.adminRolesPermissions": "Mga Role at Permission ng Admin",
  "sidebar.securitySettings": "Security Settings",
  "sidebar.notificationSettings": "Settings ng Abiso",
  "sidebar.logsAuditTrail": "Logs at Audit Trail",
  "sidebar.integrations": "Integrations",
  "sidebar.expandSidebar": "Palawakin ang Sidebar",
  "sidebar.collapseSidebar": "Paliitin ang Sidebar",
  "sidebar.collapse": "Paliitin",
  "settings.pageTitle": "Account Settings",
  "settings.pageSubtitle": "Pamahalaan ang iyong account preferences at notification settings",
  "settings.failedLoad": "Hindi ma-load ang settings API",
  "settings.notifications": "Mga Abiso",
  "settings.emailNotifications": "Email Notifications",
  "settings.emailNotificationsDesc": "Tumanggap ng email update tungkol sa activity ng platform",
  "settings.pushNotifications": "Push Notifications",
  "settings.pushNotificationsDesc": "Tumanggap ng real-time browser notification",
  "settings.bookingAlerts": "Booking Alerts",
  "settings.bookingAlertsDesc": "Abiso para sa bagong booking at updates",
  "settings.paymentAlerts": "Payment Alerts",
  "settings.paymentAlertsDesc": "Tumanggap ng abiso tungkol sa bayad at payout",
  "settings.disputeAlerts": "Dispute Alerts",
  "settings.disputeAlertsDesc": "Mag-abiso kapag may bagong dispute",
  "settings.regionalPreferences": "Rehiyonal at Preferences",
  "settings.language": "Wika",
  "settings.selectLanguage": "Pumili ng wika",
  "settings.filipino": "Filipino",
  "settings.timezone": "Timezone",
  "settings.selectTimezone": "Pumili ng timezone",
  "settings.appearance": "Hitsura",
  "settings.theme": "Theme",
  "settings.selectTheme": "Pumili ng theme",
  "settings.light": "Maliwanag",
  "settings.dark": "Madilim",
  "settings.autoSystem": "Awtomatiko (System)",
  "settings.themeDesc": "Piliin ang gusto mong color theme",
  "settings.dataPrivacy": "Data at Privacy",
  "settings.dataRetentionPeriod": "Panahon ng Data Retention",
  "settings.selectPeriod": "Pumili ng period",
  "settings.dataRetentionDesc": "Gaano katagal itatago ang historical data",
  "settings.saveSettings": "I-save ang Settings",
  "settings.saveSuccess": "Matagumpay na na-save ang settings",
  "settings.saveFailed": "Hindi na-save ang settings",
};

const dictionaries: Record<AdminLanguage, Dictionary> = { en, fil };

interface LanguageContextValue {
  language: AdminLanguage;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

function getInitialLanguage(): AdminLanguage {
  const stored = readAdminPreferences();
  if (stored) return stored.language;
  if (typeof document !== "undefined" && document.documentElement.lang === "fil") return "fil";
  return "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<AdminLanguage>(getInitialLanguage);

  useEffect(() => {
    const onPreferenceChange = (event: Event) => {
      const detail = (event as CustomEvent<AdminPreferences>).detail;
      if (detail?.language === "en" || detail?.language === "fil") {
        setLanguage(detail.language);
        return;
      }
      const stored = readAdminPreferences();
      if (stored) setLanguage(stored.language);
    };

    const onStorage = (event: StorageEvent) => {
      if (!event.key || event.key === "servease_admin_preferences") {
        const stored = readAdminPreferences();
        if (stored) setLanguage(stored.language);
      }
    };

    window.addEventListener(ADMIN_PREFERENCES_CHANGED_EVENT, onPreferenceChange as EventListener);
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener(ADMIN_PREFERENCES_CHANGED_EVENT, onPreferenceChange as EventListener);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const value = useMemo<LanguageContextValue>(() => {
    const dictionary = dictionaries[language] ?? dictionaries.en;
    return {
      language,
      t: (key: TranslationKey) => dictionary[key] ?? dictionaries.en[key],
    };
  }, [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useTranslation must be used within a LanguageProvider");
  return context;
}
