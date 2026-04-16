import { useEffect, useState } from "react";
import {
  Activity,
  AlertCircle,
  BarChart2,
  ChevronRight,
  ClipboardList,
  CreditCard,
  Loader2,
  MessageSquare,
  Package,
  Star,
  TrendingUp,
  UserCheck,
  Users,
  Wallet,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { KPICard } from "../components/shared/KPICard";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import { useNavigate } from "@/lib/react-router-compat";
import { useAuth } from "../contexts/AuthContext";
import { fetchAdminJson } from "../lib/adminApi";

type RevenueReportResponse = {
  total_revenue: number;
  platform_fees: number;
  net_to_providers: number;
  transaction_count: number;
};

type BookingAnalyticsResponse = {
  total: number;
  by_status: Record<string, number>;
};

type UserReportResponse = {
  total: number;
  by_role: Record<string, number>;
  by_status: Record<string, number>;
};

type OngoingServicesResponse = {
  bookings: Array<{
    id: string;
    status?: string;
    provider_name?: string;
    customer_name?: string;
    scheduled_at?: string;
  }>;
};

type DisputesResponse = {
  disputes: Array<{
    id: string;
    status?: string;
    created_at?: string;
  }>;
  total: number;
};

type SupportTicketsResponse = {
  tickets: Array<{
    id: string;
    status?: string;
    created_at?: string;
    subject?: string;
  }>;
  total: number;
};

type PayoutsResponse = {
  payouts: Array<{
    id: string;
    status?: string;
    provider_id?: string;
    created_at?: string;
  }>;
  total: number;
};

type FailedPaymentsResponse = {
  payments: Array<{
    id: string;
    created_at?: string;
  }>;
  total: number;
};

type PerformanceReportResponse = {
  provider_profiles: Array<{
    user_id: string;
    business_name?: string;
    average_rating?: number;
    total_reviews?: number;
    trust_score?: number;
  }>;
  reviews: Array<unknown>;
};

type DashboardData = {
  revenue: RevenueReportResponse;
  bookings: BookingAnalyticsResponse;
  users: UserReportResponse;
  ongoing: OngoingServicesResponse;
  disputes: DisputesResponse;
  support: SupportTicketsResponse;
  payouts: PayoutsResponse;
  failed: FailedPaymentsResponse;
  performance: PerformanceReportResponse;
};

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function DashboardSkeleton() {
  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-40 w-full rounded-xl" />
        ))}
      </div>
      <div className="space-y-6">
        <Skeleton className="h-[320px] w-full rounded-xl" />
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <Skeleton className="h-[320px] w-full rounded-xl" />
          <Skeleton className="h-[320px] w-full rounded-xl" />
        </div>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <Skeleton className="h-[320px] w-full rounded-xl" />
          <Skeleton className="h-[320px] w-full rounded-xl" />
        </div>
      </div>
    </>
  );
}

