import { createBrowserRouter, Navigate } from "react-router";
import { RootLayout } from "./components/layouts/RootLayout";
import { useAuth } from "../contexts/AuthContext";
import { Login } from "./pages/Login";
import { GoogleCallback } from "./pages/GoogleCallback";
import { MfaVerify } from "./pages/MfaVerify";
import { Dashboard } from "./pages/Dashboard";
import { ApprovalQueue } from "./pages/ApprovalQueue";
import { ServiceProviders } from "./pages/ServiceProviders";
import { AllBookings } from "./pages/AllBookings";
import { OngoingServices } from "./pages/OngoingServices";
import { DisputesResolutions } from "./pages/DisputesResolutions";
import { Transactions } from "./pages/Transactions";
import { ProviderEarnings } from "./pages/ProviderEarnings";
import { PayoutRequests } from "./pages/PayoutRequests";
import { RefundManagement } from "./pages/RefundManagement";
import { FailedPayments } from "./pages/FailedPayments";
import { ReportsInsights } from "./pages/ReportsInsights";
import { Reports } from "./pages/Reports";
import { CommissionSettings } from "./pages/CommissionSettings";
import { Support } from "./pages/Support";
import { PromoCodes, Broadcasts } from "./pages/MarketingPages";
import {
  AdminRoles,
  NotificationSettings,
  SecuritySettings,
  AuditTrail,
} from "./pages/PlatformSettingsPages";
import { AddAdmin } from "./pages/AddAdmin";
import { AdminProfile } from "./pages/AdminProfile";
import { Customers } from "./pages/PlaceholderPages";
import { Integrations } from "./pages/Integrations";
import { ProviderApplicationReview } from "./pages/ProviderApplicationReview";
import { ServiceProviderDetails } from "./pages/ServiceProviderDetails";

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { token, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading…</div>;
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/auth/google/callback",
    Component: GoogleCallback,
  },
  {
    path: "/mfa-verify",
    Component: MfaVerify,
  },
  {
    path: "/",
    element: <AuthGuard><RootLayout /></AuthGuard>,
    children: [
      { index: true, Component: Dashboard },
      { path: "customers", Component: Customers },
      { path: "service-providers", Component: ServiceProviders },
      { path: "service-providers/:id", Component: ServiceProviderDetails },
      { path: "approval-queue", Component: ApprovalQueue },
      { path: "approval-queue/:id", Component: ProviderApplicationReview },
      { path: "bookings", Component: AllBookings },
      { path: "ongoing-services", Component: OngoingServices },
      { path: "disputes-resolutions", Component: DisputesResolutions },
      { path: "transactions", Component: Transactions },
      { path: "provider-earnings", Component: ProviderEarnings },
      { path: "payout-requests", Component: PayoutRequests },
      { path: "refund-management", Component: RefundManagement },
      { path: "failed-payments", Component: FailedPayments },
      { path: "support", Component: Support },
      { path: "promo-codes", Component: PromoCodes },
      { path: "broadcasts", Component: Broadcasts },
      { path: "reports", Component: Reports },
      { path: "reports-insights", Component: ReportsInsights },
      { path: "commission-settings", Component: CommissionSettings },
      { path: "admin-roles", Component: AdminRoles },
      { path: "add-admin", Component: AddAdmin },
      { path: "admin-profile", Component: AdminProfile },
      { path: "notification-settings", Component: NotificationSettings },
      { path: "security-settings", Component: SecuritySettings },
      { path: "audit-trail", Component: AuditTrail },
      { path: "integrations", Component: Integrations },
    ],
  },
]);
