"use client";

import type { ComponentType, ReactNode } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { BookingDetailsPage } from "./components/BookingDetailsPage";
import { BookingRequestDetailsPage } from "./components/BookingRequestDetailsPage";
import { BookingRequestsPage } from "./components/BookingRequestsPage";
import { BlockTimePage } from "./components/BlockTimePage";
import { CalendarPage } from "./components/CalendarPage";
import { CancelBookingPage } from "./components/CancelBookingPage";
import { CounterOfferModalPage } from "./components/CounterOfferModalPage";
import { CounterOfferPage } from "./components/CounterOfferPage";
import { DashboardPage } from "./components/DashboardPage";
import { EditProfilePage } from "./components/EditProfilePage";
import { EditServicesPricingPage } from "./components/EditServicesPricingPage";
import { Layout } from "./components/Layout";
import { LegalPage } from "./components/LegalPage";
import { LoginPage } from "./components/LoginPage";
import { MessagesPage } from "./components/MessagesPage";
import { NotificationsPage } from "./components/NotificationsPage";
import { NotificationPreferencesPage } from "./components/NotificationPreferencesPage";
import { OnboardingPage } from "./components/OnboardingPage";
import { SignupPage } from "./components/signup";
import { PayoutConfirmationPage } from "./components/PayoutConfirmationPage";
import { PayoutPage } from "./components/PayoutPage";
import { PortfolioManagementPage } from "./components/PortfolioManagementPage";
import { ProviderAnalyticsPage } from "./components/ProviderAnalyticsPage";
import { ProviderEarningsDashboard } from "./components/ProviderEarningsDashboard";
import { ProviderEarningsDetails } from "./components/ProviderEarningsDetails";
import { ProviderHelpCenterPage } from "./components/ProviderHelpCenterPage";
import { ProviderPerformanceInsightsPage } from "./components/ProviderPerformanceInsightsPage";
import { ProviderProfilePage } from "./components/ProviderProfilePage";
import { CustomerProfilePage } from "./components/CustomerProfilePage";
import { ProviderReviewsPage } from "./components/ProviderReviewsPage";
import { ProviderSettingsPage } from "./components/ProviderSettingsPage";
import { RequestPayoutPage } from "./components/RequestPayoutPage";
import { SetAvailabilityPage } from "./components/SetAvailabilityPage";
import { UnifiedBookingsPage } from "./components/UnifiedBookingsPage";
import { ContactSupportPage } from "./components/ContactSupportPage";
import { ProviderCommunityPage } from "./components/ProviderCommunityPage";
import { RegistrationSuccessPage } from "./components/RegistrationSuccessPage";
import { RouteContextProvider } from "@/lib/react-router-compat";
import { isUserAuthenticated } from "./auth";

type RouteEntry = {
  component: ComponentType;
  layout?: boolean;
  path: string;
};

type MatchedRoute = {
  component: ComponentType;
  layout: boolean;
  params: Record<string, string>;
};

