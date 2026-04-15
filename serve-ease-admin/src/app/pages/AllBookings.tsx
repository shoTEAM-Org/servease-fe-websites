import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Search,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  DollarSign,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { fetchAdminJson } from "../lib/adminApi";

type BookingTab = "all" | "upcoming" | "ongoing" | "completed" | "cancelled";

type BookingRow = {
  id: string;
  booking_id: string;
  status: string;
  payment_status: string;
  amount: number;
  scheduled_at: string | null;
  created_at: string | null;
  customer_id: string | null;
  provider_id: string | null;
  service_id: string | null;
  service_description: string | null;
  category_id: string | null;
  customer_name: string;
  customer_email: string;
  provider_name: string;
  provider_email: string;
};

type BookingsResponse = {
  bookings: BookingRow[];
  total: number;
  page: number;
  limit: number;
};

const LIMIT = 50;

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function normalizeBooking(raw: Partial<BookingRow>): BookingRow {
  return {
    id: asString(raw.id),
    booking_id: asString(raw.booking_id, asString(raw.id)),
    status: asString(raw.status, "pending"),
    payment_status: asString(raw.payment_status, "pending"),
    amount: asNumber(raw.amount, 0),
    scheduled_at: typeof raw.scheduled_at === "string" ? raw.scheduled_at : null,
    created_at: typeof raw.created_at === "string" ? raw.created_at : null,
    customer_id: typeof raw.customer_id === "string" ? raw.customer_id : null,
    provider_id: typeof raw.provider_id === "string" ? raw.provider_id : null,
    service_id: typeof raw.service_id === "string" ? raw.service_id : null,
    service_description: typeof raw.service_description === "string" ? raw.service_description : null,
    category_id: typeof raw.category_id === "string" ? raw.category_id : null,
    customer_name: asString(raw.customer_name, "Unknown Customer"),
    customer_email: asString(raw.customer_email, "—"),
    provider_name: asString(raw.provider_name, "Unknown Provider"),
    provider_email: asString(raw.provider_email, "—"),
  };
}

function normalizeStatus(status: string): string {
  const s = status.toLowerCase();
  if (s === "in_progress") return "in progress";
  return s;
}

