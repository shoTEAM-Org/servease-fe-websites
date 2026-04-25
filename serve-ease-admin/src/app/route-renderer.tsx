"use client";

import type { ComponentType, ReactNode } from "react";

import { ProtectedRoute } from "./components/ProtectedRoute";
import { RootLayout } from "./components/layouts/RootLayout";
import { AddNewAdmin } from "./pages/AddNewAdmin";
import { AllBookings } from "./pages/AllBookings";
import { Categories } from "./pages/Categories";
import { Dashboard } from "./pages/Dashboard";
import { DisputesResolutions } from "./pages/DisputesResolutions";
import { FailedPayments } from "./pages/FailedPayments";
import { Finance } from "./pages/Finance";
import { ForgotPassword } from "./pages/ForgotPassword";
import { OngoingServices } from "./pages/OngoingServices";
import { PayoutRequests } from "./pages/PayoutRequests";
import { Profile } from "./pages/Profile";
import { ProviderApplicationReview } from "./pages/ProviderApplicationReview";
import { ProviderApplications } from "./pages/ProviderApplications";
import { ProviderEarnings } from "./pages/ProviderEarnings";
import {
  BookingAnalytics,
  BusinessReports,
  ComplianceReports,
  FinancialReports,
  PerformanceReports,
  Revenue,
  UserReports,
} from "./pages/reports";
import { ServiceAreas } from "./pages/ServiceAreas";
import { ServiceProviderDetails } from "./pages/ServiceProviderDetails";
import { ServiceProviders } from "./pages/ServiceProviders";
import { Services } from "./pages/Services";
import { Settings } from "./pages/Settings";
import { SupportTickets } from "./pages/SupportTickets";
import { Transactions } from "./pages/Transactions";
import { Login } from "./pages/Login";
import { Navigate, RouteContextProvider } from "@/lib/react-router-compat";

type RouteEntry = {
  component: ComponentType;
  layout?: boolean;
  path: string;
  protected?: boolean;
};

type MatchedRoute = {
  component: ComponentType;
  layout: boolean;
  params: Record<string, string>;
  protected: boolean;
};

const ROUTES: RouteEntry[] = [
  { path: "/", component: () => <Navigate to="/dashboard" replace />, protected: true },
  { path: "/login", component: Login },
  { path: "/forgot-password", component: ForgotPassword },
  { path: "/dashboard", component: Dashboard, protected: true, layout: true },
  { path: "/profile", component: Profile, protected: true, layout: true },
  { path: "/settings", component: Settings, protected: true, layout: true },
  { path: "/service-providers", component: ServiceProviders, protected: true, layout: true },
  { path: "/service-providers/:id", component: ServiceProviderDetails, protected: true, layout: true },
  { path: "/provider-applications", component: ProviderApplications, protected: true, layout: true },
  {
    path: "/provider-applications/:applicationId",
    component: ProviderApplicationReview,
    protected: true,
    layout: true,
  },
  { path: "/approval-queue", component: ProviderApplications, protected: true, layout: true },
  {
    path: "/approval-queue/:applicationId",
    component: ProviderApplicationReview,
    protected: true,
    layout: true,
  },
  { path: "/bookings", component: AllBookings, protected: true, layout: true },
  { path: "/ongoing-services", component: OngoingServices, protected: true, layout: true },
  { path: "/disputes", component: DisputesResolutions, protected: true, layout: true },
  { path: "/disputes-resolutions", component: DisputesResolutions, protected: true, layout: true },
  { path: "/support", component: SupportTickets, protected: true, layout: true },
  { path: "/transactions", component: Transactions, protected: true, layout: true },
  { path: "/finance", component: Finance, protected: true, layout: true },
  { path: "/provider-earnings", component: ProviderEarnings, protected: true, layout: true },
  { path: "/payouts", component: PayoutRequests, protected: true, layout: true },
  { path: "/payout-requests", component: PayoutRequests, protected: true, layout: true },
  { path: "/failed-payments", component: FailedPayments, protected: true, layout: true },
  { path: "/categories", component: Categories, protected: true, layout: true },
  { path: "/services", component: Services, protected: true, layout: true },
  { path: "/service-areas", component: ServiceAreas, protected: true, layout: true },
  { path: "/reports/revenue", component: Revenue, protected: true, layout: true },
  { path: "/reports/booking-analytics", component: BookingAnalytics, protected: true, layout: true },
  { path: "/reports/business", component: BusinessReports, protected: true, layout: true },
  { path: "/reports/financial", component: FinancialReports, protected: true, layout: true },
  { path: "/reports/user", component: UserReports, protected: true, layout: true },
  { path: "/reports/performance", component: PerformanceReports, protected: true, layout: true },
  { path: "/reports/compliance", component: ComplianceReports, protected: true, layout: true },
  { path: "/add-new-admin", component: AddNewAdmin, protected: true, layout: true },
];

function normalizePath(pathname: string) {
  if (!pathname) {
    return "/";
  }

  return pathname !== "/" && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
}

function matchRoute(pathname: string): MatchedRoute | null {
  const normalizedPath = normalizePath(pathname);

  for (const route of ROUTES) {
    const routeSegments = route.path.split("/").filter(Boolean);
    const pathSegments = normalizedPath.split("/").filter(Boolean);

    if (routeSegments.length !== pathSegments.length) {
      continue;
    }

    const params: Record<string, string> = {};
    let matches = true;

    for (let index = 0; index < routeSegments.length; index += 1) {
      const routeSegment = routeSegments[index];
      const pathSegment = pathSegments[index];

      if (routeSegment.startsWith(":")) {
        params[routeSegment.slice(1)] = decodeURIComponent(pathSegment);
        continue;
      }

      if (routeSegment !== pathSegment) {
        matches = false;
        break;
      }
    }

    if (matches) {
      return {
        component: route.component,
        layout: route.layout ?? false,
        params,
        protected: route.protected ?? false,
      };
    }
  }

  return null;
}

function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
      <div className="max-w-md text-center">
        <h1 className="text-3xl font-bold text-gray-900">Page not found</h1>
        <p className="mt-3 text-gray-600">
          The requested route is not wired into the Next migration yet.
        </p>
      </div>
    </div>
  );
}

export function RouteRenderer({ pathname }: { pathname: string }) {
  const matched = matchRoute(pathname);

  if (!matched) {
    return <NotFoundPage />;
  }

  const PageComponent = matched.component;
  const page = <PageComponent />;
  const routeContext = (
    <RouteContextProvider
      outlet={matched.layout ? page : null}
      params={matched.params}
      pathname={pathname}
    >
      {matched.layout ? <RootLayout /> : page}
    </RouteContextProvider>
  );

  let content: ReactNode = routeContext;

  if (matched.protected) {
    content = <ProtectedRoute>{content}</ProtectedRoute>;
  }

  return content;
}