const ROUTES: RouteEntry[] = [
  { path: "/", component: LoginPage },
  { path: "/login", component: LoginPage },
  { path: "/registration-success", component: RegistrationSuccessPage },
  { path: "/registration-sucess", component: RegistrationSuccessPage },
  { path: "/signup", component: SignupPage },
  { path: "/provider/apply", component: SignupPage },
  { path: "/provider/dashboard", component: DashboardPage, layout: true },
  { path: "/provider/onboarding", component: OnboardingPage, layout: true },
  { path: "/provider/bookings", component: UnifiedBookingsPage, layout: true },
  { path: "/provider/requests", component: BookingRequestsPage, layout: true },
  { path: "/provider/booking-details/:id", component: BookingDetailsPage, layout: true },
  { path: "/provider/request-details/:id", component: BookingRequestDetailsPage, layout: true },
  { path: "/provider/counter-offer/:id", component: CounterOfferModalPage, layout: true },
  { path: "/provider/cancel-booking/:id", component: CancelBookingPage, layout: true },
  { path: "/provider/counter-offer", component: CounterOfferPage, layout: true },
  { path: "/provider/earningsdashboard", component: ProviderEarningsDashboard, layout: true },
  { path: "/provider/earningsdetails", component: ProviderEarningsDetails, layout: true },
  { path: "/provider/reviews", component: ProviderReviewsPage, layout: true },
  { path: "/provider/performanceinsights", component: ProviderPerformanceInsightsPage, layout: true },
  { path: "/provider/analytics", component: ProviderAnalyticsPage, layout: true },
  { path: "/provider/calendar", component: CalendarPage, layout: true },
  { path: "/provider/availability", component: SetAvailabilityPage, layout: true },
  { path: "/provider-agreement", component: () => <LegalPage title="Provider Agreement" lastUpdated="April 10, 2024" />, layout: true },
  { path: "/terms-and-conditions", component: () => <LegalPage title="Terms and Conditions" lastUpdated="April 10, 2024" />, layout: true },
  { path: "/privacy-policy", component: () => <LegalPage title="Privacy Policy" lastUpdated="April 10, 2024" />, layout: true },
  { path: "/provider/block-time", component: BlockTimePage, layout: true },
  { path: "/provider/payout", component: PayoutPage, layout: true },
  { path: "/provider/request-payout", component: RequestPayoutPage, layout: true },
  { path: "/provider/payout-confirmation", component: PayoutConfirmationPage, layout: true },
  { path: "/provider/profile", component: ProviderProfilePage, layout: true },
  { path: "/provider/customer-profile/:id", component: CustomerProfilePage, layout: true },
  { path: "/provider/edit-profile", component: EditProfilePage, layout: true },
  { path: "/provider/edit-services", component: EditServicesPricingPage, layout: true },
  { path: "/provider/portfolio", component: PortfolioManagementPage, layout: true },
  { path: "/provider/settings", component: ProviderSettingsPage, layout: true },
  { path: "/provider/help-center", component: ProviderHelpCenterPage, layout: true },
  { path: "/provider/contact-support", component: ContactSupportPage, layout: true },
  { path: "/provider/community", component: ProviderCommunityPage, layout: true },
  { path: "/provider/messages", component: MessagesPage, layout: true },
  {
    path: "/provider/notification-preferences",
    component: NotificationPreferencesPage,
    layout: true,
  },
  {
    path: "/provider/notifications",
    component: NotificationsPage,
    layout: true,
  },
];

function normalizePath(pathname: string) {
  if (!pathname) {
    return "/";
  }

  return pathname !== "/" && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
}

function isProtectedPath(pathname: string) {
  return pathname === "/provider" || pathname.startsWith("/provider/");
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
  const router = useRouter();
  const matched = matchRoute(pathname);
  const normalizedPath = normalizePath(pathname);
  const requiresAuth = isProtectedPath(normalizedPath);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    setIsAuthenticated(isUserAuthenticated());
    setAuthChecked(true);
  }, [pathname]);

  useEffect(() => {
    if (!authChecked) {
      return;
    }

    if (requiresAuth && !isAuthenticated) {
      router.replace("/login");
    }
  }, [authChecked, requiresAuth, isAuthenticated, router]);

  if (!matched) {
    return <NotFoundPage />;
  }

  if (requiresAuth && !authChecked) {
    return null;
  }

  if (requiresAuth && !isAuthenticated) {
    return <LoginPage />;
  }

  const PageComponent = matched.component;
  const page = <PageComponent />;

  let content: ReactNode = page;

  if (matched.layout) {
    content = (
      <RouteContextProvider outlet={page} params={matched.params} pathname={pathname}>
        <Layout />
      </RouteContextProvider>
    );
  } else {
    content = (
      <RouteContextProvider outlet={null} params={matched.params} pathname={pathname}>
        {page}
      </RouteContextProvider>
    );
  }

  return content;
}
