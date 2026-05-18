import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Search, Users, TrendingUp, DollarSign, Package, CheckCircle, Plus, Megaphone, Send, Eye, Clock, BarChart2, AlertCircle } from "lucide-react";
import { useData } from "../../contexts/DataContext";
import { useEffect, useMemo, useState } from "react";
import type { Customer } from "../../types";
import { apiCall } from "../../hooks/useApi";

export function Customers() {
  const {
    customers,
    isLoadingCustomers,
    fetchCustomers,
    fetchCustomerDetails,
    updateCustomerStatus,
  } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    void fetchCustomers();
  }, [fetchCustomers]);

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = [
    {
      title: "Total Customers",
      value: customers.length.toString(),
      change: `${customers.filter((c) => c.status === "Active").length} active`,
      icon: Users,
      color: "text-[#16A34A]",
      bgColor: "bg-[#DCFCE7]",
    },
    {
      title: "Total Bookings",
      value: customers.reduce((sum, c) => sum + c.totalBookings, 0).toString(),
      change: "All time",
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Total Spent",
      value: `₱${(customers.reduce((sum, c) => sum + c.totalSpent, 0) / 1000).toFixed(1)}K`,
      change: "Platform revenue",
      icon: DollarSign,
      color: "text-[#16A34A]",
      bgColor: "bg-[#DCFCE7]",
    },
    {
      title: "Avg. Bookings per Customer",
      value: customers.length
        ? (customers.reduce((sum, c) => sum + c.totalBookings, 0) / customers.length).toFixed(1)
        : "0.0",
      change: "Engagement rate",
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  const handleViewCustomer = async (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDetailsOpen(true);
    const details = await fetchCustomerDetails(customer.id);
    if (details) {
      setSelectedCustomer(details);
    }
  };

  const handleStatusChange = async (customer: Customer, status: Customer["status"]) => {
    const result = await updateCustomerStatus(customer.id, status);
    if (result.success) {
      alert(`Customer status updated to ${status}.`);
    }
  };

  const getStatusBadgeClass = (status: Customer["status"]) => {
    if (status === "Active") {
      return "bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]";
    }
    if (status === "Suspended") {
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    }
    return "bg-red-100 text-red-700 border-red-200";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
        <p className="text-gray-500 mt-1">
          Manage and monitor all customers on the platform
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <p className="text-xs text-gray-400 mt-1">{stat.change}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Customers</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name, email, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Total Bookings</TableHead>
                  <TableHead>Total Spent</TableHead>
                  <TableHead>Member Since</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingCustomers ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                      Loading customers...
                    </TableCell>
                  </TableRow>
                ) : filteredCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                      No customers found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <span className="font-mono font-semibold text-[#16A34A]">
                          {customer.id}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-gray-900">{customer.name}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">{customer.email}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">{customer.phone}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">{customer.location}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-gray-900">{customer.totalBookings}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-bold text-[#16A34A]">
                          ₱{customer.totalSpent.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {new Date(customer.memberSince).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeClass(customer.status)}>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {customer.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleViewCustomer(customer)}>
                            View
                          </Button>
                          <Select
                            value={customer.status}
                            onValueChange={(value) => handleStatusChange(customer, value as Customer["status"])}
                          >
                            <SelectTrigger className="w-[130px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Active">Active</SelectItem>
                              <SelectItem value="Inactive">Inactive</SelectItem>
                              <SelectItem value="Suspended">Suspended</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-4 py-2">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium text-gray-900">{selectedCustomer.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-900">{selectedCustomer.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium text-gray-900">{selectedCustomer.phone || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-medium text-gray-900">{selectedCustomer.location || "-"}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Bookings</p>
                  <p className="font-medium text-gray-900">{selectedCustomer.totalBookings}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Spent</p>
                  <p className="font-medium text-gray-900">₱{selectedCustomer.totalSpent.toLocaleString()}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <Badge className={getStatusBadgeClass(selectedCustomer.status)}>
                  {selectedCustomer.status}
                </Badge>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ── Coming-soon placeholder helper ──────────────────────────── */
function ComingSoon({ title, description }: { title: string; description: string }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        <p className="text-gray-500 mt-1">{description}</p>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 bg-[#DCFCE7] rounded-2xl flex items-center justify-center mb-4">
            <Package className="w-8 h-8 text-[#16A34A]" />
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Coming Soon</h2>
          <p className="text-gray-400 text-sm max-w-sm">
            This section is under development and will be available in a future update.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export function Support() {
  return (
    <ComingSoon
      title="Support"
      description="Manage customer and provider support tickets"
    />
  );
}

type Broadcast = {
  id: string;
  title: string;
  message: string;
  audience: string;
  channel: string;
  sent: number;
  opened: number;
  status: string;
  date: string;
};

const mockBroadcasts: Broadcast[] = [
  { id: "BC-001", title: "Platform Maintenance Notice", message: "Scheduled maintenance notice for all users.", audience: "All Users", channel: "Push + Email", sent: 8420, opened: 5103, status: "Sent", date: "2026-03-28T09:00:00" },
  { id: "BC-002", title: "New Feature: Live Tracking", message: "Live tracking is now available for active bookings.", audience: "Customers", channel: "Push", sent: 5200, opened: 3410, status: "Sent", date: "2026-03-25T14:00:00" },
  { id: "BC-003", title: "Summer Promo Reminder", message: "Reminder for the upcoming summer promo.", audience: "All Users", channel: "Email", sent: 0, opened: 0, status: "Scheduled", date: "2026-04-01T10:00:00" },
  { id: "BC-004", title: "KYC Verification Reminder", message: "Reminder for providers to complete KYC verification.", audience: "Providers", channel: "Email + SMS", sent: 312, opened: 271, status: "Sent", date: "2026-03-20T08:30:00" },
];

const broadcastStatusCfg: Record<string, string> = {
  Sent: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Scheduled: "bg-blue-50 text-blue-700 border-blue-200",
  Draft: "bg-gray-100 text-gray-600 border-gray-200",
  Sending: "bg-amber-50 text-amber-700 border-amber-200",
  Failed: "bg-red-50 text-red-600 border-red-200",
};

function getBroadcastString(source: Record<string, any>, keys: string[], fallback = "") {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
    if (typeof value === "number") {
      return String(value);
    }
  }
  return fallback;
}

function getBroadcastNumber(source: Record<string, any>, keys: string[], fallback = 0) {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === "string" && Number.isFinite(Number(value))) {
      return Number(value);
    }
  }
  return fallback;
}

function getBroadcastItems(payload: any): any[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  const candidates = [
    payload?.broadcasts,
    payload?.items,
    payload?.results,
    payload?.rows,
    payload?.data,
    payload?.data?.broadcasts,
    payload?.data?.items,
    payload?.data?.results,
    payload?.data?.rows,
  ];

  return candidates.find(Array.isArray) ?? [];
}

function normalizeBroadcastStatus(value: unknown) {
  const status = String(value ?? "Sent").trim().toLowerCase();
  if (status === "scheduled") return "Scheduled";
  if (status === "draft") return "Draft";
  if (status === "sending" || status === "in_progress") return "Sending";
  if (status === "failed") return "Failed";
  return "Sent";
}

function normalizeBroadcasts(payload: any): Broadcast[] {
  return getBroadcastItems(payload).map((item, index) => {
    const source = item && typeof item === "object" ? item : {};
    const date = getBroadcastString(
      source,
      ["date", "sentAt", "sent_at", "scheduledAt", "scheduled_at", "createdAt", "created_at"],
      new Date().toISOString()
    );

    return {
      id: getBroadcastString(source, ["id", "broadcastId", "broadcast_id"], `BC-${String(index + 1).padStart(3, "0")}`),
      title: getBroadcastString(source, ["title", "subject"], "Untitled Broadcast"),
      message: getBroadcastString(source, ["message", "body", "content", "description"], ""),
      audience: getBroadcastString(source, ["audience", "targetAudience", "target_audience", "recipientType", "recipient_type"], "All Users"),
      channel: getBroadcastString(source, ["channel", "channels", "deliveryChannel", "delivery_channel"], "Push"),
      sent: getBroadcastNumber(source, ["sent", "sentCount", "sent_count", "recipients", "recipient_count"]),
      opened: getBroadcastNumber(source, ["opened", "openCount", "open_count", "readCount", "read_count"]),
      status: normalizeBroadcastStatus(source.status),
      date,
    };
  });
}

export function Broadcasts() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    audience: "All Users",
    channel: "Push",
    scheduledAt: "",
  });

  const fetchBroadcasts = async () => {
    setIsLoading(true);
    setLoadError("");

    try {
      const response = await apiCall("/api/admin/v1/broadcasts");
      setBroadcasts(normalizeBroadcasts(response));
    } catch (error: any) {
      console.warn("Falling back to mock broadcasts after fetch failed:", error);
      setBroadcasts(mockBroadcasts);
      setLoadError(error?.message || "Failed to load broadcasts");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchBroadcasts();
  }, []);

  const filtered = broadcasts.filter((broadcast) => {
    const normalizedSearch = search.trim().toLowerCase();
    const matchesSearch =
      !normalizedSearch ||
      broadcast.title.toLowerCase().includes(normalizedSearch) ||
      broadcast.audience.toLowerCase().includes(normalizedSearch) ||
      broadcast.channel.toLowerCase().includes(normalizedSearch);
    const matchesStatus = statusFilter === "all" || broadcast.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = useMemo(() => {
    const totalSent = broadcasts.reduce((sum, broadcast) => sum + broadcast.sent, 0);
    const totalOpened = broadcasts.reduce((sum, broadcast) => sum + broadcast.opened, 0);
    const scheduled = broadcasts.filter((broadcast) => broadcast.status === "Scheduled").length;
    const openRate = totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0;

    return [
      { label: "Total Sent", value: totalSent >= 1000 ? `${(totalSent / 1000).toFixed(1)}K` : totalSent.toString(), icon: Send, color: "text-blue-600", bg: "bg-blue-50" },
      { label: "Open Rate", value: `${openRate}%`, icon: Eye, color: "text-emerald-600", bg: "bg-emerald-50" },
      { label: "Scheduled", value: scheduled.toString(), icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
      { label: "Campaigns", value: broadcasts.length.toString(), icon: BarChart2, color: "text-purple-600", bg: "bg-purple-50" },
    ];
  }, [broadcasts]);

  const handleCreateBroadcast = async () => {
    if (!formData.title.trim() || !formData.message.trim()) {
      alert("Please enter a title and message.");
      return;
    }

    setIsSubmitting(true);
    try {
      await apiCall("/api/admin/v1/broadcasts", {
        method: "POST",
        body: JSON.stringify({
          title: formData.title.trim(),
          message: formData.message.trim(),
          audience: formData.audience,
          channel: formData.channel,
          scheduledAt: formData.scheduledAt || null,
        }),
      });
      setIsDialogOpen(false);
      setFormData({
        title: "",
        message: "",
        audience: "All Users",
        channel: "Push",
        scheduledAt: "",
      });
      await fetchBroadcasts();
    } catch (error: any) {
      alert(error?.message || "Failed to create broadcast.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Broadcasts</h1>
          <p className="text-gray-500 mt-1">Send platform-wide announcements and notifications</p>
        </div>
        <Button
          onClick={() => setIsDialogOpen(true)}
          className="bg-[#16A34A] hover:bg-[#15803D] text-white gap-2"
        >
          <Plus className="w-4 h-4" />
          New Broadcast
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border border-gray-200">
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xs text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{isLoading ? "..." : stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border border-gray-200">
        <CardHeader className="border-b border-gray-100">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <CardTitle className="text-sm font-semibold text-gray-800">Broadcast Campaigns</CardTitle>
              {loadError && (
                <div className="flex items-center gap-1 text-xs text-amber-600 mt-1">
                  <AlertCircle className="w-3 h-3" />
                  Showing fallback broadcasts.
                </div>
              )}
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search broadcasts..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="pl-9 h-9 text-sm"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36 h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-50">
            {isLoading ? (
              <div className="px-5 py-12 text-center text-sm text-gray-500">
                Loading broadcasts...
              </div>
            ) : filtered.length === 0 ? (
              <div className="px-5 py-12 text-center text-sm text-gray-500">
                No broadcasts found.
              </div>
            ) : (
              filtered.map((broadcast) => (
                <div key={broadcast.id} className="flex items-center gap-5 px-5 py-4 hover:bg-gray-50 transition-colors group">
                  <div className="flex-shrink-0 p-2.5 rounded-xl bg-blue-50">
                    <Megaphone className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-semibold text-gray-900 group-hover:text-[#16A34A] transition-colors truncate">
                        {broadcast.title}
                      </p>
                      <Badge className={`text-xs border ${broadcastStatusCfg[broadcast.status] || broadcastStatusCfg.Draft}`}>
                        {broadcast.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 truncate mb-1">{broadcast.message}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span>Audience: <span className="text-gray-600 font-medium">{broadcast.audience}</span></span>
                      <span>-</span>
                      <span>Channel: <span className="text-gray-600 font-medium">{broadcast.channel}</span></span>
                    </div>
                  </div>
                  {broadcast.status === "Sent" ? (
                    <div className="flex-shrink-0 text-right">
                      <p className="text-xs text-gray-500">{broadcast.sent.toLocaleString()} sent</p>
                      <p className="text-xs font-semibold text-emerald-600 mt-0.5">
                        {broadcast.sent > 0 ? `${Math.round((broadcast.opened / broadcast.sent) * 100)}% opened` : "0% opened"}
                      </p>
                    </div>
                  ) : (
                    <div className="flex-shrink-0 text-right">
                      <p className="text-xs text-gray-400">Scheduled for</p>
                      <p className="text-xs font-medium text-blue-600 mt-0.5">
                        {new Date(broadcast.date).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  )}
                  <div className="flex-shrink-0 text-xs text-gray-400">
                    {new Date(broadcast.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>New Broadcast</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="broadcast-title">Title *</Label>
              <Input
                id="broadcast-title"
                value={formData.title}
                onChange={(event) => setFormData({ ...formData, title: event.target.value })}
                placeholder="e.g., Platform Maintenance Notice"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="broadcast-message">Message *</Label>
              <Textarea
                id="broadcast-message"
                value={formData.message}
                onChange={(event) => setFormData({ ...formData, message: event.target.value })}
                placeholder="Write the announcement users will receive..."
                rows={4}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Audience</Label>
                <Select value={formData.audience} onValueChange={(value) => setFormData({ ...formData, audience: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Users">All Users</SelectItem>
                    <SelectItem value="Customers">Customers</SelectItem>
                    <SelectItem value="Providers">Providers</SelectItem>
                    <SelectItem value="Admins">Admins</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Channel</Label>
                <Select value={formData.channel} onValueChange={(value) => setFormData({ ...formData, channel: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Push">Push</SelectItem>
                    <SelectItem value="Email">Email</SelectItem>
                    <SelectItem value="SMS">SMS</SelectItem>
                    <SelectItem value="Push + Email">Push + Email</SelectItem>
                    <SelectItem value="Email + SMS">Email + SMS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="broadcast-scheduled-at">Schedule Time</Label>
              <Input
                id="broadcast-scheduled-at"
                type="datetime-local"
                value={formData.scheduledAt}
                onChange={(event) => setFormData({ ...formData, scheduledAt: event.target.value })}
              />
              <p className="text-xs text-gray-500">Leave empty to send immediately.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateBroadcast}
              disabled={isSubmitting}
              className="bg-[#16A34A] hover:bg-[#15803D]"
            >
              {isSubmitting ? "Sending..." : "Send Broadcast"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