export function Dashboard() {
  const navigate = useNavigate();
  const { admin } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  const [isDashboardLoading, setIsDashboardLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        setIsDashboardLoading(true);
        setDashboardError(null);

        const [
          revenue,
          bookings,
          users,
          ongoing,
          disputes,
          support,
          payouts,
          failed,
          performance,
        ] = await Promise.all([
          fetchAdminJson<RevenueReportResponse>("/api/admin/v1/reports/revenue"),
          fetchAdminJson<BookingAnalyticsResponse>("/api/admin/v1/reports/bookings"),
          fetchAdminJson<UserReportResponse>("/api/admin/v1/reports/users"),
          fetchAdminJson<OngoingServicesResponse>("/api/admin/v1/operations/ongoing"),
          fetchAdminJson<DisputesResponse>("/api/admin/v1/operations/disputes?page=1&limit=50"),
          fetchAdminJson<SupportTicketsResponse>("/api/admin/v1/operations/support?page=1&limit=50"),
          fetchAdminJson<PayoutsResponse>("/api/admin/v1/finance/payouts?page=1&limit=50"),
          fetchAdminJson<FailedPaymentsResponse>("/api/admin/v1/finance/failed?page=1&limit=50"),
          fetchAdminJson<PerformanceReportResponse>("/api/admin/v1/reports/performance"),
        ]);

        if (!cancelled) {
          setDashboardData({
            revenue,
            bookings,
            users,
            ongoing,
            disputes,
            support,
            payouts,
            failed,
            performance,
          });
        }
      } catch (error) {
        if (!cancelled) {
          setDashboardError(error instanceof Error ? error.message : "Failed to load dashboard data.");
        }
      } finally {
        if (!cancelled) {
          setIsDashboardLoading(false);
        }
      }
    }

    void loadDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  const formattedDate = currentTime.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const formattedTime = currentTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const revenue = dashboardData?.revenue;
  const bookings = dashboardData?.bookings;
  const users = dashboardData?.users;
  const ongoing = dashboardData?.ongoing.bookings ?? [];
  const disputes = dashboardData?.disputes.disputes ?? [];
  const supportTickets = dashboardData?.support.tickets ?? [];
  const payouts = dashboardData?.payouts.payouts ?? [];
  const failedPayments = dashboardData?.failed.payments ?? [];
  const providerProfiles = dashboardData?.performance.provider_profiles ?? [];

  const pendingPayouts = payouts.filter((payout) => payout.status?.toLowerCase() === "pending").length;
  const openDisputes = disputes.filter((dispute) => {
    const status = dispute.status?.toLowerCase();
    return status === "open" || status === "under review";
  }).length;
  const openSupportTickets = supportTickets.filter((ticket) => {
    const status = ticket.status?.toLowerCase();
    return status === "open" || status === "pending";
  }).length;
  const activeBookings = (bookings?.by_status.confirmed || 0) + (bookings?.by_status.in_progress || 0);
  const completedBookings = bookings?.by_status.completed || 0;
  const cancelledBookings = bookings?.by_status.cancelled || 0;
  const activeProviders = users?.by_role.provider || 0;
  const activeCustomers = users?.by_role.customer || 0;
  const totalUsers = users?.total || 0;
  const activeAdmins = users?.by_role.admin || 0;
  const pendingUsers = users?.by_status.pending || 0;

  const userMixData = [
    { label: "Customers", value: activeCustomers },
    { label: "Providers", value: activeProviders },
    { label: "Admins", value: activeAdmins },
  ];

  const roleStatusData = [
    { category: "Providers", Active: activeProviders, Pending: pendingUsers },
    { category: "Customers", Active: activeCustomers, Pending: 0 },
    { category: "Admins", Active: activeAdmins, Pending: 0 },
  ];

  const bookingSnapshotData = [
    {
      period: "Current Snapshot",
      Active: activeBookings,
      Completed: completedBookings,
      Cancelled: cancelledBookings,
    },
  ];

  const revenueSnapshotData = [
    {
      date: MONTH_LABELS[new Date().getMonth()],
      revenue: (revenue?.total_revenue || 0) / 1000,
      commission: (revenue?.platform_fees || 0) / 1000,
      payouts: (revenue?.net_to_providers || 0) / 1000,
    },
  ];

  const queueData = [
    { type: "Pending Payouts", count: pendingPayouts, fill: "#f59e0b" },
    { type: "Open Disputes", count: openDisputes, fill: "#ef4444" },
    { type: "Support Tickets", count: openSupportTickets, fill: "#3b82f6" },
    { type: "Failed Payments", count: dashboardData?.failed.total || 0, fill: "#8b5cf6" },
  ];

  const topProviders = [...providerProfiles]
    .sort((left, right) => Number(right.trust_score || 0) - Number(left.trust_score || 0))
    .slice(0, 5)
    .map((provider, index) => ({
      rank: index + 1,
      name: provider.business_name || `Provider ${index + 1}`,
      trustScore: Number(provider.trust_score || 0),
      rating: Number(provider.average_rating || 0),
      reviews: Number(provider.total_reviews || 0),
    }));

  const activityItems = [
    {
      id: "ongoing",
      icon: Activity,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      title: `${ongoing.length} ongoing services`,
      description: ongoing[0]
        ? `${ongoing[0].customer_name || "Customer"} with ${ongoing[0].provider_name || "Provider"}`
        : "No active bookings right now.",
      time: "Operations",
    },
    {
      id: "disputes",
      icon: MessageSquare,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      title: `${openDisputes} disputes need review`,
      description: disputes[0]?.id ? `Latest dispute: ${disputes[0].id}` : "No disputes in the current queue.",
      time: "Support",
    },
    {
      id: "payouts",
      icon: Wallet,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      title: `${pendingPayouts} payout requests pending`,
      description: payouts[0]?.provider_id
        ? `Latest payout requested by ${payouts[0].provider_id}`
        : "No payout requests waiting right now.",
      time: "Finance",
    },
    {
      id: "failed",
      icon: CreditCard,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      title: `${dashboardData?.failed.total || 0} failed payments recorded`,
      description: failedPayments[0]?.id ? `Latest failed payment: ${failedPayments[0].id}` : "No failed payments recorded.",
      time: "Payments",
    },
  ];

  return (
    <div className="space-y-7">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <p className="text-sm text-gray-500 mb-1">
            {formattedDate} &nbsp;|&nbsp;
            <span className="font-mono tabular-nums">{formattedTime}</span>
          </p>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {admin?.name?.split(" ")[0] || "Admin"}
          </h1>
          <p className="text-gray-500 mt-1">Live admin metrics pulled from your backend endpoints.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="text-gray-600 border-gray-200 gap-2"
            onClick={() => navigate("/reports/revenue")}
          >
            <BarChart2 className="w-4 h-4" />
            View Reports
          </Button>
          <Button
            size="sm"
            className="bg-[#16A34A] hover:bg-[#15803D] text-white gap-2"
            onClick={() => navigate("/transactions")}
          >
            <ClipboardList className="w-4 h-4" />
            Review Finance Queue ({pendingPayouts})
          </Button>
        </div>
      </div>

      {dashboardError ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-start gap-3 p-6 text-red-700">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Dashboard data could not be loaded</p>
              <p className="mt-1 text-sm">{dashboardError}</p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {isDashboardLoading ? (
        <DashboardSkeleton />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <KPICard
              title="Total Revenue"
              value={`PHP ${Number(revenue?.total_revenue || 0).toLocaleString()}`}
              change={`${revenue?.transaction_count || 0} paid transactions`}
              icon={TrendingUp}
              status="success"
              sparklineData={[Number(revenue?.total_revenue || 0)]}
            />
            <KPICard
              title="Platform Fees"
              value={`PHP ${Number(revenue?.platform_fees || 0).toLocaleString()}`}
              change={`${pendingPayouts} payouts pending`}
              icon={Wallet}
              status="info"
              sparklineData={[Number(revenue?.platform_fees || 0)]}
            />
            <KPICard
              title="Active Bookings"
              value={activeBookings}
              change={`${completedBookings} completed / ${cancelledBookings} cancelled`}
              icon={Activity}
              status="warning"
              sparklineData={[activeBookings, completedBookings, cancelledBookings]}
            />
            <KPICard
              title="Users"
              value={totalUsers}
              change={`${activeCustomers} customers / ${activeProviders} providers / ${activeAdmins} admins`}
              icon={Users}
              status="info"
              sparklineData={[activeCustomers, activeProviders, activeAdmins]}
            />
          </div>

          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-800">Platform Performance</h2>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Users className="w-6 h-6 text-[#00BF63]" />
                  User Mix
                </CardTitle>
                <p className="text-sm text-gray-500 mt-1">Live user counts by role from the reports endpoint</p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={userMixData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis dataKey="label" stroke="#6b7280" tick={{ fontSize: 13 }} tickLine={false} />
                    <YAxis stroke="#6b7280" tick={{ fontSize: 13 }} tickLine={false} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#00BF63" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <UserCheck className="w-6 h-6 text-[#00BF63]" />
                    Role Status Snapshot
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={roleStatusData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                      <XAxis dataKey="category" stroke="#6b7280" tick={{ fontSize: 12 }} />
                      <YAxis stroke="#6b7280" />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="Active" stackId="a" fill="#00BF63" radius={[0, 0, 0, 0]} />
                      <Bar dataKey="Pending" stackId="a" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <TrendingUp className="w-6 h-6 text-[#00BF63]" />
                    Revenue Snapshot
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={320}>
                    <LineChart data={revenueSnapshotData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                      <XAxis dataKey="date" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="revenue" stroke="#00BF63" strokeWidth={3} />
                      <Line type="monotone" dataKey="commission" stroke="#3b82f6" strokeWidth={3} />
                      <Line type="monotone" dataKey="payouts" stroke="#f59e0b" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <AlertCircle className="w-6 h-6 text-[#00BF63]" />
                  Operations Queue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={queueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis dataKey="type" stroke="#6b7280" tick={{ fontSize: 12 }} />
                    <YAxis stroke="#6b7280" />
                    <Tooltip />
                    <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                      {queueData.map((entry) => (
                        <Cell key={entry.type} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Activity className="w-6 h-6 text-[#00BF63]" />
                  Booking Snapshot
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={bookingSnapshotData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis dataKey="period" stroke="#6b7280" tick={{ fontSize: 13 }} />
                    <YAxis stroke="#6b7280" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Active" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="Completed" fill="#00BF63" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="Cancelled" fill="#ef4444" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div>
                  <CardTitle className="text-base">Top Providers</CardTitle>
                  <p className="text-xs text-gray-500 mt-0.5">Ranked by trust score</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => navigate("/service-providers")}>
                  View All
                </Button>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {topProviders.length > 0 ? (
                    topProviders.map((provider) => (
                      <div
                        key={provider.rank}
                        className="flex items-center gap-4 p-3 border border-gray-100 rounded-xl hover:border-[#00BF63]/40 hover:bg-[#F0FDF4] transition-all cursor-pointer group"
                        onClick={() => navigate("/service-providers")}
                      >
                        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-[#DCFCE7] flex items-center justify-center">
                          <span className="text-sm font-bold text-[#16A34A]">#{provider.rank}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate group-hover:text-[#16A34A] transition-colors">
                            {provider.name}
                          </p>
                          <div className="flex items-center gap-3 mt-1">
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                              <span className="text-xs text-gray-600">{provider.rating.toFixed(1)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Package className="w-3 h-3 text-gray-400" />
                              <span className="text-xs text-gray-600">{provider.reviews} reviews</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-[#16A34A]">{provider.trustScore.toFixed(1)}</p>
                          <p className="text-xs text-gray-400">trust score</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No provider performance data is available yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 flex flex-col">
              <CardHeader className="pb-3 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Live Queue Snapshot</CardTitle>
                    <p className="text-xs text-gray-500 mt-0.5">Current platform queues</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-gray-500 hover:text-[#16A34A] gap-1"
                    onClick={() => navigate("/transactions")}
                  >
                    Open Queue <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0 flex-1">
                <div className="overflow-y-auto max-h-[360px] divide-y divide-gray-50">
                  {activityItems.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-4 px-5 py-4 hover:bg-gray-50 transition-colors cursor-pointer group"
                    >
                      <div className={`flex-shrink-0 p-2 rounded-lg ${activity.iconBg}`}>
                        <activity.icon className={`w-4 h-4 ${activity.iconColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 group-hover:text-[#16A34A] transition-colors">
                          {activity.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5 truncate">{activity.description}</p>
                      </div>
                      <span className="flex-shrink-0 text-xs text-gray-400 whitespace-nowrap mt-0.5">
                        {activity.time}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {isDashboardLoading ? (
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading live dashboard metrics...
        </div>
      ) : null}
    </div>
  );
}