export function AllBookings() {
  const [data, setData] = useState<BookingsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);

  const [activeTab, setActiveTab] = useState<BookingTab>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setIsLoading(true);
        setError(null);
        const result = await fetchAdminJson<BookingsResponse>(
          `/api/admin/v1/operations/bookings?page=${page}&limit=${LIMIT}`
        );
        if (!cancelled) {
          const bookings = Array.isArray((result as { bookings?: unknown[] }).bookings)
            ? (result as { bookings: unknown[] }).bookings.map((raw) =>
                normalizeBooking((raw ?? {}) as Partial<BookingRow>)
              )
            : [];
          setData({
            bookings,
            total: asNumber((result as { total?: unknown }).total, bookings.length),
            page: asNumber((result as { page?: unknown }).page, page),
            limit: asNumber((result as { limit?: unknown }).limit, LIMIT),
          });
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load bookings.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [page]);

  const bookings = data?.bookings ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const status = normalizeStatus(booking.status);

      let matchesTab = true;
      switch (activeTab) {
        case "upcoming":
          matchesTab = status === "pending" || status === "confirmed";
          break;
        case "ongoing":
          matchesTab = status === "in progress";
          break;
        case "completed":
          matchesTab = status === "completed";
          break;
        case "cancelled":
          matchesTab = status === "cancelled";
          break;
        case "all":
        default:
          matchesTab = true;
      }

      const needle = searchTerm.toLowerCase();
      const matchesSearch =
        booking.booking_id.toLowerCase().includes(needle) ||
        booking.customer_name.toLowerCase().includes(needle) ||
        booking.provider_name.toLowerCase().includes(needle);

      const matchesCategory = categoryFilter === "all" || booking.category_id === categoryFilter;

      let matchesDate = true;
      if (dateFilter !== "all") {
        const dateSource = booking.scheduled_at || booking.created_at;
        if (!dateSource) {
          matchesDate = false;
        } else {
          const bookingDate = new Date(dateSource);
          const today = new Date();
          const daysDiff = Math.floor((today.getTime() - bookingDate.getTime()) / (1000 * 60 * 60 * 24));
          switch (dateFilter) {
            case "today":
              matchesDate = daysDiff === 0;
              break;
            case "week":
              matchesDate = daysDiff <= 7;
              break;
            case "month":
              matchesDate = daysDiff <= 30;
              break;
          }
        }
      }

      return matchesTab && matchesSearch && matchesCategory && matchesDate;
    });
  }, [bookings, activeTab, searchTerm, categoryFilter, dateFilter]);

  const stats = useMemo(() => {
    const totalCount = filteredBookings.length;
    const completed = filteredBookings.filter((b) => normalizeStatus(b.status) === "completed").length;
    const inProgress = filteredBookings.filter((b) => normalizeStatus(b.status) === "in progress").length;
    const cancelled = filteredBookings.filter((b) => normalizeStatus(b.status) === "cancelled").length;
    const totalRevenue = filteredBookings
      .filter((b) => normalizeStatus(b.status) === "completed" && normalizeStatus(b.payment_status) === "paid")
      .reduce((sum, b) => sum + b.amount, 0);
    const completionRate = totalCount > 0 ? (completed / totalCount) * 100 : 0;

    return { totalCount, completed, inProgress, cancelled, totalRevenue, completionRate };
  }, [filteredBookings]);

  const getStatusBadge = (status: string) => {
    const normalized = normalizeStatus(status);
    if (normalized === "completed") {
      return (
        <Badge className="bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]">
          <CheckCircle className="w-3 h-3 mr-1" />
          Completed
        </Badge>
      );
    }
    if (normalized === "in progress") {
      return (
        <Badge className="bg-blue-100 text-blue-700 border-blue-200">
          <Activity className="w-3 h-3 mr-1" />
          In Progress
        </Badge>
      );
    }
    if (normalized === "confirmed") {
      return (
        <Badge className="bg-purple-100 text-purple-700 border-purple-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          Confirmed
        </Badge>
      );
    }
    if (normalized === "pending") {
      return (
        <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
          <Clock className="w-3 h-3 mr-1" />
          Pending
        </Badge>
      );
    }
    return (
      <Badge className="bg-red-100 text-red-700 border-red-200">
        <XCircle className="w-3 h-3 mr-1" />
        Cancelled
      </Badge>
    );
  };

  const getPaymentBadge = (status: string) => {
    const normalized = normalizeStatus(status);
    if (normalized === "paid") return <Badge className="bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]">Paid</Badge>;
    if (normalized === "refunded") return <Badge className="bg-gray-100 text-gray-700 border-gray-200">Refunded</Badge>;
    if (normalized === "failed") return <Badge className="bg-red-100 text-red-700 border-red-200">Failed</Badge>;
    return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Pending</Badge>;
  };

  const categoryIds = Array.from(
    new Set(bookings.map((b) => b.category_id).filter((value): value is string => Boolean(value)))
  ).sort();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">All Bookings</h1>
        <p className="text-gray-500 mt-1">Manage and monitor all service bookings across the platform</p>
      </div>

      {error ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-start gap-3 p-6 text-red-700">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Failed to load bookings</p>
              <p className="mt-1 text-sm">{error}</p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-50">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Bookings</p>
                <p className="text-xl font-bold text-gray-900">{stats.totalCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#DCFCE7]">
                <CheckCircle className="w-5 h-5 text-[#16A34A]" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Completed</p>
                <p className="text-xl font-bold text-gray-900">{stats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-50">
                <Activity className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">In Progress</p>
                <p className="text-xl font-bold text-gray-900">{stats.inProgress}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-50">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Cancelled</p>
                <p className="text-xl font-bold text-gray-900">{stats.cancelled}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#DCFCE7]">
                <DollarSign className="w-5 h-5 text-[#16A34A]" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Revenue</p>
                <p className="text-xl font-bold text-gray-900">₱{(stats.totalRevenue / 1000).toFixed(1)}K</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-50">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Completion Rate</p>
                <p className="text-xl font-bold text-gray-900">{stats.completionRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Booking List</CardTitle>
            <div className="flex items-center gap-2 border border-gray-200 rounded-lg p-1">
              {(["all", "upcoming", "ongoing", "completed", "cancelled"] as BookingTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab ? "bg-[#16A34A] text-white" : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {tab === "all"
                    ? "All"
                    : tab === "upcoming"
                    ? "Upcoming"
                    : tab === "ongoing"
                    ? "Ongoing"
                    : tab === "completed"
                    ? "Completed"
                    : "Cancelled"}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by ID, customer, provider..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categoryIds.map((categoryId) => (
                  <SelectItem key={categoryId} value={categoryId}>
                    {categoryId}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border border-gray-200">
            <Table className="min-w-[1220px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[150px] text-gray-700 font-semibold">Booking ID</TableHead>
                  <TableHead className="min-w-[200px] text-gray-700 font-semibold">Customer</TableHead>
                  <TableHead className="min-w-[200px] text-gray-700 font-semibold">Provider</TableHead>
                  <TableHead className="min-w-[220px] text-gray-700 font-semibold">Service</TableHead>
                  <TableHead className="min-w-[170px] text-gray-700 font-semibold">Scheduled Date</TableHead>
                  <TableHead className="min-w-[110px] text-gray-700 font-semibold">Amount</TableHead>
                  <TableHead className="min-w-[120px] text-gray-700 font-semibold">Status</TableHead>
                  <TableHead className="min-w-[110px] text-gray-700 font-semibold">Payment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      Loading bookings...
                    </TableCell>
                  </TableRow>
                ) : filteredBookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      No bookings found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>
                        <span className="font-mono font-bold text-[#15803D]">{booking.booking_id}</span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">{booking.customer_name}</p>
                          <p className="text-xs text-gray-500">{booking.customer_email || "—"}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">{booking.provider_name}</p>
                          <p className="text-xs text-gray-500">{booking.category_id || "—"}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-800 whitespace-normal">{booking.service_description || "—"}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {booking.scheduled_at
                            ? new Date(booking.scheduled_at).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "—"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-bold text-gray-900">₱{booking.amount.toLocaleString()}</span>
                      </TableCell>
                      <TableCell>{getStatusBadge(booking.status)}</TableCell>
                      <TableCell>{getPaymentBadge(booking.payment_status)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-gray-500">
              {total === 0 ? "No bookings" : `Page ${page} of ${totalPages} (${total.toLocaleString()} total)`}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1 || isLoading}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages || isLoading}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
